import { Incident } from '../types/incident';
import { DrillScenario, DrillScenarioId, HazardZone, MissionEvent, MissionMode, MissionStatus, SearchSector } from '../types/mission';
import { SensorEvidence, SensorStatus } from '../types/sensors';
import { SVLPEvaluation, SVLPState } from '../types/svlp';
import { Telemetry } from '../types/telemetry';
import { DEFAULT_SVLP_THRESHOLDS, DEFAULT_SVLP_WEIGHTS, SVLPEngine } from './svlpEngine';

// Default search area centered around 28.6139, 77.2090 (Disaster Response Drill Sector Alpha)
export const DEFAULT_SEARCH_SECTOR: SearchSector = {
  name: 'Disaster Sector Alpha — Urban Debris Zone',
  center: [28.6139, 77.2090],
  bounds: [
    [28.6170, 77.2050],
    [28.6170, 77.2130],
    [28.6105, 77.2130],
    [28.6105, 77.2050],
  ],
  totalAreaM2: 520000,
  areaCoveredPercent: 18,
};

// Planned lawnmower waypoints for sector coverage
const WAYPOINTS: [number, number][] = [
  [28.6162, 77.2058],
  [28.6162, 77.2120],
  [28.6148, 77.2120],
  [28.6148, 77.2058],
  [28.6134, 77.2058],
  [28.6134, 77.2120],
  [28.6120, 77.2120],
  [28.6120, 77.2058],
];

// Pre-positioned anomaly hotspots along search route
export interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  description: string;
  targetVisual: number;
  targetThermal: number;
  targetAcoustic: number;
  targetLidar?: number;
  discovered: boolean;
}

export const PRESET_HOTSPOTS: Hotspot[] = [
  {
    id: 'HOT-01',
    latitude: 28.6148,
    longitude: 77.2092,
    description: 'Collapsed structure with trapped individual beneath rubble slab',
    targetVisual: 0.76,
    targetThermal: 0.93,
    targetAcoustic: 0.84,
    targetLidar: 0.88,
    discovered: false,
  },
  {
    id: 'HOT-02',
    latitude: 28.6125,
    longitude: 77.2105,
    description: 'Partially submerged basement cavity with faint distress tapping',
    targetVisual: 0.65,
    targetThermal: 0.86,
    targetAcoustic: 0.80,
    targetLidar: 0.78,
    discovered: false,
  },
];

export const HAZARD_ZONES: HazardZone[] = [
  {
    id: 'HAZ-01',
    name: 'Unstable Multi-Story Façade',
    type: 'STRUCTURAL_COLLAPSE',
    color: '#f43f5e',
    bounds: [
      [28.6160, 77.2065],
      [28.6166, 77.2082],
      [28.6152, 77.2086],
      [28.6148, 77.2068],
    ],
    severity: 'HIGH',
    description: 'Cracked load-bearing columns; secondary collapse risk. Keep drone altitude >25m AGL.',
  },
  {
    id: 'HAZ-02',
    name: 'Sub-surface Ruptured Gas Pocket',
    type: 'TOXIC_PLUME',
    color: '#f97316',
    bounds: [
      [28.6130, 77.2098],
      [28.6138, 77.2118],
      [28.6120, 77.2122],
      [28.6114, 77.2104],
    ],
    severity: 'EXTREME',
    description: 'VOC volatile organic sensor spike. Flammable vapor dispersion towards south-east.',
  },
];

export const DRILL_SCENARIOS: Record<DrillScenarioId, DrillScenario> = {
  EARTHQUAKE_RUBBLE: {
    id: 'EARTHQUAKE_RUBBLE',
    title: 'Earthquake Structural Collapse',
    subtitle: 'Urban Debris Cavity Search • Sector Alpha',
    description: 'High-density reinforced concrete rubble with sub-surface voids and trapped survivors.',
    windSpeed: '3.2 m/s NW',
    ambientTemp: 18.5,
    recommendedSensor: 'FLIR Thermal + LiDAR 3D Void',
  },
  FLASH_FLOOD_NIGHT: {
    id: 'FLASH_FLOOD_NIGHT',
    title: 'Flash Flood Night Rescue',
    subtitle: 'Riverbank Inundation & Debris Drift • Sector Beta',
    description: 'Rapidly rising water table, submerged vehicles, night-time low-light operations.',
    windSpeed: '8.4 m/s gusts',
    ambientTemp: 14.0,
    recommendedSensor: 'NVG Night Vision + FLIR White-Hot',
  },
  CHEMICAL_EXPLOSION: {
    id: 'CHEMICAL_EXPLOSION',
    title: 'Industrial Chemical Incident',
    subtitle: 'Toxic Plume Perimeter & Worker Triage • Sector Gamma',
    description: 'Hazardous material breach with dynamic toxic exclusion zone and acoustic distress signals.',
    windSpeed: '5.1 m/s E',
    ambientTemp: 22.0,
    recommendedSensor: 'Acoustic Array + Thermal Hotspot',
  },
};

export const createScenarioHotspots = (scenarioId: DrillScenarioId): Hotspot[] => {
  switch (scenarioId) {
    case 'FLASH_FLOOD_NIGHT':
      return [
        {
          id: 'HOT-FF-01',
          latitude: 28.6152,
          longitude: 77.2110,
          description: 'Submerged vehicle roof with active strobe signals in flood channel',
          targetVisual: 0.74,
          targetThermal: 0.95,
          targetAcoustic: 0.88,
          targetLidar: 0.82,
          discovered: false,
        },
        {
          id: 'HOT-FF-02',
          latitude: 28.6138,
          longitude: 77.2085,
          description: 'Riverbank embankment washout with trapped survivor in debris cluster',
          targetVisual: 0.68,
          targetThermal: 0.86,
          targetAcoustic: 0.78,
          targetLidar: 0.76,
          discovered: false,
        },
        {
          id: 'HOT-FF-03',
          latitude: 28.6125,
          longitude: 77.2105,
          description: 'Flooded underground commercial basement with distress wrench tapping',
          targetVisual: 0.62,
          targetThermal: 0.81,
          targetAcoustic: 0.76,
          targetLidar: 0.74,
          discovered: false,
        },
      ];

    case 'CHEMICAL_EXPLOSION':
      return [
        {
          id: 'HOT-CH-01',
          latitude: 28.6130,
          longitude: 77.2098,
          description: 'High-pressure ethylene manifold blast injury site & VOC plume',
          targetVisual: 0.78,
          targetThermal: 0.97,
          targetAcoustic: 0.86,
          targetLidar: 0.89,
          discovered: false,
        },
        {
          id: 'HOT-CH-02',
          latitude: 28.6155,
          longitude: 77.2075,
          description: 'Chlorine scrubber tower collapse with elevated catwalk casualties',
          targetVisual: 0.82,
          targetThermal: 0.88,
          targetAcoustic: 0.75,
          targetLidar: 0.84,
          discovered: false,
        },
        {
          id: 'HOT-CH-03',
          latitude: 28.6142,
          longitude: 77.2112,
          description: 'Chemical trench valve enclosure with hazardous H2S accumulation',
          targetVisual: 0.65,
          targetThermal: 0.84,
          targetAcoustic: 0.79,
          targetLidar: 0.72,
          discovered: false,
        },
      ];

    case 'EARTHQUAKE_RUBBLE':
    default:
      return [
        {
          id: 'HOT-EQ-01',
          latitude: 28.6148,
          longitude: 77.2092,
          description: 'Multi-story collapsed structure with trapped casualties beneath concrete slab',
          targetVisual: 0.78,
          targetThermal: 0.95,
          targetAcoustic: 0.86,
          targetLidar: 0.89,
          discovered: false,
        },
        {
          id: 'HOT-EQ-02',
          latitude: 28.6135,
          longitude: 77.2072,
          description: 'Transit overpass rupture with sheared girder onto crushed vehicle',
          targetVisual: 0.81,
          targetThermal: 0.87,
          targetAcoustic: 0.72,
          targetLidar: 0.85,
          discovered: false,
        },
        {
          id: 'HOT-EQ-03',
          latitude: 28.6125,
          longitude: 77.2105,
          description: 'Partially submerged basement cavity with faint distress tapping',
          targetVisual: 0.66,
          targetThermal: 0.86,
          targetAcoustic: 0.80,
          targetLidar: 0.78,
          discovered: false,
        },
      ];
  }
};

