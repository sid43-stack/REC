import React, { useState } from 'react';
import { 
  Flame, 
  Camera, 
  Clock, 
  MapPin, 
  Search, 
  Download, 
  Maximize2, 
  X
} from 'lucide-react';

export interface CapturedFrame {
  id: string;
  title: string;
  timestamp: string;
  missionTime: string;
  modality: 'FLIR' | 'RGB' | 'NVG';
  imageSrc: string;
  latitude: number;
  longitude: number;
  altitudeM: number;
  confidenceScore?: number;
  hotspotTemp?: number;
  classification: string;
  description: string;
  timeframeCategory: '0-5' | '5-15' | 'recent';
}

const SAMPLE_GALLERY: CapturedFrame[] = [
  {
    id: 'FRAME-001',
    title: 'Collapsed Beam Thermal Hotspot Alpha',
    timestamp: '2026-09-05T14:38:22Z',
    missionTime: 'T+ 03:45',
    modality: 'FLIR',
    imageSrc: '/flir_thermal_survivor.jpg',
    latitude: 28.6148,
    longitude: 77.2092,
    altitudeM: 18.4,
    confidenceScore: 0.89,
    hotspotTemp: 37.0,
    classification: 'SURVIVOR CONFIRMED',
    description: 'Distinct 37°C biometric heat signature beneath collapsed slab; corroborated by acoustic voice harmonics.',
    timeframeCategory: '0-5',
  },
  {
    id: 'FRAME-002',
    title: 'Urban Debris Grid Sector 02 Overview',
    timestamp: '2026-09-05T14:41:10Z',
    missionTime: 'T+ 06:30',
    modality: 'RGB',
    imageSrc: '/optical_rubble_search.jpg',
    latitude: 28.6142,
    longitude: 77.2085,
    altitudeM: 35.0,
    confidenceScore: 0.72,
    classification: 'STRUCTURAL VOID',
    description: 'High-resolution optical pass over collapsed multistory structure; emergency search vehicle on north perimeter.',
    timeframeCategory: '5-15',
  },
  {
    id: 'FRAME-003',
    title: 'Twilight Crisis Zone Wide Reconnaissance',
    timestamp: '2026-09-05T14:44:05Z',
    missionTime: 'T+ 09:25',
    modality: 'RGB',
    imageSrc: '/disaster_drone_bg.jpg',
    latitude: 28.6155,
    longitude: 77.2104,
    altitudeM: 65.0,
    classification: 'SECTOR SURVEY',
    description: 'Wide-area search perimeter mapping searchlights, flood zone breach, and primary evacuation corridors.',
    timeframeCategory: '5-15',
  },
  {
    id: 'FRAME-004',
    title: 'Sub-Surface Heat Core Extraction Drill',
    timestamp: '2026-09-05T14:48:15Z',
    missionTime: 'T+ 13:40',
    modality: 'FLIR',
    imageSrc: '/flir_thermal_survivor.jpg',
    latitude: 28.6125,
    longitude: 77.2105,
    altitudeM: 14.2,
    confidenceScore: 0.85,
    hotspotTemp: 36.6,
    classification: 'SURVIVOR CONFIRMED',
    description: 'Precision low-altitude stationary hover frame capturing human posture match under basement cavity rubble.',
    timeframeCategory: 'recent',
  },
  {
    id: 'FRAME-005',
    title: 'Tactical Search Grid Delta High-Res Optical',
    timestamp: '2026-09-05T14:50:30Z',
    missionTime: 'T+ 15:55',
    modality: 'RGB',
    imageSrc: '/optical_rubble_search.jpg',
    latitude: 28.6134,
    longitude: 77.2072,
    altitudeM: 28.0,
    confidenceScore: 0.64,
    classification: 'DEBRIS ANOMALY',
    description: 'Targeted visual inspection of collapsed concrete ceiling slabs following acoustic distress chirp.',
    timeframeCategory: 'recent',
  },
];

