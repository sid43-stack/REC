import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  Flame, 
  Eye, 
  Volume2, 
  ChevronRight,
  Check,
  Download,
  Copy,
  Box
} from 'lucide-react';
import { Incident } from '../types/incident';
import { IRECDataService } from '../services/dataService';

interface IncidentListProps {
  incidents: Incident[];
  service: IRECDataService;
  onSelectIncident: (incident: Incident) => void;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  service,
  onSelectIncident,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'CRITICAL' | 'RESOLVED'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sitrepCopied, setSitrepCopied] = useState(false);

  const handleExportSITREP = () => {
    const report = service.exportSITREP();
    
    // Copy to clipboard
    navigator.clipboard?.writeText(report);
    setSitrepCopied(true);
    setTimeout(() => setSitrepCopied(false), 2500);

    // Trigger file download
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `REC_SITREP_${new Date().toISOString().replace(/[:.]/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCoords = (coords: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(coords);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (filter === 'ACTIVE') return inc.status !== 'RESOLVED';
    if (filter === 'CRITICAL') return inc.priority === 'CRITICAL';
    if (filter === 'RESOLVED') return inc.status === 'RESOLVED';
    return true;
  });

  if (incidents.length === 0) {
    return (
      <div className="tactical-glass rounded-lg border border-white/10 p-5 flex flex-col items-center justify-center text-center space-y-2 h-full tactical-corner">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="font-tech text-sm text-slate-100 font-bold tracking-wider">NO ACTIVE INCIDENTS IN QUEUE</div>
        <p className="text-[11px] font-mono text-slate-400 max-w-sm leading-relaxed">
          Autonomous search patrol active. High-priority incidents are automatically logged here when REC-SVLP cross-validates survivor signatures above 82% threshold.
        </p>
      </div>
    );
  }

  return (
    <div className="tactical-glass rounded-lg border border-white/10 p-2.5 flex flex-col gap-1.5 h-full shadow-xl tactical-corner overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="font-tech text-xs font-bold tracking-wider text-slate-100 flex items-center gap-1.5">
              CONFIRMED RESCUE INCIDENTS QUEUE
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-600 text-white font-bold animate-pulse">
                {incidents.filter(i => i.status !== 'RESOLVED').length} ACTIVE
              </span>
            </h2>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => service.injectAnomaly()}
            className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600/25 text-rose-300 border border-rose-500/40 hover:bg-rose-600/40 hover:text-white transition shadow-[0_0_10px_rgba(244,63,94,0.2)]"
            title="Simulate immediate disaster accident in current sector"
          >
            <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
            <span>+ SIMULATE ACCIDENT</span>
          </button>

          {/* SITREP Export Button */}
          <button
            onClick={handleExportSITREP}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold transition border ${
              sitrepCopied
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                : 'bg-gradient-to-r from-amber-600/30 to-orange-500/30 text-amber-300 border-amber-500/40 hover:border-amber-400'
            }`}
            title="Download complete tactical situation report and copy to clipboard"
          >
            {sitrepCopied ? <Check className="w-3 h-3" /> : <Download className="w-3 h-3" />}
            <span>{sitrepCopied ? 'SITREP EXPORTED' : 'EXPORT SITREP'}</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center justify-between gap-1 text-[10px] font-mono shrink-0">
        <div className="flex items-center space-x-1">
          {(['ALL', 'ACTIVE', 'CRITICAL', 'RESOLVED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 rounded transition ${
                filter === f
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-slate-500">
          Showing: <strong className="text-slate-300">{filteredIncidents.length}</strong> of {incidents.length}
        </span>
      </div>

      {/* Incident Cards Scroll Area */}
      <div className="space-y-2 overflow-y-auto flex-1 pr-1.5 min-h-0 tactical-scroll">
        {filteredIncidents.map((incident) => {
          const isResolved = incident.status === 'RESOLVED';
          const isCritical = incident.priority === 'CRITICAL';
          const coordsStr = `${incident.latitude.toFixed(5)}, ${incident.longitude.toFixed(5)}`;

          return (
            <div
              key={incident.incidentId}
              className={`p-3 rounded-lg border transition-all ${
                isResolved
                  ? 'bg-[#0a0d14]/70 border-white/5 opacity-75'
                  : isCritical
                  ? 'bg-gradient-to-r from-rose-950/40 via-[#131018] to-[#14121a] border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                  : 'bg-[#10131d] border-white/10 hover:border-amber-500/40'
              }`}
            >
              {/* Card Top: ID, Title, Priority, Timestamp */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="font-tech text-sm font-bold text-slate-100 tracking-wide">
                      {incident.incidentId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        isResolved
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : isCritical
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {incident.status.replace(/_/g, ' ')}
                    </span>
                    {incident.victimCount && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {incident.victimCount} {incident.victimCount === 1 ? 'CASUALTY' : 'CASUALTIES'}
                      </span>
                    )}
                  </div>
                  {incident.title && (
                    <div className="text-[11px] font-semibold text-amber-300/90 font-tech mt-0.5 leading-snug">
                      {incident.title}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1 text-slate-400 font-mono text-[10px] shrink-0">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{new Date(incident.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Confidence and Multi-modal Evidence Grid (5 elements) */}
              <div className="grid grid-cols-5 gap-1.5 mb-2 font-mono text-xs">
                {/* Confidence */}
                <div className="bg-[#07090f] p-1.5 rounded border border-white/5 flex flex-col justify-center">
                  <div className="text-[8px] text-slate-400 font-semibold truncate">CONF</div>
                  <div className="font-tech text-sm font-extrabold text-rose-400 leading-tight">
                    {Math.round(incident.confidence * 100)}%
                  </div>
                </div>

                {/* Visual */}
                <div className="bg-[#07090f] p-1.5 rounded border border-white/5 flex items-center space-x-1">
                  <Eye className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[7px] text-slate-500">RGB</div>
                    <div className="font-bold text-slate-200 text-[10px]">
                      {Math.round(incident.evidence.visual * 100)}%
                    </div>
                  </div>
                </div>

                {/* Thermal */}
                <div className="bg-[#07090f] p-1.5 rounded border border-white/5 flex items-center space-x-1">
                  <Flame className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                  <div>
                    <div className="text-[7px] text-slate-500">THERM</div>
                    <div className="font-bold text-rose-300 text-[10px]">
                      {Math.round(incident.evidence.thermal * 100)}%
                    </div>
                  </div>
                </div>

                {/* Acoustic */}
                <div className="bg-[#07090f] p-1.5 rounded border border-white/5 flex items-center space-x-1">
                  <Volume2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[7px] text-slate-500">AUDIO</div>
                    <div className="font-bold text-emerald-300 text-[10px]">
                      {Math.round(incident.evidence.acoustic * 100)}%
                    </div>
                  </div>
                </div>

                {/* LiDAR */}
                <div className="bg-[#07090f] p-1.5 rounded border border-white/5 flex items-center space-x-1">
                  <Box className="w-2.5 h-2.5 text-sky-400 shrink-0" />
                  <div>
                    <div className="text-[7px] text-slate-500">LiDAR</div>
                    <div className="font-bold text-sky-300 text-[10px]">
                      {incident.evidence.lidar ? `${Math.round(incident.evidence.lidar * 100)}%` : '85%'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Coordinates and notes */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                <div className="flex items-center space-x-1 text-slate-300">
                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="font-semibold">{incident.latitude.toFixed(5)}°N, {incident.longitude.toFixed(5)}°E</span>
                  <button
                    onClick={(e) => handleCopyCoords(coordsStr, incident.incidentId, e)}
                    className="ml-1 p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-amber-300 transition"
                    title="Copy coordinates"
                  >
                    {copiedId === incident.incidentId ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                  </button>
                </div>
                {incident.notes && (
                  <span className="text-[10px] text-slate-500 truncate max-w-[170px]">
                    {incident.notes}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs font-mono">
                <button
                  onClick={() => onSelectIncident(incident)}
                  className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 transition font-semibold"
                >
                  <span>INSPECT EVIDENCE</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center space-x-1.5">
                  {!incident.acknowledged && (
                    <button
                      onClick={() => service.acknowledgeIncident(incident.incidentId)}
                      className="px-2 py-1 rounded bg-white/10 text-slate-300 hover:bg-white/15 text-[10px] transition"
                    >
                      ACKNOWLEDGE
                    </button>
                  )}

                  {!isResolved ? (
                    <button
                      onClick={() => service.resolveIncident(incident.incidentId)}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/40 text-[10px] font-bold transition"
                    >
                      <Check className="w-3 h-3" />
                      <span>MARK RESCUED</span>
                    </button>
                  ) : (
                    <span className="flex items-center space-x-1 text-emerald-400 text-[10px] font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>EVACUATED</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