export const createScenarioIncidents = (scenarioId: DrillScenarioId): Incident[] => {
  const now = Date.now();
  switch (scenarioId) {
    case 'FLASH_FLOOD_NIGHT':
      return [
        {
          incidentId: 'INC-201',
          title: 'Submerged Minivan Stranded in Current Surge',
          accidentType: 'VEHICLE_SUBMERSION',
          victimCount: 2,
          timestamp: new Date(now - 6 * 60 * 1000).toISOString(),
          latitude: 28.6152,
          longitude: 77.2110,
          confidence: 0.93,
          status: 'HIGH_PRIORITY',
          priority: 'CRITICAL',
          evidence: {
            visual: 0.74,
            thermal: 0.95,
            acoustic: 0.88,
            lidar: 0.82,
          },
          recommendedAction: 'Vector NDRF Swiftwater Rescue Boat to riverbank grid. Drone REC-02 initiate life-preserver payload drop.',
          notes: 'Submerged passenger van caught in 2.2 m/s flood surge. 2 adults on roof flashing emergency strobe. Water level rising 8cm/hr.',
          acknowledged: true,
        },
        {
          incidentId: 'INC-202',
          title: 'Embankment Washout Debris Entrapment',
          accidentType: 'DEBRIS_ENTRAPMENT',
          victimCount: 1,
          timestamp: new Date(now - 16 * 60 * 1000).toISOString(),
          latitude: 28.6138,
          longitude: 77.2085,
          confidence: 0.84,
          status: 'UNDER_VERIFICATION',
          priority: 'HIGH',
          evidence: {
            visual: 0.68,
            thermal: 0.86,
            acoustic: 0.78,
            lidar: 0.76,
          },
          recommendedAction: 'Deploy motorized winch from northern levee. FLIR thermal continuous lock to monitor hypothermia risk.',
          notes: 'Drifting log and debris mass pinned against drainage culvert. Vocal calls corroborated at 180Hz.',
          acknowledged: false,
        },
        {
          incidentId: 'INC-203',
          title: 'Commercial Basement Flood Inundation',
          accidentType: 'STRUCTURAL_INUNDATION',
          victimCount: 1,
          timestamp: new Date(now - 32 * 60 * 1000).toISOString(),
          latitude: 28.6125,
          longitude: 77.2105,
          confidence: 0.79,
          status: 'UNDER_VERIFICATION',
          priority: 'MEDIUM',
          evidence: {
            visual: 0.62,
            thermal: 0.81,
            acoustic: 0.76,
            lidar: 0.74,
          },
          recommendedAction: 'Dispatch portable submersible dewatering pump and tactical extraction hoist team.',
          notes: 'Underground parking security cabin flooded. Faint metallic wrench distress tapping detected.',
          acknowledged: false,
        },
        {
          incidentId: 'INC-204',
          title: 'Residential Rooftop Rescue Completed',
          accidentType: 'FLOOD_EVACUATION',
          victimCount: 3,
          timestamp: new Date(now - 55 * 60 * 1000).toISOString(),
          latitude: 28.6108,
          longitude: 77.2095,
          confidence: 0.91,
          status: 'RESOLVED',
          priority: 'HIGH',
          evidence: {
            visual: 0.88,
            thermal: 0.92,
            acoustic: 0.84,
            lidar: 0.80,
          },
          recommendedAction: 'Evacuation completed. Family of 3 transferred to Municipal Shelter Sector 4.',
          notes: 'Rapid airlift hoist completed by helicopter squad. All vital signs stable.',
          acknowledged: true,
        },
      ];

    case 'CHEMICAL_EXPLOSION':
      return [
        {
          incidentId: 'INC-301',
          title: 'Storage Tank Manifold Blast Injury',
          accidentType: 'BLEVE_EXPLOSION',
          victimCount: 1,
          timestamp: new Date(now - 4 * 60 * 1000).toISOString(),
          latitude: 28.6130,
          longitude: 77.2098,
          confidence: 0.96,
          status: 'HIGH_PRIORITY',
          priority: 'CRITICAL',
          hazardZoneRef: 'HAZ-02',
          evidence: {
            visual: 0.78,
            thermal: 0.97,
            acoustic: 0.86,
            lidar: 0.89,
          },
          recommendedAction: 'Level-A Hazmat extraction team entry authorized with SCBA. Continuous volatile organic plume tracking active.',
          notes: 'Unconscious plant technician near high-pressure ethylene manifold. Severe thermal burns & vapor inhalation risk.',
          acknowledged: true,
        },
        {
          incidentId: 'INC-302',
          title: 'Chlorine Scrubber Tower Collapse',
          accidentType: 'TOXIC_BREACH',
          victimCount: 2,
          timestamp: new Date(now - 14 * 60 * 1000).toISOString(),
          latitude: 28.6155,
          longitude: 77.2075,
          confidence: 0.87,
          status: 'UNDER_VERIFICATION',
          priority: 'HIGH',
          hazardZoneRef: 'HAZ-01',
          evidence: {
            visual: 0.82,
            thermal: 0.88,
            acoustic: 0.75,
            lidar: 0.84,
          },
          recommendedAction: 'Establish 200m downwind safety perimeter. REC-02 drone deploy chemical burn neutralization kit.',
          notes: 'Secondary structural collapse of steel scaffolding onto solvent line. Workers signaling from elevated catwalk.',
          acknowledged: false,
        },
        {
          incidentId: 'INC-303',
          title: 'Chemical Trench Gas Enclosure',
          accidentType: 'CONFINED_SPACE_TOXIC',
          victimCount: 1,
          timestamp: new Date(now - 28 * 60 * 1000).toISOString(),
          latitude: 28.6142,
          longitude: 77.2112,
          confidence: 0.81,
          status: 'UNDER_VERIFICATION',
          priority: 'MEDIUM',
          evidence: {
            visual: 0.65,
            thermal: 0.84,
            acoustic: 0.79,
            lidar: 0.72,
          },
          recommendedAction: 'Forced ventilation and toxic gas suction required before stretcher team descent.',
          notes: 'Pipeline maintenance technician trapped in valve chamber with hazardous H2S accumulation.',
          acknowledged: false,
        },
        {
          incidentId: 'INC-304',
          title: 'Loading Dock Perimeter Evacuation Completed',
          accidentType: 'HAZMAT_TRIAGE',
          victimCount: 4,
          timestamp: new Date(now - 48 * 60 * 1000).toISOString(),
          latitude: 28.6162,
          longitude: 77.2068,
          confidence: 0.88,
          status: 'RESOLVED',
          priority: 'MEDIUM',
          evidence: {
            visual: 0.86,
            thermal: 0.80,
            acoustic: 0.74,
            lidar: 0.65,
          },
          recommendedAction: 'Evacuation successful. Decontamination shower protocol executed at Gate 3.',
          notes: 'Perimeter workers safely moved upwind and triaged for mild particulate exposure.',
          acknowledged: true,
        },
      ];

    case 'EARTHQUAKE_RUBBLE':
    default:
      return [
        {
          incidentId: 'INC-101',
          title: 'Commercial Complex Structural Collapse',
          accidentType: 'STRUCTURAL_COLLAPSE',
          victimCount: 2,
          timestamp: new Date(now - 5 * 60 * 1000).toISOString(),
          latitude: 28.6148,
          longitude: 77.2092,
          confidence: 0.94,
          status: 'HIGH_PRIORITY',
          priority: 'CRITICAL',
          hazardZoneRef: 'HAZ-01',
          evidence: {
            visual: 0.78,
            thermal: 0.95,
            acoustic: 0.86,
            lidar: 0.89,
          },
          recommendedAction: 'Dispatch USAR Heavy Rescue Unit with pneumatic lifting bags & hydraulic spreaders. Gas shutoff active.',
          notes: 'Multi-story reinforced concrete collapse. 2 adult casualties trapped in sub-surface void beneath slab #4. Acoustic tapping confirmed at 180Hz.',
          acknowledged: true,
        },
        {
          incidentId: 'INC-102',
          title: 'Transit Overpass Rupture & Crushed Van',
          accidentType: 'VEHICLE_CRUSH',
          victimCount: 1,
          timestamp: new Date(now - 18 * 60 * 1000).toISOString(),
          latitude: 28.6135,
          longitude: 77.2072,
          confidence: 0.86,
          status: 'UNDER_VERIFICATION',
          priority: 'HIGH',
          evidence: {
            visual: 0.81,
            thermal: 0.87,
            acoustic: 0.72,
            lidar: 0.85,
          },
          recommendedAction: 'Deploy crane truck and stabilization jacks. Maintain drone thermal surveillance on fuel leak boundary.',
          notes: 'Concrete bridge girder sheared onto transit van. Single conscious driver trapped behind steering column.',
          acknowledged: false,
        },
        {
          incidentId: 'INC-103',
          title: 'Collapsed Basement Cavity Inundation',
          accidentType: 'VOID_ENTRAPMENT',
          victimCount: 1,
          timestamp: new Date(now - 35 * 60 * 1000).toISOString(),
          latitude: 28.6125,
          longitude: 77.2105,
          confidence: 0.82,
          status: 'UNDER_VERIFICATION',
          priority: 'MEDIUM',
          evidence: {
            visual: 0.66,
            thermal: 0.86,
            acoustic: 0.80,
            lidar: 0.78,
          },
          recommendedAction: 'Deploy submersible pump and tactical extraction hoist. Drone REC-02 standing by for medical payload drop.',
          notes: 'Sub-surface basement void with faint distress tapping. Ruptured water main causing slow accumulation.',
          acknowledged: false,
        },
        {
          incidentId: 'INC-104',
          title: 'Residential Arcade Surface Rescue Completed',
          accidentType: 'SURFACE_EXTRACTION',
          victimCount: 1,
          timestamp: new Date(now - 50 * 60 * 1000).toISOString(),
          latitude: 28.6115,
          longitude: 77.2078,
          confidence: 0.89,
          status: 'RESOLVED',
          priority: 'MEDIUM',
          evidence: {
            visual: 0.84,
            thermal: 0.79,
            acoustic: 0.75,
            lidar: 0.62,
          },
          recommendedAction: 'Evacuation completed. Casualty safely transported to Trauma Care Unit Alpha.',
          notes: 'Surface rubble entrapment successfully cleared by Quick Response Team. Stable condition.',
          acknowledged: true,
        },
      ];
  }
};

