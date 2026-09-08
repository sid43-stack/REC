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
