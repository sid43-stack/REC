import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { LiveMap } from './components/LiveMap';
import { SVLPIntelligencePanel } from './components/SVLPIntelligencePanel';
import { SensorPanel } from './components/SensorPanel';
import { IncidentList } from './components/IncidentList';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { MissionTimeline } from './components/MissionTimeline';
import { SystemDiagnostics } from './components/SystemDiagnostics';
import { GimbalCameraModal } from './components/GimbalCameraModal';
import { ImageryVault } from './components/ImageryVault';
import { useRECData } from './hooks/useRECData';
import { Incident } from './types/incident';
import { ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const { data, service } = useRECData();
  const [activeTab, setActiveTab] = useState<'command' | 'incidents' | 'vault' | 'timeline' | 'system'>('command');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isGimbalOpen, setIsGimbalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Tactical Web Audio Synthesizer
  const playTacticalChirp = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Audio context policy
    }
  }, [soundEnabled]);

  // Audio cues on state transitions
  useEffect(() => {
    if (!data) return;

    if (data.svlpEvaluation.state === 'ALERT') {
      playTacticalChirp(880, 0.4, 'sawtooth');
    } else if (data.svlpEvaluation.state === 'SUSPICION') {
      playTacticalChirp(520, 0.15, 'sine');
    } else if (data.svlpEvaluation.state === 'INVESTIGATION') {
      playTacticalChirp(640, 0.2, 'triangle');
    }
  }, [data?.svlpEvaluation.state, playTacticalChirp]);

  // Modern Keyboard Hotkeys ([Space], [A], [F], [1-5])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (data?.isPaused) service.resumeMission();
        else service.pauseMission();
        playTacticalChirp(440, 0.1);
      } else if (e.key.toLowerCase() === 'a') {
        service.injectAnomaly();
        playTacticalChirp(700, 0.2, 'sawtooth');
      } else if (e.key.toLowerCase() === 'f') {
        setIsGimbalOpen((prev) => !prev);
      } else if (e.key === '1') {
        setActiveTab('command');
      } else if (e.key === '2') {
        setActiveTab('incidents');
      } else if (e.key === '3') {
        setActiveTab('vault');
      } else if (e.key === '4') {
        setActiveTab('timeline');
      } else if (e.key === '5') {
        setActiveTab('system');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data?.isPaused, service, playTacticalChirp]);

  if (!data) {
    return (
      <div className="h-screen bg-[#090b10] text-amber-400 flex flex-col items-center justify-center font-mono space-y-3">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <div className="text-sm font-bold tracking-widest uppercase">INITIALIZING REC COMMAND SYSTEM...</div>
      </div>
    );
  }

  const isCriticalAlert = data.svlpEvaluation.state === 'ALERT';

  return (
    <div className="relative h-screen max-h-screen flex flex-col text-slate-100 overflow-hidden select-none">
      {/* Cinematic Disaster Background Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-40 z-0"
        style={{ backgroundImage: 'url(/disaster_drone_bg.jpg)' }}
      />
      
      {/* Matte Obsidian Backdrop & Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c12]/92 via-[#0b0e14]/88 to-[#07090e]/95 backdrop-blur-[10px] pointer-events-none z-0" />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Top System Header - high stacking context so dropdowns never overlap with map */}
        <div className="relative z-50 shrink-0">
          <Header
            data={data}
            service={service}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenGimbal={() => setIsGimbalOpen(true)}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
          />
        </div>

        {/* Flashing Alert Banner when in Critical Survivor Alert state */}
        {isCriticalAlert && (
          <div className="bg-rose-600 text-white px-4 py-1 flex items-center justify-between text-xs font-mono font-bold animate-pulse shadow-lg shrink-0 z-30">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4" />
              <span>CRITICAL RESCUE ALERT: HIGH-CONFIDENCE SURVIVOR SIGNATURE DETECTED</span>
            </div>
            <button
              onClick={() => setActiveTab('incidents')}
              className="px-2 py-0.5 rounded bg-white text-rose-700 hover:bg-rose-100 text-[10px] uppercase tracking-wider font-extrabold"
            >
              OPEN INCIDENT RECORD
            </button>
          </div>
        )}

        {/* Main Unified Viewport Dashboard (Zero-scroll, 100% viewport fit) */}
        <main className="relative z-10 flex-1 min-h-0 p-2 sm:p-2.5 overflow-hidden flex flex-col">
          {activeTab === 'command' && (
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5">
              {/* Left Column: Live Map + Sensor Suite (7 cols on lg and xl) */}
              <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-2 min-h-0 h-full">
                {/* Tactical Live Map */}
                <div className="flex-1 min-h-[260px] h-full">
                  <LiveMap
                    data={data}
                    onSelectIncident={(inc) => setSelectedIncident(inc)}
                  />
                </div>

                {/* Integrated Sensor Payload (Compact HUD strip) */}
                <div className="shrink-0 h-[178px]">
                  <SensorPanel
                    sensorStatus={data.sensorStatus}
                    sensorEvidence={data.sensorEvidence}
                    telemetry={data.telemetry}
                    onOpenGimbal={() => setIsGimbalOpen(true)}
                  />
                </div>
              </div>

              {/* Right Column: REC-SVLP Intelligence Panel + Prominent Incident Queue (5 cols on lg & xl) */}
              <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-2 min-h-0 h-full">
                {/* REC-SVLP Intelligence Focal Point */}
                <div className="shrink-0">
                  <SVLPIntelligencePanel
                    svlpEvaluation={data.svlpEvaluation}
                    sensorEvidence={data.sensorEvidence}
                    service={service}
                  />
                </div>

                {/* Incidents Queue & Alerts (Spacious & Prominent) */}
                <div className="flex-1 min-h-[170px] overflow-hidden flex flex-col">
                  <IncidentList
                    incidents={data.incidents}
                    service={service}
                    onSelectIncident={(inc) => setSelectedIncident(inc)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Screen 2: Dedicated Full Incidents View */}
          {activeTab === 'incidents' && (
            <div className="flex-1 min-h-0 max-w-5xl mx-auto w-full py-2 overflow-hidden flex flex-col">
              <IncidentList
                incidents={data.incidents}
                service={service}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
              />
            </div>
          )}

          {/* Screen 3: Dedicated Imagery & Thermal Vault View */}
          {activeTab === 'vault' && (
            <div className="flex-1 min-h-0 w-full py-2 overflow-hidden flex flex-col">
              <ImageryVault />
            </div>
          )}

          {/* Screen 4: Dedicated Full Mission Timeline View */}
          {activeTab === 'timeline' && (
            <div className="flex-1 min-h-0 max-w-4xl mx-auto w-full py-2 overflow-hidden flex flex-col">
              <MissionTimeline events={data.missionEvents} />
            </div>
          )}

          {/* Screen 5: Dedicated System Diagnostics View */}
          {activeTab === 'system' && (
            <div className="flex-1 min-h-0 max-w-5xl mx-auto w-full py-2 overflow-y-auto">
              <SystemDiagnostics data={data} />
            </div>
          )}
        </main>

        {/* Fullscreen Interactive Gimbal Camera Modal */}
        <GimbalCameraModal
          isOpen={isGimbalOpen}
          onClose={() => setIsGimbalOpen(false)}
          sensorEvidence={data.sensorEvidence}
          telemetry={data.telemetry}
        />

        {/* Incident Detail Modal */}
        {selectedIncident && (
          <IncidentDetailModal
            incident={selectedIncident}
            onClose={() => setSelectedIncident(null)}
            service={service}
          />
        )}

        {/* Crisp Tactical Footer with Hotkey Cheatsheet */}
        <footer className="border-t border-white/10 bg-[#07090e]/95 px-3 py-1 flex items-center justify-between text-[10px] font-mono text-slate-400 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-slate-300 font-semibold">REC COMMAND CENTER</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-300/80">REC-SVLP PROTOCOL</span>
            <span className="text-slate-600">•</span>
            <span>SECTOR ALPHA DRILL</span>
          </div>

          {/* Modern Keyboard Hotkey Guide */}
          <div className="hidden sm:flex items-center space-x-3 text-slate-400">
            <span className="flex items-center space-x-1">
              <kbd className="px-1 py-0.2 rounded bg-white/10 text-slate-200 text-[9px]">Space</kbd>
              <span>Pause</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1 py-0.2 rounded bg-white/10 text-slate-200 text-[9px]">A</kbd>
              <span>Drill</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1 py-0.2 rounded bg-white/10 text-slate-200 text-[9px]">F</kbd>
              <span>Gimbal</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1 py-0.2 rounded bg-white/10 text-slate-200 text-[9px]">1-5</kbd>
              <span>Views</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400">SATCOM LINKED</span>
            <span className="text-slate-600">•</span>
            <span>v1.2.0 MODERN</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