export interface SimulatorState {
  telemetry: Telemetry;
  companionTelemetry: Telemetry;
  activeDroneId: 'REC-01' | 'REC-02';
  sensorStatus: SensorStatus;
  sensorEvidence: SensorEvidence;
  svlpEvaluation: SVLPEvaluation;
  incidents: Incident[];
  missionEvents: MissionEvent[];
  flightPath: [number, number][];
  companionFlightPath: [number, number][];
  searchSector: SearchSector;
  hazardZones: HazardZone[];
  activeScenario: DrillScenarioId;
  missionStatus: MissionStatus;
  missionMode: MissionMode;
  missionTimeSeconds: number;
  hotspots: Hotspot[];
  simulationSpeed: number;
  isPaused: boolean;
  isAutoDemoRunning: boolean;
}

type Subscriber = (state: SimulatorState) => void;

export class DroneSimulator {
  private svlpEngine: SVLPEngine;
  private state: SimulatorState;
  private subscribers: Set<Subscriber> = new Set();
  private timer: number | null = null;
  private autoDemoTimer: number | null = null;
  private currentWaypointIndex: number = 0;
  private tickIntervalMs: number = 1000;
  private incidentCounter: number = 105;
  private alertHoldTicks: number = 0;

  constructor() {
    this.svlpEngine = new SVLPEngine(DEFAULT_SVLP_WEIGHTS, DEFAULT_SVLP_THRESHOLDS);
    
    const initialLat = WAYPOINTS[0][0];
    const initialLng = WAYPOINTS[0][1];

    this.state = {
      telemetry: {
        timestamp: new Date().toISOString(),
        droneId: 'REC-01',
        latitude: initialLat,
        longitude: initialLng,
        altitude: 35.2,
        speed: 7.4,
        battery: 88,
        batteryVoltage: 22.8,
        gpsStatus: 'LOCKED',
        connection: 'CONNECTED',
        heading: 90,
        pitch: 1.2,
        roll: -0.4,
        yaw: 89.8,
        satellites: 18,
        signalStrength: 96,
      },
      companionTelemetry: {
        timestamp: new Date().toISOString(),
        droneId: 'REC-02',
        latitude: initialLat + 0.0018,
        longitude: initialLng + 0.0015,
        altitude: 45.0,
        speed: 6.2,
        battery: 94,
        batteryVoltage: 23.2,
        gpsStatus: 'LOCKED',
        connection: 'CONNECTED',
        heading: 180,
        pitch: 0.8,
        roll: 0.2,
        yaw: 179.5,
        satellites: 19,
        signalStrength: 98,
      },
      activeDroneId: 'REC-01',
      sensorStatus: {
        rgbCamera: 'ACTIVE',
        thermalSensor: 'ACTIVE',
        acousticSensor: 'ACTIVE',
        lidar: 'ACTIVE',
        gps: 'ACTIVE',
        imu: 'ACTIVE',
      },
      sensorEvidence: {
        visual: 0.12,
        thermal: 0.18,
        acoustic: 0.08,
        lidar: 0.15,
        timestamp: new Date().toISOString(),
        visualObjectLabel: 'Clear terrain / rubble debris',
        visualConfidence: 0.12,
        thermalHotspotTemp: 19.4,
        thermalAmbientTemp: 18.5,
        acousticDecibels: 42,
        acousticFrequency: 140,
        lidarDepthM: 35.2,
        lidarVoidVolumeM3: 0.0,
        lidarStructuralIntegrity: 'CLEAR / NO VOID',
      },
      svlpEvaluation: {
        state: 'SEARCH',
        confidence: 0.13,
        recommendedAction: 'Maintain primary search pattern. Multi-sensor background scanning active.',
        stateReason: 'Normal survey grid scan in progress.',
      },
      incidents: createScenarioIncidents('EARTHQUAKE_RUBBLE'),
      missionEvents: [
        {
          id: 'EVT-001',
          timestamp: new Date().toISOString(),
          type: 'INFO',
          title: 'Mission Initialized',
          details: 'Disaster Sector Alpha grid loaded. REC-01 autonomous survey started.',
        },
        {
          id: 'EVT-002',
          timestamp: new Date().toISOString(),
          type: 'SUCCESS',
          title: 'Sensor Suite Calibrated',
          details: 'RGB 4K, FLIR Thermal LWIR, LiDAR 3D Void Depth, and MEMS Acoustic Array operational.',
        },
      ],
      flightPath: [[initialLat, initialLng]],
      companionFlightPath: [[initialLat + 0.0018, initialLng + 0.0015]],
      searchSector: { ...DEFAULT_SEARCH_SECTOR },
      hazardZones: [...HAZARD_ZONES],
      activeScenario: 'EARTHQUAKE_RUBBLE',
      missionStatus: 'ACTIVE',
      missionMode: 'AUTONOMOUS_SEARCH',
      missionTimeSeconds: 0,
      hotspots: createScenarioHotspots('EARTHQUAKE_RUBBLE'),
      simulationSpeed: 1,
      isPaused: false,
      isAutoDemoRunning: false,
    };

    // Auto-start simulation on creation
    this.start();
  }

