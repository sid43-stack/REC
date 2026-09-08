import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Crosshair, Maximize2, Navigation, Globe, Flame, AlertOctagon } from 'lucide-react';
import { Hotspot, SimulatorState } from '../simulation/droneSimulator';
import { Incident } from '../types/incident';

interface LiveMapProps {
  data: SimulatorState;
  onSelectIncident?: (incident: Incident) => void;
}

export const LiveMap: React.FC<LiveMapProps> = ({ data, onSelectIncident }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const droneMarkerRef = useRef<L.Marker | null>(null);
  const companionDroneMarkerRef = useRef<L.Marker | null>(null);
  const flightPolylineRef = useRef<L.Polyline | null>(null);
  const companionPolylineRef = useRef<L.Polyline | null>(null);
  const boundaryPolygonRef = useRef<L.Polygon | null>(null);
  const hotspotLayerRef = useRef<L.LayerGroup | null>(null);
  const incidentLayerRef = useRef<L.LayerGroup | null>(null);
  const hazardLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const investigationCircleRef = useRef<L.Circle | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapMode, setMapMode] = useState<'tactical' | 'satellite'>('tactical');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [showHazards, setShowHazards] = useState<boolean>(true);

  const { 
    telemetry, 
    companionTelemetry, 
    flightPath, 
    companionFlightPath, 
    searchSector, 
    hotspots, 
    incidents, 
    svlpEvaluation,
    hazardZones 
  } = data;

  // Initialize Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [telemetry.latitude, telemetry.longitude],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    // Zero-watermark high-contrast OpenStreetMap tiles styled with tactical-map-tiles CSS filter
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'tactical-map-tiles',
    }).addTo(map);
    currentTileLayerRef.current = tileLayer;

    // Zoom control in bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Search boundary polygon with amber tactical dashed border
    const boundary = L.polygon(searchSector.bounds, {
      color: '#f59e0b',
      weight: 1.5,
      dashArray: '6, 6',
      fillColor: '#f59e0b',
      fillOpacity: 0.05,
    }).addTo(map);
    boundaryPolygonRef.current = boundary;

    // Flight path breadcrumb polyline for REC-01
    const flightLine = L.polyline(flightPath, {
      color: '#fbbf24',
      weight: 2,
      opacity: 0.85,
      dashArray: '2, 4',
      lineCap: 'round',
    }).addTo(map);
    flightPolylineRef.current = flightLine;

    // Companion flight path for REC-02
    const compLine = L.polyline(companionFlightPath || [], {
      color: '#38bdf8',
      weight: 1.5,
      opacity: 0.6,
      dashArray: '4, 4',
      lineCap: 'round',
    }).addTo(map);
    companionPolylineRef.current = compLine;

    // Layer groups
    hotspotLayerRef.current = L.layerGroup().addTo(map);
    incidentLayerRef.current = L.layerGroup().addTo(map);
    hazardLayerRef.current = L.layerGroup().addTo(map);
    heatmapLayerRef.current = L.layerGroup().addTo(map);

    // 1. Dynamic Tactical UAV REC-01 Icon
    const droneHtml = `
      <div class="relative flex items-center justify-center w-12 h-12">
        <div id="uav-fov-cone" class="absolute w-28 h-28 -top-8 -left-8 pointer-events-none transition-transform duration-300" style="transform: rotate(${telemetry.heading}deg);">
          <svg viewBox="0 0 100 100" class="w-full h-full opacity-40">
            <defs>
              <linearGradient id="cone-gradient-amber" x1="50%" y1="50%" x2="50%" y2="0%">
                <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.9"/>
                <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <polygon points="50,50 20,0 80,0" fill="url(#cone-gradient-amber)" />
          </svg>
        </div>
        <div class="absolute inset-2 rounded-full border border-amber-400/50 animate-ping"></div>
        <div id="uav-icon-body" class="relative w-8 h-8 rounded-full border-2 border-amber-400 bg-[#090b10] flex items-center justify-center shadow-[0_0_15px_#f59e0b] transition-transform duration-300" style="transform: rotate(${telemetry.heading}deg);">
          <svg viewBox="0 0 24 24" class="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="2" x2="12" y2="22" stroke="#f59e0b" stroke-width="2.5" />
            <line x1="2" y1="12" x2="22" y2="12" stroke="#f59e0b" stroke-width="2.5" />
            <circle cx="12" cy="12" r="3" fill="#f59e0b" />
            <circle cx="12" cy="4" r="2" fill="#fbbf24" />
            <circle cx="12" cy="20" r="2" fill="#fbbf24" />
            <circle cx="4" cy="12" r="2" fill="#fbbf24" />
            <circle cx="20" cy="12" r="2" fill="#fbbf24" />
          </svg>
        </div>
        <div id="uav-alt-label" class="absolute -bottom-4 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-black/85 border border-amber-500/40 text-[9px] font-mono text-amber-300 whitespace-nowrap shadow">
          REC-01 • ${telemetry.altitude.toFixed(0)}m
        </div>
      </div>
    `;

    const droneIcon = L.divIcon({
      className: 'tactical-drone-marker',
      html: droneHtml,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    const marker = L.marker([telemetry.latitude, telemetry.longitude], {
      icon: droneIcon,
      zIndexOffset: 1000,
    }).addTo(map);
    droneMarkerRef.current = marker;

    // 2. Swarm Companion Drone REC-02 Marker
    if (companionTelemetry) {
      const compDroneHtml = `
        <div class="relative flex items-center justify-center w-10 h-10">
          <div id="uav2-icon-body" class="relative w-6 h-6 rounded-full border border-sky-400 bg-[#090b10] flex items-center justify-center shadow-[0_0_12px_#38bdf8] transition-transform duration-300" style="transform: rotate(${companionTelemetry.heading}deg);">
            <svg viewBox="0 0 24 24" class="w-4 h-4 text-sky-300" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="2" x2="12" y2="22" stroke="#38bdf8" stroke-width="2" />
              <line x1="2" y1="12" x2="22" y2="12" stroke="#38bdf8" stroke-width="2" />
              <circle cx="12" cy="12" r="2.5" fill="#38bdf8" />
            </svg>
          </div>
          <div class="absolute -bottom-3.5 left-1/2 -translate-x-1/2 px-1 py-0.1 rounded bg-black/85 border border-sky-500/40 text-[8px] font-mono text-sky-300 whitespace-nowrap shadow">
            REC-02 • RELIEF
          </div>
        </div>
      `;

      const compIcon = L.divIcon({
        className: 'companion-drone-marker',
        html: compDroneHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const compMarker = L.marker([companionTelemetry.latitude, companionTelemetry.longitude], {
        icon: compIcon,
        zIndexOffset: 900,
      }).addTo(map);
      companionDroneMarkerRef.current = compMarker;
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch between Tactical Dark and ESRI Satellite imagery
  const toggleMapLayer = () => {
    if (!mapInstanceRef.current || !currentTileLayerRef.current) return;
    
    currentTileLayerRef.current.remove();
    const nextMode = mapMode === 'tactical' ? 'satellite' : 'tactical';
    setMapMode(nextMode);

    if (nextMode === 'satellite') {
      const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        className: 'satellite-map-tiles',
      }).addTo(mapInstanceRef.current);
      currentTileLayerRef.current = satLayer;
    } else {
      const darkLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'tactical-map-tiles',
      }).addTo(mapInstanceRef.current);
      currentTileLayerRef.current = darkLayer;
    }
  };

  // Update drone positions, headings and flight paths continuously
  useEffect(() => {
    if (!mapInstanceRef.current || !droneMarkerRef.current || !flightPolylineRef.current) return;

    droneMarkerRef.current.setLatLng([telemetry.latitude, telemetry.longitude]);

    const iconElement = droneMarkerRef.current.getElement();
    if (iconElement) {
      const fovCone = iconElement.querySelector('#uav-fov-cone') as HTMLElement | null;
      const uavBody = iconElement.querySelector('#uav-icon-body') as HTMLElement | null;
      const altLabel = iconElement.querySelector('#uav-alt-label') as HTMLElement | null;
      if (fovCone) fovCone.style.transform = `rotate(${telemetry.heading}deg)`;
      if (uavBody) uavBody.style.transform = `rotate(${telemetry.heading}deg)`;
      if (altLabel) altLabel.textContent = `REC-01 • ${telemetry.altitude.toFixed(0)}m`;
    }

    flightPolylineRef.current.setLatLngs(flightPath);

    // Update REC-02 companion position
    if (companionTelemetry && companionDroneMarkerRef.current && companionPolylineRef.current) {
      companionDroneMarkerRef.current.setLatLng([companionTelemetry.latitude, companionTelemetry.longitude]);
      const compElement = companionDroneMarkerRef.current.getElement();
      if (compElement) {
        const compBody = compElement.querySelector('#uav2-icon-body') as HTMLElement | null;
        if (compBody) compBody.style.transform = `rotate(${companionTelemetry.heading}deg)`;
      }
      if (companionFlightPath) companionPolylineRef.current.setLatLngs(companionFlightPath);
    }
  }, [telemetry, companionTelemetry, flightPath, companionFlightPath]);

  // Render Hazard Zones
  useEffect(() => {
    if (!mapInstanceRef.current || !hazardLayerRef.current) return;
    hazardLayerRef.current.clearLayers();

    if (!showHazards) return;

    hazardZones.forEach((hz) => {
      const polygon = L.polygon(hz.bounds, {
        color: hz.color,
        weight: 1.5,
        dashArray: '5, 5',
        fillColor: hz.color,
        fillOpacity: 0.12,
      });

      polygon.bindPopup(`
        <div class="p-2 font-mono text-xs bg-[#0b0e14] text-slate-200 border border-rose-500/50 rounded">
          <div class="text-rose-400 font-bold mb-0.5 flex items-center gap-1">
            <span>⚠ GEOFENCED HAZARD:</span>
            <span>${hz.name}</span>
          </div>
          <div class="text-[10px] text-amber-300 mb-1">SEVERITY: ${hz.severity} (${hz.type.replace(/_/g, ' ')})</div>
          <div class="text-slate-300 text-[11px]">${hz.description}</div>
        </div>
      `);

      hazardLayerRef.current?.addLayer(polygon);
    });
  }, [hazardZones, showHazards]);

  // Render Thermal Heatmap Density Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !heatmapLayerRef.current) return;
    heatmapLayerRef.current.clearLayers();

    if (!showHeatmap) return;

    hotspots.forEach((h) => {
      // Outer thermal spread
      const outerCircle = L.circle([h.latitude, h.longitude], {
        radius: 65,
        color: '#f97316',
        weight: 0,
        fillColor: '#f97316',
        fillOpacity: 0.18,
      });
      // Inner thermal core
      const innerCircle = L.circle([h.latitude, h.longitude], {
        radius: 25,
        color: '#ef4444',
        weight: 0,
        fillColor: '#ef4444',
        fillOpacity: 0.45,
      });

      heatmapLayerRef.current?.addLayer(outerCircle);
      heatmapLayerRef.current?.addLayer(innerCircle);
    });
  }, [hotspots, showHeatmap]);

  // Handle Investigation / Verification Area Circle
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (svlpEvaluation.state === 'INVESTIGATION' || svlpEvaluation.state === 'VERIFICATION') {
      const center = svlpEvaluation.targetCoordinates || { latitude: telemetry.latitude, longitude: telemetry.longitude };
      const color = svlpEvaluation.state === 'VERIFICATION' ? '#10b981' : '#f59e0b';

      if (!investigationCircleRef.current) {
        investigationCircleRef.current = L.circle([center.latitude, center.longitude], {
          radius: 35,
          color,
          weight: 1.5,
          dashArray: '4, 4',
          fillColor: color,
          fillOpacity: 0.14,
        }).addTo(mapInstanceRef.current);
      } else {
        investigationCircleRef.current.setLatLng([center.latitude, center.longitude]);
        investigationCircleRef.current.setStyle({ color, fillColor: color });
      }
    } else if (investigationCircleRef.current) {
      investigationCircleRef.current.remove();
      investigationCircleRef.current = null;
    }
  }, [svlpEvaluation.state, svlpEvaluation.targetCoordinates, telemetry.latitude, telemetry.longitude]);

  // Update Hotspots and Incidents layers
  useEffect(() => {
    if (!mapInstanceRef.current || !hotspotLayerRef.current || !incidentLayerRef.current) return;

    hotspotLayerRef.current.clearLayers();
    incidentLayerRef.current.clearLayers();

    // Render Hotspots (Amber caution tactical radar targets)
    hotspots.forEach((h: Hotspot) => {
      const isEvaluating = svlpEvaluation.targetCoordinates && 
        Math.hypot(svlpEvaluation.targetCoordinates.latitude - h.latitude, svlpEvaluation.targetCoordinates.longitude - h.longitude) < 0.0005;

      const hotspotHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-6 h-6 rounded-full border border-amber-400 bg-amber-950/90 flex items-center justify-center text-amber-300 text-[10px] font-mono font-bold shadow-[0_0_12px_#f59e0b]">
            !
          </div>
          ${isEvaluating ? '<div class="absolute -inset-2.5 rounded-full border-2 border-amber-400/60 animate-ping"></div>' : ''}
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-hotspot-icon',
        html: hotspotHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([h.latitude, h.longitude], { icon });
      marker.bindPopup(`
        <div class="p-2 font-mono text-xs bg-[#0b0e14] text-slate-200 border border-amber-500/40 rounded">
          <div class="text-amber-400 font-bold mb-1">SUSPECT ANOMALY: ${h.id}</div>
          <div class="text-slate-300 text-[11px]">${h.description}</div>
          <div class="mt-1 text-slate-400 text-[10px]">COORDS: ${h.latitude.toFixed(4)}, ${h.longitude.toFixed(4)}</div>
        </div>
      `);
      hotspotLayerRef.current?.addLayer(marker);
    });

    // Render Confirmed Incidents (Red critical radar circles)
    incidents.forEach((inc: Incident) => {
      const isCritical = inc.priority === 'CRITICAL' || inc.status === 'HIGH_PRIORITY';
      const color = inc.status === 'RESOLVED' ? '#10b981' : '#f43f5e';

      const incidentHtml = `
        <div class="relative cursor-pointer">
          ${isCritical && inc.status !== 'RESOLVED' ? '<div class="absolute -inset-3 rounded-full bg-rose-600/30 animate-ping"></div>' : ''}
          <div class="w-7 h-7 rounded-full border-2 border-[${color}] bg-[#14080b] flex items-center justify-center text-[${color}] text-[11px] font-mono font-bold shadow-[0_0_18px_rgba(244,63,94,0.8)]">
            ${inc.status === 'RESOLVED' ? '✓' : '★'}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-incident-icon',
        html: incidentHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([inc.latitude, inc.longitude], { icon });
      marker.bindPopup(`
        <div class="p-2.5 font-mono text-xs bg-[#0f121a] text-slate-200 border border-rose-500/60 rounded shadow-xl min-w-[200px]">
          <div class="flex items-center justify-between border-b border-rose-500/30 pb-1 mb-1.5">
            <span class="text-rose-400 font-bold">${inc.incidentId}</span>
            <span class="px-1.5 py-0.2 text-[10px] rounded bg-rose-500/20 text-rose-300 font-bold">${inc.priority}</span>
          </div>
          <div class="text-[11px] text-slate-300 mb-1">Survivor Confidence: <strong class="text-rose-400">${Math.round(inc.confidence * 100)}%</strong></div>
          <div class="text-[10px] text-slate-400 space-y-0.5 mb-2">
            <div>RGB Visual: ${(inc.evidence.visual * 100).toFixed(0)}%</div>
            <div>IR Thermal: ${(inc.evidence.thermal * 100).toFixed(0)}%</div>
            <div>Acoustic: ${(inc.evidence.acoustic * 100).toFixed(0)}%</div>
            ${inc.evidence.lidar ? `<div>LiDAR 3D Void: ${(inc.evidence.lidar * 100).toFixed(0)}%</div>` : ''}
          </div>
          <div class="text-[10px] text-slate-500 mb-2">COORDS: ${inc.latitude.toFixed(5)}, ${inc.longitude.toFixed(5)}</div>
          ${inc.status === 'RESOLVED' ? '<div class="text-emerald-400 font-bold text-center py-0.5 bg-emerald-950/40 rounded border border-emerald-500/40">EVACUATED / RESOLVED</div>' : ''}
        </div>
      `);

      if (onSelectIncident) {
        marker.on('click', () => onSelectIncident(inc));
      }

      incidentLayerRef.current?.addLayer(marker);
    });
  }, [hotspots, incidents, svlpEvaluation, onSelectIncident]);

  const recenterOnDrone = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([telemetry.latitude, telemetry.longitude], 17, {
        animate: true,
      });
    }
  };

  const fitBoundsToSector = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(searchSector.bounds, { padding: [20, 20] });
    }
  };

  return (
    <div className="relative w-full h-full bg-[#080a0f] rounded-lg border border-white/10 overflow-hidden flex flex-col tactical-corner">
      {/* Tactical Map HUD Header Bar - Pinned inside the top of the map, full-width, non-overlapping with z-[2000] */}
      <div className="absolute top-0 left-0 right-0 z-[2000] bg-[#0c0f17]/95 backdrop-blur-md border-b border-white/10 px-3 py-1.5 flex items-center justify-between gap-3 shadow-lg pointer-events-none">
        {/* Left: Surveillance Grid Info */}
        <div className="pointer-events-auto flex items-center space-x-2 min-w-0">
          <Navigation className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-xs font-mono font-semibold tracking-wider text-slate-200 truncate">
            GRID: <span className="text-amber-400 font-bold">{searchSector.name}</span>
          </span>
          <span className="text-slate-600 hidden sm:inline shrink-0">•</span>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline shrink-0">
            COVERAGE: <strong className="text-slate-200">{searchSector.areaCoveredPercent}%</strong>
          </span>
        </div>

        {/* Right: Map Action Controls */}
        <div className="pointer-events-auto flex items-center space-x-1 shrink-0">
          {/* Thermal Heatmap Toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded border text-xs font-mono transition ${
              showHeatmap
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                : 'bg-[#141824]/90 text-slate-300 border-white/10 hover:text-amber-300 hover:border-amber-500/40'
            }`}
            title="Toggle Thermal Heatmap Layer"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">HEATMAP</span>
          </button>

          {/* Hazard Exclusion Toggle */}
          <button
            onClick={() => setShowHazards(!showHazards)}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded border text-xs font-mono transition ${
              showHazards
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                : 'bg-[#141824]/90 text-slate-400 border-white/10 hover:text-amber-300 hover:border-amber-500/40'
            }`}
            title="Toggle Hazard Exclusion Zones"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">HAZARDS</span>
          </button>

          {/* Tactical / Satellite Toggle */}
          <button
            onClick={toggleMapLayer}
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#141824]/90 border border-white/10 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 text-xs font-mono transition"
            title="Toggle Satellite Imagery / Tactical Map"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{mapMode === 'tactical' ? 'SATELLITE' : 'TACTICAL'}</span>
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

          <button
            onClick={recenterOnDrone}
            className="p-1 rounded bg-[#141824]/90 border border-white/10 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 shadow transition"
            title="Center on REC-01 Drone"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={fitBoundsToSector}
            className="p-1 rounded bg-[#141824]/90 border border-white/10 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 shadow transition"
            title="Fit Search Sector"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-10" />

      {/* Map Legend Overlay in bottom-left */}
      <div className="absolute bottom-2.5 left-2.5 z-[2000] pointer-events-none px-2.5 py-1 rounded bg-[#090b10]/95 backdrop-blur border border-white/10 text-[10px] font-mono flex items-center space-x-3 text-slate-400 shadow">
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>REC-01 UAV</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span>REC-02 RELIEF</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Survivor Alert</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-3 h-0.5 bg-rose-500 border border-dashed" />
          <span>Hazard Exclusion</span>
        </div>
      </div>
    </div>
  );
};