export const ImageryVault: React.FC = () => {
  const [selectedModality, setSelectedModality] = useState<'ALL' | 'FLIR' | 'RGB'>('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'ALL' | '0-5' | '5-15' | 'recent'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFrame, setActiveFrame] = useState<CapturedFrame | null>(null);

  const filteredFrames = SAMPLE_GALLERY.filter((frame) => {
    const matchesModality = selectedModality === 'ALL' || frame.modality === selectedModality;
    const matchesTime = selectedTimeframe === 'ALL' || frame.timeframeCategory === selectedTimeframe;
    const matchesQuery = searchQuery === '' || 
      frame.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      frame.classification.toLowerCase().includes(searchQuery.toLowerCase()) ||
      frame.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModality && matchesTime && matchesQuery;
  });

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-3 font-mono text-xs overflow-hidden">
      {/* Top Controls Bar */}
      <div className="tactical-glass p-3 rounded-lg border border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="font-tech text-base font-bold tracking-wider text-slate-100 flex items-center gap-2">
            SURVEILLANCE IMAGERY & THERMAL ARCHIVE
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              EVIDENCE VAULT
            </span>
          </h2>
          <p className="text-[11px] text-slate-400">
            GEOTAGGED MULTI-SPECTRAL SENSOR CAPTURES WITH TIMESTAMPS & CONFIDENCE SCORES
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search captures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 rounded bg-[#0b0e14] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 w-44"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar: Modality & Timeframe */}
      <div className="tactical-glass p-2.5 rounded-lg border border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Modality Filter */}
        <div className="flex items-center space-x-1">
          <span className="text-slate-500 text-[10px] mr-1">SENSOR:</span>
          {(['ALL', 'FLIR', 'RGB'] as const).map((mod) => (
            <button
              key={mod}
              onClick={() => setSelectedModality(mod)}
              className={`px-2.5 py-1 rounded text-[11px] transition flex items-center space-x-1.5 ${
                selectedModality === mod
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'bg-white/5 text-slate-400 border border-white/5 hover:text-slate-200'
              }`}
            >
              {mod === 'FLIR' && <Flame className="w-3 h-3 text-rose-400" />}
              {mod === 'RGB' && <Camera className="w-3 h-3 text-sky-400" />}
              <span>{mod === 'ALL' ? 'ALL SENSORS' : mod === 'FLIR' ? 'FLIR THERMAL IR' : 'RGB OPTICAL 4K'}</span>
            </button>
          ))}
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3 text-amber-400 mr-1" />
          <span className="text-slate-500 text-[10px] mr-1">TIMEFRAME:</span>
          {[
            { id: 'ALL', label: 'ENTIRE MISSION' },
            { id: '0-5', label: 'T+ 00:00 - 05:00' },
            { id: '5-15', label: 'T+ 05:00 - 15:00' },
            { id: 'recent', label: 'RECENT (<5m)' },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setSelectedTimeframe(tf.id as any)}
              className={`px-2 py-1 rounded text-[10px] transition ${
                selectedTimeframe === tf.id
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'bg-white/5 text-slate-400 border border-white/5 hover:text-slate-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Cards Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFrames.map((frame) => {
            const isThermal = frame.modality === 'FLIR';
            const isConfirmed = frame.confidenceScore && frame.confidenceScore >= 0.8;

            return (
              <div
                key={frame.id}
                onClick={() => setActiveFrame(frame)}
                className="tactical-glass rounded-lg border border-white/10 overflow-hidden hover:border-amber-500/50 transition duration-200 cursor-pointer group flex flex-col justify-between tactical-corner"
              >
                {/* Thumbnail Image */}
                <div className="relative w-full h-44 bg-black overflow-hidden">
                  <img
                    src={frame.imageSrc}
                    alt={frame.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />

                  {/* Top Badges Overlay */}
                  <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider shadow ${
                        isThermal
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                          : 'bg-sky-950/80 text-sky-300 border border-sky-500/50'
                      }`}
                    >
                      {frame.modality === 'FLIR' ? 'FLIR LWIR' : 'RGB 4K'}
                    </span>

                    <span className="px-1.5 py-0.5 rounded bg-black/80 text-amber-300 border border-white/10 text-[10px]">
                      {frame.missionTime}
                    </span>
                  </div>

                  {/* Confidence Badge */}
                  {frame.confidenceScore && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/85 border border-white/10 text-[11px] font-bold text-amber-300 flex items-center space-x-1">
                      <span>CONF:</span>
                      <span className={isConfirmed ? 'text-rose-400 font-extrabold' : 'text-amber-400'}>
                        {Math.round(frame.confidenceScore * 100)}%
                      </span>
                    </div>
                  )}

                  {/* Hotspot temperature tag */}
                  {frame.hotspotTemp && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/85 border border-rose-500/40 text-[10px] text-rose-300 font-bold flex items-center space-x-1">
                      <Flame className="w-3 h-3 text-rose-400" />
                      <span>{frame.hotspotTemp}°C BIOMETRIC HEAT</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                    <div className="px-3 py-1 rounded-full bg-black/80 text-amber-300 text-xs font-bold border border-amber-500/50 flex items-center space-x-1.5">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>VIEW HIGH-RES</span>
                    </div>
                  </div>
                </div>

                {/* Card Content Footer */}
                <div className="p-3 bg-[#0c0f16]/90 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                      <span>ID: {frame.id}</span>
                      <span>ALT: {frame.altitudeM}m AGL</span>
                    </div>
                    <h3 className="font-tech text-sm font-bold text-slate-100 leading-snug">
                      {frame.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {frame.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center space-x-1 text-slate-300">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{frame.latitude.toFixed(4)}°, {frame.longitude.toFixed(4)}°</span>
                    </span>
                    <span className="text-amber-400/90 font-bold uppercase">
                      {frame.classification}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal for High-Resolution Inspection */}
      {activeFrame && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl bg-[#0b0e14] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-4 py-2.5 bg-[#0f121a] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-tech text-base font-bold text-slate-100">
                  {activeFrame.title}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
                  {activeFrame.id}
                </span>
              </div>
              <button
                onClick={() => setActiveFrame(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-res Image Preview */}
            <div className="relative w-full h-[52vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activeFrame.imageSrc}
                alt={activeFrame.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Telemetry & Metadata Strip */}
            <div className="p-4 bg-[#0c0f16] border-t border-white/10 space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                <div className="bg-[#08090d] p-2 rounded border border-white/5">
                  <div className="text-[10px] text-slate-500">GEOLOCATION</div>
                  <div className="font-bold text-slate-200">{activeFrame.latitude.toFixed(5)}°N, {activeFrame.longitude.toFixed(5)}°E</div>
                </div>
                <div className="bg-[#08090d] p-2 rounded border border-white/5">
                  <div className="text-[10px] text-slate-500">MISSION TIMESTAMP</div>
                  <div className="font-bold text-amber-300">{activeFrame.missionTime} ({activeFrame.timestamp})</div>
                </div>
                <div className="bg-[#08090d] p-2 rounded border border-white/5">
                  <div className="text-[10px] text-slate-500">ALTITUDE</div>
                  <div className="font-bold text-slate-200">{activeFrame.altitudeM}m AGL</div>
                </div>
                <div className="bg-[#08090d] p-2 rounded border border-white/5">
                  <div className="text-[10px] text-slate-500">CLASSIFICATION</div>
                  <div className="font-bold text-rose-400">{activeFrame.classification}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>{activeFrame.description}</span>
                <button
                  onClick={() => alert(`Metadata packet for ${activeFrame.id} exported successfully.`)}
                  className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 flex items-center space-x-1.5 shrink-0 ml-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>EXPORT GEOTIFF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