  public start(): void {
    if (this.timer) return;
    this.timer = window.setInterval(() => this.tick(), this.tickIntervalMs / this.state.simulationSpeed);
  }

  public pause(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.state.isPaused = true;
    this.state.missionStatus = 'PAUSED';
    this.notify();
  }

  public resume(): void {
    this.state.isPaused = false;
    this.state.missionStatus = 'ACTIVE';
    this.start();
    this.notify();
  }

  public setActiveDrone(droneId: 'REC-01' | 'REC-02'): void {
    this.state.activeDroneId = droneId;
    this.addEvent({
      id: `EVT-DRONE-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'INFO',
      title: `Swarm Telemetry Switched: ${droneId}`,
      details: `Active ground telemetry display reassigned to ${droneId} (${droneId === 'REC-01' ? 'Lead Scout' : 'Relief Payload Carrier'}).`,
    });
    this.notify();
  }

  public setScenario(scenarioId: DrillScenarioId): void {
    this.state.activeScenario = scenarioId;
    const scenario = DRILL_SCENARIOS[scenarioId];

    this.state.incidents = createScenarioIncidents(scenarioId);
    this.state.hotspots = createScenarioHotspots(scenarioId);

    if (scenarioId === 'FLASH_FLOOD_NIGHT') {
      this.state.searchSector.name = 'Sector Beta — Riverbank Inundation';
      this.state.sensorEvidence.thermalAmbientTemp = 14.0;
      this.incidentCounter = 205;
    } else if (scenarioId === 'CHEMICAL_EXPLOSION') {
      this.state.searchSector.name = 'Sector Gamma — Industrial Complex Perimeter';
      this.state.sensorEvidence.thermalAmbientTemp = 22.0;
      this.incidentCounter = 305;
    } else {
      this.state.searchSector.name = DEFAULT_SEARCH_SECTOR.name;
      this.state.sensorEvidence.thermalAmbientTemp = 18.5;
      this.incidentCounter = 105;
    }

    this.addEvent({
      id: `EVT-SCENARIO-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'WARNING',
      title: `Disaster Scenario Loaded: ${scenario.title}`,
      details: `${scenario.description} Activated ${this.state.incidents.length} verified accident records and ${this.state.hotspots.length} radar search targets.`,
    });

    this.notify();
  }

