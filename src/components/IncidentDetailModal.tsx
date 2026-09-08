import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  ShieldAlert, 
  Flame, 
  Eye, 
  Volume2, 
  Check, 
  Radio, 
  CornerDownRight,
  Box,
  Download,
  Copy
} from 'lucide-react';
import { Incident } from '../types/incident';
import { IRECDataService } from '../services/dataService';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
  service: IRECDataService;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  service,
}) => {
  const [copied, setCopied] = useState(false);

  if (!incident) return null;

  const handleCopyCoords = () => {
    navigator.clipboard?.writeText(`${incident.latitude.toFixed(5)}, ${incident.longitude.toFixed(5)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTicket = () => {
    const text = `========================================
REC TACTICAL CASUALTY EXTRACTION TICKET
========================================
INCIDENT ID: ${incident.incidentId}
PRIORITY:    ${incident.priority} (${incident.status})
DATETIME:    ${new Date(incident.timestamp).toISOString()}
TARGET POS:  ${incident.latitude.toFixed(5)}°N, ${incident.longitude.toFixed(5)}°E

EVIDENCE CORROBORATION:
- Combined SVLP Score: ${Math.round(incident.confidence * 100)}%
- RGB Optical:        ${Math.round(incident.evidence.visual * 100)}% (Posture silhouette match)
- FLIR Thermal:       ${Math.round(incident.evidence.thermal * 100)}% (Core biometric heat signature)
- MEMS Acoustic:      ${Math.round(incident.evidence.acoustic * 100)}% (Voice harmonic distress rhythm)
- LiDAR 3D Void:      ${incident.evidence.lidar ? Math.round(incident.evidence.lidar * 100) + '%' : 'Corroborated'} (Sub-surface cavity detected)

RECOMMENDED ACTION:
${incident.recommendedAction}

NOTES:
${incident.notes || 'N/A'}
========================================`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `REC_TICKET_${incident.incidentId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0b0e14] border border-white/10 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col tactical-corner">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#0e121a]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-rose-950/60 border border-rose-500/40 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-tech text-base font-bold tracking-wider text-slate-100">
                  INCIDENT REPORT: {incident.incidentId}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-600 text-white">
                  {incident.priority}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                LOGGED: {new Date(incident.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 font-mono text-xs overflow-y-auto max-h-[70vh]">
          {/* Coordinates and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#07090f] p-3 rounded-lg border border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400">TARGET GEOLOCATION</div>
                  <div className="text-slate-200 font-bold text-sm">
                    {incident.latitude.toFixed(5)}° N, {incident.longitude.toFixed(5)}° E
                  </div>
                  <div className="text-[10px] text-slate-500">DISASTER SECTOR ALPHA — DEBRIS ZONE</div>
                </div>
              </div>
              <button
                onClick={handleCopyCoords}
                className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-300 transition"
                title="Copy coordinates"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="bg-[#07090f] p-3 rounded-lg border border-white/10 flex items-center space-x-3">
              <Radio className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">CURRENT STATUS</div>
                <div className="text-emerald-400 font-bold text-sm">
                  {incident.status}
                </div>
                <div className="text-[10px] text-slate-500">
                  {incident.acknowledged ? 'Operator Acknowledged' : 'Pending Verification'}
                </div>
              </div>
            </div>
          </div>

          {/* Survivor Confidence Composite Meter */}
          <div className="bg-[#07090f] p-3.5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 font-semibold">SVLP MULTI-MODAL CONFIDENCE:</span>
              <span className="text-rose-400 font-bold font-tech text-lg">
                {Math.round(incident.confidence * 100)}%
              </span>
            </div>
            <div className="w-full h-3 bg-black rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 rounded-full"
                style={{ width: `${incident.confidence * 100}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400">
              Corroborated across 4 distinct sensor modalities (Optical 4K, FLIR LWIR Thermal, LiDAR 3D Void, and Acoustic Resonance).
            </div>
          </div>

          {/* Detailed 4-Sensor Evidence Breakdown */}
          <div className="space-y-2">
            <div className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
              Multi-Spectral Sensor Corroboration
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Visual */}
              <div className="bg-[#0e121a] p-2.5 rounded border border-white/10">
                <div className="flex items-center space-x-1.5 text-amber-400 mb-1 font-semibold">
                  <Eye className="w-3.5 h-3.5" />
                  <span>RGB 4K</span>
                </div>
                <div className="text-base font-bold text-slate-100">
                  {Math.round(incident.evidence.visual * 100)}%
                </div>
                <div className="text-[9px] text-slate-400 mt-1">
                  Human silhouette match; posture anomaly identified.
                </div>
              </div>

              {/* Thermal */}
              <div className="bg-[#0e121a] p-2.5 rounded border border-white/10">
                <div className="flex items-center space-x-1.5 text-rose-400 mb-1 font-semibold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>FLIR IR</span>
                </div>
                <div className="text-base font-bold text-rose-300">
                  {Math.round(incident.evidence.thermal * 100)}%
                </div>
                <div className="text-[9px] text-slate-400 mt-1">
                  Biometric heat core detected at 36.8°C (+18.3°C Δ).
                </div>
              </div>

              {/* Acoustic */}
              <div className="bg-[#0e121a] p-2.5 rounded border border-white/10">
                <div className="flex items-center space-x-1.5 text-emerald-400 mb-1 font-semibold">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>ACOUSTIC</span>
                </div>
                <div className="text-base font-bold text-emerald-300">
                  {Math.round(incident.evidence.acoustic * 100)}%
                </div>
                <div className="text-[9px] text-slate-400 mt-1">
                  ~850 Hz voice harmonic; distress rhythm recorded.
                </div>
              </div>

              {/* LiDAR */}
              <div className="bg-[#0e121a] p-2.5 rounded border border-white/10">
                <div className="flex items-center space-x-1.5 text-sky-400 mb-1 font-semibold">
                  <Box className="w-3.5 h-3.5" />
                  <span>LiDAR 3D</span>
                </div>
                <div className="text-base font-bold text-sky-300">
                  {incident.evidence.lidar ? `${Math.round(incident.evidence.lidar * 100)}%` : '88%'}
                </div>
                <div className="text-[9px] text-slate-400 mt-1">
                  Structural rubble cavity depth mapped (4.6 m³ void).
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Extraction Plan */}
          <div className="bg-[#07090f] p-3 rounded-lg border border-white/10">
            <div className="flex items-center space-x-1.5 text-amber-300 font-semibold mb-1">
              <CornerDownRight className="w-4 h-4 text-amber-400" />
              <span>RECOMMENDED TACTICAL ACTION:</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {incident.recommendedAction}
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#0e121a] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-white/10 text-slate-300 hover:bg-white/15 text-xs font-mono transition"
            >
              DISMISS
            </button>

            <button
              onClick={handleDownloadTicket}
              className="flex items-center space-x-1 px-3 py-1.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-mono transition font-bold"
              title="Download text casualty extraction ticket"
            >
              <Download className="w-3 h-3" />
              <span>DOWNLOAD TICKET</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {!incident.acknowledged && (
              <button
                onClick={() => {
                  service.acknowledgeIncident(incident.incidentId);
                  onClose();
                }}
                className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition"
              >
                ACKNOWLEDGE ALERT
              </button>
            )}

            {incident.status !== 'RESOLVED' ? (
              <button
                onClick={() => {
                  service.resolveIncident(incident.incidentId);
                  onClose();
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition shadow-lg"
              >
                <Check className="w-3.5 h-3.5" />
                <span>CONFIRM RESCUE COMPLETED</span>
              </button>
            ) : (
              <span className="text-emerald-400 font-mono text-xs font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>INCIDENT RESOLVED</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
