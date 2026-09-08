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
      // Create a shallow copy to trigger re-renders reliably
      setData({ ...state });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { data, service: recDataService };
}
