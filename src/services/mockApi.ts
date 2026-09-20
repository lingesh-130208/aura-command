/**
 * AURA COMMAND - Mock API & WebSocket Service Layer
 * Designed to cleanly swap with actual FastAPI REST endpoints and WebSockets in production.
 */

import {
  TrafficState,
  JunctionNode,
  Prediction,
  Cascade,
  Intervention,
  ScenarioResult,
  DecisionCandidate,
  EmergencyCorridorState,
  SystemStatus,
  OperatorAction,
  OperatorDecisionType,
  InterventionParams,
  WebSocketEventType,
  WebSocketMessage,
  AuraFullState,
} from "../types/traffic";

import {
  INITIAL_JUNCTIONS,
  INITIAL_ROAD_SEGMENTS,
  INITIAL_PREDICTIONS,
  INITIAL_CASCADE,
  INTERVENTIONS,
  SCENARIO_RESULTS,
  DECISION_CANDIDATE,
  EMERGENCY_CORRIDOR,
  INITIAL_SYSTEM_STATUS,
  ReplaySnapshot,
} from "../data/corridorData";

// In-memory state store for interactive simulation in the frontend
class MockAuraService {
  private junctions: JunctionNode[] = [...INITIAL_JUNCTIONS];
  private segments: TrafficState[] = [...INITIAL_ROAD_SEGMENTS];
  private predictions: Prediction[] = [...INITIAL_PREDICTIONS];
  private cascade: Cascade = { ...INITIAL_CASCADE };
  private interventions: Record<string, Intervention> = { ...INTERVENTIONS };
  private scenarioResults: Record<string, ScenarioResult> = { ...SCENARIO_RESULTS };
  private emergencyCorridor: EmergencyCorridorState = { ...EMERGENCY_CORRIDOR };
  private systemStatus: SystemStatus = { ...INITIAL_SYSTEM_STATUS };
  private operatorActionHistory: OperatorAction[] = [];
  private listeners: Map<WebSocketEventType, ((msg: WebSocketMessage) => void)[]> = new Map();

  private isMitigated = false;
  private stateChangeSubscribers: ((state: AuraFullState) => void)[] = [];

  constructor() {
    // initialize listeners map
    const events: WebSocketEventType[] = [
      "STATE_UPDATED",
      "RISK_UPDATED",
      "CASCADE_UPDATED",
      "SCENARIO_STARTED",
      "SCENARIO_COMPLETED",
      "INTERVENTION_UPDATED",
      "OPERATOR_ACTION",
      "SYSTEM_STATUS",
    ];
    events.forEach((ev) => this.listeners.set(ev, []));
  }

  // Subscribe to mock WebSocket events
  public subscribe<T>(event: WebSocketEventType, callback: (msg: WebSocketMessage<T>) => void): () => void {
    const list = this.listeners.get(event) || [];
    list.push(callback as (msg: WebSocketMessage) => void);
    this.listeners.set(event, list);

    return () => {
      const current = this.listeners.get(event) || [];
      this.listeners.set(
        event,
        current.filter((cb) => cb !== callback)
      );
    };
  }

  private broadcast<T>(event: WebSocketEventType, payload: T) {
    const message: WebSocketMessage<T> = {
      event,
      timestamp: new Date().toISOString(),
      payload,
    };
    const cbs = this.listeners.get(event) || [];
    cbs.forEach((cb) => cb(message as WebSocketMessage));
  }

  // GET /network/state
  public async getNetworkState(): Promise<{ junctions: JunctionNode[]; segments: TrafficState[] }> {
    return {
      junctions: [...this.junctions],
      segments: [...this.segments],
    };
  }

  // GET /network/risk
  public async getNetworkRisk(): Promise<Prediction[]> {
    return [...this.predictions];
  }

  // GET /cascade/:id
  public async getCascade(id: string = "CASC-J7-001"): Promise<Cascade> {
    return { ...this.cascade };
  }

  // GET /predictions/:segmentId
  public async getPredictionsForTarget(targetId: string): Promise<Prediction[]> {
    return this.predictions.filter((p) => p.targetId === targetId);
  }

  // GET /interventions
  public async getInterventions(): Promise<Record<string, Intervention>> {
    return { ...this.interventions };
  }

  // GET /decision/candidate
  public async getDecisionCandidate(): Promise<DecisionCandidate> {
    return { ...DECISION_CANDIDATE };
  }

  // GET /emergency/corridor
  public async getEmergencyCorridor(): Promise<EmergencyCorridorState> {
    return { ...this.emergencyCorridor };
  }

