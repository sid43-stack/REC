import { SVLPState, SVLPWeights } from '../types/svlp';
import { MissionMode } from '../types/mission';
import { droneSimulator, SimulatorState } from '../simulation/droneSimulator';

export interface IRECDataService {
  subscribe(callback: (state: SimulatorState) => void): () => void;
  pauseMission(): void;
  resumeMission(): void;
  resetMission(): void;
  setSimulationSpeed(speed: number): void;
  setMissionMode(mode: MissionMode): void;
  injectAnomaly(): void;
  acknowledgeIncident(id: string): void;
  resolveIncident(id: string): void;
  updateSVLPWeights(weights: Partial<SVLPWeights>): void;
  triggerManualState(state: SVLPState): void;
}

class RECDataService implements IRECDataService {
  public subscribe(callback: (state: SimulatorState) => void): () => void {
    return droneSimulator.subscribe(callback);
  }

  public setMissionMode(mode: MissionMode): void {
    droneSimulator.setMissionMode(mode);
  }

  public pauseMission(): void {
    droneSimulator.pause();
  }

  public resumeMission(): void {
    droneSimulator.resume();
  }

  public resetMission(): void {
    droneSimulator.reset();
  }

  public setSimulationSpeed(speed: number): void {
    droneSimulator.setSpeed(speed);
  }

  public injectAnomaly(): void {
    droneSimulator.injectAnomaly();
  }

  public acknowledgeIncident(id: string): void {
    droneSimulator.acknowledgeIncident(id);
  }

  public resolveIncident(id: string): void {
    droneSimulator.resolveIncident(id);
  }

  public updateSVLPWeights(weights: Partial<SVLPWeights>): void {
    droneSimulator.getSVLPEngine().setWeights(weights);
  }

  public triggerManualState(state: SVLPState): void {
    // Allows testing specific state overrides in SVLP
    droneSimulator.getSVLPEngine().evaluate(
      { visual: 0.8, thermal: 0.85, acoustic: 0.75, timestamp: new Date().toISOString() },
      { latitude: 28.6148, longitude: 77.2092 },
      state
    );
  }
}

export const recDataService: IRECDataService = new RECDataService();
