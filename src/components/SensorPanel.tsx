import React, { useEffect, useRef } from 'react';
import { 
  Camera, 
  Flame, 
  Volume2, 
  Navigation, 
  ShieldCheck, 
  Cpu,
  Maximize2,
  Box
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
  const lidarCanvasRef = useRef<HTMLCanvasElement>(null);

  const renderStatusBadge = (status?: SensorHealthStatus) => {
    switch (status) {
      case 'ACTIVE':
      default:
        return (
          <span className="flex items-center space-x-1 px-1 py-0.2 rounded text-[8px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            <span>ACTIVE</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center space-x-1 px-1 py-0.2 rounded text-[8px] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1 h-1 rounded-full bg-amber-400" />
            <span>WARN</span>
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="flex items-center space-x-1 px-1 py-0.2 rounded text-[8px] font-mono bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-1 h-1 rounded-full bg-rose-400" />
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
      ctx.moveTo(midX - 22, midY + pitchOffset);
      ctx.lineTo(midX - 6, midY + pitchOffset);
      ctx.moveTo(midX + 6, midY + pitchOffset);
      ctx.lineTo(midX + 22, midY + pitchOffset);
      ctx.stroke();

      // Optical Center Reticle
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
      ctx.beginPath();
      ctx.arc(midX, midY, 4, 0, Math.PI * 2);
      ctx.moveTo(midX - 8, midY); ctx.lineTo(midX - 3, midY);
      ctx.moveTo(midX + 3, midY); ctx.lineTo(midX + 8, midY);
      ctx.moveTo(midX, midY - 8); ctx.lineTo(midX, midY - 3);
      ctx.moveTo(midX, midY + 3); ctx.lineTo(midX, midY + 8);
      ctx.stroke();

      // Dynamic Target Bounding Box if Visual Evidence is High
      if (sensorEvidence.visual > 0.45) {
        const boxW = 38;
        const boxH = 30;
        const targetX = midX - boxW / 2;
        const targetY = midY - boxH / 2 + pitchOffset;

        ctx.strokeStyle = sensorEvidence.visual > 0.75 ? '#10b981' : '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(targetX, targetY, boxW, boxH);

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
      const radius = 12 + heatIntensity * 30;
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

      // Thermal Reticle
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(midX - 10, midY); ctx.lineTo(midX - 3, midY);
      ctx.moveTo(midX + 3, midY); ctx.lineTo(midX + 10, midY);
      ctx.moveTo(midX, midY - 10); ctx.lineTo(midX, midY - 3);
      ctx.moveTo(midX, midY + 3); ctx.lineTo(midX, midY + 10);
      ctx.stroke();

      // Thermal reference bar on right
      const barX = w - 6;
      const barGrad = ctx.createLinearGradient(0, 6, 0, h - 6);
      barGrad.addColorStop(0, '#ffffff');
      barGrad.addColorStop(0.25, '#fff200');
      barGrad.addColorStop(0.5, '#ff4d00');
      barGrad.addColorStop(0.75, '#6a0a7a');
      barGrad.addColorStop(1, '#05021a');
      ctx.fillStyle = barGrad;
      ctx.fillRect(barX, 6, 3, h - 12);

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

      // FFT Spectrum Frequency Bars (14 bands)
      const numBars = 14;
      const barWidth = (w - 18) / numBars;
      const acousticElevated = sensorEvidence.acoustic > 0.55;

      for (let i = 0; i < numBars; i++) {
        const isVoiceBand = i >= 4 && i <= 8;
        let bandHeight = Math.sin(phase + i * 0.5) * 5 + 8;

        if (acousticElevated && isVoiceBand) {
          bandHeight += sensorEvidence.acoustic * 36;
        } else {
          bandHeight += (sensorEvidence.acoustic * 12);
        }

        const barHeight = Math.min(h - 12, Math.max(3, bandHeight));
        const x = 9 + i * barWidth;
        const y = h - 6 - barHeight;

        if (acousticElevated && isVoiceBand) {
          ctx.fillStyle = '#10b981';
        } else if (acousticElevated) {
          ctx.fillStyle = '#f59e0b';
        } else {
          ctx.fillStyle = '#222938';
        }

        ctx.fillRect(x, y, barWidth - 1.5, barHeight);
      }

      phase += 0.2;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [sensorEvidence.acoustic, sensorEvidence.acousticFrequency]);

  // 4. LiDAR 3D Point Cloud & Structural Void Scan Canvas
  useEffect(() => {
    const canvas = lidarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let sweep = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = '#06080d';
      ctx.fillRect(0, 0, w, h);

      const hasVoid = (sensorEvidence.lidarVoidVolumeM3 || 0) > 1.0;

      // 3D Perspective Grid Points / Contour
      const rows = 7;
      const cols = 10;
      const startY = h * 0.35;
      const endY = h * 0.9;

      for (let r = 0; r < rows; r++) {
        const t = r / (rows - 1);
        const y = startY + t * (endY - startY);
        const rowWidth = w * (0.55 + t * 0.4);
        const leftX = (w - rowWidth) / 2;

        for (let c = 0; c < cols; c++) {
          const ct = c / (cols - 1);
          const x = leftX + ct * rowWidth;
          
          // Animate point height displacement based on rubble or void
          let displacement = Math.sin(x * 0.08 + sweep) * 2;
          
          // If cavity detected in center, draw deep elevation dip
          const distToCenter = Math.hypot(ct - 0.5, t - 0.6);
          const inVoidCore = hasVoid && distToCenter < 0.28;

          if (inVoidCore) {
            displacement -= (sensorEvidence.lidarVoidVolumeM3 || 3) * 2.5;
            ctx.fillStyle = '#f43f5e'; // Red void anomaly
          } else {
            ctx.fillStyle = inVoidCore ? '#f43f5e' : ((ct * rows + r) % 3 === 0 ? '#38bdf8' : '#0ea5e9');
          }

          ctx.beginPath();
          ctx.arc(x, y + displacement, inVoidCore ? 2.5 : 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // LiDAR Vertical Radar Laser Sweep Line
      const sweepX = ((sweep * 25) % w);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sweepX, 0);
      ctx.lineTo(sweepX, h);
      ctx.stroke();

      // Bounding box on detected void
      if (hasVoid) {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(w * 0.35, h * 0.4, w * 0.3, h * 0.45);
        ctx.fillStyle = '#f43f5e';
        ctx.font = '7px monospace';
        ctx.fillText(`VOID: ${sensorEvidence.lidarVoidVolumeM3}m³`, w * 0.36, h * 0.38);
      }

      sweep += 0.06;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [sensorEvidence.lidarVoidVolumeM3, sensorEvidence.lidarDepthM]);

  return (
    <div className="tactical-glass rounded-lg border border-white/10 p-2 flex flex-col space-y-1.5 shadow-xl tactical-corner">
      <div className="flex items-center justify-between border-b border-white/5 pb-1">
        <div className="flex items-center space-x-2">
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <h2 className="font-tech text-xs font-bold tracking-wider text-slate-100">
            INTEGRATED 5-SENSOR RECONNAISSANCE SUITE
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
              <span>GIMBAL</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5">
        {/* Sensor 1: RGB Optical Recon Camera */}
        <div className="bg-[#0b0e14]/90 p-1.5 rounded border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1 text-[10px] font-mono font-semibold text-slate-300">
                <Camera className="w-2.5 h-2.5 text-amber-400" />
                <span>RGB 4K</span>
              </div>
              {renderStatusBadge(sensorStatus.rgbCamera)}
            </div>

            <div className="relative w-full h-16 rounded bg-black overflow-hidden border border-white/5 group cursor-pointer" onClick={onOpenGimbal}>
              <canvas ref={rgbCanvasRef} width={140} height={64} className="w-full h-full object-cover" />
              <div className="absolute top-0.5 left-1 text-[7px] font-mono text-amber-300 bg-black/70 px-1 rounded">
                GIMBAL 45°
              </div>
              <div className="absolute bottom-0.5 right-1 text-[7px] font-mono text-slate-400 bg-black/70 px-1 rounded">
                4K 60FPS
              </div>
            </div>
          </div>
          <div className="mt-1 text-[8px] font-mono text-slate-400 flex justify-between">
            <span>RES: 3840×2160</span>
            <span className="text-amber-300 font-bold">{(sensorEvidence.visual * 100).toFixed(0)}% MATCH</span>
          </div>
        </div>

        {/* Sensor 2: FLIR Longwave Infrared Thermal Sensor */}
        <div className="bg-[#0b0e14]/90 p-1.5 rounded border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1 text-[10px] font-mono font-semibold text-slate-300">
                <Flame className="w-2.5 h-2.5 text-rose-400" />
                <span>FLIR LWIR</span>
              </div>
              {renderStatusBadge(sensorStatus.thermalSensor)}
            </div>

            <div className="relative w-full h-16 rounded bg-black overflow-hidden border border-white/5 group cursor-pointer" onClick={onOpenGimbal}>
              <canvas ref={thermalCanvasRef} width={140} height={64} className="w-full h-full object-cover" />
              <div className="absolute top-0.5 left-1 text-[7px] font-mono text-rose-300 bg-black/70 px-1 rounded border border-rose-500/30">
                CORE: {sensorEvidence.thermalHotspotTemp}°C
              </div>
            </div>
          </div>
          <div className="mt-1 text-[8px] font-mono text-slate-400 flex justify-between">
            <span>IRONBOW</span>
            <span className="text-rose-400 font-bold">Δ {((sensorEvidence.thermalHotspotTemp || 19) - 18.5).toFixed(1)}°C</span>
          </div>
        </div>

        {/* Sensor 3: LiDAR 3D Structural Void Depth */}
        <div className="bg-[#0b0e14]/90 p-1.5 rounded border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1 text-[10px] font-mono font-semibold text-slate-300">
                <Box className="w-2.5 h-2.5 text-sky-400" />
                <span>LiDAR 3D VOID</span>
              </div>
              {renderStatusBadge(sensorStatus.lidar || 'ACTIVE')}
            </div>

            <div className="relative w-full h-16 rounded bg-black overflow-hidden border border-white/5">
              <canvas ref={lidarCanvasRef} width={140} height={64} className="w-full h-full object-cover" />
              <div className="absolute top-0.5 left-1 text-[7px] font-mono text-sky-300 bg-black/70 px-1 rounded border border-sky-500/30">
                {sensorEvidence.lidarDepthM}m AGL
              </div>
              <div className="absolute bottom-0.5 right-1 text-[7px] font-mono text-slate-400 bg-black/70 px-1 rounded">
                100 kHz 905nm
              </div>
            </div>
          </div>
          <div className="mt-1 text-[8px] font-mono text-slate-400 flex justify-between">
            <span>RUBBLE DEPTH</span>
            <span className={sensorEvidence.lidarVoidVolumeM3 ? 'text-rose-400 font-bold' : 'text-sky-400'}>
              {sensorEvidence.lidarVoidVolumeM3 ? `${sensorEvidence.lidarVoidVolumeM3}m³ CAVITY` : 'SOLID'}
            </span>
          </div>
        </div>

        {/* Sensor 4: MEMS Acoustic Array Microphone */}
        <div className="bg-[#0b0e14]/90 p-1.5 rounded border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1 text-[10px] font-mono font-semibold text-slate-300">
                <Volume2 className="w-2.5 h-2.5 text-emerald-400" />
                <span>ACOUSTIC ARRAY</span>
              </div>
              {renderStatusBadge(sensorStatus.acousticSensor)}
            </div>

            <div className="relative w-full h-16 rounded bg-black overflow-hidden border border-white/5">
              <canvas ref={acousticCanvasRef} width={140} height={64} className="w-full h-full object-cover" />
              <div className="absolute top-0.5 left-1 text-[7px] font-mono text-emerald-300 bg-black/70 px-1 rounded border border-emerald-500/30">
                {sensorEvidence.acousticDecibels} dB SPL
              </div>
              <div className="absolute bottom-0.5 right-1 text-[7px] font-mono text-slate-400 bg-black/70 px-1 rounded">
                {sensorEvidence.acousticFrequency} Hz
              </div>
            </div>
          </div>
          <div className="mt-1 text-[8px] font-mono text-slate-400 flex justify-between">
            <span>4-CH MEMS</span>
            <span className={sensorEvidence.acoustic > 0.55 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {sensorEvidence.acoustic > 0.55 ? 'VOICE ANOMALY' : 'AMBIENT'}
            </span>
          </div>
        </div>

        {/* Sensor 5: GPS & IMU Flight Telemetry */}
        <div className="bg-[#0b0e14]/90 p-1.5 rounded border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1 text-[10px] font-mono font-semibold text-slate-300">
                <Navigation className="w-2.5 h-2.5 text-amber-400" />
                <span>GPS & IMU</span>
              </div>
              {renderStatusBadge(sensorStatus.imu)}
            </div>

            <div className="w-full h-16 rounded bg-black border border-white/5 p-1 flex flex-col justify-between font-mono text-[10px]">
              <div className="flex justify-between border-b border-white/5 pb-0.5 text-[8px]">
                <span className="text-slate-500">POS:</span>
                <span className="text-slate-200 font-bold">{telemetry.latitude.toFixed(4)}, {telemetry.longitude.toFixed(4)}</span>
              </div>
              <div className="grid grid-cols-3 gap-0.5 text-center py-0.5">
                <div className="bg-white/5 rounded py-0.2">
                  <div className="text-[7px] text-slate-500">PITCH</div>
                  <div className="text-[8px] text-slate-200">{telemetry.pitch}°</div>
                </div>
                <div className="bg-white/5 rounded py-0.2">
                  <div className="text-[7px] text-slate-500">ROLL</div>
                  <div className="text-[8px] text-slate-200">{telemetry.roll}°</div>
                </div>
                <div className="bg-white/5 rounded py-0.2">
                  <div className="text-[7px] text-slate-500">HDG</div>
                  <div className="text-[8px] text-slate-200">{telemetry.heading}°</div>
                </div>
              </div>
              <div className="flex justify-between text-[8px] text-slate-400">
                <span>HDOP: 0.82</span>
                <span className="text-amber-300">{telemetry.satellites} SATS</span>
              </div>
            </div>
          </div>
          <div className="mt-1 text-[8px] font-mono text-slate-400 flex justify-between">
            <span>{telemetry.heading}° N</span>
            <span className="text-emerald-400">RTK LOCKED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
