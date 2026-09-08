export type SensorHealthStatus = 'ACTIVE' | 'WARNING' | 'OFFLINE';

export interface SensorStatus {
  rgbCamera: SensorHealthStatus;
  thermalSensor: SensorHealthStatus;
  acousticSensor: SensorHealthStatus;
  gps: SensorHealthStatus;
  imu: SensorHealthStatus;
}

export interface SensorEvidence {
  visual: number; // 0.00 - 1.00
  thermal: number; // 0.00 - 1.00
  acoustic: number; // 0.00 - 1.00
  timestamp: string;
  // Detail telemetry for realistic technical display
  visualObjectLabel?: string;
  visualConfidence?: number;
  thermalHotspotTemp?: number; // degrees Celsius (e.g. 36.8°C)
  thermalAmbientTemp?: number; // ambient temp (e.g. 18.5°C)
  acousticDecibels?: number; // dB (e.g. 74 dB)
  acousticFrequency?: number; // Hz (e.g. 850 Hz peak voice resonance)
}
