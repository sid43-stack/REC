import { Incident } from '../types/incident';
import { 
  AccidentScenarioItem, 
  CPPStatus, 
  DrillScenario, 
  DrillScenarioId, 
  HazardZone, 
  MissionEvent, 
  MissionMode, 
  MissionStatus, 
  SearchSector 
} from '../types/mission';
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
  areaCoveredPercent: 12,
};

/**
 * Autonomous Coverage Path Planning (CPP) Algorithm
 * Generates Boustrophedon (lawnmower sweep) coverage tracks across the sector polygon.
 */
export function generateCPPTracks(sector: SearchSector, swathSpacingDeg: number = 0.00065): [number, number][] {
  const lats = sector.bounds.map(b => b[0]);
  const lngs = sector.bounds.map(b => b[1]);
  const minLat = Math.min(...lats) + 0.0004;
  const maxLat = Math.max(...lats) - 0.0004;
  const minLng = Math.min(...lngs) + 0.0005;
  const maxLng = Math.max(...lngs) - 0.0005;

  const waypoints: [number, number][] = [];
  let currentLat = maxLat;
  let sweepDirection = true; // true: West-to-East, false: East-to-West

  while (currentLat >= minLat) {
    if (sweepDirection) {
      waypoints.push([parseFloat(currentLat.toFixed(5)), parseFloat(minLng.toFixed(5))]);
      waypoints.push([parseFloat(currentLat.toFixed(5)), parseFloat(maxLng.toFixed(5))]);
    } else {
      waypoints.push([parseFloat(currentLat.toFixed(5)), parseFloat(maxLng.toFixed(5))]);
      waypoints.push([parseFloat(currentLat.toFixed(5)), parseFloat(minLng.toFixed(5))]);
    }
    currentLat -= swathSpacingDeg;
    sweepDirection = !sweepDirection;
  }
  return waypoints;
}

// Pre-positioned anomaly / accident hotspot along search route
export interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  accidentType: string;
  victimCount: number;
  targetVisual: number;
  targetThermal: number;
  targetAcoustic: number;
  targetLidar?: number;
  recommendedAction: string;
  discovered: boolean;
  isSimulated?: boolean;
}

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
    description: 'Cracked load-bearing columns; secondary collapse risk. Maintain altitude >25m AGL.',
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

/**
 * Catalog of Disaster Accident Scenarios for On-Demand and Autonomous Simulation
 */
export const ACCIDENT_CATALOG: AccidentScenarioItem[] = [
  {
    id: 'ACC-EQ-01',
    title: 'Multi-Story Reinforced Concrete Slab Collapse',
    type: 'STRUCTURAL_COLLAPSE',
    severity: 'CRITICAL',
    description: 'Multi-story collapsed building. 2 adult casualties trapped in sub-surface cavity void under slab #4. Acoustic cries detected.',
    expectedCasualties: 2,
    recommendedAction: 'Deploy USAR Heavy Rescue Unit with pneumatic lifting bags & hydraulic spreaders. Gas line shutoff verified.',
    targetVisual: 0.84,
    targetThermal: 0.96,
    targetAcoustic: 0.88,
    targetLidar: 0.92,
  },
  {
    id: 'ACC-EQ-02',
    title: 'Transit Overpass Sheared Girder onto Van',
    type: 'VEHICLE_CRUSH',
    severity: 'HIGH',
    description: 'Concrete bridge girder sheared onto transit vehicle. Driver conscious and trapped behind steering column.',
    expectedCasualties: 1,
    recommendedAction: 'Deploy mobile crane truck and stabilization jacks. Maintain drone thermal surveillance on vehicle battery/fuel leak.',
    targetVisual: 0.82,
    targetThermal: 0.88,
    targetAcoustic: 0.74,
    targetLidar: 0.86,
  },
  {
    id: 'ACC-EQ-03',
    title: 'Flooded Commercial Basement Cavity Cave-In',
    type: 'VOID_ENTRAPMENT',
    severity: 'HIGH',
    description: 'Subterranean parking security booth collapsed under water pipe breach. Faint metallic wrench distress tapping.',
    expectedCasualties: 1,
    recommendedAction: 'Dispatch submersible dewatering pump and tactical extraction hoist team.',
    targetVisual: 0.68,
    targetThermal: 0.86,
    targetAcoustic: 0.82,
    targetLidar: 0.80,
  },
  {
    id: 'ACC-FF-01',
    title: 'Submerged Passenger Van Stranded in Current Surge',
    type: 'VEHICLE_SUBMERSION',
    severity: 'CRITICAL',
    description: 'Passenger van swept by 2.4 m/s flood current onto barrier. 2 occupants signaling with emergency strobe light.',
    expectedCasualties: 2,
    recommendedAction: 'Vector NDRF Swiftwater Rescue Boat to riverbank grid. Drone deploy emergency life-preserver payload.',
    targetVisual: 0.78,
    targetThermal: 0.95,
    targetAcoustic: 0.90,
    targetLidar: 0.84,
  },
  {
    id: 'ACC-CH-01',
    title: 'High-Pressure Ethylene Manifold BLEVE Blast',
    type: 'CHEMICAL_EXPLOSION',
    severity: 'CRITICAL',
    description: 'Catastrophic rupture of pressure manifold. Severe thermal burn casualty with volatile plume downwind.',
    expectedCasualties: 1,
    recommendedAction: 'Level-A Hazmat extraction squad entry authorized with SCBA. Continuous VOC gas cloud tracking active.',
    targetVisual: 0.80,
    targetThermal: 0.97,
    targetAcoustic: 0.86,
    targetLidar: 0.90,
  },
  {
    id: 'ACC-CH-02',
    title: 'Chlorine Scrubber Tower Collapse & Catwalk Entrapment',
    type: 'TOXIC_BREACH',
    severity: 'HIGH',
    description: 'Steel scaffolding collapsed over toxic solvent line. 2 maintenance technicians signaling from elevated platform.',
    expectedCasualties: 2,
    recommendedAction: 'Establish 200m downwind safety perimeter. Tactical stretcher extraction via aerial ladder.',
    targetVisual: 0.83,
    targetThermal: 0.88,
    targetAcoustic: 0.76,
    targetLidar: 0.85,
  }
];

