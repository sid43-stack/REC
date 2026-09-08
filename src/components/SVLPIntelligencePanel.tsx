import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  AlertCircle, 
  Crosshair, 
  CheckCircle2, 
  Sliders, 
  Flame, 
  Volume2, 
  Camera, 
  Activity, 
  Zap, 
  CornerDownRight 
} from 'lucide-react';
import { SensorEvidence } from '../types/sensors';
import { SVLPEvaluation, SVLPState, SVLPWeights } from '../types/svlp';
import { IRECDataService } from '../services/dataService';

interface SVLPIntelligencePanelProps {
  svlpEvaluation: SVLPEvaluation;
  sensorEvidence: SensorEvidence;
  service: IRECDataService;
}

const SVLP_STEPS: { state: SVLPState; label: string; desc: string }[] = [
  { state: 'SEARCH', label: 'SEARCH', desc: 'Scan' },
  { state: 'SUSPICION', label: 'SUSPICION', desc: 'Detect' },
  { state: 'INVESTIGATION', label: 'INVESTIGATION', desc: 'Investigate' },
  { state: 'VERIFICATION', label: 'VERIFICATION', desc: 'Verify' },
  { state: 'ALERT', label: 'ALERT', desc: 'Alert' },
  { state: 'RETURN', label: 'RETURN', desc: 'Base' },
];

