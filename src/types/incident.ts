export type IncidentStatus = 'HIGH_PRIORITY' | 'UNDER_VERIFICATION' | 'CONFIRMED' | 'RESOLVED';
export type IncidentPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface IncidentEvidence {
  visual: number;
  thermal: number;
  acoustic: number;
  lidar?: number;
}

export interface Incident {
  incidentId: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  confidence: number;
  status: IncidentStatus;
  priority: IncidentPriority;
  evidence: IncidentEvidence;
  recommendedAction: string;
  notes?: string;
  acknowledged: boolean;
  hazardZoneRef?: string;
}