  // GET /system/health
  public async getSystemHealth(): Promise<SystemStatus> {
    return { ...this.systemStatus };
  }

  // GET /scenarios/compare
  public async getScenarioComparison(): Promise<Record<string, ScenarioResult>> {
    return { ...this.scenarioResults };
  }

  // POST /scenarios/:id/run (Updates simulated parameters & returns recalculated metrics)
  public async runScenario(code: "A" | "B" | "C" | "D" | "E" | "A+B", customParams?: InterventionParams): Promise<ScenarioResult> {
    this.broadcast("SCENARIO_STARTED", { code, customParams });

    if (customParams && this.interventions[code]) {
      this.interventions[code].params = {
        ...this.interventions[code].params,
        ...customParams,
      };
    }

    // Dynamic adjustment simulation
    const base = this.scenarioResults[code] || this.scenarioResults["A"];
    let updatedResult = { ...base };

    if (code === "A" && customParams?.greenExtensionSec) {
      // E.g., extending green more improves recovery time
      const bonus = Math.min(20, customParams.greenExtensionSec);
      const factor = bonus / 15;
      updatedResult = {
        ...updatedResult,
        maxSeverity: Number((0.75 - factor * 0.15).toFixed(2)),
        recoveryTimeMinutes: Math.max(5, Math.round(11 - factor * 2.5)),
        cascadeDurationMinutes: Math.max(4, Math.round(10 - factor * 2.5)),
        secondaryRiskPercent: Math.round(35 + factor * 6), // extending green increases cross-street wait slightly
      };
      this.scenarioResults["A"] = updatedResult;
    }

    this.broadcast("SCENARIO_COMPLETED", updatedResult);
    return updatedResult;
  }

