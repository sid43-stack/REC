import React, { useState } from 'react';
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
  Layers
} from 'lucide-react';
import { DRILL_SCENARIOS, SimulatorState } from '../simulation/droneSimulator';
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
    companionTelemetry,
    activeDroneId,
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const highPriorityCount = incidents.filter(i => i.status === 'HIGH_PRIORITY').length;

  const handleSelectMode = (mode: MissionMode) => {
    service.setMissionMode(mode);
    setShowModeDropdown(false);
  };

  const handleSelectScenario = (scenarioId: DrillScenarioId) => {
    service.setScenario(scenarioId);
    setShowScenarioDropdown(false);
  };

  // Determine current drone telemetry based on activeDroneId
  const currentTelemetry = activeDroneId === 'REC-02' && companionTelemetry ? companionTelemetry : telemetry;

  return (
    <header className="border-b border-white/10 bg-[#0d1017]/90 backdrop-blur-xl sticky top-0 z-40 shadow-xl shrink-0">
      {/* Top Bar: Brand, Team attribution, Scenario switcher, and Primary Telemetry HUD */}
      <div className="px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-white/5">
        <div className="flex items-center space-x-3">
          {/* Tactical Unit Badge with warm amber flare */}
          <div className="relative flex items-center justify-center w-9 h-9 rounded bg-amber-500/15 border border-amber-500/40 text-amber-400 font-tech font-bold text-lg tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            REC
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-tech text-sm sm:text-base font-bold tracking-wider text-slate-100 flex items-center gap-1.5">
                RAPID EMERGENCY & CRISIS-RESPONSE DRONE
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {activeDroneId} TACTICAL
                </span>
              </h1>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-2">
              <span>TEAM: <strong className="text-amber-300/90 font-semibold">FUKREY TECHIES</strong></span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">Siddharth Goyal & Kartik Wadhwa</span>
            </div>
          </div>
        </div>

        {/* Telemetry Strip - Obsidian/Graphite Pills with Warm Accents */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 font-mono text-xs">
          {/* Swarm Fleet Drone Selector */}
          <div className="flex items-center bg-[#131722] border border-white/10 rounded p-0.5" title="Switch active drone telemetry">
            <button
              onClick={() => service.setActiveDrone('REC-01')}
              className={`px-2 py-0.5 rounded text-[10px] transition ${
                activeDroneId === 'REC-01'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              REC-01 SCOUT
            </button>
            <button
              onClick={() => service.setActiveDrone('REC-02')}
              className={`px-2 py-0.5 rounded text-[10px] transition ${
                activeDroneId === 'REC-02'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              REC-02 RELIEF
            </button>
          </div>

          {/* Drill Scenario Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowScenarioDropdown(!showScenarioDropdown)}
              className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#131722] hover:bg-[#1c2233] border border-amber-500/40 transition cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.15)]"
              title="Select Disaster Scenario Drill"
            >
              <Layers className="w-3 h-3 text-amber-400" />
              <span className="text-slate-400 text-[10px]">SCENARIO:</span>
              <span className="text-amber-300 font-bold text-[11px] truncate max-w-[130px]">
                {DRILL_SCENARIOS[activeScenario]?.title || 'Earthquake'}
              </span>
              <ChevronDown className="w-3 h-3 text-amber-400" />
            </button>

            {showScenarioDropdown && (
              <div className="absolute top-full right-0 mt-1 w-72 bg-[#0c0f16] border border-amber-500/40 rounded-lg shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in duration-150">
                <div className="text-[9px] font-mono text-slate-400 px-2 py-0.5 border-b border-white/5 font-bold">
                  SELECT DISASTER DRILL SCENARIO
                </div>
                {Object.values(DRILL_SCENARIOS).map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc.id)}
                    className={`w-full text-left p-2 rounded transition flex flex-col ${
                      activeScenario === sc.id
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold'
                        : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <span className="text-[11px] font-mono">{sc.title}</span>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">{sc.subtitle}</span>
                    <span className="text-[8px] text-amber-400/80 font-mono mt-0.5">{sc.recommendedSensor}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Manual Drone Flight Mode Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModeDropdown(!showModeDropdown)}
              className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#131722] hover:bg-[#1c2233] border border-amber-500/40 transition cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.15)]"
              title="Click to manually select drone flight mode"
            >
              <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
              <span className="text-slate-400 text-[10px]">MODE:</span>
              <span className="text-amber-300 font-bold text-[11px]">
                {missionMode.replace('_', ' ')}
              </span>
              <ChevronDown className="w-3 h-3 text-amber-400" />
            </button>

            {/* Flight Mode Dropdown Menu */}
            {showModeDropdown && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-[#0c0f16] border border-amber-500/40 rounded-lg shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in duration-150">
                <div className="text-[9px] font-mono text-slate-400 px-2 py-0.5 border-b border-white/5 font-bold">
                  MANUAL FLIGHT MODE OVERRIDE
                </div>
                {[
                  { mode: 'AUTONOMOUS_SEARCH' as MissionMode, title: 'AUTONOMOUS SEARCH', desc: 'Cruise lawnmower survey at 35m' },
                  { mode: 'MANUAL_INVESTIGATION' as MissionMode, title: 'MANUAL INVESTIGATION', desc: 'Low-speed 3.8 m/s orbit over sector' },
                  { mode: 'VERIFICATION_HOLD' as MissionMode, title: 'VERIFICATION HOLD', desc: 'Stationary hover at 12m altitude' },
                  { mode: 'RETURN_TO_HOME' as MissionMode, title: 'RETURN TO HOME (RTH)', desc: 'Direct vector to launch point at 40m' },
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => handleSelectMode(item.mode)}
                    className={`w-full text-left p-1.5 rounded transition flex flex-col ${
                      missionMode === item.mode
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold'
                        : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <span className="text-[11px] font-mono">{item.title}</span>
                    <span className="text-[9px] text-slate-500 font-mono">{item.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Connection */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#131722]/80 border border-white/10">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-400 text-[10px]">LINK:</span>
            <span className="text-emerald-400 font-bold text-[11px]">{currentTelemetry.connection}</span>
            <span className="text-slate-500 text-[9px]">12ms</span>
          </div>

          {/* Battery */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#131722]/80 border border-white/10">
            <Battery className={`w-3 h-3 ${currentTelemetry.battery < 25 ? 'text-rose-500 animate-bounce' : currentTelemetry.battery < 50 ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span className="text-slate-400 text-[10px]">BAT:</span>
            <span className={`font-bold text-[11px] ${currentTelemetry.battery < 25 ? 'text-rose-400' : 'text-slate-100'}`}>
              {currentTelemetry.battery}%
            </span>
            <span className="text-slate-500 text-[9px]">{currentTelemetry.batteryVoltage}V</span>
          </div>

          {/* GPS */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#131722]/80 border border-white/10">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400 text-[10px]">GPS:</span>
            <span className="text-amber-300 font-bold text-[11px]">{currentTelemetry.gpsStatus}</span>
            <span className="text-slate-500 text-[9px]">{currentTelemetry.satellites} SAT</span>
          </div>

          {/* Altitude */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#131722]/80 border border-white/10">
            <Activity className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400 text-[10px]">ALT:</span>
            <span className="text-slate-100 font-bold text-[11px]">{currentTelemetry.altitude.toFixed(1)}m</span>
          </div>

          {/* Speed */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#131722]/80 border border-white/10">
            <Gauge className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400 text-[10px]">SPD:</span>
            <span className="text-slate-100 font-bold text-[11px]">{currentTelemetry.speed.toFixed(1)} m/s</span>
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
      <div className="px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 bg-[#090b10]">
        {/* Navigation Tabs (Cockpit, Incidents, Imagery Vault, Timeline, Diagnostics) */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('command')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded transition ${
              activeTab === 'command'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
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
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
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

        {/* Tactical Controls, Judge Auto-Demo & Drill Anomaly */}
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
            title="Reset Simulation"
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

          {/* Interactive Drill Anomaly Button */}
          <button
            onClick={() => service.injectAnomaly()}
            className="flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-mono font-bold bg-gradient-to-r from-rose-500/30 via-orange-500/30 to-amber-500/30 text-amber-300 border border-amber-500/50 hover:border-amber-400 transition shadow-[0_0_12px_rgba(245,158,11,0.25)]"
            title="Inject survivor signature forward of drone to demonstrate REC-SVLP investigation cycle [A]"
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>TRIGGER DRILL</span>
          </button>
        </div>
      </div>
    </header>
  );
};
