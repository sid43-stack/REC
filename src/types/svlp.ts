export type SVLPState = 
  | 'SEARCH'
  | 'SUSPICION'
  | 'INVESTIGATION'
  | 'VERIFICATION'
  | 'ALERT'
  | 'RETURN';

export interface SVLPWeights {
  visual: number;   // default ~0.35
  thermal: number;  // default ~0.40
  acoustic: number; // default ~0.25
}

export interface SVLPThresholds {
  suspicionThreshold: number;     // e.g. 0.45 or single sensor > 0.60
  investigationThreshold: number; // e.g. 0.60
  verificationThreshold: number;  // e.g. 0.75
  alertThreshold: number;         // e.g. 0.82
}

export interface SVLPEvaluation {
  state: SVLPState;
  confidence: number; // 0.00 - 1.00 decision support score
  recommendedAction: string;
  stateReason: string;
  triggerSource?: 'VISUAL' | 'THERMAL' | 'ACOUSTIC' | 'MULTI_MODAL' | 'NONE';
  targetCoordinates?: {
    latitude: number;
    longitude: number;
  };
}
