import React, { useEffect, useRef } from 'react';
import { 
  Camera, 
  Flame, 
  Volume2, 
  Navigation, 
  ShieldCheck, 
  Cpu,
  Maximize2
} from 'lucide-react';
import { SensorEvidence, SensorHealthStatus, SensorStatus } from '../types/sensors';
import { Telemetry } from '../types/telemetry';

interface SensorPanelProps {
  sensorStatus: SensorStatus;
  sensorEvidence: SensorEvidence;
  telemetry: Telemetry;
  onOpenGimbal?: () => void;
}

export const SensorPanel: React.FC<SensorPanelProps> = ({
  sensorStatus,
  sensorEvidence,
  telemetry,
  onOpenGimbal,
}) => {
  const rgbCanvasRef = useRef<HTMLCanvasElement>(null);
  const thermalCanvasRef = useRef<HTMLCanvasElement>(null);
  const acousticCanvasRef = useRef<HTMLCanvasElement>(null);

  const renderStatusBadge = (status: SensorHealthStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="flex items-center space-x-1 px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ACTIVE</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center space-x-1 px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>WARN</span>
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="flex items-center space-x-1 px-1.5 py-0.2 rounded text-[9px] font-mono bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>OFF</span>
          </span>
        );
    }
  };

  // 1. Dynamic RGB Drone Reconnaissance Camera Feed Canvas
  useEffect(() => {
    const canvas = rgbCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Deep graphite terrain scan
      ctx.fillStyle = '#080a0f';
      ctx.fillRect(0, 0, w, h);

      // Ground contour grid lines
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.09)';
      ctx.lineWidth = 1;
      const gridSize = 16;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = (offset % gridSize); y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      offset += (telemetry.speed || 5) * 0.12;

      // Simulated rubble blocks
      ctx.fillStyle = 'rgba(38, 44, 58, 0.45)';
      ctx.fillRect(w * 0.2, (h * 0.3 + offset * 0.5) % h, 28, 18);
      ctx.fillRect(w * 0.65, (h * 0.6 + offset * 0.5) % h, 34, 22);

      // Camera HUD Artificial Horizon Ladder
      const midX = w / 2;
      const midY = h / 2;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 1;
      const pitchOffset = telemetry.pitch * 1.5;
      ctx.beginPath();
      ctx.moveTo(midX - 25, midY + pitchOffset);
      ctx.lineTo(midX - 8, midY + pitchOffset);
      ctx.moveTo(midX + 8, midY + pitchOffset);
      ctx.lineTo(midX + 25, midY + pitchOffset);
      ctx.stroke();

      // Optical Center Reticle
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
      ctx.beginPath();
      ctx.arc(midX, midY, 5, 0, Math.PI * 2);
      ctx.moveTo(midX - 10, midY);
      ctx.lineTo(midX - 4, midY);
      ctx.moveTo(midX + 4, midY);
      ctx.lineTo(midX + 10, midY);
      ctx.moveTo(midX, midY - 10);
      ctx.lineTo(midX, midY - 4);
      ctx.moveTo(midX, midY + 4);
      ctx.lineTo(midX, midY + 10);
      ctx.stroke();

      // Dynamic Target Bounding Box if Visual Evidence is High
      if (sensorEvidence.visual > 0.45) {
        const boxW = 44;
        const boxH = 34;
        const targetX = midX - boxW / 2;
        const targetY = midY - boxH / 2 + pitchOffset;

        ctx.strokeStyle = sensorEvidence.visual > 0.75 ? '#10b981' : '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(targetX, targetY, boxW, boxH);

        // Corner brackets
        const bSize = 6;
        ctx.beginPath();
        ctx.moveTo(targetX, targetY + bSize); ctx.lineTo(targetX, targetY); ctx.lineTo(targetX + bSize, targetY);
        ctx.moveTo(targetX + boxW - bSize, targetY); ctx.lineTo(targetX + boxW, targetY); ctx.lineTo(targetX + boxW, targetY + bSize);
        ctx.moveTo(targetX, targetY + boxH - bSize); ctx.lineTo(targetX, targetY + boxH); ctx.lineTo(targetX + bSize, targetY + boxH);
        ctx.moveTo(targetX + boxW - bSize, targetY + boxH); ctx.lineTo(targetX + boxW, targetY + boxH); ctx.lineTo(targetX + boxW, targetY + boxH - bSize);
        ctx.stroke();

        ctx.fillStyle = sensorEvidence.visual > 0.75 ? '#10b981' : '#f59e0b';
        ctx.font = '8px monospace';
        ctx.fillText(`TARGET: ${Math.round(sensorEvidence.visual * 100)}%`, targetX - 4, targetY - 4);
      }

      // Lens Vignette Edge
      const vig = ctx.createRadialGradient(midX, midY, h * 0.4, midX, midY, w * 0.7);
      vig.addColorStop(0, 'transparent');
      vig.addColorStop(1, 'rgba(0,0,0,0.75)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [sensorEvidence.visual, telemetry.speed, telemetry.pitch]);

  // 2. Realistic FLIR Longwave Infrared Thermal Sensor Canvas
  useEffect(() => {
    const canvas = thermalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const midX = w / 2;
      const midY = h / 2;

      // Deep graphite thermal palette
      const baseGrad = ctx.createLinearGradient(0, 0, 0, h);
      baseGrad.addColorStop(0, '#06070a');
      baseGrad.addColorStop(0.5, '#130d22');
      baseGrad.addColorStop(1, '#090a10');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, w, h);

      // Thermal Heat Bloom (Ironbow colormap)
      const heatIntensity = sensorEvidence.thermal;
      const radius = 15 + heatIntensity * 35;
      const heatGrad = ctx.createRadialGradient(midX, midY, 1, midX, midY, radius);

      if (heatIntensity > 0.4) {
        heatGrad.addColorStop(0, '#ffffff'); // White hot core (>36.5°C)
        heatGrad.addColorStop(0.2, '#fff200'); // Yellow
        heatGrad.addColorStop(0.45, '#ff4d00'); // Amber-Red
        heatGrad.addColorStop(0.75, '#6a0a7a'); // Purple
        heatGrad.addColorStop(1, 'transparent');
      } else {
        heatGrad.addColorStop(0, '#601500');
        heatGrad.addColorStop(0.5, '#28072e');
        heatGrad.addColorStop(1, 'transparent');
      }

      ctx.fillStyle = heatGrad;
      ctx.beginPath();
      ctx.arc(midX, midY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Thermal Sensor Reticle & Target Crosshairs
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(midX - 12, midY); ctx.lineTo(midX - 3, midY);
      ctx.moveTo(midX + 3, midY); ctx.lineTo(midX + 12, midY);
      ctx.moveTo(midX, midY - 12); ctx.lineTo(midX, midY - 3);
      ctx.moveTo(midX, midY + 3); ctx.lineTo(midX, midY + 12);
      ctx.stroke();

      // Thermal palette reference bar on right
      const barX = w - 8;
      const barGrad = ctx.createLinearGradient(0, 8, 0, h - 8);
      barGrad.addColorStop(0, '#ffffff');
      barGrad.addColorStop(0.25, '#fff200');
      barGrad.addColorStop(0.5, '#ff4d00');
      barGrad.addColorStop(0.75, '#6a0a7a');
      barGrad.addColorStop(1, '#05021a');
      ctx.fillStyle = barGrad;
      ctx.fillRect(barX, 8, 3, h - 16);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [sensorEvidence.thermal, sensorEvidence.thermalHotspotTemp]);

  // 3. Multi-Channel Acoustic Spectrum FFT Visualizer
  useEffect(() => {
    const canvas = acousticCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = '#07090e';
      ctx.fillRect(0, 0, w, h);

      // FFT Spectrum Frequency Bars (16 frequency bands)
      const numBars = 16;
      const barWidth = (w - 24) / numBars;
      const acousticElevated = sensorEvidence.acoustic > 0.55;

      for (let i = 0; i < numBars; i++) {
        // Boost voice resonance bands around bars 6-10 (400Hz - 1200Hz)
        const isVoiceBand = i >= 5 && i <= 9;
        let bandHeight = Math.sin(phase + i * 0.5) * 6 + 10;

        if (acousticElevated && isVoiceBand) {
          bandHeight += sensorEvidence.acoustic * 40;
        } else {
          bandHeight += (sensorEvidence.acoustic * 14);
        }

        const barHeight = Math.min(h - 14, Math.max(4, bandHeight));
        const x = 12 + i * barWidth;
        const y = h - 6 - barHeight;

        // Color coding with emergency accents
        if (acousticElevated && isVoiceBand) {
          ctx.fillStyle = '#10b981'; // Green vocal resonance
        } else if (acousticElevated) {
          ctx.fillStyle = '#f59e0b'; // Amber elevated
        } else {
          ctx.fillStyle = '#222938';
        }

        ctx.fillRect(x, y, barWidth - 2, barHeight);
      }

      // Voice Harmonic Band indicator bracket
      if (acousticElevated) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.strokeRect(12 + 5 * barWidth - 1, 6, 5 * barWidth, h - 12);
        ctx.fillStyle = '#10b981';
        ctx.font = '7px monospace';
        ctx.fillText('VOCAL RESONANCE', 12 + 5 * barWidth + 2, 14);
      }

      phase += 0.2;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [sensorEvidence.acoustic, sensorEvidence.acousticFrequency]);

  return (
    <div className="tactical-glass rounded-lg border border-white/10 p-2.5 flex flex-col space-y-2 shadow-xl tactical-corner">
      <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
        <div className="flex items-center space-x-2">
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <h2 className="font-tech text-xs font-bold tracking-wider text-slate-100">
            INTEGRATED SENSOR SUITE
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            ALL SENSORS NORMAL
          </span>
          {onOpenGimbal && (
            <button
              onClick={onOpenGimbal}
              className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-[9px] font-mono border border-white/10 transition"
              title="Expand Live Gimbal Camera"
            >
              <Maximize2 className="w-2.5 h-2.5" />
              <span>EXPAND FEED</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* Sensor 1: RGB Optical Recon Camera */}
        <div className="bg-[#0b0e14]/90 p-2 rounded border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1 text-[11px] font-mono font-semibold text-slate-300">
                <Camera className="w-3 h-3 text-amber-400" />
                <span>RGB OPTICAL</span>
              </div>
              {renderStatusBadge(sensorStatus.rgbCamera)}
            </div>

            <div className="relative w-full h-20 rounded bg-black overflow-hidden border border-white/5 group cursor-pointer" onClick={onOpenGimbal}>
              <canvas
                ref={rgbCanvasRef}
                width={180}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 left-1.5 text-[8px] font-mono text-amber-300 bg-black/70 px-1 rounded border border-amber-500/30">
                GIMBAL 45°
              </div>
              <div className="absolute bottom-1 right-1.5 text-[8px] font-mono text-slate-400 bg-black/70 px-1 rounded">
                4K 60FPS
              </div>
              <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="mt-1.5 text-[9px] font-mono text-slate-400 flex justify-between">
            <span>RES: 3840×2160</span>
            <span className="text-amber-300 font-bold">{(sensorEvidence.visual * 100).toFixed(0)}% MATCH</span>
          </div>
        </div>

        {/* Sensor 2: FLIR Longwave Infrared Thermal Sensor */}
        <div className="bg-[#0b0e14]/90 p-2 rounded border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1 text-[11px] font-mono font-semibold text-slate-300">
                <Flame className="w-3 h-3 text-rose-400" />
                <span>FLIR LWIR IR</span>
              </div>
              {renderStatusBadge(sensorStatus.thermalSensor)}
            </div>

            <div className="relative w-full h-20 rounded bg-black overflow-hidden border border-white/5 group cursor-pointer" onClick={onOpenGimbal}>
              <canvas
                ref={thermalCanvasRef}
                width={180}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 left-1.5 text-[8px] font-mono text-rose-300 bg-black/70 px-1 rounded border border-rose-500/30">
                HOTSPOT: {sensorEvidence.thermalHotspotTemp}°C
              </div>
              <div className="absolute bottom-1 left-1.5 text-[8px] font-mono text-slate-400 bg-black/70 px-1 rounded">
                AMB: 18.5°C
              </div>
              <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="mt-1.5 text-[9px] font-mono text-slate-400 flex justify-between">
            <span>PALETTE: IRONBOW</span>
            <span className="text-rose-400 font-bold">Δ {((sensorEvidence.thermalHotspotTemp || 19) - 18.5).toFixed(1)}°C</span>
          </div>
        </div>

        {/* Sensor 3: MEMS Acoustic Array Microphone */}
        <div className="bg-[#0b0e14]/90 p-2 rounded border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1 text-[11px] font-mono font-semibold text-slate-300">
                <Volume2 className="w-3 h-3 text-emerald-400" />
                <span>ACOUSTIC ARRAY</span>
              </div>
              {renderStatusBadge(sensorStatus.acousticSensor)}
            </div>

            <div className="relative w-full h-20 rounded bg-black overflow-hidden border border-white/5">
              <canvas
                ref={acousticCanvasRef}
                width={180}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 left-1.5 text-[8px] font-mono text-emerald-300 bg-black/70 px-1 rounded border border-emerald-500/30">
                {sensorEvidence.acousticDecibels} dB SPL
              </div>
              <div className="absolute bottom-1 right-1.5 text-[8px] font-mono text-slate-400 bg-black/70 px-1 rounded">
                {sensorEvidence.acousticFrequency} Hz
              </div>
            </div>
          </div>

          <div className="mt-1.5 text-[9px] font-mono text-slate-400 flex justify-between">
            <span>BEAM: 4-CH MEMS</span>
            <span className={sensorEvidence.acoustic > 0.55 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {sensorEvidence.acoustic > 0.55 ? 'VOICE ANOMALY' : 'AMBIENT'}
            </span>
          </div>
        </div>

        {/* Sensor 4: GPS & IMU Flight Telemetry */}
        <div className="bg-[#0b0e14]/90 p-2 rounded border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1 text-[11px] font-mono font-semibold text-slate-300">
                <Navigation className="w-3 h-3 text-amber-400" />
                <span>GPS & IMU ATTITUDE</span>
              </div>
              {renderStatusBadge(sensorStatus.imu)}
            </div>

            <div className="w-full h-20 rounded bg-black border border-white/5 p-1.5 flex flex-col justify-between font-mono text-xs">
              <div className="flex justify-between border-b border-white/5 pb-0.5 text-[10px]">
                <span className="text-slate-500">POS:</span>
                <span className="text-slate-200 font-bold">{telemetry.latitude.toFixed(4)}, {telemetry.longitude.toFixed(4)}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center py-0.5">
                <div className="bg-white/5 rounded py-0.5">
                  <div className="text-[8px] text-slate-500">PITCH</div>
                  <div className="text-[9px] text-slate-200">{telemetry.pitch}°</div>
                </div>
                <div className="bg-white/5 rounded py-0.5">
                  <div className="text-[8px] text-slate-500">ROLL</div>
                  <div className="text-[9px] text-slate-200">{telemetry.roll}°</div>
                </div>
                <div className="bg-white/5 rounded py-0.5">
                  <div className="text-[8px] text-slate-500">HDG</div>
                  <div className="text-[9px] text-slate-200">{telemetry.heading}°</div>
                </div>
              </div>
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>HDOP: 0.82</span>
                <span className="text-amber-300">{telemetry.satellites} SATS</span>
              </div>
            </div>
          </div>

          <div className="mt-1.5 text-[9px] font-mono text-slate-400 flex justify-between">
            <span>MAG: {telemetry.heading}° N</span>
            <span className="text-emerald-400">RTK LOCKED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