export const SVLPIntelligencePanel: React.FC<SVLPIntelligencePanelProps> = ({
  svlpEvaluation,
  sensorEvidence,
  service,
}) => {
  const [showWeightsConfig, setShowWeightsConfig] = useState(false);
  const [weights, setWeights] = useState<SVLPWeights>({
    visual: 0.35,
    thermal: 0.40,
    acoustic: 0.25,
  });

  const handleWeightChange = (key: keyof SVLPWeights, val: number) => {
    const updated = { ...weights, [key]: val };
    setWeights(updated);
    service.updateSVLPWeights(updated);
  };

  const { state, confidence, recommendedAction, stateReason, triggerSource } = svlpEvaluation;

  // Determine state banner visual appearance
  const getStateMeta = (currState: SVLPState) => {
    switch (currState) {
      case 'SEARCH':
        return {
          bg: 'bg-[#141824]/90 border-amber-500/30 text-amber-300',
          badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold',
          border: 'border-amber-500/20',
          icon: <Search className="w-4 h-4 text-amber-400 animate-pulse" />,
          accent: 'text-amber-400',
          barColor: 'from-amber-600 to-amber-400',
        };
      case 'SUSPICION':
        return {
          bg: 'bg-amber-950/50 border-amber-500/60 text-amber-300 emergency-glow',
          badge: 'bg-amber-500 text-black font-extrabold',
          border: 'border-amber-500/60',
          icon: <AlertCircle className="w-4 h-4 text-amber-400 animate-bounce" />,
          accent: 'text-amber-400',
          barColor: 'from-amber-500 to-orange-400',
        };
      case 'INVESTIGATION':
        return {
          bg: 'bg-purple-950/50 border-purple-500/60 text-purple-300',
          badge: 'bg-purple-500 text-white font-extrabold',
          border: 'border-purple-500/60',
          icon: <Crosshair className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />,
          accent: 'text-purple-400',
          barColor: 'from-purple-500 to-fuchsia-400',
        };
      case 'VERIFICATION':
        return {
          bg: 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300',
          badge: 'bg-emerald-500 text-black font-extrabold',
          border: 'border-emerald-500/60',
          icon: <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />,
          accent: 'text-emerald-400',
          barColor: 'from-emerald-500 to-teal-400',
        };
      case 'ALERT':
        return {
          bg: 'bg-rose-950/70 border-rose-500 text-rose-200 alert-glow-red animate-pulse',
          badge: 'bg-rose-600 text-white font-black',
          border: 'border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.4)]',
          icon: <ShieldAlert className="w-4 h-4 text-rose-400 animate-ping-slow" />,
          accent: 'text-rose-400',
          barColor: 'from-rose-600 to-red-500',
        };
      case 'RETURN':
        return {
          bg: 'bg-[#10131c] border-white/10 text-slate-300',
          badge: 'bg-slate-700 text-white',
          border: 'border-white/10',
          icon: <CheckCircle2 className="w-4 h-4 text-slate-400" />,
          accent: 'text-slate-300',
          barColor: 'from-slate-600 to-slate-400',
        };
    }
  };

  const meta = getStateMeta(state);

  return (
    <div className={`rounded-lg border bg-[#0d1017]/95 backdrop-blur-xl ${meta.border} p-2 flex flex-col gap-1.5 shadow-xl transition-all duration-300 tactical-corner`}>
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-1 shrink-0">
        <div className="flex items-center space-x-1.5 min-w-0">
          <div className="p-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
            <Zap className="w-3 h-3" />
          </div>
          <span className="font-tech text-xs font-bold tracking-wider text-slate-100 shrink-0">
            REC-SVLP INTELLIGENCE
          </span>
          <span className="text-[8px] font-mono text-amber-400 px-1 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 shrink-0">
            v1.0
          </span>
          <span className="text-[9px] font-mono text-cyan-300 hidden sm:inline truncate">
            • "{state === 'SEARCH' ? 'REC scans.' : state === 'SUSPICION' ? 'Anomaly detected.' : state === 'INVESTIGATION' ? 'REC investigates.' : state === 'VERIFICATION' ? 'Verifying target.' : state === 'ALERT' ? 'SURVIVOR CONFIRMED.' : 'Returning to base.'}"
          </span>
        </div>

        <button
          onClick={() => setShowWeightsConfig(!showWeightsConfig)}
          className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-mono border transition shrink-0 ${
            showWeightsConfig
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200'
          }`}
          title="Configure Protocol Evidence Weights"
        >
          <Sliders className="w-2.5 h-2.5" />
          <span>WEIGHTS</span>
        </button>
      </div>

      {/* Protocol State Sequence Pipeline */}
      <div className="grid grid-cols-6 gap-1 shrink-0">
        {SVLP_STEPS.map((step, idx) => {
          const isCurrent = step.state === state;
          const isPassed = SVLP_STEPS.findIndex(s => s.state === state) > idx;

          return (
            <div
              key={step.state}
              className={`py-0.5 px-0.5 rounded text-center transition-all ${
                isCurrent
                  ? `${meta.bg} border ${meta.border} font-bold shadow-sm`
                  : isPassed
                  ? 'bg-slate-900/60 border border-slate-800 text-slate-400'
                  : 'bg-slate-950/40 border border-slate-900 text-slate-600'
              }`}
            >
              <div className="text-[7.5px] font-mono leading-none tracking-tight text-slate-400 uppercase truncate">
                {step.desc}
              </div>
              <div className={`text-[8.5px] font-tech mt-0.5 truncate leading-tight ${isCurrent ? meta.accent : ''}`}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Active State & Confidence Metric */}
      <div className={`p-1.5 rounded-md border ${meta.bg} flex flex-col gap-1 shadow-inner shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 min-w-0">
            <span className="shrink-0">{meta.icon}</span>
            <span className="text-[9px] font-mono text-slate-400 shrink-0">STATE:</span>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded shrink-0 ${meta.badge}`}>
              {state}
            </span>
            {triggerSource && triggerSource !== 'NONE' && (
              <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-slate-900/80 text-amber-300 border border-amber-500/30 truncate">
                {triggerSource}
              </span>
            )}
          </div>
          <div className="flex items-baseline space-x-1 font-tech shrink-0">
            <span className="text-[9px] font-mono text-slate-400">CONF:</span>
            <span className={`text-sm font-bold ${meta.accent}`}>{Math.round(confidence * 100)}%</span>
          </div>
        </div>

        {/* Progress Bar with key thresholds */}
        <div className="relative w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full bg-gradient-to-r ${meta.barColor} transition-all duration-500 rounded-full`}
            style={{ width: `${Math.min(100, confidence * 100)}%` }}
          />
          <div className="absolute top-0 bottom-0 left-[45%] w-0.5 bg-amber-500/40" title="Suspicion (45%)" />
          <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-purple-500/50" title="Investigation (60%)" />
          <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-cyan-400/60" title="Verification (75%)" />
          <div className="absolute top-0 bottom-0 left-[82%] w-0.5 bg-rose-500/80" title="Alert (82%)" />
        </div>

        <div className="text-[10px] text-slate-200 font-mono truncate">
          {stateReason}
        </div>
      </div>

      {/* Multi-Sensor Corroboration Breakdown (4 Modalities) */}
      <div className="grid grid-cols-4 gap-1 shrink-0">
        {/* RGB Visual Evidence */}
        <div className="bg-[#090b10] px-1.5 py-1 rounded border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="flex items-center space-x-0.5 text-slate-300">
              <Camera className="w-2.5 h-2.5 text-amber-400" />
              <span>RGB</span>
            </span>
            <span className="font-bold text-amber-300">{(sensorEvidence.visual * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-1 bg-black rounded-full overflow-hidden my-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300 rounded-full"
              style={{ width: `${sensorEvidence.visual * 100}%` }}
            />
          </div>
          <div className="text-[8px] font-mono text-slate-400 truncate">
            {sensorEvidence.visualObjectLabel || "Scanning"}
          </div>
        </div>

        {/* IR Thermal Evidence */}
        <div className="bg-[#090b10] px-1.5 py-1 rounded border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="flex items-center space-x-0.5 text-slate-300">
              <Flame className="w-2.5 h-2.5 text-rose-400" />
              <span>FLIR</span>
            </span>
            <span className="font-bold text-rose-400">{(sensorEvidence.thermal * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-1 bg-black rounded-full overflow-hidden my-0.5">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-300 rounded-full"
              style={{ width: `${sensorEvidence.thermal * 100}%` }}
            />
          </div>
          <div className="text-[8px] font-mono text-slate-400 truncate">
            {sensorEvidence.thermalHotspotTemp}°C
          </div>
        </div>

        {/* Acoustic Resonance Evidence */}
        <div className="bg-[#090b10] px-1.5 py-1 rounded border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="flex items-center space-x-0.5 text-slate-300">
              <Volume2 className="w-2.5 h-2.5 text-emerald-400" />
              <span>AUDIO</span>
            </span>
            <span className="font-bold text-emerald-400">{(sensorEvidence.acoustic * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-1 bg-black rounded-full overflow-hidden my-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${sensorEvidence.acoustic * 100}%` }}
            />
          </div>
          <div className="text-[8px] font-mono text-slate-400 truncate">
            {sensorEvidence.acousticDecibels} dB
          </div>
        </div>

        {/* LiDAR 3D Void Evidence */}
        <div className="bg-[#090b10] px-1.5 py-1 rounded border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="flex items-center space-x-0.5 text-slate-300">
              <Activity className="w-2.5 h-2.5 text-sky-400" />
              <span>LiDAR</span>
            </span>
            <span className="font-bold text-sky-300">{((sensorEvidence.lidar || 0.85) * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-1 bg-black rounded-full overflow-hidden my-0.5">
            <div
              className="h-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-300 rounded-full"
              style={{ width: `${(sensorEvidence.lidar || 0.85) * 100}%` }}
            />
          </div>
          <div className="text-[8px] font-mono text-slate-400 truncate">
            {sensorEvidence.lidarVoidVolumeM3 || 0}m³
          </div>
        </div>
      </div>

      {/* Tactical Advisory Recommendation */}
      <div className="bg-[#090b10] px-2 py-1 rounded border border-white/5 flex items-start space-x-1.5 shrink-0">
        <CornerDownRight className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider font-semibold mr-1">ACTION:</span>
          <span className="text-[10px] font-mono text-amber-100/90 leading-tight">
            {recommendedAction}
          </span>
        </div>
      </div>

      {/* Configurable Weights Drawer */}
      {showWeightsConfig && (
        <div className="p-2.5 bg-[#0e111a] rounded border border-amber-500/30 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-amber-300 font-bold border-b border-white/10 pb-1">
            <span>CONFIGURABLE SVLP EVIDENCE WEIGHTS</span>
            <span className="text-[10px] text-slate-400">Sum: {(weights.visual + weights.thermal + weights.acoustic).toFixed(2)}</span>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Visual (W_v): {weights.visual.toFixed(2)}</span>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={weights.visual}
                onChange={(e) => handleWeightChange('visual', parseFloat(e.target.value))}
                className="w-32 accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Thermal (W_t): {weights.thermal.toFixed(2)}</span>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={weights.thermal}
                onChange={(e) => handleWeightChange('thermal', parseFloat(e.target.value))}
                className="w-32 accent-rose-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Acoustic (W_a): {weights.acoustic.toFixed(2)}</span>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={weights.acoustic}
                onChange={(e) => handleWeightChange('acoustic', parseFloat(e.target.value))}
                className="w-32 accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="text-[9px] text-slate-400 italic">
            *Weights modify the live decision matrix. Total score = W_v·Visual + W_t·Thermal + W_a·Acoustic.
          </div>
        </div>
      )}

      {/* Mandatory Decision Support Disclaimer */}
      <div className="text-[9px] font-mono text-slate-500 bg-black/40 px-2 py-0.5 rounded border border-white/5 text-center">
        DECISION SUPPORT METRIC ONLY • VERIFY GROUND TELEMETRY PRIOR TO PHYSICAL DISPATCH
      </div>
    </div>
  );
};
