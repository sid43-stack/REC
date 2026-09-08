import { SVLPState, SVLPWeights } from '../types/svlp';
import { DrillScenarioId, MissionMode } from '../types/mission';
import { droneSimulator, SimulatorState } from '../simulation/droneSimulator';

export interface IRECDataService {
  subscribe(callback: (state: SimulatorState) => void): () => void;
  pauseMission(): void;
  resumeMission(): void;
  resetMission(): void;
  setSimulationSpeed(speed: number): void;
  setMissionMode(mode: MissionMode): void;
  injectAnomaly(accidentTitle?: string): void;
  simulateAccident(accidentTitle?: string): void;
  runAutoDemo(): void;
  setScenario(scenarioId: DrillScenarioId): void;
  setActiveDrone(droneId: 'REC-01'): void;
  exportSITREP(): string;
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

  public injectAnomaly(accidentTitle?: string): void {
    droneSimulator.simulateAccident(accidentTitle);
  }

  public simulateAccident(accidentTitle?: string): void {
    droneSimulator.simulateAccident(accidentTitle);
  }

  public runAutoDemo(): void {
    droneSimulator.runAutoDemo();
  }

  public setScenario(scenarioId: DrillScenarioId): void {
    droneSimulator.setScenario(scenarioId);
  }

  public setActiveDrone(_droneId: 'REC-01'): void {
    // Single drone REC-01 active
  }

  public exportSITREP(): string {
    return droneSimulator.exportSITREP();
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
    droneSimulator.getSVLPEngine().evaluate(
      { visual: 0.8, thermal: 0.85, acoustic: 0.75, timestamp: new Date().toISOString() },
      { latitude: 28.6148, longitude: 77.2092 },
      state
    );
  }
}

export const recDataService: IRECDataService = new RECDataService();
