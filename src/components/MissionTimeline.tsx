import React from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ShieldAlert, 
  Crosshair,
  MapPin
} from 'lucide-react';
import { MissionEvent } from '../types/mission';

interface MissionTimelineProps {
  events: MissionEvent[];
}

export const MissionTimeline: React.FC<MissionTimelineProps> = ({ events }) => {
  const getEventIcon = (type: MissionEvent['type']) => {
    switch (type) {
      case 'ALERT':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'STATE_CHANGE':
        return <Crosshair className="w-3.5 h-3.5 text-purple-400" />;
      case 'INFO':
      default:
        return <Info className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  const getEventBadge = (type: MissionEvent['type']) => {
    switch (type) {
      case 'ALERT':
        return 'bg-rose-950/60 text-rose-300 border border-rose-500/50';
      case 'WARNING':
        return 'bg-amber-950/60 text-amber-300 border border-amber-500/50';
      case 'SUCCESS':
        return 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50';
      case 'STATE_CHANGE':
        return 'bg-purple-950/60 text-purple-300 border border-purple-500/50';
      case 'INFO':
      default:
        return 'bg-slate-900 text-slate-300 border border-slate-700/60';
    }
  };

  return (
    <div className="bg-[#0b0f19] rounded-lg border border-slate-800 p-3.5 flex flex-col space-y-3 h-full shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h2 className="font-tech text-sm font-bold tracking-wider text-slate-100">
            CHRONOLOGICAL MISSION TIMELINE
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-500">
          Events: <strong className="text-slate-300">{events.length}</strong>
        </span>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1 font-mono text-xs">
        {events.map((evt, idx) => (
          <div key={evt.id || idx} className="relative pl-6 pb-2 border-l border-slate-800 last:border-l-0">
            {/* Timeline node circle */}
            <div className="absolute -left-[9px] top-0 p-1 rounded-full bg-[#080d1a] border border-slate-700">
              {getEventIcon(evt.type)}
            </div>

            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-200">{evt.title}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${getEventBadge(evt.type)}`}>
                  {evt.type}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                {new Date(evt.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {evt.details}
            </p>

            {evt.relatedCoordinates && (
              <div className="flex items-center space-x-1 mt-1 text-[10px] text-cyan-400/90">
                <MapPin className="w-3 h-3" />
                <span>
                  COORDS: {evt.relatedCoordinates.latitude.toFixed(4)}, {evt.relatedCoordinates.longitude.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
