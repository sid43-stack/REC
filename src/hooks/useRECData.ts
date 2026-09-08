import { useEffect, useState } from 'react';
import { recDataService } from '../services/dataService';
import { SimulatorState } from '../simulation/droneSimulator';

export function useRECData(): {
  data: SimulatorState | null;
  service: typeof recDataService;
} {
  const [data, setData] = useState<SimulatorState | null>(null);

  useEffect(() => {
    // Start simulation when mounted
    const unsubscribe = recDataService.subscribe((state) => {
      // Deep-clone critical nested objects that the simulator mutates in-place,
      // so React's Object.is comparison detects changes and re-renders components.
      setData({
        ...state,
        telemetry: { ...state.telemetry },
        companionTelemetry: { ...state.companionTelemetry },
        sensorEvidence: { ...state.sensorEvidence },
        svlpEvaluation: { ...state.svlpEvaluation },
        flightPath: [...state.flightPath],
        companionFlightPath: [...state.companionFlightPath],
        incidents: [...state.incidents],
        hotspots: [...state.hotspots],
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { data, service: recDataService };
}