  public runAutoDemo(): void {
    if (this.state.isAutoDemoRunning) return;
    this.state.isAutoDemoRunning = true;

    // 1. Resume simulation and set speed to 2x
    this.resume();
    this.setSpeed(2);

    // 2. Inject high-confidence drill anomaly immediately forward
    this.injectAnomaly();

    this.addEvent({
      id: `EVT-DEMO-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'INFO',
      title: 'JUDGE AUTO-DEMO ENGAGED',
      details: 'Automated 15s demonstration of full REC-SVLP multi-sensor survivor verification cycle.',
    });

    // 3. Clear existing autoDemoTimer
    if (this.autoDemoTimer) clearTimeout(this.autoDemoTimer);

    // Stop after 15 seconds of accelerated simulation
    this.autoDemoTimer = window.setTimeout(() => {
      this.state.isAutoDemoRunning = false;
      this.setSpeed(1);
      this.notify();
    }, 16000);

    this.notify();
  }

  public setMissionMode(mode: MissionMode): void {
    this.state.missionMode = mode;
    
    let details = `Flight mode manually updated to ${mode.replace(/_/g, ' ')}.`;
    if (mode === 'RETURN_TO_HOME') {
      details = 'Return-to-Home engaged. Drone vectoring to base waypoint at 40m altitude.';
      this.state.telemetry.altitude = 40.0;
      this.state.telemetry.speed = 8.5;
    } else if (mode === 'VERIFICATION_HOLD') {
      details = 'Stationary precision hover engaged at 12m. Gimbal sensors locked.';
      this.state.telemetry.altitude = 12.0;
      this.state.telemetry.speed = 0.2;
    } else if (mode === 'MANUAL_INVESTIGATION') {
      details = 'Manual investigation mode active. Cruise speed reduced to 3.8 m/s.';
      this.state.telemetry.altitude = 22.0;
      this.state.telemetry.speed = 3.8;
    } else if (mode === 'AUTONOMOUS_SEARCH') {
      details = 'Autonomous search grid resumed at 35m cruise altitude.';
      this.state.telemetry.altitude = 35.0;
      this.state.telemetry.speed = 7.4;
    }

    this.addEvent({
      id: `EVT-MODE-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'INFO',
      title: `Flight Mode: ${mode.replace(/_/g, ' ')}`,
      details,
      relatedCoordinates: {
        latitude: this.state.telemetry.latitude,
        longitude: this.state.telemetry.longitude,
      },
    });

    this.notify();
  }