export const createScenarioHotspots = (scenarioId: DrillScenarioId): Hotspot[] => {
  switch (scenarioId) {
    case 'FLASH_FLOOD_NIGHT':
      return [
        {
          id: 'HOT-FF-01',
          latitude: 28.6155,
          longitude: 77.2112,
          title: 'Submerged Passenger Van Stranded in Surge',
          description: 'Passenger vehicle trapped in 2.2 m/s flood surge with active strobe signal.',
          accidentType: 'VEHICLE_SUBMERSION',
          victimCount: 2,
          targetVisual: 0.76,
          targetThermal: 0.95,
          targetAcoustic: 0.88,
          targetLidar: 0.82,
          recommendedAction: 'Deploy NDRF swiftwater rescue boat. Drone deploy life-preserver.',
          discovered: false,
        },
        {
          id: 'HOT-FF-02',
          latitude: 28.6138,
          longitude: 77.2085,
          title: 'Riverbank Embankment Washout Debris Entrapment',
          description: 'Driftwood logjam pinned against retaining culvert with vocal distress calls.',
          accidentType: 'DEBRIS_ENTRAPMENT',
          victimCount: 1,
          targetVisual: 0.70,
          targetThermal: 0.86,
          targetAcoustic: 0.80,
          targetLidar: 0.78,
          recommendedAction: 'Deploy levee winch line and thermal tracking.',
          discovered: false,
        },
        {
          id: 'HOT-FF-03',
          latitude: 28.6125,
          longitude: 77.2105,
          title: 'Commercial Basement Inundation Cavity',
          description: 'Underground security office submerged with metallic distress tapping.',
          accidentType: 'STRUCTURAL_INUNDATION',
          victimCount: 1,
          targetVisual: 0.65,
          targetThermal: 0.84,
          targetAcoustic: 0.78,
          targetLidar: 0.75,
          recommendedAction: 'Dispatch submersible dewatering pump.',
          discovered: false,
        },
      ];

    case 'CHEMICAL_EXPLOSION':
      return [
        {
          id: 'HOT-CH-01',
          latitude: 28.6132,
          longitude: 77.2098,
          title: 'Ethylene Manifold Blast & Burn Casualty',
          description: 'High-pressure pipe burst with intense heat contrast and unconscious worker.',
          accidentType: 'BLEVE_EXPLOSION',
          victimCount: 1,
          targetVisual: 0.80,
          targetThermal: 0.97,
          targetAcoustic: 0.86,
          targetLidar: 0.89,
          recommendedAction: 'Level-A Hazmat extraction team entry authorized.',
          discovered: false,
        },
        {
          id: 'HOT-CH-02',
          latitude: 28.6155,
          longitude: 77.2075,
          title: 'Chlorine Scrubber Tower Collapse',
          description: 'Catwalk collapse onto solvent line with 2 workers signaling.',
          accidentType: 'TOXIC_BREACH',
          victimCount: 2,
          targetVisual: 0.82,
          targetThermal: 0.88,
          targetAcoustic: 0.78,
          targetLidar: 0.84,
          recommendedAction: 'Establish 200m downwind perimeter and hoist evacuation.',
          discovered: false,
        },
        {
          id: 'HOT-CH-03',
          latitude: 28.6142,
          longitude: 77.2115,
          title: 'Chemical Trench Gas Pocket Enclosure',
          description: 'H2S gas accumulation in valve pit with maintenance technician trapped.',
          accidentType: 'CONFINED_SPACE_TOXIC',
          victimCount: 1,
          targetVisual: 0.68,
          targetThermal: 0.85,
          targetAcoustic: 0.80,
          targetLidar: 0.74,
          recommendedAction: 'Forced ventilation and toxic gas suction required.',
          discovered: false,
        },
      ];

    case 'EARTHQUAKE_RUBBLE':
    default:
      return [
        {
          id: 'HOT-EQ-01',
          latitude: 28.6152,
          longitude: 77.2096,
          title: 'Commercial Complex Structural Slab Collapse',
          description: 'Multi-story reinforced concrete slab collapse. 2 casualties trapped in cavity void.',
          accidentType: 'STRUCTURAL_COLLAPSE',
          victimCount: 2,
          targetVisual: 0.82,
          targetThermal: 0.96,
          targetAcoustic: 0.88,
          targetLidar: 0.91,
          recommendedAction: 'Dispatch USAR Heavy Rescue Unit with pneumatic lifting bags.',
          discovered: false,
        },
        {
          id: 'HOT-EQ-02',
          latitude: 28.6138,
          longitude: 77.2072,
          title: 'Transit Overpass Rupture onto Passenger Vehicle',
          description: 'Bridge girder sheared onto transit vehicle. Driver trapped behind steering column.',
          accidentType: 'VEHICLE_CRUSH',
          victimCount: 1,
          targetVisual: 0.81,
          targetThermal: 0.88,
          targetAcoustic: 0.75,
          targetLidar: 0.85,
          recommendedAction: 'Deploy mobile crane truck and stabilization jacks.',
          discovered: false,
        },
        {
          id: 'HOT-EQ-03',
          latitude: 28.6124,
          longitude: 77.2108,
          title: 'Collapsed Basement Cavity Inundation',
          description: 'Sub-surface basement void with metallic distress tapping and slow water accumulation.',
          accidentType: 'VOID_ENTRAPMENT',
          victimCount: 1,
          targetVisual: 0.69,
          targetThermal: 0.86,
          targetAcoustic: 0.82,
          targetLidar: 0.79,
          recommendedAction: 'Deploy submersible pump and tactical extraction hoist.',
          discovered: false,
        },
      ];
  }
};

