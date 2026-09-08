import { Incident } from '../types/incident';
import { MissionEvent, MissionMode, MissionStatus, SearchSector } from '../types/mission';
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
  discovered: boolean;
}

const PRESET_HOTSPOTS: Hotspot[] = [
  {
    id: 'HOT-01',
    latitude: 28.6148,
    longitude: 77.2092,
    description: 'Collapsed structure with trapped individual beneath rubble',
    targetVisual: 0.74,
    targetThermal: 0.92,
    targetAcoustic: 0.84,
    discovered: false,
  },
  {
    id: 'HOT-02',
    latitude: 28.6125,
    longitude: 77.2105,
    description: 'Partially submerged basement cavity with faint distress tap',
    targetVisual: 0.62,
    targetThermal: 0.85,
    targetAcoustic: 0.78,
    discovered: false,
  },
];

export interface SimulatorState {
  telemetry: Telemetry;
  sensorStatus: SensorStatus;
  sensorEvidence: SensorEvidence;
  svlpEvaluation: SVLPEvaluation;
  incidents: Incident[];
  missionEvents: MissionEvent[];
  flightPath: [number, number][];
  searchSector: SearchSector;
  missionStatus: MissionStatus;
  missionMode: MissionMode;
  missionTimeSeconds: number;
  hotspots: Hotspot[];
  simulationSpeed: number;
  isPaused: boolean;
}

type Subscriber = (state: SimulatorState) => void;

