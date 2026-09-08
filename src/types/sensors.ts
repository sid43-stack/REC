export type SensorHealthStatus = 'ACTIVE' | 'WARNING' | 'OFFLINE';

export interface SensorStatus {
  rgbCamera: SensorHealthStatus;
  thermalSensor: SensorHealthStatus;
  acousticSensor: SensorHealthStatus;
  lidar: SensorHealthStatus;
  gps: SensorHealthStatus;
  imu: SensorHealthStatus;
}

export interface SensorEvidence {
  visual: number; // 0.00 - 1.00
  thermal: number; // 0.00 - 1.00
  acoustic: number; // 0.00 - 1.00
  lidar?: number; // 0.00 - 1.00 structural void penetration score
  timestamp: string;
  // Detail telemetry for realistic technical display
  visualObjectLabel?: string;
  visualConfidence?: number;
  thermalHotspotTemp?: number; // degrees Celsius (e.g. 36.8°C)
  thermalAmbientTemp?: number; // ambient temp (e.g. 18.5°C)
  acousticDecibels?: number; // dB (e.g. 74 dB)
  acousticFrequency?: number; // Hz (e.g. 850 Hz peak voice resonance)
  lidarDepthM?: number; // Distance to ground/rubble in meters (e.g. 12.4m)
  lidarVoidVolumeM3?: number; // Estimated cavity void volume (e.g. 4.6 m³)
  lidarStructuralIntegrity?: string; // e.g. "STRUCTURAL CAVITY / 82% VOID"
}