  // POST /operator/decision (ACCEPT / MODIFY / REJECT)
  public async submitOperatorDecision(
    decision: OperatorDecisionType,
    selectedCode: string,
    params: InterventionParams,
    notes?: string
  ): Promise<OperatorAction> {
    const action: OperatorAction = {
      id: `OP-ACT-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("en-GB"),
      operatorId: "CTRL-OFFICER-07",
      decision,
      selectedInterventionCode: selectedCode,
      appliedParams: params,
      notes,
      simulatedOutcomeState: decision === "ACCEPTED" ? "MITIGATED" : decision === "REJECTED" ? "ACTIVE_FAILURE" : "MITIGATED",
    };

    this.operatorActionHistory.unshift(action);

    // If accepted, update J7 and network state to reflect simulated mitigation
    if (decision === "ACCEPTED") {
      this.applyMitigationToState(selectedCode);
    } else if (decision === "REJECTED") {
      this.applyFailureToState();
    }

    this.broadcast("OPERATOR_ACTION", action);
    this.broadcast("STATE_UPDATED", { junctions: this.junctions, segments: this.segments });
    this.notifyStateChange();

    return action;
  }

  // Update simulation state when historical replay scrub is moved
  public updateStateFromReplaySnapshot(
    j7Queue: number,
    j7Speed: number,
    j7Risk: number,
    severity: "NORMAL" | "DETERIORATING" | "HIGH_RISK" | "CRITICAL"
  ) {
    this.junctions = this.junctions.map((j) => {
      if (j.id === "J7") {
        return {
          ...j,
          severity,
          currentSpeed: j7Speed,
          estimatedQueueMeters: j7Queue,
          predictedSpillbackPercent: j7Risk,
        };
      }
      return j;
    });

    this.segments = this.segments.map((seg) => {
      if (seg.segmentId === "SEG-6-7" || seg.segmentId === "SEG-7-8") {
        return {
          ...seg,
          severity,
          queue: j7Queue,
          speed: j7Speed,
        };
      }
      return seg;
    });

    this.broadcast("STATE_UPDATED", { junctions: this.junctions, segments: this.segments });
  }

  // Helper: simulate mitigation on state
  private applyMitigationToState(interventionCode: string) {
    this.junctions = this.junctions.map((j) => {
      if (j.id === "J7") {
        return {
          ...j,
          severity: "DETERIORATING",
          currentSpeed: 34,
          estimatedQueueMeters: 92,
          capacityStressPercent: 62,
          predictedSpillbackPercent: 28,
        };
      }
      if (j.id === "J8" && (interventionCode === "B" || interventionCode === "A+B")) {
        // Displaced queue effect at J8
        return {
          ...j,
          estimatedQueueMeters: 148,
          capacityStressPercent: 79,
        };
      }
      return j;
    });

    // Update predictions
    this.predictions = this.predictions.map((p) => {
      if (p.targetId === "J7") {
        return {
          ...p,
          probability: 0.28,
          severity: "DETERIORATING",
          primaryIssue: "Queue dissipating following green extension",
        };
      }
      return p;
    });

    // Update cascade status
    this.cascade.events = this.cascade.events.map((e) => {
      if (e.id === "E2" || e.id === "E3") {
        return { ...e, status: "MITIGATED", severity: "NORMAL" };
      }
      return e;
    });
  }

  // Helper: simulate unmitigated failure progression
  private applyFailureToState() {
    this.junctions = this.junctions.map((j) => {
      if (j.id === "J7") {
        return {
          ...j,
          severity: "CRITICAL",
          currentSpeed: 12,
          estimatedQueueMeters: 235,
          capacityStressPercent: 98,
          predictedSpillbackPercent: 94,
        };
      }
      if (j.id === "J6") {
        return {
          ...j,
          severity: "CRITICAL",
          currentSpeed: 16,
          estimatedQueueMeters: 185,
        };
      }
      return j;
    });
  }

  public getOperatorHistory(): OperatorAction[] {
    return [...this.operatorActionHistory];
  }

  public getState(): AuraFullState {
    return {
      corridor: {
        id: "AURA-CORRIDOR-01",
        name: "AURA Demo Corridor — Arterial 7 & Perimeter",
        description: "9-junction high-density metropolitan arterial network",
        junctions: [...this.junctions],
        segments: [...this.segments],
      },
      predictions: [...this.predictions],
      cascade: { ...this.cascade },
      interventions: { ...this.interventions },
      scenarioResults: { ...this.scenarioResults },
      decisionCandidate: { ...DECISION_CANDIDATE },
      emergencyCorridor: { ...this.emergencyCorridor },
      systemStatus: { ...this.systemStatus },
      operatorActions: [...this.operatorActionHistory],
      lastOperatorAction: this.operatorActionHistory[0] || null,
      isMitigated: this.isMitigated,
    };
  }

  public subscribeToState(callback: (state: AuraFullState) => void): () => void {
    this.stateChangeSubscribers.push(callback);
    return () => {
      this.stateChangeSubscribers = this.stateChangeSubscribers.filter((cb) => cb !== callback);
    };
  }

  private notifyStateChange() {
    const state = this.getState();
    this.stateChangeSubscribers.forEach((cb) => cb(state));
  }

  public resetCorridor() {
    this.junctions = [...INITIAL_JUNCTIONS];
    this.segments = [...INITIAL_ROAD_SEGMENTS];
    this.predictions = [...INITIAL_PREDICTIONS];
    this.cascade = { ...INITIAL_CASCADE };
    this.interventions = { ...INTERVENTIONS };
    this.scenarioResults = { ...SCENARIO_RESULTS };
    this.emergencyCorridor = { ...EMERGENCY_CORRIDOR };
    this.systemStatus = { ...INITIAL_SYSTEM_STATUS };
    this.isMitigated = false;
    this.notifyStateChange();
  }

  public toggleEmergencyProtection(active: boolean) {
    this.emergencyCorridor.protectionActive = active;
    this.emergencyCorridor.clearancePreemptionApplied = active;
    if (active) {
      this.emergencyCorridor.corridorStatus = "CLEAR";
      this.emergencyCorridor.estimatedClearanceMinutes = 0;
    } else {
      this.emergencyCorridor.corridorStatus = "HIGH_RISK";
      this.emergencyCorridor.estimatedClearanceMinutes = 4.2;
    }
    this.broadcast("INTERVENTION_UPDATED", this.emergencyCorridor);
    this.notifyStateChange();
  }

  public applyReplaySnapshot(snapshot: ReplaySnapshot) {
    this.junctions = this.junctions.map((j) => {
      if (j.id === "J7") {
        return {
          ...j,
          currentSpeed: snapshot.j7SpeedKmh,
          estimatedQueueMeters: snapshot.j7QueueMeters,
          predictedSpillbackPercent: snapshot.j7RiskPercent,
          severity: snapshot.severity,
        };
      }
      if (j.id === "J6") {
        return {
          ...j,
          currentSpeed: snapshot.j6SpeedKmh,
        };
      }
      if (j.id === "J8") {
        return {
          ...j,
          predictedSpillbackPercent: snapshot.j8RiskPercent,
        };
      }
      return j;
    });

    this.systemStatus.simulatedTime = snapshot.time;
    this.notifyStateChange();
  }
}

// Singleton instance
export const mockAuraService = new MockAuraService();
