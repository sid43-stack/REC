import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, 
  Battery, 
  Gauge, 
  MapPin, 
  Pause, 
  Play, 
  Radio, 
  RotateCcw, 
  Wifi, 
  Flame, 
  LayoutDashboard, 
  AlertTriangle, 
  Clock, 
  Cpu, 
  Camera, 
  Volume2, 
  VolumeX,
  ChevronDown,
  Images,
  Sparkles,
  Layers,
  ShieldAlert
} from 'lucide-react';
import { DRILL_SCENARIOS, ACCIDENT_CATALOG, SimulatorState } from '../simulation/droneSimulator';
import { IRECDataService } from '../services/dataService';
import { DrillScenarioId, MissionMode } from '../types/mission';

interface HeaderProps {
  data: SimulatorState;
  service: IRECDataService;
  activeTab: 'command' | 'incidents' | 'vault' | 'timeline' | 'system';
  setActiveTab: (tab: 'command' | 'incidents' | 'vault' | 'timeline' | 'system') => void;
  onOpenGimbal?: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  data, 
  service, 
  activeTab, 
  setActiveTab,
  onOpenGimbal,
  soundEnabled,
  setSoundEnabled
}) => {
  const { 
    telemetry, 
    missionMode, 
    missionTimeSeconds, 
    isPaused, 
    simulationSpeed, 
    incidents,
    activeScenario,
    isAutoDemoRunning
  } = data;

  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showScenarioDropdown, setShowScenarioDropdown] = useState(false);
  const [showAccidentMenu, setShowAccidentMenu] = useState(false);

  const scenarioRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);
  const accidentRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (scenarioRef.current && !scenarioRef.current.contains(event.target as Node)) {
        setShowScenarioDropdown(false);
      }
      if (modeRef.current && !modeRef.current.contains(event.target as Node)) {
        setShowModeDropdown(false);
      }
      if (accidentRef.current && !accidentRef.current.contains(event.target as Node)) {
        setShowAccidentMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const highPriorityCount = incidents.filter(i => i.status === 'HIGH_PRIORITY' || i.priority === 'CRITICAL').length;

  const handleSelectMode = (mode: MissionMode) => {
    service.setMissionMode(mode);
    setShowModeDropdown(false);
  };

  const handleSelectScenario = (scenarioId: DrillScenarioId) => {
    service.setScenario(scenarioId);
    setShowScenarioDropdown(false);
  };

  const handleTriggerAccident = (title?: string) => {
    service.simulateAccident(title);
    setShowAccidentMenu(false);
  };

  return (
    <header className="relative z-[9999] border-b border-white/10 bg-[#0a0c13] shadow-2xl shrink-0 select-none">
      {/* Top Bar: Brand, Team attribution, Scenario switcher, and Primary Telemetry HUD */}
      <div className="px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-white/5">
        <div className="flex items-center space-x-3">
          {/* Tactical Yellow Unit Badge with warm amber flare */}
          <div className="relative flex items-center justify-center w-9 h-9 rounded bg-yellow-500/20 border-2 border-yellow-400 text-yellow-300 font-tech font-bold text-lg tracking-wider shadow-[0_0_18px_rgba(234,179,8,0.45)]">
            REC
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-tech text-sm sm:text-base font-bold tracking-wider text-slate-100 flex items-center gap-2">
                RAPID EMERGENCY & CRISIS-RESPONSE DRONE
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-400/60 font-extrabold shadow-[0_0_10px_rgba(234,179,8,0.25)] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                  REC-01 UAV ACTIVE
                </span>
              </h1>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-2">
              <span className="text-amber-400/90 font-semibold">BOUSTROPHEDON CPP SEARCH</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">REC-SVLP INCIDENT ENGINE</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">GROUND CONTROL STATION</span>
            </div>
          </div>
        </div>

        {/* Telemetry Strip - Obsidian/Graphite Pills with Warm Accents */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 font-mono text-xs">
          {/* Single Yellow Drone Indicator */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#141824] border border-yellow-500/40 text-yellow-300 font-bold text-[11px] shadow-[0_0_10px_rgba(234,179,8,0.15)]">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span>REC-01 SCOUT</span>
          </div>

          {/* Drill Scenario Selector Dropdown - Elevated Stacking z-[9999] */}
          <div className="relative" ref={scenarioRef}>
            <button
              onClick={() => {
                setShowScenarioDropdown(!showScenarioDropdown);
                setShowModeDropdown(false);
                setShowAccidentMenu(false);
              }}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#141824] hover:bg-[#1c2233] border border-amber-500/40 transition cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.15)] text-slate-200"
              title="Select Disaster Scenario Drill"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 text-[10px]">SCENARIO:</span>
              <span className="text-amber-300 font-bold text-[11px] truncate max-w-[130px]">
                {DRILL_SCENARIOS[activeScenario]?.title || 'Earthquake'}
              </span>
              <ChevronDown className="w-3 h-3 text-amber-400 ml-0.5" />
            </button>

            {showScenarioDropdown && (
              <div className="absolute top-full right-0 mt-1.5 w-80 bg-[#0d1017] border-2 border-amber-500/60 rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.95)] z-[9999] p-2 space-y-1 backdrop-blur-none">
                <div className="text-[10px] font-mono text-amber-400 px-2 py-1 border-b border-white/10 font-bold flex items-center justify-between">
                  <span>DISASTER DRILL SCENARIO</span>
                  <span className="text-slate-500 text-[9px]">CPP RESETS GRID</span>
                </div>
                {Object.values(DRILL_SCENARIOS).map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc.id)}
                    className={`w-full text-left p-2 rounded transition flex flex-col ${
                      activeScenario === sc.id
                        ? 'bg-amber-500/25 border border-amber-500/50 text-amber-300 font-bold'
                        : 'hover:bg-white/10 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-100">{sc.title}</span>
                      {activeScenario === sc.id && (
                        <span className="text-[9px] text-amber-400 uppercase font-mono">ACTIVE</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">{sc.subtitle}</span>
                    <span className="text-[9px] text-amber-300/80 font-mono mt-0.5">Payload: {sc.recommendedSensor}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Manual Drone Flight Mode Selector - Elevated Stacking z-[9999] */}
          <div className="relative" ref={modeRef}>
            <button
              onClick={() => {
                setShowModeDropdown(!showModeDropdown);
                setShowScenarioDropdown(false);
                setShowAccidentMenu(false);
              }}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#141824] hover:bg-[#1c2233] border border-amber-500/40 transition cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.15)] text-slate-200"
              title="Click to manually select drone flight mode"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-slate-400 text-[10px]">MODE:</span>
              <span className="text-amber-300 font-bold text-[11px]">
                {missionMode.replace(/_/g, ' ')}
              </span>
              <ChevronDown className="w-3 h-3 text-amber-400 ml-0.5" />
            </button>

            {showModeDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-[#0d1017] border-2 border-amber-500/60 rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.95)] z-[9999] p-2 space-y-1 backdrop-blur-none">
                <div className="text-[10px] font-mono text-amber-400 px-2 py-1 border-b border-white/10 font-bold">
                  MANUAL FLIGHT MODE OVERRIDE
                </div>
                {[
                  { mode: 'AUTONOMOUS_SEARCH' as MissionMode, title: 'AUTONOMOUS SEARCH', desc: 'CPP Lawnmower grid survey at 35m' },
                  { mode: 'MANUAL_INVESTIGATION' as MissionMode, title: 'INVESTIGATION ORBIT', desc: 'Low-speed 3.5 m/s orbital scan' },
                  { mode: 'VERIFICATION_HOLD' as MissionMode, title: 'VERIFICATION HOLD', desc: 'Stationary hover at 12m altitude' },
                  { mode: 'RETURN_TO_HOME' as MissionMode, title: 'RETURN TO HOME (RTH)', desc: 'Direct vector to launch base at 40m' },
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => handleSelectMode(item.mode)}
                    className={`w-full text-left p-2 rounded transition flex flex-col ${
                      missionMode === item.mode
                        ? 'bg-amber-500/25 border border-amber-500/50 text-amber-300 font-bold'
                        : 'hover:bg-white/10 text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold">{item.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Connection */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#131722]/80 border border-white/10">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-400 text-[10px]">LINK:</span>
            <span className="text-emerald-400 font-bold text-[11px]">{telemetry.connection}</span>
            <span className="text-slate-500 text-[9px]">12ms</span>
          </div>

          {/* Battery */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#131722]/80 border border-white/10">
            <Battery className={`w-3 h-3 ${telemetry.battery < 25 ? 'text-rose-500 animate-bounce' : telemetry.battery < 50 ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span className="text-slate-400 text-[10px]">BAT:</span>
            <span className={`font-bold text-[11px] ${telemetry.battery < 25 ? 'text-rose-400' : 'text-slate-100'}`}>
              {telemetry.battery}%
            </span>
            <span className="text-slate-500 text-[9px]">{telemetry.batteryVoltage}V</span>
          </div>

          {/* GPS */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#131722]/80 border border-white/10">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400 text-[10px]">GPS:</span>
            <span className="text-amber-300 font-bold text-[11px]">{telemetry.gpsStatus}</span>
            <span className="text-slate-500 text-[9px]">{telemetry.satellites} SAT</span>
          </div>

          {/* Altitude */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#131722]/80 border border-white/10">
            <Activity className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400 text-[10px]">ALT:</span>
            <span className="text-slate-100 font-bold text-[11px]">{telemetry.altitude.toFixed(1)}m</span>
          </div>

          {/* Speed */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#131722]/80 border border-white/10">
            <Gauge className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400 text-[10px]">SPD:</span>
            <span className="text-slate-100 font-bold text-[11px]">{telemetry.speed.toFixed(1)} m/s</span>
          </div>

          {/* Mission Timer */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#131722]/80 border border-white/10">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400 text-[10px]">T+:</span>
            <span className="text-amber-400 font-bold text-[11px] font-code">{formatTime(missionTimeSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar & Simulation Controls */}
      <div className="px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 bg-[#080a0f]">
        {/* Navigation Tabs (Cockpit, Incidents, Imagery Vault, Timeline, Diagnostics) */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('command')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded transition ${
              activeTab === 'command'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-3 h-3" />
            <span>COMMAND COCKPIT</span>
          </button>

          <button
            onClick={() => setActiveTab('incidents')}
            className={`relative flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded transition ${
              activeTab === 'incidents'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>INCIDENTS</span>
            {highPriorityCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-rose-600 text-white font-bold animate-pulse">
                {highPriorityCount}
              </span>
            )}
          </button>

          {/* Imagery Vault Tab */}
          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded transition ${
              activeTab === 'vault'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Images className="w-3 h-3 text-amber-400" />
            <span>IMAGERY & THERMAL VAULT</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded transition ${
              activeTab === 'timeline'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>TIMELINE</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded transition ${
              activeTab === 'system'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span>DIAGNOSTICS & BUS</span>
          </button>

          {/* Quick Launch Gimbal Feed Button */}
          {onOpenGimbal && (
            <button
              onClick={onOpenGimbal}
              className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono bg-white/5 text-slate-300 hover:text-amber-300 hover:bg-amber-500/15 border border-white/10 transition ml-1"
              title="Open Fullscreen Interactive Drone Reconnaissance Gimbal"
            >
              <Camera className="w-3 h-3 text-amber-400" />
              <span>GIMBAL MONITOR</span>
            </button>
          )}
        </div>

        {/* Tactical Controls, Judge Auto-Demo & Rich Disaster Accident Simulator */}
        <div className="flex items-center space-x-2">
          {/* Tactical Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded border transition text-xs font-mono ${
              soundEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#131722]/80 text-slate-500 border-white/10 hover:text-slate-300'
            }`}
            title="Toggle Tactical Audio Feedback"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => isPaused ? service.resumeMission() : service.pauseMission()}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono font-medium transition ${
              isPaused
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600/40'
                : 'bg-[#131722] text-slate-300 border border-white/10 hover:bg-[#1a2030]'
            }`}
            title="Pause/Resume Simulation [Space]"
          >
            {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
            <span>{isPaused ? "RESUME" : "PAUSE"}</span>
          </button>

          {/* Simulation Speed */}
          <div className="flex items-center bg-[#131722] border border-white/10 rounded text-xs font-mono">
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => service.setSimulationSpeed(speed)}
                className={`px-2 py-0.5 transition ${
                  simulationSpeed === speed
                    ? 'bg-amber-500/20 text-amber-300 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Reset Mission */}
          <button
            onClick={() => service.resetMission()}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded border border-white/10 transition"
            title="Reset Simulation & Regenerate CPP Tracks"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Special Judge Guided Auto-Demo Button */}
          <button
            onClick={() => service.runAutoDemo()}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition shadow-lg ${
              isAutoDemoRunning
                ? 'bg-amber-500 text-black animate-pulse border border-amber-400'
                : 'bg-gradient-to-r from-amber-600/30 via-yellow-500/30 to-amber-500/30 text-amber-300 border border-amber-500/50 hover:border-amber-400'
            }`}
            title="Fast 15-second guided judge demo through the complete REC-SVLP rescue cycle"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>{isAutoDemoRunning ? 'DEMO RUNNING...' : 'JUDGE AUTO-DEMO'}</span>
          </button>

          {/* Rich Accident Simulation Menu - Solves Missing Incidents & Stacking Overlap */}
          <div className="relative" ref={accidentRef}>
            <div className="flex items-center">
              <button
                onClick={() => handleTriggerAccident()}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-l text-xs font-mono font-bold bg-gradient-to-r from-rose-600/40 via-red-500/30 to-amber-500/30 text-rose-300 border border-rose-500/60 hover:border-rose-400 transition shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:text-white"
                title="Simulate immediate disaster accident forward of drone vector [Key: A]"
              >
                <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>SIMULATE ACCIDENT</span>
              </button>
              <button
                onClick={() => {
                  setShowAccidentMenu(!showAccidentMenu);
                  setShowScenarioDropdown(false);
                  setShowModeDropdown(false);
                }}
                className="px-1.5 py-1 rounded-r border-t border-r border-b border-rose-500/60 bg-[#1e131d] hover:bg-rose-900/40 text-rose-300 transition"
                title="Choose specific crisis disaster to simulate"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Accident Scenario Catalog Dropdown */}
            {showAccidentMenu && (
              <div className="absolute top-full right-0 mt-1.5 w-84 bg-[#0d1017] border-2 border-rose-500/60 rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.95)] z-[9999] p-2 space-y-1 backdrop-blur-none">
                <div className="text-[10px] font-mono text-rose-400 px-2 py-1 border-b border-white/10 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    DISASTER ACCIDENT CATALOG
                  </span>
                  <span className="text-[9px] text-slate-400">REC FLOW TEST</span>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {ACCIDENT_CATALOG.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTriggerAccident(item.title)}
                      className="w-full text-left p-2 rounded hover:bg-rose-950/40 border border-transparent hover:border-rose-500/40 transition flex flex-col group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-100 group-hover:text-rose-300 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-400 shrink-0" />
                          {item.title}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          {item.expectedCasualties} Trapped
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 line-clamp-1">
                        {item.description}
                      </span>
                      <div className="flex items-center gap-2 mt-1 text-[9px] text-amber-400/90 font-mono">
                        <span>Thermal: {Math.round(item.targetThermal * 100)}%</span>
                        <span>•</span>
                        <span>Acoustic: {Math.round(item.targetAcoustic * 100)}%</span>
                        <span>•</span>
                        <span className="text-rose-400 font-bold">{item.severity}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