export class DroneSimulator {
  private svlpEngine: SVLPEngine;
  private state: SimulatorState;
  private subscribers: Set<Subscriber> = new Set();
  private timer: number | null = null;
  private currentWaypointIndex: number = 0;
  private tickIntervalMs: number = 1000;
  private incidentCounter: number = 1;

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
      sensorStatus: {
        rgbCamera: 'ACTIVE',
        thermalSensor: 'ACTIVE',
        acousticSensor: 'ACTIVE',
        gps: 'ACTIVE',
        imu: 'ACTIVE',
      },
      sensorEvidence: {
        visual: 0.12,
        thermal: 0.18,
        acoustic: 0.08,
        timestamp: new Date().toISOString(),
        visualObjectLabel: 'Clear terrain / rubble debris',
        visualConfidence: 0.12,
        thermalHotspotTemp: 19.4,
        thermalAmbientTemp: 18.2,
        acousticDecibels: 42,
        acousticFrequency: 140,
      },
      svlpEvaluation: {
        state: 'SEARCH',
        confidence: 0.13,
        recommendedAction: 'Maintain primary search pattern. Multi-sensor background scanning active.',
        stateReason: 'Normal survey grid scan in progress.',
      },
      incidents: [],
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
          title: 'Sensors Calibrated',
          details: 'RGB, FLIR Thermal LWIR, and MEMS Acoustic array operational.',
        },
      ],
      flightPath: [[initialLat, initialLng]],
      searchSector: { ...DEFAULT_SEARCH_SECTOR },
      missionStatus: 'ACTIVE',
      missionMode: 'AUTONOMOUS_SEARCH',
      missionTimeSeconds: 0,
      hotspots: JSON.parse(JSON.stringify(PRESET_HOTSPOTS)),
      simulationSpeed: 1,
      isPaused: false,
    };
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

  public setMissionMode(mode: MissionMode): void {
    this.state.missionMode = mode;
    
    let details = `Flight mode manually updated to ${mode.replace('_', ' ')}.`;
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
      title: `Flight Mode: ${mode.replace('_', ' ')}`,
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
    this.state.incidents = [];
    this.state.missionEvents = [
      {
        id: 'EVT-RST',
        timestamp: new Date().toISOString(),
        type: 'INFO',
        title: 'Mission Reset',
        details: 'REC Command Center reset to initial survey point.',
      },
    ];
    this.state.hotspots = JSON.parse(JSON.stringify(PRESET_HOTSPOTS));
    this.state.searchSector.areaCoveredPercent = 5;
    this.state.missionTimeSeconds = 0;
    this.state.missionStatus = 'ACTIVE';
    this.state.missionMode = 'AUTONOMOUS_SEARCH';
    this.state.isPaused = false;
    
    this.start();
    this.notify();
  }

  public injectAnomaly(): void {
    // Manually force an anomaly right in front of the drone for instant demonstration
    const curLat = this.state.telemetry.latitude;
    const curLng = this.state.telemetry.longitude;
    
    const manualHotspot: Hotspot = {
      id: `HOT-MANUAL-${Date.now()}`,
      latitude: curLat + 0.0003,
      longitude: curLng + 0.0004,
      description: 'Operator simulated survivor signature for REC-SVLP drill',
      targetVisual: 0.81,
      targetThermal: 0.93,
      targetAcoustic: 0.86,
      discovered: false,
    };

    this.state.hotspots.unshift(manualHotspot);

    this.addEvent({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'WARNING',
      title: 'Manual Anomaly Injected',
      details: 'Target anomaly placed at immediate forward vector for verification demonstration.',
      relatedCoordinates: { latitude: manualHotspot.latitude, longitude: manualHotspot.longitude },
    });

    this.notify();
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
    if (this.state.missionEvents.length > 50) {
      this.state.missionEvents.pop();
    }
  }

  private tick(): void {
    if (this.state.isPaused) return;

    this.state.missionTimeSeconds += 1;

    // 1. Check distance to nearest active hotspot
    let nearestHotspot: Hotspot | null = null;
    let minDistance = Infinity;

    for (const h of this.state.hotspots) {
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

    let targetVisual = baseVisual;
    let targetThermal = baseThermal;
    let targetAcoustic = baseAcoustic;
    let hotspotTemp = 19.5 + (Math.random() * 0.6 - 0.3);
    let acousticDb = 42 + Math.floor(Math.random() * 4);
    let acousticFreq = 120 + Math.floor(Math.random() * 20);
    let objectLabel = 'Clear terrain / rubble';

    if (inHotspotZone && nearestHotspot) {
      const proximity = Math.max(0, 1 - (minDistance / 0.0012));
      targetVisual = baseVisual + (nearestHotspot.targetVisual - baseVisual) * proximity;
      targetThermal = baseThermal + (nearestHotspot.targetThermal - baseThermal) * proximity;
      targetAcoustic = baseAcoustic + (nearestHotspot.targetAcoustic - baseAcoustic) * proximity;
      
      hotspotTemp = 20.0 + (37.2 - 20.0) * proximity;
      acousticDb = Math.round(45 + (78 - 45) * proximity);
      acousticFreq = Math.round(150 + (840 - 150) * proximity);

      if (proximity > 0.6) {
        objectLabel = 'Biometric warmth detected / human posture match';
      } else if (proximity > 0.3) {
        objectLabel = 'Possible heat anomaly / partial silhouette';
      }
    }

    this.state.sensorEvidence = {
      visual: parseFloat(targetVisual.toFixed(3)),
      thermal: parseFloat(targetThermal.toFixed(3)),
      acoustic: parseFloat(targetAcoustic.toFixed(3)),
      timestamp: new Date().toISOString(),
      visualObjectLabel: objectLabel,
      visualConfidence: parseFloat(targetVisual.toFixed(2)),
      thermalHotspotTemp: parseFloat(hotspotTemp.toFixed(1)),
      thermalAmbientTemp: 18.5,
      acousticDecibels: acousticDb,
      acousticFrequency: acousticFreq,
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
        this.state.telemetry.altitude = 35.0 + Math.sin(this.state.missionTimeSeconds * 0.1) * 0.4;
        this.state.telemetry.speed = 7.4;
        this.advanceWaypointLawnmower();
        break;

      case 'SUSPICION':
        this.state.missionMode = 'MANUAL_INVESTIGATION';
        this.state.telemetry.altitude = 28.0;
        this.state.telemetry.speed = 4.2;
        // Bias movement gently toward the suspicious point
        if (nearestHotspot) {
          this.steerToward(nearestHotspot.latitude, nearestHotspot.longitude, 0.00015);
        } else {
          this.advanceWaypointLawnmower();
        }
        break;

      case 'INVESTIGATION':
        this.state.missionMode = 'MANUAL_INVESTIGATION';
        this.state.telemetry.altitude = 15.4;
        this.state.telemetry.speed = 2.4;
        // Circle around the hotspot
        if (nearestHotspot) {
          const angle = this.state.missionTimeSeconds * 0.2;
          const targetLat = nearestHotspot.latitude + Math.sin(angle) * 0.00025;
          const targetLng = nearestHotspot.longitude + Math.cos(angle) * 0.0003;
          this.steerToward(targetLat, targetLng, 0.0002);
        }
        break;

      case 'VERIFICATION':
        this.state.missionMode = 'VERIFICATION_HOLD';
        this.state.telemetry.altitude = 12.0;
        this.state.telemetry.speed = 0.4;
        if (nearestHotspot) {
          this.steerToward(nearestHotspot.latitude, nearestHotspot.longitude, 0.00008);
        }
        break;

      case 'ALERT':
        this.state.missionMode = 'VERIFICATION_HOLD';
        this.state.telemetry.altitude = 12.0;
        this.state.telemetry.speed = 0.1;
        break;

      case 'RETURN':
        this.state.missionMode = 'RETURN_TO_HOME';
        this.state.telemetry.speed = 8.5;
        this.state.telemetry.altitude = 40.0;
        this.steerToward(WAYPOINTS[0][0], WAYPOINTS[0][1], 0.0003);
        break;
    }

    // 5. Battery and Telemetry micro-updates
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

    // Append to flight path history (limit to last 200 points for smooth rendering)
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

    const newIncident: Incident = {
      incidentId,
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
      },
      recommendedAction: evaluation.recommendedAction,
      notes: `Corroborated by thermal hotspot (${this.state.sensorEvidence.thermalHotspotTemp}°C) and acoustic voice frequency (${this.state.sensorEvidence.acousticFrequency}Hz).`,
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
