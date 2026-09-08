import React, { useState } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ShieldAlert, 
  Crosshair,
  MapPin,
  Search
} from 'lucide-react';
import { MissionEvent } from '../types/mission';

interface MissionTimelineProps {
  events: MissionEvent[];
}

export const MissionTimeline: React.FC<MissionTimelineProps> = ({ events }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
        return <Info className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getEventBadge = (type: MissionEvent['type']) => {
    switch (type) {
      case 'ALERT':
        return 'bg-rose-950/80 text-rose-300 border border-rose-500/60 font-bold';
      case 'WARNING':
        return 'bg-amber-950/80 text-amber-300 border border-amber-500/60 font-bold';
      case 'SUCCESS':
        return 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 font-bold';
      case 'STATE_CHANGE':
        return 'bg-purple-950/80 text-purple-300 border border-purple-500/60 font-bold';
      case 'INFO':
      default:
        return 'bg-[#131722] text-slate-300 border border-white/10';
    }
  };

  const filteredEvents = events.filter((evt) => {
    if (filterType !== 'ALL' && evt.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return evt.title.toLowerCase().includes(q) || evt.details.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="bg-[#0b0e14] rounded-lg border border-white/10 p-4 flex flex-col space-y-3 h-full shadow-xl tactical-corner">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-tech text-sm font-bold tracking-wider text-slate-100">
              CHRONOLOGICAL MISSION LOG & TIMELINE
            </h2>
            <p className="text-[10px] font-mono text-slate-400">
              REAL-TIME MISSION EVENTS, STATE TRANSITIONS & SENSOR NOTIFICATIONS
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-6 pr-2 py-0.5 rounded bg-black/40 border border-white/10 text-[11px] font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 w-40"
          />
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center justify-between text-[10px] font-mono">
        <div className="flex items-center space-x-1">
          {['ALL', 'ALERT', 'WARNING', 'SUCCESS', 'INFO'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`px-2 py-0.5 rounded transition ${
                filterType === cat
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <span className="text-slate-500">
          Showing: <strong className="text-slate-300">{filteredEvents.length}</strong> of {events.length}
        </span>
      </div>

      {/* Events List */}
      <div className="space-y-2.5 overflow-y-auto flex-1 min-h-0 pr-1 font-mono text-xs tactical-scroll">
        {filteredEvents.map((evt, idx) => (
          <div key={evt.id || idx} className="relative pl-6 pb-2 border-l border-white/10 last:border-l-0">
            {/* Timeline node circle */}
            <div className="absolute -left-[9px] top-0 p-1 rounded-full bg-[#080d1a] border border-white/20">
              {getEventIcon(evt.type)}
            </div>

            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-200">{evt.title}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] ${getEventBadge(evt.type)}`}>
                  {evt.type}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                {new Date(evt.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {evt.details}
            </p>

            {evt.relatedCoordinates && (
              <div className="flex items-center space-x-1 mt-1 text-[10px] text-amber-400/90">
                <MapPin className="w-3 h-3" />
                <span>
                  COORDS: {evt.relatedCoordinates.latitude.toFixed(5)}, {evt.relatedCoordinates.longitude.toFixed(5)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
