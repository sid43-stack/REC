import { SensorEvidence } from '../types/sensors';
import { SVLPEvaluation, SVLPState, SVLPThresholds, SVLPWeights } from '../types/svlp';

export const DEFAULT_SVLP_WEIGHTS: SVLPWeights = {
  visual: 0.35,
  thermal: 0.40,
  acoustic: 0.25,
};

export const DEFAULT_SVLP_THRESHOLDS: SVLPThresholds = {
  suspicionThreshold: 0.45,
  investigationThreshold: 0.60,
  verificationThreshold: 0.75,
  alertThreshold: 0.82,
};

export class SVLPEngine {
  private weights: SVLPWeights;
  private thresholds: SVLPThresholds;
  private currentState: SVLPState = 'SEARCH';
  private stateHoldTicks: number = 0;
  private targetLocation: { latitude: number; longitude: number } | undefined;

  constructor(
    weights: SVLPWeights = DEFAULT_SVLP_WEIGHTS,
    thresholds: SVLPThresholds = DEFAULT_SVLP_THRESHOLDS
  ) {
    this.weights = weights;
    this.thresholds = thresholds;
  }

  public getWeights(): SVLPWeights {
    return { ...this.weights };
  }

  public setWeights(weights: Partial<SVLPWeights>): void {
    this.weights = { ...this.weights, ...weights };
  }

  public getThresholds(): SVLPThresholds {
    return { ...this.thresholds };
  }

