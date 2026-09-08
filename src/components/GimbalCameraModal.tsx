import React, { useState } from 'react';
import { 
  X, 
  Flame 
} from 'lucide-react';
import { SensorEvidence } from '../types/sensors';
import { Telemetry } from '../types/telemetry';

interface GimbalCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  sensorEvidence: SensorEvidence;
  telemetry: Telemetry;
}

export const GimbalCameraModal: React.FC<GimbalCameraModalProps> = ({
  isOpen,
  onClose,
  sensorEvidence,
  telemetry,
}) => {
  const [filterMode, setFilterMode] = useState<'thermal' | 'optical' | 'nvg' | 'ironbow'>('thermal');
  const [zoomLevel, setZoomLevel] = useState<number>(2);
  const [gimbalAngle, setGimbalAngle] = useState<number>(-45);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#0b0d13] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
        {/* Modal Top Bar */}
        <div className="px-4 py-2.5 bg-[#0f121a] border-b border-white/10 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-tech text-sm font-bold text-slate-100 tracking-wider">
              UAV GIMBAL LIVE RECONNAISSANCE FEED
            </span>
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
              REC-01 DIRECT STREAM
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Mode Switcher Buttons */}
            <div className="flex bg-[#08090d] rounded border border-white/10 p-0.5">
              <button
                onClick={() => setFilterMode('thermal')}
                className={`px-2 py-1 rounded text-[10px] transition ${
                  filterMode === 'thermal'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                FLIR WHITE-HOT
              </button>
              <button
                onClick={() => setFilterMode('ironbow')}
                className={`px-2 py-1 rounded text-[10px] transition ${
                  filterMode === 'ironbow'
                    ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                IRONBOW IR
              </button>
              <button
                onClick={() => setFilterMode('optical')}
                className={`px-2 py-1 rounded text-[10px] transition ${
                  filterMode === 'optical'
                    ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                OPTICAL 4K
              </button>
              <button
                onClick={() => setFilterMode('nvg')}
                className={`px-2 py-1 rounded text-[10px] transition ${
                  filterMode === 'nvg'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                NVG NIGHT VISION
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Close Full Gimbal Monitor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas / Screen Area */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center select-none">
          {/* Background Feed Image */}
          <div 
            className={`absolute inset-0 bg-center bg-cover transition-all duration-300 ${
              filterMode === 'thermal' 
                ? 'grayscale contrast-150 brightness-95' 
                : filterMode === 'ironbow'
                ? 'hue-rotate-15 contrast-125 saturate-200'
                : filterMode === 'nvg'
                ? 'sepia hue-rotate-90 saturate-200 contrast-150 brightness-110'
                : 'contrast-105'
            }`}
            style={{
              backgroundImage: filterMode === 'optical' ? 'url(/disaster_drone_bg.jpg)' : 'url(/flir_thermal_survivor.jpg)',
              transform: `scale(${1 + (zoomLevel - 1) * 0.25})`,
            }}
          />

          {/* NVG Green phosphor or Thermal ironbow tint overlay */}
          {filterMode === 'nvg' && (
            <div className="absolute inset-0 bg-emerald-500/20 mix-blend-color pointer-events-none" />
          )}
          {filterMode === 'ironbow' && (
            <div className="absolute inset-0 bg-amber-600/15 mix-blend-overlay pointer-events-none" />
          )}

          {/* Tactical HUD Telemetry Overlay */}
          <div className="absolute inset-0 p-4 pointer-events-none flex flex-col justify-between font-mono text-xs text-white/90">
            {/* Top HUD Row */}
            <div className="flex items-start justify-between">
              <div className="bg-black/60 backdrop-blur-sm p-2 rounded border border-white/10 space-y-1">
                <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>MODE: {filterMode.toUpperCase()}</span>
                </div>
                <div>ZOOM: {zoomLevel}.0x DIGITAL</div>
                <div>GIMBAL PITCH: {gimbalAngle}°</div>
                <div className="text-[10px] text-slate-300">AGC: DYNAMIC AUTO • 60 FPS</div>
              </div>

              <div className="bg-black/60 backdrop-blur-sm p-2 rounded border border-white/10 text-right space-y-1">
                <div className="text-emerald-400 font-bold">DATE: {new Date().toLocaleDateString()}</div>
                <div>UTC: {new Date().toLocaleTimeString()}</div>
                <div>ALT: {telemetry.altitude.toFixed(1)}m AGL</div>
                <div className="text-[10px] text-slate-300">POS: {telemetry.latitude.toFixed(5)}°N, {telemetry.longitude.toFixed(5)}°E</div>
              </div>
            </div>

            {/* Center Targeting Reticle & Target Lock */}
            <div className="relative flex flex-col items-center justify-center">
              {/* Dynamic Target Box */}
              {sensorEvidence.thermal > 0.5 && (
                <div className="relative border-2 border-emerald-400 bg-emerald-500/10 px-4 py-2 rounded animate-pulse text-center">
                  <div className="text-emerald-300 font-bold tracking-wider text-xs">
                    *SURVIVOR TARGET LOCKED*
                  </div>
                  <div className="text-amber-300 text-xs font-mono font-bold mt-0.5">
                    CORE HEAT: {sensorEvidence.thermalHotspotTemp || 36.8}°C (Δ +18.3°C)
                  </div>
                  <div className="text-[10px] text-slate-200">
                    ACOUSTIC BEAM: {sensorEvidence.acousticDecibels || 78} dB @ {sensorEvidence.acousticFrequency || 850} Hz
                  </div>
                </div>
              )}

              {/* Optical Crosshairs */}
              <div className="absolute w-40 h-40 pointer-events-none flex items-center justify-center">
                <div className="w-full h-0.5 bg-white/40" />
                <div className="absolute h-full w-0.5 bg-white/40" />
                <div className="absolute w-12 h-12 rounded-full border border-white/60" />
              </div>
            </div>

            {/* Bottom HUD Row */}
            <div className="flex items-end justify-between">
              <div className="bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded border border-white/10 flex items-center space-x-3">
                <span className="text-amber-400 font-bold">BATTERY: {telemetry.battery}%</span>
                <span>•</span>
                <span className="text-emerald-400">GPS: {telemetry.gpsStatus} ({telemetry.satellites} SATS)</span>
                <span>•</span>
                <span className="text-sky-400">SPD: {telemetry.speed.toFixed(1)} m/s</span>
              </div>

              <div className="bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded border border-white/10 flex items-center space-x-2">
                <span>COMPASS:</span>
                <span className="text-amber-300 font-bold">{telemetry.heading}° N</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Controls Bar */}
        <div className="px-4 py-2 bg-[#0f121a] border-t border-white/10 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-3">
            <span className="text-slate-400">ZOOM CONTROLS:</span>
            {[1, 2, 4, 8].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setZoomLevel(lvl)}
                className={`px-2 py-0.5 rounded border transition ${
                  zoomLevel === lvl
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                    : 'bg-[#08090d] text-slate-400 border-white/10 hover:text-slate-200'
                }`}
              >
                {lvl}x
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-slate-400">GIMBAL ANGLE:</span>
            <button
              onClick={() => setGimbalAngle(Math.min(0, gimbalAngle + 15))}
              className="px-2 py-0.5 rounded bg-[#08090d] text-slate-300 border border-white/10 hover:bg-white/5"
            >
              ▲ TILT UP
            </button>
            <span className="text-amber-300 font-bold">{gimbalAngle}°</span>
            <button
              onClick={() => setGimbalAngle(Math.max(-90, gimbalAngle - 15))}
              className="px-2 py-0.5 rounded bg-[#08090d] text-slate-300 border border-white/10 hover:bg-white/5"
            >
              ▼ TILT DOWN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