  public setSpeed(multiplier: number): void {
    this.state.simulationSpeed = multiplier;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = window.setInterval(() => this.tick(), this.tickIntervalMs / this.state.simulationSpeed);
    }
    this.notify();
  }

  public reset(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.currentWaypointIndex = 0;
    this.svlpEngine.reset();
    const initialLat = WAYPOINTS[0][0];
    const initialLng = WAYPOINTS[0][1];

    this.state.telemetry.latitude = initialLat;
    this.state.telemetry.longitude = initialLng;
    this.state.telemetry.altitude = 35.0;
    this.state.telemetry.speed = 7.4;
    this.state.telemetry.battery = 92;
    this.state.flightPath = [[initialLat, initialLng]];
    this.state.companionFlightPath = [[initialLat + 0.0018, initialLng + 0.0015]];
    this.state.incidents = createScenarioIncidents(this.state.activeScenario);
    this.state.missionEvents = [
      {
        id: 'EVT-RST',
        timestamp: new Date().toISOString(),
        type: 'INFO',
        title: 'Mission Reset',
        details: 'REC Command Center reset to initial survey point. Disaster incident manifest reloaded.',
      },
    ];
    this.state.hotspots = createScenarioHotspots(this.state.activeScenario);
    this.state.searchSector.areaCoveredPercent = 5;
    this.state.missionTimeSeconds = 0;
    this.state.missionStatus = 'ACTIVE';
    this.state.missionMode = 'AUTONOMOUS_SEARCH';
    this.state.isPaused = false;
    this.state.isAutoDemoRunning = false;
    
    this.start();
    this.notify();
  }

  public injectAnomaly(accidentTitle?: string): void {
    const curLat = this.state.telemetry.latitude;
    const curLng = this.state.telemetry.longitude;
    
    // Position accident immediately in forward flight corridor (~45m ahead)
    const headingRad = (this.state.telemetry.heading * Math.PI) / 180;
    const forwardLat = curLat + Math.cos(headingRad) * 0.00045;
    const forwardLng = curLng + Math.sin(headingRad) * 0.00045;

    const incidentNum = this.incidentCounter++;
    const incidentId = `INC-${String(incidentNum).padStart(3, '0')}`;

    let defaultTitle = 'Emergency Structural Cavity Accident';
    let accidentType = 'STRUCTURAL_COLLAPSE';
    let defaultNotes = 'Immediate multi-spectral anomaly detected forward of drone patrol vector. High thermal signature & acoustic distress pattern.';
    let action = 'Vector primary drone to hover coordinates. Dispatch rapid extraction squad with hydraulic spreaders.';

    if (this.state.activeScenario === 'FLASH_FLOOD_NIGHT') {
      defaultTitle = 'Surge Debris Car Crash / Trapped Occupants';
      accidentType = 'WATER_ENTRAPMENT';
      defaultNotes = 'Vehicle displaced by flood surge pinned against retaining barrier. Thermal body heat localized inside cabin.';
      action = 'NDRF swiftwater team deploy tether line. Drone REC-02 dispatch flotation payload.';
    } else if (this.state.activeScenario === 'CHEMICAL_EXPLOSION') {
      defaultTitle = 'Process Pipe Rupture & Chemical Burn Casualty';
      accidentType = 'CHEMICAL_EXPOSURE';
      defaultNotes = 'Aerosolized toxic chemical leak with high thermal contrast. Worker signaling with pass alarm.';
      action = 'Hazmat emergency response team dispatch with antidote kit. Exclude non-essential personnel.';
    }

    const title = accidentTitle || defaultTitle;

    const newIncident: Incident = {
      incidentId,
      title,
      accidentType,
      victimCount: 1 + Math.floor(Math.random() * 2),
      timestamp: new Date().toISOString(),
      latitude: parseFloat(forwardLat.toFixed(5)),
      longitude: parseFloat(forwardLng.toFixed(5)),
      confidence: 0.94,
      status: 'HIGH_PRIORITY',
      priority: 'CRITICAL',
      evidence: {
        visual: 0.82,
        thermal: 0.96,
        acoustic: 0.88,
        lidar: 0.91,
      },
      recommendedAction: action,
      notes: defaultNotes,
      acknowledged: false,
    };

    // 1. Immediately insert new accident into active incident queue
    this.state.incidents.unshift(newIncident);

    // 2. Add as an active radar hotspot
    const manualHotspot: Hotspot = {
      id: `HOT-${incidentId}`,
      latitude: forwardLat,
      longitude: forwardLng,
      description: `${title} • ${defaultNotes}`,
      targetVisual: 0.82,
      targetThermal: 0.96,
      targetAcoustic: 0.88,
      targetLidar: 0.91,
      discovered: false,
    };
    this.state.hotspots.unshift(manualHotspot);

    // 3. Vector drone immediately to accident site for investigation
    this.state.missionMode = 'MANUAL_INVESTIGATION';
    this.state.telemetry.altitude = 18.0;
    this.state.telemetry.speed = 6.8;

    // 4. Update sensor evidence readings to reflect accident detection
    this.state.sensorEvidence = {
      ...this.state.sensorEvidence,
      visual: 0.82,
      thermal: 0.96,
      acoustic: 0.88,
      lidar: 0.91,
      visualObjectLabel: `CRITICAL CASUALTY: ${title}`,
      visualConfidence: 0.82,
      thermalHotspotTemp: 38.4,
      acousticDecibels: 84,
      acousticFrequency: 180,
      lidarVoidVolumeM3: 3.8,
      lidarStructuralIntegrity: 'CRITICAL CAVITY / ACCIDENT VOID DETECTED',
    };

    // 5. Force SVLP evaluation into INVESTIGATION
    this.state.svlpEvaluation = {
      state: 'INVESTIGATION',
      confidence: 0.94,
      recommendedAction: action,
      stateReason: `Accident simulated: ${title}. Multi-spectral sensors corroborated.`,
      targetCoordinates: { latitude: forwardLat, longitude: forwardLng },
    };

    // 6. Log critical timeline alert
    this.addEvent({
      id: `EVT-ACCIDENT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'ALERT',
      title: `🚨 ACCIDENT REPORTED: ${incidentId}`,
      details: `${title} at [${forwardLat.toFixed(4)}, ${forwardLng.toFixed(4)}]. Drone vectoring to accident site at 18m AGL.`,
      relatedCoordinates: { latitude: forwardLat, longitude: forwardLng },
    });

    this.notify();
  }

  public exportSITREP(): string {
    const activeIncidents = this.state.incidents.filter(i => i.status !== 'RESOLVED');
    const resolvedIncidents = this.state.incidents.filter(i => i.status === 'RESOLVED');
    
    const sitrep = `# REC TACTICAL SITUATION REPORT (SITREP)
**GENERATED:** ${new Date().toISOString()}
**CALLSIGN:** REC-01 TACTICAL GCS
**OPERATION:** ${this.state.searchSector.name}
**SCENARIO:** ${DRILL_SCENARIOS[this.state.activeScenario].title}

---

## 1. EXECUTIVE SUMMARY
- **Mission Elapsed Time:** ${Math.floor(this.state.missionTimeSeconds / 60)}m ${this.state.missionTimeSeconds % 60}s
- **Grid Coverage:** ${this.state.searchSector.areaCoveredPercent}% (${this.state.searchSector.totalAreaM2.toLocaleString()} m² survey area)
- **Active Casualties Pending Extraction:** ${activeIncidents.length}
- **Rescued / Evacuated Casualties:** ${resolvedIncidents.length}
- **Telemetry Health:** ${this.state.telemetry.battery}% Battery | SATCOM ${this.state.telemetry.connection} | ${this.state.telemetry.satellites} Satellites locked

---

## 2. VERIFIED INCIDENT MANIFEST
${this.state.incidents.map((inc, i) => `
### [${i + 1}] ${inc.incidentId} — Priority: ${inc.priority} (${inc.status})
- **Coordinates:** ${inc.latitude.toFixed(5)}°N, ${inc.longitude.toFixed(5)}°E
- **SVLP Confidence Score:** ${Math.round(inc.confidence * 100)}%
- **Corroborating Multi-Spectral Telemetry:**
  - Optical (RGB): ${Math.round(inc.evidence.visual * 100)}%
  - FLIR Thermal IR: ${Math.round(inc.evidence.thermal * 100)}%
  - Acoustic Resonance: ${Math.round(inc.evidence.acoustic * 100)}%
  - LiDAR Structural Void: ${inc.evidence.lidar ? Math.round(inc.evidence.lidar * 100) + '%' : 'Corroborated'}
- **Recommended Extraction Vector:** ${inc.recommendedAction}
`).join('\n')}

---

## 3. ACTIVE HAZARD EXCLUSION ZONES
${this.state.hazardZones.map(hz => `- **${hz.name}** [${hz.severity}]: ${hz.description}`).join('\n')}

---
*Report certified by REC-SVLP Autonomous Multi-Spectral Fusion Protocol v1.0*
`;
    return sitrep;
  }

  public getSVLPEngine(): SVLPEngine {
    return this.svlpEngine;
  }

  public subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    fn(this.state);
    return () => this.subscribers.delete(fn);
  }

  private notify(): void {
    this.subscribers.forEach((fn) => fn(this.state));
  }

  private addEvent(event: MissionEvent): void {
    this.state.missionEvents.unshift(event);
    if (this.state.missionEvents.length > 60) {
      this.state.missionEvents.pop();
    }
  }

  private tick(): void {
    if (this.state.isPaused) return;

    this.state.missionTimeSeconds += 1;

    // 1. Check distance to nearest active undiscovered hotspot
    let nearestHotspot: Hotspot | null = null;
    let minDistance = Infinity;

    // Filter to active undiscovered hotspots
    let activeHotspots = this.state.hotspots.filter((h) => !h.discovered);

    // If all preset hotspots were cleared, cycle them so the demo stays perpetually active
    if (activeHotspots.length === 0 && this.state.missionTimeSeconds > 90) {
      this.state.hotspots.forEach((h) => { h.discovered = false; });
      activeHotspots = this.state.hotspots;
    }

    for (const h of activeHotspots) {
      const dist = Math.hypot(
        h.latitude - this.state.telemetry.latitude,
        h.longitude - this.state.telemetry.longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestHotspot = h;
      }
    }

    const inHotspotZone = minDistance < 0.0012; // within ~120 meters

    // 2. Synthesize sensor readings based on distance
    const baseVisual = 0.10 + Math.random() * 0.08;
    const baseThermal = 0.14 + Math.random() * 0.07;
    const baseAcoustic = 0.06 + Math.random() * 0.09;
    const baseLidar = 0.12 + Math.random() * 0.08;

    let targetVisual = baseVisual;
    let targetThermal = baseThermal;
    let targetAcoustic = baseAcoustic;
    let targetLidar = baseLidar;
    let hotspotTemp = 19.5 + (Math.random() * 0.6 - 0.3);
    let acousticDb = 42 + Math.floor(Math.random() * 4);
    let acousticFreq = 120 + Math.floor(Math.random() * 20);
    let objectLabel = 'Clear terrain / rubble';
    let lidarDepth = this.state.telemetry.altitude;
    let lidarVoidVolume = 0.0;
    let structuralStatus = 'CLEAR / NO VOID';

    if (inHotspotZone && nearestHotspot) {
      const proximity = Math.max(0, 1 - (minDistance / 0.0012));
      targetVisual = baseVisual + (nearestHotspot.targetVisual - baseVisual) * proximity;
      targetThermal = baseThermal + (nearestHotspot.targetThermal - baseThermal) * proximity;
      targetAcoustic = baseAcoustic + (nearestHotspot.targetAcoustic - baseAcoustic) * proximity;
      targetLidar = baseLidar + ((nearestHotspot.targetLidar || 0.85) - baseLidar) * proximity;
      
      hotspotTemp = 20.0 + (37.2 - 20.0) * proximity;
      acousticDb = Math.round(45 + (78 - 45) * proximity);
      acousticFreq = Math.round(150 + (840 - 150) * proximity);
      lidarDepth = parseFloat((this.state.telemetry.altitude - proximity * 14).toFixed(1));
      lidarVoidVolume = parseFloat((proximity * 5.4).toFixed(1));

      if (proximity > 0.6) {
        objectLabel = 'Biometric warmth detected / human posture match';
        structuralStatus = `DEEP CAVITY (${lidarVoidVolume}m³ VOID DETECTED)`;
      } else if (proximity > 0.3) {
        objectLabel = 'Possible heat anomaly / partial silhouette';
        structuralStatus = 'UNSTABLE VOID INDICATION';
      }
    }

    const currentAmbient = DRILL_SCENARIOS[this.state.activeScenario]?.ambientTemp || 18.5;

    this.state.sensorEvidence = {
      visual: parseFloat(targetVisual.toFixed(3)),
      thermal: parseFloat(targetThermal.toFixed(3)),
      acoustic: parseFloat(targetAcoustic.toFixed(3)),
      lidar: parseFloat(targetLidar.toFixed(3)),
      timestamp: new Date().toISOString(),
      visualObjectLabel: objectLabel,
      visualConfidence: parseFloat(targetVisual.toFixed(2)),
      thermalHotspotTemp: parseFloat(hotspotTemp.toFixed(1)),
      thermalAmbientTemp: currentAmbient,
      acousticDecibels: acousticDb,
      acousticFrequency: acousticFreq,
      lidarDepthM: lidarDepth,
      lidarVoidVolumeM3: lidarVoidVolume,
      lidarStructuralIntegrity: structuralStatus,
    };

    // 3. Evaluate through REC-SVLP Engine
    const prevSVLPState = this.state.svlpEvaluation.state;
    const svlpEval = this.svlpEngine.evaluate(
      this.state.sensorEvidence,
      {
        latitude: this.state.telemetry.latitude,
        longitude: this.state.telemetry.longitude,
      }
    );
    this.state.svlpEvaluation = svlpEval;

    // Check for State Change Event
    if (svlpEval.state !== prevSVLPState) {
      this.handleStateTransition(prevSVLPState, svlpEval.state, svlpEval);
    }

    // 4. Update Mission Mode and drone dynamics according to SVLP state
    switch (svlpEval.state) {
      case 'SEARCH':
        this.state.missionMode = 'AUTONOMOUS_SEARCH';
        this.state.telemetry.altitude = 35.0 + Math.sin(this.state.missionTimeSeconds * 0.1) * 0.5;
        this.state.telemetry.speed = 7.4;
        this.advanceWaypointLawnmower();
        break;

      case 'SUSPICION':
        this.state.missionMode = 'MANUAL_INVESTIGATION';
        this.state.telemetry.altitude = 28.0;
        this.state.telemetry.speed = 5.2;
        if (nearestHotspot) {
          this.steerToward(nearestHotspot.latitude, nearestHotspot.longitude, 0.00018);
        } else {
          this.advanceWaypointLawnmower();
        }
        break;

      case 'INVESTIGATION':
        this.state.missionMode = 'MANUAL_INVESTIGATION';
        this.state.telemetry.altitude = 20.0;
        this.state.telemetry.speed = 3.8;
        if (nearestHotspot) {
          const angle = this.state.missionTimeSeconds * 0.25;
          const targetLat = nearestHotspot.latitude + Math.sin(angle) * 0.00025;
          const targetLng = nearestHotspot.longitude + Math.cos(angle) * 0.0003;
          this.steerToward(targetLat, targetLng, 0.00018);
        } else {
          this.advanceWaypointLawnmower();
        }
        break;

      case 'VERIFICATION':
        this.state.missionMode = 'VERIFICATION_HOLD';
        this.state.telemetry.altitude = 14.0;
        this.state.telemetry.speed = 2.4;
        if (nearestHotspot) {
          this.steerToward(nearestHotspot.latitude, nearestHotspot.longitude, 0.00012);
        } else {
          this.advanceWaypointLawnmower();
        }
        break;

      case 'ALERT':
        this.state.missionMode = 'VERIFICATION_HOLD';
        this.state.telemetry.altitude = 12.0 + Math.sin(this.state.missionTimeSeconds * 0.2) * 0.3;
        this.state.telemetry.speed = 3.2; // Active tactical loiter orbit speed
        if (nearestHotspot) {
          // Tactical circular orbit around confirmed survivor location (radius ~25m)
          const loiterAngle = this.state.missionTimeSeconds * 0.35;
          const loiterLat = nearestHotspot.latitude + Math.sin(loiterAngle) * 0.00022;
          const loiterLng = nearestHotspot.longitude + Math.cos(loiterAngle) * 0.00028;
          this.steerToward(loiterLat, loiterLng, 0.00015);

          this.alertHoldTicks++;
          if (this.alertHoldTicks > 12) {
            // Target locked & comm relay active. Advance to next patrol waypoint
            nearestHotspot.discovered = true;
            this.alertHoldTicks = 0;
            this.addEvent({
              id: `EVT-RELAY-${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'SUCCESS',
              title: `Survivor Target Locked • Comm Relay Anchored`,
              details: `Incident record logged. Extraction coordinates broadcast. REC-01 resuming autonomous survey sweep.`,
            });
            this.currentWaypointIndex = (this.currentWaypointIndex + 1) % WAYPOINTS.length;
          }
        } else {
          this.advanceWaypointLawnmower();
        }
        break;

      case 'RETURN':
        this.state.missionMode = 'RETURN_TO_HOME';
        this.state.telemetry.speed = 8.5;
        this.state.telemetry.altitude = 40.0;
        this.steerToward(WAYPOINTS[0][0], WAYPOINTS[0][1], 0.0003);
        break;
    }

    // 5. Update Swarm Companion drone (REC-02) orbiting perimeter
    const compAngle = this.state.missionTimeSeconds * 0.05;
    this.state.companionTelemetry.latitude = DEFAULT_SEARCH_SECTOR.center[0] + Math.sin(compAngle) * 0.0022;
    this.state.companionTelemetry.longitude = DEFAULT_SEARCH_SECTOR.center[1] + Math.cos(compAngle) * 0.0028;
    this.state.companionTelemetry.heading = Math.round(((compAngle * 180) / Math.PI + 90) % 360);
    this.state.companionTelemetry.timestamp = new Date().toISOString();
    this.state.companionFlightPath.push([this.state.companionTelemetry.latitude, this.state.companionTelemetry.longitude]);
    if (this.state.companionFlightPath.length > 100) this.state.companionFlightPath.shift();

    // 6. Battery and Telemetry micro-updates
    if (this.state.missionTimeSeconds % 8 === 0 && this.state.telemetry.battery > 5) {
      this.state.telemetry.battery -= 1;
      this.state.telemetry.batteryVoltage = parseFloat((20.0 + (this.state.telemetry.battery / 100) * 4.2).toFixed(1));
    }

    // Update area covered
    if (this.state.searchSector.areaCoveredPercent < 98) {
      this.state.searchSector.areaCoveredPercent = Math.min(
        100,
        parseFloat((18 + (this.state.flightPath.length / 10)).toFixed(1))
      );
    }

    // Append to flight path history (limit to last 250 points for smooth rendering)
    this.state.flightPath.push([this.state.telemetry.latitude, this.state.telemetry.longitude]);
    if (this.state.flightPath.length > 250) {
      this.state.flightPath.shift();
    }

    this.state.telemetry.timestamp = new Date().toISOString();

    this.notify();
  }

  private handleStateTransition(oldState: SVLPState, newState: SVLPState, evaluation: SVLPEvaluation): void {
    let eventType: MissionEvent['type'] = 'INFO';
    let title = `REC-SVLP: ${oldState} → ${newState}`;

    if (newState === 'SUSPICION') {
      eventType = 'WARNING';
      title = 'SVLP: Anomaly Detected';
    } else if (newState === 'INVESTIGATION') {
      eventType = 'WARNING';
      title = 'SVLP: Investigation Commenced';
    } else if (newState === 'VERIFICATION') {
      eventType = 'WARNING';
      title = 'SVLP: High Confidence Verification';
    } else if (newState === 'ALERT') {
      eventType = 'ALERT';
      title = 'CRITICAL RESCUE ALERT';
      this.createIncidentFromAlert(evaluation);
    }

    this.addEvent({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: eventType,
      title,
      details: `${evaluation.stateReason} | Action: ${evaluation.recommendedAction}`,
      relatedCoordinates: {
        latitude: this.state.telemetry.latitude,
        longitude: this.state.telemetry.longitude,
      },
    });
  }

  private createIncidentFromAlert(evaluation: SVLPEvaluation): void {
    const lat = this.state.telemetry.latitude;
    const lng = this.state.telemetry.longitude;
    const incidentId = `INC-${String(this.incidentCounter++).padStart(3, '0')}`;

    let title = 'Sub-Surface Rubble Cavity Casualty';
    let accidentType = 'STRUCTURAL_COLLAPSE';
    if (this.state.activeScenario === 'FLASH_FLOOD_NIGHT') {
      title = 'Inundated Structure Survivor Lock';
      accidentType = 'WATER_ENTRAPMENT';
    } else if (this.state.activeScenario === 'CHEMICAL_EXPLOSION') {
      title = 'Toxic Plume Zone Worker Detection';
      accidentType = 'CHEMICAL_EXPOSURE';
    }

    const newIncident: Incident = {
      incidentId,
      title,
      accidentType,
      victimCount: 1,
      timestamp: new Date().toISOString(),
      latitude: parseFloat(lat.toFixed(5)),
      longitude: parseFloat(lng.toFixed(5)),
      confidence: evaluation.confidence,
      status: 'HIGH_PRIORITY',
      priority: evaluation.confidence > 0.85 ? 'CRITICAL' : 'HIGH',
      evidence: {
        visual: this.state.sensorEvidence.visual,
        thermal: this.state.sensorEvidence.thermal,
        acoustic: this.state.sensorEvidence.acoustic,
        lidar: this.state.sensorEvidence.lidar,
      },
      recommendedAction: evaluation.recommendedAction,
      notes: `Corroborated by thermal hotspot (${this.state.sensorEvidence.thermalHotspotTemp}°C), LiDAR void (${this.state.sensorEvidence.lidarVoidVolumeM3}m³), and acoustic resonance (${this.state.sensorEvidence.acousticFrequency}Hz).`,
      acknowledged: false,
    };

    // Prevent duplicate spam at same location
    const alreadyExists = this.state.incidents.some(
      (inc) => Math.hypot(inc.latitude - lat, inc.longitude - lng) < 0.0003
    );

    if (!alreadyExists) {
      this.state.incidents.unshift(newIncident);
    }
  }

  private advanceWaypointLawnmower(): void {
    const target = WAYPOINTS[this.currentWaypointIndex];
    const dLat = target[0] - this.state.telemetry.latitude;
    const dLng = target[1] - this.state.telemetry.longitude;
    const dist = Math.hypot(dLat, dLng);

    if (dist < 0.0004) {
      this.currentWaypointIndex = (this.currentWaypointIndex + 1) % WAYPOINTS.length;
    } else {
      this.steerToward(target[0], target[1], 0.0002);
    }
  }

  private steerToward(targetLat: number, targetLng: number, stepSize: number): void {
    const dLat = targetLat - this.state.telemetry.latitude;
    const dLng = targetLng - this.state.telemetry.longitude;
    const dist = Math.hypot(dLat, dLng);

    if (dist > 0.00001) {
      const stepLat = (dLat / dist) * Math.min(dist, stepSize);
      const stepLng = (dLng / dist) * Math.min(dist, stepSize);

      this.state.telemetry.latitude += stepLat;
      this.state.telemetry.longitude += stepLng;

      // Calculate heading angle
      const angleDeg = (Math.atan2(dLng, dLat) * 180) / Math.PI;
      this.state.telemetry.heading = Math.round((angleDeg + 360) % 360);
    }
  }

  public acknowledgeIncident(incidentId: string): void {
    const inc = this.state.incidents.find((i) => i.incidentId === incidentId);
    if (inc) {
      inc.acknowledged = true;
      this.addEvent({
        id: `EVT-ACK-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'SUCCESS',
        title: `Incident ${incidentId} Acknowledged`,
        details: `Rescue coordination logged. Operator confirmed extraction squad dispatch.`,
      });
      this.notify();
    }
  }

  public resolveIncident(incidentId: string): void {
    const inc = this.state.incidents.find((i) => i.incidentId === incidentId);
    if (inc) {
      inc.status = 'RESOLVED';
      this.addEvent({
        id: `EVT-RES-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'SUCCESS',
        title: `Incident ${incidentId} Marked Resolved`,
        details: `Survivor located and evacuated to safety by field rescue personnel.`,
      });
      this.notify();
    }
  }
}

// Export singleton instance for app-wide sharing
export const droneSimulator = new DroneSimulator();
