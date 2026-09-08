import React from 'react';
import { 
  Activity, 
  Cpu, 
  Radio, 
  Zap, 
  Terminal
} from 'lucide-react';
import { SimulatorState } from '../simulation/droneSimulator';

interface SystemDiagnosticsProps {
  data: SimulatorState;
}

export const SystemDiagnostics: React.FC<SystemDiagnosticsProps> = ({ data }) => {
  const { telemetry, sensorStatus, svlpEvaluation } = data;

  return (
    <div className="bg-[#0b0f19] rounded-lg border border-slate-800 p-4 space-y-4 shadow-xl font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="font-tech text-base font-bold text-slate-100">
              SYSTEM DIAGNOSTICS & HARDWARE INTEGRATION STATUS
            </h2>
            <p className="text-[11px] text-slate-400">
              PLATFORM TELEMETRY & FUTURE HARDWARE BUS READINESS (TRD / SRS / ARCHITECTURE)
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
            GATEWAY READY
          </span>
        </div>
      </div>

      {/* Hardware Gateway Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Gateway 1 */}
        <div className="bg-[#080c14] p-3 rounded border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800/80 pb-1">
            <span className="flex items-center space-x-1.5 text-cyan-400">
              <Radio className="w-4 h-4" />
              <span>FLIGHT CONTROLLER BUS</span>
            </span>
            <span className="text-[10px] text-emerald-400">MOCK SIMULATOR</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1">
            <div>Target Platform: <strong>Pixhawk 4 / Cube Orange</strong></div>
            <div>Protocol: <strong>MAVLink v2.0 (UART 57600)</strong></div>
            <div>Companion Interface: <strong>ESP32 / Raspberry Pi</strong></div>
            <div>Current Latency: <strong>12ms</strong></div>
          </div>
        </div>

        {/* Gateway 2 */}
        <div className="bg-[#080c14] p-3 rounded border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800/80 pb-1">
            <span className="flex items-center space-x-1.5 text-amber-400">
              <Zap className="w-4 h-4" />
              <span>SENSOR SUITE BUS</span>
            </span>
            <span className="text-[10px] text-emerald-400">SYNCHRONIZED</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1">
            <div>Visual: <strong>USB 4K CMOS (60 FPS)</strong></div>
            <div>Thermal: <strong>FLIR Lepton 3.5 (160×120 SPI)</strong></div>
            <div>Acoustic: <strong>INMP441 MEMS I2S Array</strong></div>
            <div>Telemetry Frequency: <strong>1.0 Hz Polling</strong></div>
          </div>
        </div>

        {/* Gateway 3 */}
        <div className="bg-[#080c14] p-3 rounded border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800/80 pb-1">
            <span className="flex items-center space-x-1.5 text-purple-400">
              <Activity className="w-4 h-4" />
              <span>REC-SVLP INFERENCE</span>
            </span>
            <span className="text-[10px] text-cyan-400">ONLINE</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1">
            <div>Active State: <strong>{svlpEvaluation.state}</strong></div>
            <div>Confidence Score: <strong>{(svlpEvaluation.confidence * 100).toFixed(1)}%</strong></div>
            <div>Decision Engine: <strong>Rule-based Multi-Spectral Aggregator</strong></div>
            <div>Evaluation Rate: <strong>Real-time (~1000ms tick)</strong></div>
          </div>
        </div>
      </div>

      {/* Live System Log Terminal Feed */}
      <div className="bg-[#05080f] rounded-md border border-slate-800 p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-1">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>LIVE TELEMETRY COMMS LOG</span>
          </div>
          <span className="text-[10px] text-slate-500">FORMAT: ISO8601 • TELEMETRY JSON</span>
        </div>

        <pre className="p-2 bg-black/40 rounded text-[10px] text-cyan-400/90 font-code overflow-x-auto leading-relaxed">
{JSON.stringify({
  timestamp: telemetry.timestamp,
  droneId: telemetry.droneId,
  latitude: telemetry.latitude,
  longitude: telemetry.longitude,
  altitude: telemetry.altitude,
  speed: telemetry.speed,
  battery: telemetry.battery,
  gpsStatus: telemetry.gpsStatus,
  connection: telemetry.connection,
  sensorStatus: sensorStatus,
}, null, 2)}
        </pre>
      </div>
    </div>
  );
};
