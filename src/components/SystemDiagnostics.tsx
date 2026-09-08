import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Radio, 
  Zap, 
  Terminal,
  Wifi,
  HardDrive
} from 'lucide-react';
import { SimulatorState } from '../simulation/droneSimulator';

interface SystemDiagnosticsProps {
  data: SimulatorState;
}

interface MAVLinkPacket {
  seq: number;
  msgId: number;
  name: string;
  payload: Record<string, any>;
  timestamp: string;
}

export const SystemDiagnostics: React.FC<SystemDiagnosticsProps> = ({ data }) => {
  const { telemetry, sensorStatus, svlpEvaluation } = data;

  const [pingRunning, setPingRunning] = useState(false);
  const [pingResults, setPingResults] = useState<{ bus: string; latency: number; status: 'OK' | 'WARN' }[]>([
    { bus: 'Pixhawk 4 FCU (UART MAVLink)', latency: 8, status: 'OK' },
    { bus: 'FLIR Lepton SPI Bus', latency: 14, status: 'OK' },
    { bus: 'MEMS I2S Acoustic Array', latency: 4, status: 'OK' },
    { bus: 'LiDAR Time-of-Flight I2C', latency: 11, status: 'OK' },
    { bus: 'ESP32 SATCOM Uplink', latency: 42, status: 'OK' },
  ]);

  const [mavlinkPackets, setMavlinkPackets] = useState<MAVLinkPacket[]>([]);

  // Simulate incoming MAVLink packets
  useEffect(() => {
    const interval = setInterval(() => {
      const packetTypes = [
        { msgId: 0, name: 'HEARTBEAT', payload: { type: 'QUADROTOR', autopilot: 'PX4', base_mode: 209, custom_mode: 67108864 } },
        { msgId: 30, name: 'ATTITUDE', payload: { pitch: telemetry.pitch, roll: telemetry.roll, yaw: telemetry.yaw } },
        { msgId: 33, name: 'GLOBAL_POSITION_INT', payload: { lat: Math.round(telemetry.latitude * 1e7), lon: Math.round(telemetry.longitude * 1e7), alt: Math.round(telemetry.altitude * 1000) } },
        { msgId: 147, name: 'BATTERY_STATUS', payload: { voltage: (telemetry.batteryVoltage || 22.8) * 1000, current: 14500, remaining: telemetry.battery } },
        { msgId: 245, name: 'REC_SVLP_STATUS', payload: { state: svlpEvaluation.state, confidence: Math.round(svlpEvaluation.confidence * 100) } },
      ];

      const selected = packetTypes[Math.floor(Math.random() * packetTypes.length)];
      const newPacket: MAVLinkPacket = {
        seq: Date.now() % 65535,
        msgId: selected.msgId,
        name: selected.name,
        payload: selected.payload,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMavlinkPackets((prev) => [newPacket, ...prev.slice(0, 15)]);
    }, 1200);

    return () => clearInterval(interval);
  }, [telemetry, svlpEvaluation]);

  const handleRunPing = () => {
    setPingRunning(true);
    setTimeout(() => {
      setPingResults([
        { bus: 'Pixhawk 4 FCU (UART MAVLink)', latency: Math.floor(6 + Math.random() * 5), status: 'OK' },
        { bus: 'FLIR Lepton SPI Bus', latency: Math.floor(12 + Math.random() * 6), status: 'OK' },
        { bus: 'MEMS I2S Acoustic Array', latency: Math.floor(3 + Math.random() * 4), status: 'OK' },
        { bus: 'LiDAR Time-of-Flight I2C', latency: Math.floor(9 + Math.random() * 5), status: 'OK' },
        { bus: 'ESP32 SATCOM Uplink', latency: Math.floor(38 + Math.random() * 12), status: 'OK' },
      ]);
      setPingRunning(false);
    }, 1000);
  };

  return (
    <div className="bg-[#0b0e14] rounded-lg border border-white/10 p-4 space-y-4 shadow-xl font-mono text-xs tactical-corner">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-tech text-base font-bold text-slate-100 flex items-center gap-2">
              SYSTEM DIAGNOSTICS & HARDWARE INTEGRATION BUS
              <span className="text-[10px] font-mono font-normal text-amber-400 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30">
                TRD / SRS v1.0
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              PHYSICAL UAV COMPANION BUS & TELEMETRY PROTOCOL READINESS
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunPing}
            disabled={pingRunning}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition text-[10px] font-bold"
          >
            <Wifi className="w-3 h-3" />
            <span>{pingRunning ? 'PROBING BUS...' : 'RUN BUS PING TEST'}</span>
          </button>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
            GATEWAY ONLINE
          </span>
        </div>
      </div>

      {/* Hardware Subsystems 3-Column Spec Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Gateway 1 */}
        <div className="bg-[#07090f] p-3 rounded border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-white/5 pb-1">
            <span className="flex items-center space-x-1.5 text-amber-400">
              <Radio className="w-4 h-4" />
              <span>FLIGHT CONTROLLER BUS</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">Pixhawk 4</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1">
            <div>Target Platform: <strong className="text-slate-200">Pixhawk 4 / Cube Orange</strong></div>
            <div>Protocol: <strong className="text-slate-200">MAVLink v2.0 (UART 57600)</strong></div>
            <div>Companion Interface: <strong className="text-slate-200">Raspberry Pi 5 / ESP32</strong></div>
            <div>Current Jitter: <strong className="text-emerald-400">&lt; 3ms</strong></div>
          </div>
        </div>

        {/* Gateway 2 */}
        <div className="bg-[#07090f] p-3 rounded border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-white/5 pb-1">
            <span className="flex items-center space-x-1.5 text-rose-400">
              <Zap className="w-4 h-4" />
              <span>5-SENSOR PAYLOAD BUS</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">SYNCHRONIZED</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1">
            <div>Optical: <strong className="text-slate-200">USB 4K CMOS (60 FPS)</strong></div>
            <div>Thermal: <strong className="text-slate-200">FLIR Lepton 3.5 (160×120 SPI)</strong></div>
            <div>LiDAR: <strong className="text-slate-200">Benewake TFmini-S (905nm I2C)</strong></div>
            <div>Acoustic: <strong className="text-slate-200">4× INMP441 MEMS Array (I2S)</strong></div>
          </div>
        </div>

        {/* Gateway 3 */}
        <div className="bg-[#07090f] p-3 rounded border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-white/5 pb-1">
            <span className="flex items-center space-x-1.5 text-sky-400">
              <Activity className="w-4 h-4" />
              <span>REC-SVLP INFERENCE</span>
            </span>
            <span className="text-[10px] text-amber-400 font-bold">ACTIVE</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1">
            <div>Current State: <strong className="text-amber-300">{svlpEvaluation.state}</strong></div>
            <div>Confidence Score: <strong className="text-rose-400">{Math.round(svlpEvaluation.confidence * 100)}%</strong></div>
            <div>Decision Pipeline: <strong className="text-slate-200">Multi-Spectral Aggregator</strong></div>
            <div>Tick Interval: <strong className="text-slate-200">1000ms (~1.0 Hz)</strong></div>
          </div>
        </div>
      </div>

      {/* Bus Roundtrip Ping Health Table */}
      <div className="bg-[#07090f] rounded border border-white/10 p-3 space-y-2">
        <div className="flex items-center justify-between border-b border-white/5 pb-1">
          <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
            <HardDrive className="w-3.5 h-3.5 text-amber-400" />
            <span>REAL-TIME HARDWARE BUS LATENCY TELEMETRY</span>
          </div>
          <span className="text-[10px] text-slate-500">PING ROUNDTRIP</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
          {pingResults.map((p) => (
            <div key={p.bus} className="p-2 rounded bg-black/40 border border-white/5 flex flex-col justify-between">
              <div className="text-[9px] text-slate-400 truncate mb-1">{p.bus}</div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-tech font-bold text-amber-300">{p.latency} ms</span>
                <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAVLink v2.0 Live Packet Stream & Comms Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left: MAVLink Packet Inspector */}
        <div className="bg-[#05080f] rounded-md border border-white/10 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-300 border-b border-white/5 pb-1">
            <div className="flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">LIVE MAVLink v2.0 STREAM</span>
            </div>
            <span className="text-[9px] text-slate-500">UART 57600 BAUD</span>
          </div>

          <div className="space-y-1 overflow-y-auto max-h-56 pr-1">
            {mavlinkPackets.map((pkt, idx) => (
              <div key={idx} className="p-1.5 rounded bg-black/40 border border-white/5 flex items-center justify-between text-[10px]">
                <div className="flex items-center space-x-2">
                  <span className="text-amber-400 font-bold">#{pkt.msgId}</span>
                  <span className="text-slate-200 font-semibold">{pkt.name}</span>
                </div>
                <div className="text-slate-400 font-code text-[9px] truncate max-w-[180px]">
                  {JSON.stringify(pkt.payload)}
                </div>
                <span className="text-slate-600 text-[8px]">{pkt.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Full JSON Telemetry Frame */}
        <div className="bg-[#05080f] rounded-md border border-white/10 p-3 space-y-1.5 flex flex-col">
          <div className="flex items-center justify-between text-[11px] text-slate-300 border-b border-white/5 pb-1">
            <span className="font-semibold">RAW TELEMETRY DATUM SNAPSHOT</span>
            <span className="text-[9px] text-slate-500">JSON • ISO8601</span>
          </div>

          <pre className="p-2 bg-black/40 rounded text-[10px] text-amber-300/90 font-code overflow-x-auto leading-relaxed flex-1 max-h-56">
{JSON.stringify({
  timestamp: telemetry.timestamp,
  droneId: telemetry.droneId,
  coordinates: {
    lat: telemetry.latitude,
    lng: telemetry.longitude,
    alt_agl: telemetry.altitude,
  },
  motion: {
    speed_ms: telemetry.speed,
    heading_deg: telemetry.heading,
    attitude: { pitch: telemetry.pitch, roll: telemetry.roll, yaw: telemetry.yaw },
  },
  system: {
    battery_pct: telemetry.battery,
    voltage_v: telemetry.batteryVoltage,
    satellites: telemetry.satellites,
    connection: telemetry.connection,
  },
  sensorHealth: sensorStatus,
  svlp: {
    state: svlpEvaluation.state,
    confidence: svlpEvaluation.confidence,
  }
}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