export const createScenarioIncidents = (scenarioId: DrillScenarioId): Incident[] => {
  const now = Date.now();
  // Include one pre-existing resolved incident from earlier in the shift,
  // while all active disaster accidents are dynamically verified in real time!
  switch (scenarioId) {
    case 'FLASH_FLOOD_NIGHT':
      return [
        {
          incidentId: 'INC-200',
          title: 'Residential Rooftop Rescue Completed',
          accidentType: 'FLOOD_EVACUATION',
          victimCount: 3,
          timestamp: new Date(now - 45 * 60 * 1000).toISOString(),
          latitude: 28.6110,
          longitude: 77.2095,
          confidence: 0.92,
          status: 'RESOLVED',
          priority: 'HIGH',
          evidence: {
            visual: 0.88,
            thermal: 0.92,
            acoustic: 0.85,
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
          incidentId: 'INC-300',
          title: 'Loading Dock Perimeter Evacuation Completed',
          accidentType: 'HAZMAT_TRIAGE',
          victimCount: 4,
          timestamp: new Date(now - 50 * 60 * 1000).toISOString(),
          latitude: 28.6162,
          longitude: 77.2065,
          confidence: 0.89,
          status: 'RESOLVED',
          priority: 'MEDIUM',
          evidence: {
            visual: 0.86,
            thermal: 0.82,
            acoustic: 0.75,
            lidar: 0.68,
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
          incidentId: 'INC-100',
          title: 'Residential Arcade Surface Rescue Completed',
          accidentType: 'SURFACE_EXTRACTION',
          victimCount: 1,
          timestamp: new Date(now - 60 * 60 * 1000).toISOString(),
          latitude: 28.6115,
          longitude: 77.2078,
          confidence: 0.90,
          status: 'RESOLVED',
          priority: 'MEDIUM',
          evidence: {
            visual: 0.84,
            thermal: 0.81,
            acoustic: 0.77,
            lidar: 0.65,
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
  sensorStatus: SensorStatus;
  sensorEvidence: SensorEvidence;
  svlpEvaluation: SVLPEvaluation;
  incidents: Incident[];
  missionEvents: MissionEvent[];
  flightPath: [number, number][];
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
  cppStatus: CPPStatus;
  activeAccidentTarget: Hotspot | null;
}

type Subscriber = (state: SimulatorState) => void;

export class DroneSimulator {
  private svlpEngine: SVLPEngine;
  private state: SimulatorState;
  private subscribers: Set<Subscriber> = new Set();
  private timer: number | null = null;
  private autoDemoTimer: number | null = null;
  private tickIntervalMs: number = 1000;
  private incidentCounter: number = 101;
  private alertHoldTicks: number = 0;
  private savedCPPWaypointIndex: number = 0;

  constructor() {
    this.svlpEngine = new SVLPEngine(DEFAULT_SVLP_WEIGHTS, DEFAULT_SVLP_THRESHOLDS);
    
    const plannedWaypoints = generateCPPTracks(DEFAULT_SEARCH_SECTOR, 0.00065);
    const initialLat = plannedWaypoints[0][0];
    const initialLng = plannedWaypoints[0][1];

    this.state = {
      telemetry: {
        timestamp: new Date().toISOString(),
        droneId: 'REC-01',
        latitude: initialLat,
        longitude: initialLng,
        altitude: 35.0,
        speed: 7.5,
        battery: 92,
        batteryVoltage: 22.8,
        gpsStatus: 'LOCKED',
        connection: 'CONNECTED',
        heading: 90,
        pitch: 1.2,
        roll: -0.4,
        yaw: 89.8,
        satellites: 18,
        signalStrength: 98,
      },
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
        thermal: 0.16,
        acoustic: 0.08,
        lidar: 0.14,
        timestamp: new Date().toISOString(),
        visualObjectLabel: 'Clear terrain / rubble surface',
        visualConfidence: 0.12,
        thermalHotspotTemp: 19.2,
        thermalAmbientTemp: 18.5,
        acousticDecibels: 42,
        acousticFrequency: 140,
        lidarDepthM: 35.0,
        lidarVoidVolumeM3: 0.0,
        lidarStructuralIntegrity: 'CLEAR / NO VOID',
      },
      svlpEvaluation: {
        state: 'SEARCH',
        confidence: 0.12,
        recommendedAction: 'Maintain primary CPP coverage sweep. Multi-sensor survey active.',
        stateReason: 'Executing autonomous Boustrophedon Coverage Path Planning (CPP).',
      },
      incidents: createScenarioIncidents('EARTHQUAKE_RUBBLE'),
      missionEvents: [
        {
          id: 'EVT-001',
          timestamp: new Date().toISOString(),
          type: 'INFO',
          title: 'REC Mission Initialized',
          details: 'Disaster Sector Alpha loaded. Yellow Tactical UAV REC-01 launched.',
        },
        {
          id: 'EVT-002',
          timestamp: new Date().toISOString(),
          type: 'SUCCESS',
          title: 'CPP Algorithm Engaged',
          details: `Boustrophedon Coverage Path Planning active with ${plannedWaypoints.length / 2} parallel sweep legs.`,
        },
      ],
      flightPath: [[initialLat, initialLng]],
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
      cppStatus: {
        algorithm: 'Boustrophedon CPP',
        currentLeg: 1,
        totalLegs: Math.ceil(plannedWaypoints.length / 2),
        swathWidthMeters: 65,
        plannedWaypoints,
        activeWaypointIndex: 0,
        coveragePercent: 5,
        isDeviatedForInvestigation: false,
      },
      activeAccidentTarget: null,
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

  public setScenario(scenarioId: DrillScenarioId): void {
    this.state.activeScenario = scenarioId;
    const scenario = DRILL_SCENARIOS[scenarioId];

    if (scenarioId === 'FLASH_FLOOD_NIGHT') {
      this.state.searchSector.name = 'Sector Beta — Riverbank Inundation';
      this.state.sensorEvidence.thermalAmbientTemp = 14.0;
      this.incidentCounter = 201;
    } else if (scenarioId === 'CHEMICAL_EXPLOSION') {
      this.state.searchSector.name = 'Sector Gamma — Industrial Complex Perimeter';
      this.state.sensorEvidence.thermalAmbientTemp = 22.0;
      this.incidentCounter = 301;
    } else {
      this.state.searchSector.name = DEFAULT_SEARCH_SECTOR.name;
      this.state.sensorEvidence.thermalAmbientTemp = 18.5;
      this.incidentCounter = 101;
    }

    // Regenerate CPP Tracks for the active sector
    const newCPPWaypoints = generateCPPTracks(this.state.searchSector, 0.00065);
    this.state.cppStatus = {
      algorithm: 'Boustrophedon CPP',
      currentLeg: 1,
      totalLegs: Math.ceil(newCPPWaypoints.length / 2),
      swathWidthMeters: 65,
      plannedWaypoints: newCPPWaypoints,
      activeWaypointIndex: 0,
      coveragePercent: 5,
      isDeviatedForInvestigation: false,
    };

    this.state.incidents = createScenarioIncidents(scenarioId);
    this.state.hotspots = createScenarioHotspots(scenarioId);
    this.state.activeAccidentTarget = null;
    this.svlpEngine.reset();

    // Position drone at first CPP waypoint
    this.state.telemetry.latitude = newCPPWaypoints[0][0];
    this.state.telemetry.longitude = newCPPWaypoints[0][1];
    this.state.flightPath = [[newCPPWaypoints[0][0], newCPPWaypoints[0][1]]];

    this.addEvent({
      id: `EVT-SCENARIO-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'WARNING',
      title: `Disaster Scenario Loaded: ${scenario.title}`,
      details: `${scenario.description} Generated ${this.state.cppStatus.totalLegs} CPP survey swaths. ${this.state.hotspots.length} accident zones active in sector.`,
    });

    this.notify();
  }

  public runAutoDemo(): void {
    if (this.state.isAutoDemoRunning) return;
    this.state.isAutoDemoRunning = true;

    // 1. Resume simulation and set speed to 2x
    this.resume();
    this.setSpeed(2);

    // 2. Trigger accident immediately forward along flight path
    this.simulateAccident();

    this.addEvent({
      id: `EVT-DEMO-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'INFO',
      title: 'JUDGE AUTO-DEMO ENGAGED',
      details: 'Demonstrating full REC-SVLP multi-sensor survivor verification cycle & autonomous CPP resumption.',
    });

    if (this.autoDemoTimer) clearTimeout(this.autoDemoTimer);

    // Conclude demonstration mode after 20 seconds
    this.autoDemoTimer = window.setTimeout(() => {
      this.state.isAutoDemoRunning = false;
      this.setSpeed(1);
      this.notify();
    }, 20000);

    this.notify();
  }

  public setMissionMode(mode: MissionMode): void {
    this.state.missionMode = mode;
    
    let details = `Flight mode set to ${mode.replace(/_/g, ' ')}.`;
    if (mode === 'RETURN_TO_HOME') {
      details = 'Return-to-Home engaged. Drone vectoring to base waypoint at 40m altitude.';
      this.state.telemetry.altitude = 40.0;
      this.state.telemetry.speed = 8.5;
    } else if (mode === 'VERIFICATION_HOLD') {
      details = 'Stationary precision hover engaged at 12m. Directional sensors locked.';
      this.state.telemetry.altitude = 12.0;
      this.state.telemetry.speed = 0.2;
    } else if (mode === 'MANUAL_INVESTIGATION') {
      details = 'Manual investigation mode active. Cruise speed reduced to 3.8 m/s.';
      this.state.telemetry.altitude = 18.0;
      this.state.telemetry.speed = 3.8;
    } else if (mode === 'AUTONOMOUS_SEARCH') {
      details = 'Autonomous Boustrophedon CPP coverage resumed at 35m cruise altitude.';
      this.state.telemetry.altitude = 35.0;
      this.state.telemetry.speed = 7.5;
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
    this.svlpEngine.reset();
    
    const plannedWaypoints = generateCPPTracks(this.state.searchSector, 0.00065);
    const initialLat = plannedWaypoints[0][0];
    const initialLng = plannedWaypoints[0][1];

    this.state.telemetry.latitude = initialLat;
    this.state.telemetry.longitude = initialLng;
    this.state.telemetry.altitude = 35.0;
    this.state.telemetry.speed = 7.5;
    this.state.telemetry.battery = 95;
    this.state.flightPath = [[initialLat, initialLng]];
    this.state.incidents = createScenarioIncidents(this.state.activeScenario);
    this.state.hotspots = createScenarioHotspots(this.state.activeScenario);
    this.state.activeAccidentTarget = null;
    this.state.searchSector.areaCoveredPercent = 5;
    this.state.missionTimeSeconds = 0;
    this.state.missionStatus = 'ACTIVE';
    this.state.missionMode = 'AUTONOMOUS_SEARCH';
    this.state.isPaused = false;
    this.state.isAutoDemoRunning = false;
    this.state.cppStatus = {
      algorithm: 'Boustrophedon CPP',
      currentLeg: 1,
      totalLegs: Math.ceil(plannedWaypoints.length / 2),
      swathWidthMeters: 65,
      plannedWaypoints,
      activeWaypointIndex: 0,
      coveragePercent: 5,
      isDeviatedForInvestigation: false,
    };
    
    this.state.missionEvents = [
      {
        id: 'EVT-RST',
        timestamp: new Date().toISOString(),
        type: 'INFO',
        title: 'Mission Reset',
        details: 'REC Command Center reset. Planned CPP grid reloaded with clean survey tracks.',
      },
    ];

    this.start();
    this.notify();
  }

  /**
   * Accident Simulation Trigger:
   * Places an accident forward of the drone along its patrol corridor or at a selected location,
   * prompting the REC-SVLP engine to execute SEARCH -> SUSPICION -> INVESTIGATION -> VERIFICATION -> ALERT.
   */
  public simulateAccident(accidentOption?: AccidentScenarioItem | string): void {
    const curLat = this.state.telemetry.latitude;
    const curLng = this.state.telemetry.longitude;
    
    // Position accident ~40-60m forward along current heading
    const headingRad = (this.state.telemetry.heading * Math.PI) / 180;
    const forwardLat = parseFloat((curLat + Math.cos(headingRad) * 0.00045).toFixed(5));
    const forwardLng = parseFloat((curLng + Math.sin(headingRad) * 0.00045).toFixed(5));

    let chosenAccident: AccidentScenarioItem;

    if (typeof accidentOption === 'object' && accidentOption !== null) {
      chosenAccident = accidentOption;
    } else if (typeof accidentOption === 'string') {
      const match = ACCIDENT_CATALOG.find(a => a.id === accidentOption || a.title.toLowerCase().includes(accidentOption.toLowerCase()));
      chosenAccident = match || ACCIDENT_CATALOG[0];
    } else {
      // Pick based on active scenario
      if (this.state.activeScenario === 'FLASH_FLOOD_NIGHT') {
        chosenAccident = ACCIDENT_CATALOG.find(a => a.type.includes('SUBMERSION') || a.type.includes('FLOOD')) || ACCIDENT_CATALOG[3];
      } else if (this.state.activeScenario === 'CHEMICAL_EXPLOSION') {
        chosenAccident = ACCIDENT_CATALOG.find(a => a.type.includes('CHEMICAL')) || ACCIDENT_CATALOG[4];
      } else {
        chosenAccident = ACCIDENT_CATALOG[0];
      }
    }

    const simHotspotId = `SIM-${Date.now().toString().slice(-4)}`;

    const newHotspot: Hotspot = {
      id: simHotspotId,
      latitude: forwardLat,
      longitude: forwardLng,
      title: chosenAccident.title,
      description: chosenAccident.description,
      accidentType: chosenAccident.type,
      victimCount: chosenAccident.expectedCasualties,
      targetVisual: chosenAccident.targetVisual,
      targetThermal: chosenAccident.targetThermal,
      targetAcoustic: chosenAccident.targetAcoustic,
      targetLidar: chosenAccident.targetLidar,
      recommendedAction: chosenAccident.recommendedAction,
      discovered: false,
      isSimulated: true,
    };

    // Insert at front of active hotspots
    this.state.hotspots.unshift(newHotspot);

    this.addEvent({
      id: `EVT-ACCIDENT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'ALERT',
      title: `🚨 ACCIDENT SIMULATED: ${chosenAccident.title}`,
      details: `${chosenAccident.description} Coordinates [${forwardLat.toFixed(4)}, ${forwardLng.toFixed(4)}]. Drone intercepting via REC-SVLP flow.`,
      relatedCoordinates: { latitude: forwardLat, longitude: forwardLng },
    });

    this.notify();
  }

  // Backwards compatibility alias for injectAnomaly
  public injectAnomaly(accidentTitle?: string): void {
    this.simulateAccident(accidentTitle);
  }

  public exportSITREP(): string {
    const activeIncidents = this.state.incidents.filter(i => i.status !== 'RESOLVED');
    const resolvedIncidents = this.state.incidents.filter(i => i.status === 'RESOLVED');
    
    const sitrep = `# REC TACTICAL SITUATION REPORT (SITREP)
**GENERATED:** ${new Date().toISOString()}
**CALLSIGN:** REC-01 TACTICAL GCS (SINGLE UAV SURVEY)
**ALGORITHM:** Boustrophedon Coverage Path Planning (CPP)
**OPERATION:** ${this.state.searchSector.name}
**SCENARIO:** ${DRILL_SCENARIOS[this.state.activeScenario].title}

---

## 1. EXECUTIVE SUMMARY
- **Mission Elapsed Time:** ${Math.floor(this.state.missionTimeSeconds / 60)}m ${this.state.missionTimeSeconds % 60}s
- **CPP Grid Progress:** Swath ${this.state.cppStatus.currentLeg} of ${this.state.cppStatus.totalLegs} (${this.state.cppStatus.coveragePercent}% Sector Coverage)
- **Active Crisis Incidents Pending Rescue:** ${activeIncidents.length}
- **Rescued / Evacuated Casualties:** ${resolvedIncidents.length}
- **UAV Telemetry:** ${this.state.telemetry.battery}% Battery | SATCOM ${this.state.telemetry.connection} | ${this.state.telemetry.satellites} Satellites locked

---

## 2. VERIFIED INCIDENT MANIFEST
${this.state.incidents.map((inc, i) => `
### [${i + 1}] ${inc.incidentId} — ${inc.title}
- **Status / Priority:** ${inc.status} • ${inc.priority} (${inc.accidentType})
- **Casualties:** ${inc.victimCount || 1}
- **Coordinates:** ${inc.latitude.toFixed(5)}°N, ${inc.longitude.toFixed(5)}°E
- **REC-SVLP Confidence:** ${Math.round(inc.confidence * 100)}%
- **Sensor Evidence:** Visual: ${Math.round(inc.evidence.visual * 100)}% | Thermal: ${Math.round(inc.evidence.thermal * 100)}% | Acoustic: ${Math.round(inc.evidence.acoustic * 100)}% | LiDAR: ${inc.evidence.lidar ? Math.round(inc.evidence.lidar * 100) + '%' : 'N/A'}
- **Extraction Directive:** ${inc.recommendedAction}
`).join('\n')}

---

## 3. ACTIVE HAZARD EXCLUSION ZONES
${this.state.hazardZones.map(hz => `- **${hz.name}** [${hz.severity}]: ${hz.description}`).join('\n')}

---
*Certified by REC-SVLP Autonomous Multi-Spectral Fusion Protocol*
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

  /**
   * Main Simulation Engine Tick (runs every second / adjusted by speed multiplier)
   */
  private tick(): void {
    if (this.state.isPaused) return;

    this.state.missionTimeSeconds += 1;

    // 1. Find nearest undiscovered accident hotspot
    let nearestHotspot: Hotspot | null = null;
    let minDistance = Infinity;

    const activeHotspots = this.state.hotspots.filter((h) => !h.discovered);

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

    this.state.activeAccidentTarget = nearestHotspot;
    const inSensorRange = minDistance < 0.0014; // within ~140 meters sensor perimeter

    // 2. Synthesize multi-spectral sensor readings based on distance
    const baseVisual = 0.10 + Math.random() * 0.08;
    const baseThermal = 0.14 + Math.random() * 0.06;
    const baseAcoustic = 0.06 + Math.random() * 0.08;
    const baseLidar = 0.12 + Math.random() * 0.08;

    let targetVisual = baseVisual;
    let targetThermal = baseThermal;
    let targetAcoustic = baseAcoustic;
    let targetLidar = baseLidar;
    let hotspotTemp = 19.5 + (Math.random() * 0.6 - 0.3);
    let acousticDb = 42 + Math.floor(Math.random() * 4);
    let acousticFreq = 120 + Math.floor(Math.random() * 20);
    let objectLabel = 'Clear terrain / rubble surface';
    let lidarDepth = this.state.telemetry.altitude;
    let lidarVoidVolume = 0.0;
    let structuralStatus = 'CLEAR / NO VOID';

    if (inSensorRange && nearestHotspot) {
      const proximity = Math.max(0, 1 - (minDistance / 0.0014));
      targetVisual = baseVisual + (nearestHotspot.targetVisual - baseVisual) * proximity;
      targetThermal = baseThermal + (nearestHotspot.targetThermal - baseThermal) * proximity;
      targetAcoustic = baseAcoustic + (nearestHotspot.targetAcoustic - baseAcoustic) * proximity;
      targetLidar = baseLidar + ((nearestHotspot.targetLidar || 0.85) - baseLidar) * proximity;
      
      hotspotTemp = 20.0 + (37.5 - 20.0) * proximity;
      acousticDb = Math.round(45 + (82 - 45) * proximity);
      acousticFreq = Math.round(150 + (840 - 150) * proximity);
      lidarDepth = parseFloat((this.state.telemetry.altitude - proximity * 14).toFixed(1));
      lidarVoidVolume = parseFloat((proximity * 5.4).toFixed(1));

      if (proximity > 0.6) {
        objectLabel = `Biometric Heat Spike / ${nearestHotspot.title}`;
        structuralStatus = `CRITICAL ACCIDENT CAVITY (${lidarVoidVolume}m³ VOID DETECTED)`;
      } else if (proximity > 0.25) {
        objectLabel = 'Elevated heat anomaly / possible silhouette';
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

    // 3. Evaluate multi-sensor signals through REC-SVLP Engine
    const prevSVLPState = this.state.svlpEvaluation.state;
    const svlpEval = this.svlpEngine.evaluate(
      this.state.sensorEvidence,
      {
        latitude: this.state.telemetry.latitude,
        longitude: this.state.telemetry.longitude,
      }
    );
    this.state.svlpEvaluation = svlpEval;

    // Check for State Transition in REC Flow
    if (svlpEval.state !== prevSVLPState) {
      this.handleStateTransition(prevSVLPState, svlpEval.state, svlpEval, nearestHotspot);
    }

    // 4. Update Drone Dynamics & Navigation following REC Flow & CPP
    switch (svlpEval.state) {
      case 'SEARCH':
        this.state.missionMode = 'AUTONOMOUS_SEARCH';
        this.state.telemetry.altitude = 35.0 + Math.sin(this.state.missionTimeSeconds * 0.1) * 0.4;
        this.state.telemetry.speed = 7.5;
        this.state.cppStatus.isDeviatedForInvestigation = false;
        this.advanceCPPGrid();
        break;

      case 'SUSPICION':
        this.state.missionMode = 'MANUAL_INVESTIGATION';
        this.state.telemetry.altitude = 28.0;
        this.state.telemetry.speed = 5.2;
        if (nearestHotspot) {
          this.steerToward(nearestHotspot.latitude, nearestHotspot.longitude, 0.00018);
        } else {
          this.advanceCPPGrid();
        }
        break;

      case 'INVESTIGATION':
        this.state.missionMode = 'MANUAL_INVESTIGATION';
        this.state.telemetry.altitude = 18.0;
        this.state.telemetry.speed = 3.8;
        this.state.cppStatus.isDeviatedForInvestigation = true;
        if (nearestHotspot) {
          // Investigative low-altitude orbit around accident site (~25m radius)
          const angle = this.state.missionTimeSeconds * 0.28;
          const targetLat = nearestHotspot.latitude + Math.sin(angle) * 0.00025;
          const targetLng = nearestHotspot.longitude + Math.cos(angle) * 0.0003;
          this.steerToward(targetLat, targetLng, 0.00018);
        } else {
          this.advanceCPPGrid();
        }
        break;

      case 'VERIFICATION':
        this.state.missionMode = 'VERIFICATION_HOLD';
        this.state.telemetry.altitude = 12.0;
        this.state.telemetry.speed = 2.0;
        this.state.cppStatus.isDeviatedForInvestigation = true;
        if (nearestHotspot) {
          this.steerToward(nearestHotspot.latitude, nearestHotspot.longitude, 0.00012);
        } else {
          this.advanceCPPGrid();
        }
        break;

      case 'ALERT':
        this.state.missionMode = 'VERIFICATION_HOLD';
        this.state.telemetry.altitude = 12.0 + Math.sin(this.state.missionTimeSeconds * 0.2) * 0.2;
        this.state.telemetry.speed = 2.8;
        this.state.cppStatus.isDeviatedForInvestigation = true;

        if (nearestHotspot) {
          // Tight precision orbit over confirmed casualty location
          const loiterAngle = this.state.missionTimeSeconds * 0.35;
          const loiterLat = nearestHotspot.latitude + Math.sin(loiterAngle) * 0.00020;
          const loiterLng = nearestHotspot.longitude + Math.cos(loiterAngle) * 0.00025;
          this.steerToward(loiterLat, loiterLng, 0.00015);

          this.alertHoldTicks++;
          if (this.alertHoldTicks > 10) {
            // Target locked & verified. Mark discovered, then resume CPP grid
            nearestHotspot.discovered = true;
            this.alertHoldTicks = 0;
            this.state.cppStatus.isDeviatedForInvestigation = false;
            
            this.addEvent({
              id: `EVT-RELAY-${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'SUCCESS',
              title: `Extraction Relay Established • ${nearestHotspot.title}`,
              details: `Incident coordinates broadcast. Yellow UAV REC-01 climbing to 35m to resume Boustrophedon CPP grid.`,
            });

            // Resume CPP grid from saved waypoint
            this.state.cppStatus.activeWaypointIndex = this.savedCPPWaypointIndex;
          }
        } else {
          this.advanceCPPGrid();
        }
        break;

      case 'RETURN':
        this.state.missionMode = 'RETURN_TO_HOME';
        this.state.telemetry.speed = 8.5;
        this.state.telemetry.altitude = 40.0;
        const homeTarget = this.state.cppStatus.plannedWaypoints[0];
        this.steerToward(homeTarget[0], homeTarget[1], 0.0003);
        break;
    }

    // 5. Battery & Telemetry micro-updates
    if (this.state.missionTimeSeconds % 8 === 0 && this.state.telemetry.battery > 5) {
      this.state.telemetry.battery -= 1;
      this.state.telemetry.batteryVoltage = parseFloat((20.0 + (this.state.telemetry.battery / 100) * 4.2).toFixed(1));
    }

    // Update CPP coverage percentage
    const totalWaypoints = this.state.cppStatus.plannedWaypoints.length;
    const progressPct = Math.min(100, Math.round(((this.state.cppStatus.activeWaypointIndex + 1) / totalWaypoints) * 100));
    this.state.cppStatus.coveragePercent = Math.max(this.state.cppStatus.coveragePercent, progressPct);
    this.state.searchSector.areaCoveredPercent = this.state.cppStatus.coveragePercent;

    // Append to live flight path breadcrumb trail
    this.state.flightPath.push([this.state.telemetry.latitude, this.state.telemetry.longitude]);
    if (this.state.flightPath.length > 300) {
      this.state.flightPath.shift();
    }

    this.state.telemetry.timestamp = new Date().toISOString();
    this.notify();
  }

  private handleStateTransition(
    oldState: SVLPState, 
    newState: SVLPState, 
    evaluation: SVLPEvaluation,
    targetHotspot: Hotspot | null
  ): void {
    let eventType: MissionEvent['type'] = 'INFO';
    let title = `REC-SVLP: ${oldState} → ${newState}`;

    if (newState === 'SUSPICION') {
      eventType = 'WARNING';
      title = 'SVLP: Pre-Alert Anomaly Detected';
      // Save current CPP waypoint index to return to after investigation
      this.savedCPPWaypointIndex = this.state.cppStatus.activeWaypointIndex;
    } else if (newState === 'INVESTIGATION') {
      eventType = 'WARNING';
      title = 'SVLP: Low-Altitude Investigation Commenced';
    } else if (newState === 'VERIFICATION') {
      eventType = 'WARNING';
      title = 'SVLP: Precision Hover & Multi-Sensor Fusion';
    } else if (newState === 'ALERT') {
      eventType = 'ALERT';
      title = '🚨 CRITICAL SURVIVOR ALERT CONFIRMED';
      this.createIncidentFromAlert(evaluation, targetHotspot);
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

  private createIncidentFromAlert(evaluation: SVLPEvaluation, targetHotspot: Hotspot | null): void {
    const lat = parseFloat(this.state.telemetry.latitude.toFixed(5));
    const lng = parseFloat(this.state.telemetry.longitude.toFixed(5));
    const incidentId = `INC-${String(this.incidentCounter++).padStart(3, '0')}`;

    const title = targetHotspot?.title || 'Emergency Structural Cavity Casualty';
    const accidentType = targetHotspot?.accidentType || 'STRUCTURAL_COLLAPSE';
    const victimCount = targetHotspot?.victimCount || 1;
    const action = targetHotspot?.recommendedAction || evaluation.recommendedAction;
    const notes = targetHotspot?.description || `Thermal hotspot (${this.state.sensorEvidence.thermalHotspotTemp}°C), LiDAR void (${this.state.sensorEvidence.lidarVoidVolumeM3}m³), acoustic frequency (${this.state.sensorEvidence.acousticFrequency}Hz).`;

    const newIncident: Incident = {
      incidentId,
      title,
      accidentType,
      victimCount,
      timestamp: new Date().toISOString(),
      latitude: lat,
      longitude: lng,
      confidence: evaluation.confidence,
      status: 'HIGH_PRIORITY',
      priority: evaluation.confidence > 0.85 ? 'CRITICAL' : 'HIGH',
      evidence: {
        visual: this.state.sensorEvidence.visual,
        thermal: this.state.sensorEvidence.thermal,
        acoustic: this.state.sensorEvidence.acoustic,
        lidar: this.state.sensorEvidence.lidar,
      },
      recommendedAction: action,
      notes,
      acknowledged: false,
    };

    // Avoid duplicates within 35 meters
    const alreadyExists = this.state.incidents.some(
      (inc) => Math.hypot(inc.latitude - lat, inc.longitude - lng) < 0.00035
    );

    if (!alreadyExists) {
      this.state.incidents.unshift(newIncident);
    }
  }

  /**
   * Advances waypoint along the planned Coverage Path Planning (CPP) tracks
   */
  private advanceCPPGrid(): void {
    const waypoints = this.state.cppStatus.plannedWaypoints;
    if (!waypoints || waypoints.length === 0) return;

    const target = waypoints[this.state.cppStatus.activeWaypointIndex];
    const dLat = target[0] - this.state.telemetry.latitude;
    const dLng = target[1] - this.state.telemetry.longitude;
    const dist = Math.hypot(dLat, dLng);

    // If reached waypoint (< 35m)
    if (dist < 0.00035) {
      this.state.cppStatus.activeWaypointIndex = (this.state.cppStatus.activeWaypointIndex + 1) % waypoints.length;
      this.state.cppStatus.currentLeg = Math.floor(this.state.cppStatus.activeWaypointIndex / 2) + 1;
    } else {
      this.steerToward(target[0], target[1], 0.00022);
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
        details: `Field extraction squad dispatched to coordinates [${inc.latitude.toFixed(4)}, ${inc.longitude.toFixed(4)}].`,
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
        details: `Casualty evacuated and safely transferred to medical transport.`,
      });
      this.notify();
    }
  }
}

// Export singleton instance
export const droneSimulator = new DroneSimulator();
