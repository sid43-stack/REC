export type GpsStatus = 'LOCKED' | 'SEARCHING' | 'LOST';
export type ConnectionStatus = 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';

export interface Telemetry {
  timestamp: string;
  droneId: string;
  latitude: number;
  longitude: number;
  altitude: number; // meters
  speed: number; // m/s
  battery: number; // percentage (0 - 100)
  batteryVoltage?: number; // Volts, e.g. 22.4V
  gpsStatus: GpsStatus;
  connection: ConnectionStatus;
  heading: number; // degrees (0 - 360)
  pitch: number;
  roll: number;
  yaw: number;
  satellites: number;
  signalStrength: number; // percentage
}
