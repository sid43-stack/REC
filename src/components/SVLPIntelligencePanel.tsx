import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  AlertCircle, 
  Crosshair, 
  CheckCircle2, 
  Sliders, 
  Info, 
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
    <div className={`rounded-lg border bg-[#0d1017]/90 backdrop-blur-xl ${meta.border} p-2.5 flex flex-col space-y-2 shadow-xl transition-all duration-300 tactical-corner`}>
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="font-tech text-xs font-bold tracking-wider text-slate-100 flex items-center gap-1.5">
              REC-SVLP INTELLIGENCE ENGINE
              <span className="text-[9px] font-mono font-normal text-amber-400 px-1 py-0.2 rounded bg-amber-500/10 border border-amber-500/30">
                v1.0 PROTOCOL
              </span>
            </h2>
            <p className="text-[9px] font-mono text-slate-400">
              SURVIVOR VERIFICATION & LOCALIZATION PROTOCOL
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowWeightsConfig(!showWeightsConfig)}
          className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono border transition ${
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

      {/* Philosophy Callout Tag */}
      <div className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
        <span className="text-slate-400">Operational Mandate:</span>
        <span className="text-cyan-300 font-semibold tracking-wide">
          “REC does not just detect. REC investigates.”
        </span>
      </div>

      {/* Protocol State Sequence Pipeline */}
      <div className="bg-[#060912] p-1.5 rounded border border-slate-800">
        <div className="text-[9px] font-mono text-slate-400 mb-1 uppercase flex items-center justify-between">
          <span>SVLP Verification Sequence</span>
          <span className="text-slate-500">Step {SVLP_STEPS.findIndex(s => s.state === state) + 1} of 6</span>
        </div>
        <div className="grid grid-cols-6 gap-1">
          {SVLP_STEPS.map((step, idx) => {
            const isCurrent = step.state === state;
            const isPassed = SVLP_STEPS.findIndex(s => s.state === state) > idx;

            return (
              <div
                key={step.state}
                className={`py-1.5 px-1 rounded text-center transition-all ${
                  isCurrent
                    ? `${meta.bg} border ${meta.border} font-bold shadow-md`
                    : isPassed
                    ? 'bg-slate-900/60 border border-slate-800 text-slate-400'
                    : 'bg-slate-950/40 border border-slate-900 text-slate-600'
                }`}
              >
                <div className="text-[9px] font-mono leading-none tracking-tight">
                  {step.desc}
                </div>
                <div className={`text-[10px] font-tech mt-0.5 truncate ${isCurrent ? meta.accent : ''}`}>
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Active State Banner */}
      <div className={`p-2 rounded-md border ${meta.bg} flex items-start justify-between gap-2 shadow-inner`}>
        <div className="flex items-start space-x-2">
          <div className="mt-0.5">{meta.icon}</div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-slate-400">STATE:</span>
              <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${meta.badge}`}>
                {state}
              </span>
              {triggerSource && triggerSource !== 'NONE' && (
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-900/80 text-amber-300 border border-amber-500/30">
                  TRIGGER: {triggerSource}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-200 mt-0.5 font-mono">{stateReason}</div>
          </div>
        </div>
      </div>

      {/* Combined Decision-Support Confidence Gauge */}
      <div className="bg-[#060912] p-2 rounded-md border border-slate-800 flex flex-col space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-[11px] font-mono text-slate-300 font-semibold">
              SURVIVOR CONFIDENCE SCORE
            </span>
            <div className="group relative">
              <Info className="w-3 h-3 text-slate-500 cursor-pointer" />
              <div className="hidden group-hover:block absolute z-20 left-0 bottom-5 w-64 p-2 bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300 rounded shadow-xl">
                Non-probabilistic decision support metric computed via multi-spectral evidence aggregation.
              </div>
            </div>
          </div>
          <div className="font-tech text-lg font-black text-slate-100 flex items-baseline space-x-1">
            <span className={`${meta.accent}`}>{Math.round(confidence * 100)}%</span>
            <span className="text-[10px] font-mono text-slate-500">SCORE</span>
          </div>
        </div>

        {/* Large Progress Bar with thresholds */}
        <div className="relative w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full bg-gradient-to-r ${meta.barColor} transition-all duration-500 rounded-full`}
            style={{ width: `${Math.min(100, confidence * 100)}%` }}
          />
          {/* Threshold markers */}
          <div className="absolute top-0 bottom-0 left-[45%] w-0.5 bg-amber-500/40" title="Suspicion (45%)" />
          <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-purple-500/50" title="Investigation (60%)" />
          <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-cyan-400/60" title="Verification (75%)" />
          <div className="absolute top-0 bottom-0 left-[82%] w-0.5 bg-rose-500/80" title="Alert (82%)" />
        </div>

        <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 px-0.5">
          <span>0%</span>
          <span className="text-amber-500/80">45% (SUSPECT)</span>
          <span className="text-purple-400/80">60% (INVESTIGATE)</span>
          <span className="text-cyan-400/80">75% (VERIFY)</span>
          <span className="text-rose-400/90 font-bold">82% (ALERT)</span>
          <span>100%</span>
        </div>
      </div>

      {/* Tri-Sensor Evidence Breakdown */}
      <div className="grid grid-cols-3 gap-1.5">
        {/* RGB Visual Evidence */}
        <div className="bg-[#090b10] p-2 rounded border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="flex items-center space-x-1 text-slate-300">
              <Camera className="w-3 h-3 text-amber-400" />
              <span>RGB</span>
            </span>
            <span className="font-bold text-amber-300">{(sensorEvidence.visual * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-black rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300 rounded-full"
              style={{ width: `${sensorEvidence.visual * 100}%` }}
            />
          </div>
          <div className="text-[9px] font-mono text-slate-400 truncate">
            {sensorEvidence.visualObjectLabel || "Scanning..."}
          </div>
        </div>

        {/* IR Thermal Evidence */}
        <div className="bg-[#090b10] p-2 rounded border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="flex items-center space-x-1 text-slate-300">
              <Flame className="w-3 h-3 text-rose-400" />
              <span>FLIR IR</span>
            </span>
            <span className="font-bold text-rose-400">{(sensorEvidence.thermal * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-black rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-300 rounded-full"
              style={{ width: `${sensorEvidence.thermal * 100}%` }}
            />
          </div>
          <div className="text-[9px] font-mono text-slate-400 flex items-center justify-between">
            <span>Core: <strong className="text-rose-300">{sensorEvidence.thermalHotspotTemp}°C</strong></span>
          </div>
        </div>

        {/* Acoustic Resonance Evidence */}
        <div className="bg-[#090b10] p-2 rounded border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="flex items-center space-x-1 text-slate-300">
              <Volume2 className="w-3 h-3 text-emerald-400" />
              <span>AUDIO</span>
            </span>
            <span className="font-bold text-emerald-400">{(sensorEvidence.acoustic * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-black rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${sensorEvidence.acoustic * 100}%` }}
            />
          </div>
          <div className="text-[9px] font-mono text-slate-400 flex items-center justify-between">
            <span>SPL: <strong className="text-emerald-300">{sensorEvidence.acousticDecibels} dB</strong></span>
          </div>
        </div>
      </div>

      {/* Tactical Advisory Recommendation */}
      <div className="bg-[#090b10] p-2 rounded border border-white/5 flex items-start space-x-2">
        <CornerDownRight className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
        <div>
          <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            RECOMMENDED AUTONOMOUS ACTION:
          </div>
          <div className="text-xs font-mono text-amber-100/90 mt-0.5 leading-relaxed">
            {recommendedAction}
          </div>
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
