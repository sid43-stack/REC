export type MissionStatus = 'IDLE' | 'ACTIVE' | 'PAUSED' | 'RETURNING' | 'COMPLETED';
export type MissionMode = 'AUTONOMOUS_SEARCH' | 'MANUAL_INVESTIGATION' | 'VERIFICATION_HOLD' | 'RETURN_TO_HOME';

export interface MissionEvent {
  id: string;
  timestamp: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'STATE_CHANGE' | 'SUCCESS';
  title: string;
  details: string;
  relatedCoordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface SearchSector {
  name: string;
  center: [number, number];
  bounds: [number, number][]; // polygon coordinates
  totalAreaM2: number;
  areaCoveredPercent: number;
}

export interface HazardZone {
  id: string;
  name: string;
  type: 'TOXIC_PLUME' | 'FLASH_FLOOD' | 'STRUCTURAL_COLLAPSE';
  color: string;
  bounds: [number, number][];
  severity: 'EXTREME' | 'HIGH' | 'MODERATE';
  description: string;
}

export type DrillScenarioId = 'EARTHQUAKE_RUBBLE' | 'FLASH_FLOOD_NIGHT' | 'CHEMICAL_EXPLOSION';

export interface DrillScenario {
  id: DrillScenarioId;
  title: string;
  subtitle: string;
  description: string;
  windSpeed: string;
  ambientTemp: number;
  recommendedSensor: string;
}