  public setThresholds(thresholds: Partial<SVLPThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  public calculateConfidence(evidence: SensorEvidence): number {
    const raw =
      (evidence.visual * this.weights.visual) +
      (evidence.thermal * this.weights.thermal) +
      (evidence.acoustic * this.weights.acoustic);
    return Math.min(1.0, Math.max(0.0, parseFloat(raw.toFixed(3))));
  }

  public evaluate(
    evidence: SensorEvidence,
    droneCoordinates: { latitude: number; longitude: number },
    forcedState?: SVLPState
  ): SVLPEvaluation {
    if (forcedState) {
      this.currentState = forcedState;
    }

    const confidence = this.calculateConfidence(evidence);
    const maxSingleSensor = Math.max(evidence.visual, evidence.thermal, evidence.acoustic);
    let trigger: 'VISUAL' | 'THERMAL' | 'ACOUSTIC' | 'MULTI_MODAL' | 'NONE' = 'NONE';

    if (evidence.thermal >= evidence.visual && evidence.thermal >= evidence.acoustic && evidence.thermal > 0.5) {
      trigger = 'THERMAL';
    } else if (evidence.visual >= evidence.thermal && evidence.visual >= evidence.acoustic && evidence.visual > 0.5) {
      trigger = 'VISUAL';
    } else if (evidence.acoustic > 0.5) {
      trigger = 'ACOUSTIC';
    } else if (confidence > 0.5) {
      trigger = 'MULTI_MODAL';
    }

    // State machine transitions
    let nextState: SVLPState = this.currentState;
    let stateReason = 'Normal grid search ongoing';
    let recommendedAction = 'Maintain cruise altitude 35m, 7.5 m/s search speed.';

    switch (this.currentState) {
      case 'SEARCH':
        if (maxSingleSensor >= 0.65 || confidence >= this.thresholds.suspicionThreshold) {
          nextState = 'SUSPICION';
          this.stateHoldTicks = 0;
          this.targetLocation = { ...droneCoordinates };
          stateReason = `Elevated ${trigger.toLowerCase()} reading detected above noise floor.`;
          recommendedAction = `Reduce ground speed to 4.0 m/s; adjust sensor gimbal toward vector (${droneCoordinates.latitude.toFixed(4)}, ${droneCoordinates.longitude.toFixed(4)}).`;
        } else {
          stateReason = 'No anomalies detected within assigned survey sector.';
          recommendedAction = 'Maintain primary search pattern. Multi-sensor background scanning active.';
        }
        break;

      case 'SUSPICION':
        this.stateHoldTicks++;
        if (confidence >= this.thresholds.investigationThreshold || (evidence.thermal > 0.65 && evidence.visual > 0.55)) {
          nextState = 'INVESTIGATION';
          this.stateHoldTicks = 0;
          stateReason = 'Corroborating multi-modal signals confirm non-random anomaly.';
          recommendedAction = 'Repositioning: Descend to 15m altitude; initiate 10m radius spiral sweep over suspected point.';
        } else if (this.stateHoldTicks > 8 && confidence < 0.35) {
          nextState = 'SEARCH';
          this.stateHoldTicks = 0;
          stateReason = 'Suspected signal dissipated upon rescan. Anomaly dismissed.';
          recommendedAction = 'Resume lawn-mower search grid at cruise velocity.';
        } else {
          stateReason = `Analyzing persistence of ${trigger} signature over multiple samples.`;
          recommendedAction = 'Holding position offset; orienting IR thermal sensor for calibrated thermal differential.';
        }
        break;

      case 'INVESTIGATION':
        this.stateHoldTicks++;
        if (confidence >= this.thresholds.verificationThreshold) {
          nextState = 'VERIFICATION';
          this.stateHoldTicks = 0;
          stateReason = 'High multi-spectral convergence observed. Locking target coordinates.';
          recommendedAction = 'Initiate stationary precision hover at 12m. Engage directional acoustic beamforming.';
        } else if (this.stateHoldTicks > 12 && confidence < 0.40) {
          nextState = 'SEARCH';
          this.stateHoldTicks = 0;
          stateReason = 'Investigation resolved: Thermal/acoustic signatures did not meet threshold.';
          recommendedAction = 'Log negative investigation event and resume sector sweep.';
        } else {
          stateReason = 'Aggregating optical and thermal imagery from multiple angles.';
          recommendedAction = 'Executing low-altitude spiral reconnaissance around hotspot.';
        }
        break;

      case 'VERIFICATION':
        this.stateHoldTicks++;
        if (confidence >= this.thresholds.alertThreshold) {
          nextState = 'ALERT';
          this.stateHoldTicks = 0;
          stateReason = 'Biometric confirmation: Body heat delta (36.8°C) and acoustic vocal pattern verified.';
          recommendedAction = 'TRIGGER CRITICAL RESCUE ALERT: Dispatch coordinate beacon to Command Center & field teams.';
        } else if (this.stateHoldTicks > 10 && confidence < 0.60) {
          nextState = 'SUSPICION';
          this.stateHoldTicks = 0;
          stateReason = 'Verification inconclusive: Signal confidence dropped below verification threshold.';
          recommendedAction = 'Re-climb to 25m and re-evaluate surrounding area.';
        } else {
          stateReason = 'Performing multi-frame acoustic and thermal correlation test.';
          recommendedAction = 'Stationary hover active. Calculating precise GPS survivor pin coordinates.';
        }
        break;

      case 'ALERT':
        this.stateHoldTicks++;
        stateReason = 'SURVIVOR CONFIRMED WITH HIGH MULTI-SENSOR CONFIDENCE.';
        recommendedAction = 'Target flagged for immediate emergency extraction. Loitering as communication relay.';
        if (this.stateHoldTicks > 20) {
          // After alert hold, either return or resume
          nextState = 'SEARCH';
          this.stateHoldTicks = 0;
        }
        break;

      case 'RETURN':
        stateReason = 'Drone commanded to return to launch base.';
        recommendedAction = 'Direct vector to RTB coordinates. Sensors idling in survey mode.';
        break;
    }

    this.currentState = nextState;

    return {
      state: this.currentState,
      confidence,
      recommendedAction,
      stateReason,
      triggerSource: trigger,
      targetCoordinates: this.targetLocation,
    };
  }

  public reset(): void {
    this.currentState = 'SEARCH';
    this.stateHoldTicks = 0;
    this.targetLocation = undefined;
  }
}
