/**
 * AURA COMMAND - Core Traffic & System Type Definitions
 * Designed for future FastAPI backend & WebSocket integration
 */

export type DataProvenance = "OBSERVED" | "ESTIMATED" | "PREDICTED" | "SIMULATED" | "UNKNOWN";

export type TrafficSeverity = "NORMAL" | "DETERIORATING" | "HIGH_RISK" | "CRITICAL" | "DEGRADED" | "NO_DATA";

export type SystemMode = "LIVE" | "REPLAY" | "DIGITAL_TWIN" | "DEGRADED";

export interface TrafficObservation {
  id: string;
  source: string;
  sensorId: string;
  locationId: string;
  timestamp: string;
  rawSpeedKmh: number;
  rawFlowVehPerHour: number;
  occupancyPercent: number;
  provenance: "OBSERVED";
  qualityScore: number;
}

export interface TrafficState {
  segmentId: string;
  name: string;
  fromJunction: string;
  toJunction: string;
  timestamp: string;
  speed: number | null; // km/h
  flow: number | null; // veh/hr
  density: number | null; // veh/km
  queue: number | null; // meters
  capacityStress: number; // 0 - 100%
  uncertainty: number; // 0 - 1.0
  severity: TrafficSeverity;
  status: DataProvenance;
  speedLimit: number;
  incidentActive?: boolean;
  incidentDescription?: string;
  isEmergencyCorridor?: boolean;
}

export interface VehicleMixBreakdown {
  twoWheelerPercent: number; // 2W
  autoRickshawPercent: number; // AUTO
  carPercent: number; // CAR
  busPercent: number; // BUS
  heavyGoodsPercent: number; // HGV
  provenance: "ESTIMATED";
  sampleWindowMin: number;
}

export interface JunctionNode {
  id: string; // e.g., "J1".."J9"
  name: string;
  type: "SIGNALIZED" | "ROUNDABOUT" | "HIGHWAY_RAMP" | "MERGE_POINT";
  coordinates: { x: number; y: number }; // Relative SVG canvas coords (0-1000, 0-600)
  severity: TrafficSeverity;
  currentSpeed: number; // km/h
  estimatedQueueMeters: number;
  capacityStressPercent: number;
  predictedSpillbackPercent: number;
  predictedWindow: string; // e.g. "3–6 min"
  confidencePercent: number;
  dataStatus: DataProvenance;
  vehicleMix: VehicleMixBreakdown;
  activeSignals?: {
    currentPhase: "N-S GREEN" | "E-W GREEN" | "ALL RED";
    greenRemainingSec: number;
    cycleLengthSec: number;
  };
  connectedSegments: string[];
  isTargetedByIntervention?: boolean;
  isEmergencyCorridor?: boolean;
}

export interface Prediction {
  id: string;
  targetId: string; // junction or segment
  targetName: string;
  eventType: "SPILLBACK" | "JUNCTION_BLOCKING" | "QUEUE_GROWTH" | "GRIDLOCK_THREAT" | "CORRIDOR_DELAY";
  probability: number; // 0.0 - 1.0 (displayed as e.g. 72%)
  timeWindow: string; // e.g. "3–6 min"
  timeMinutesFromNow: number; // e.g. 3
  severity: TrafficSeverity;
  potentialImpact: string; // e.g. "J6 → J7 → J8"
  primaryIssue: string;
  confidence: number; // 0 - 1.0
  provenance: "PREDICTED";
  timestamp: string;
}

export interface CascadeEvent {
  id: string; // e.g. "E1", "E2"
  junctionId: string;
  junctionName: string;
  title: string;
  eventType: string;
  probabilityPercent: number;
  predictedTime: string; // "+3m"
  minutesFromNow: number;
  severity: TrafficSeverity;
  propagationDelaySec?: number;
  relationshipType?: "UPSTREAM_SPILLBACK" | "DIVERSION_SURGE" | "STORAGE_DEPLETION" | "CHOKE_PROPAGATION";
  description: string;
  status: "ACTIVE" | "PENDING" | "MITIGATED" | "AVOIDED";
}

export interface CascadeRelationship {
  id: string;
  sourceEventId: string;
  targetEventId: string;
  relationship: string; // e.g. "SPILLBACK", "JUNCTION_BLOCKING"
  delaySeconds: number;
  probability: number;
  triggerCondition: string;
}

export interface Cascade {
  id: string;
  rootJunctionId: string;
  initiatedAt: string;
  events: CascadeEvent[];
  relationships: CascadeRelationship[];
  unmitigatedDurationMin: number;
  estimatedGridlockRiskPercent: number;
}

export type InterventionType = "SIGNAL" | "DIVERSION" | "RESTRICTION" | "METERING" | "EMERGENCY_CORRIDOR";

export interface InterventionParams {
  greenExtensionSec?: number;
  durationSec?: number;
  targetJunction?: string;
  diversionFractionPercent?: number;
  diversionRoute?: string;
  meteringRateVehPerMin?: number;
  restrictedVehicleClasses?: string[];
  emergencyOrigin?: string;
  emergencyDestination?: string;
  emergencyPriorityWeight?: number;
}

export interface Intervention {
  id: string;
  code: "A" | "B" | "C" | "D" | "E" | "A+B";
  type: InterventionType;
  title: string;
  summary: string;
  target: string;
  params: InterventionParams;
  positiveImpact: string;
  secondaryEffect: {
    description: string;
    riskLocation: string;
    probabilityPercent: number;
    severityChange: string;
  };
  provenance: "SIMULATED";
}

export interface ScenarioResult {
  scenarioId: string;
  label: "BASELINE" | "A" | "B" | "A+B";
  interventionName: string;
  affectedNodes: number;
  eventCount: number;
  maxSeverity: number; // 0.00 - 1.00
  cascadeDurationMinutes: number;
  recoveryTimeMinutes: number;
  emergencyImpactMinutes: number;
  secondaryRiskPercent: number;
  travelTimeImpactPercent: number; // -18% (improvement) vs +12%
  uncertaintyPercent: number;
  provenance: "SIMULATED";
}

export interface DecisionCandidate {
  recommendedInterventionId: string;
  recommendedCode: "A" | "B" | "C" | "D" | "E" | "A+B";
  recommendationTitle: string;
  targetLocation: string;
  rationale: string[];
  alternativeInterventionTitle: string;
  alternativeCode: "B" | "C" | "D";
  alternativeRationale: string;
  worstSecondaryEffect: {
    location: string;
    effect: string;
    probabilityPercent: number;
  };
  uncertaintyRating: string;
  confidenceScore: number;
}

export type OperatorDecisionType = "PENDING" | "ACCEPTED" | "MODIFIED" | "REJECTED";

export interface OperatorAction {
  id: string;
  timestamp: string;
  operatorId: string;
  decision: OperatorDecisionType;
  selectedInterventionCode: string;
  appliedParams: InterventionParams;
  notes?: string;
  simulatedOutcomeState: "PREVENTED" | "MITIGATED" | "ACTIVE_FAILURE";
}

export interface EmergencyCorridorState {
  id: string;
  name: string; // e.g. "AMBULANCE CORRIDOR — HOSPITAL LINK"
  path: string[]; // ["J4", "J5", "J7", "HOSPITAL"]
  activeVehicle: {
    callSign: string;
    type: "CRITICAL_CARE_AMBULANCE" | "FIRE_RESCUE";
    etaMinutes: number;
    origin: string;
    destination: string;
  };
  corridorStatus: "CLEAR" | "IMPEDED" | "HIGH_RISK" | "BLOCKED";
  predictedObstruction: string;
  estimatedClearanceMinutes: number;
  affectedJunctions: string[];
  protectionActive: boolean;
  clearancePreemptionApplied: boolean;
  provenance: "SIMULATED";
}

export interface CitizenAlert {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  channels: ("VMS_DISPLAYS" | "NAVIGATION_APPS" | "RADIO_BROADCAST")[];
  targetZones: string[];
  status: "DRAFTED" | "BROADCASTED";
}

export interface ServiceHealth {
  name: string;
  key: string;
  status: "AVAILABLE" | "DEGRADED" | "UNAVAILABLE";
  latencyMs: number;
  lastHeartbeat: string;
  notes?: string;
}

export interface SystemStatus {
  mode: SystemMode;
  simulatedTime: string;
  systemHealth: "HEALTHY" | "DEGRADED" | "CRITICAL";
  services: ServiceHealth[];
  activeAlertsCount: number;
  dataFreshnessSecondsAgo: number;
  provenanceNotice: string;
}

// WebSocket Event Types for future backend contract
export type WebSocketEventType = 
  | "STATE_UPDATED"
  | "RISK_UPDATED"
  | "CASCADE_UPDATED"
  | "SCENARIO_STARTED"
  | "SCENARIO_COMPLETED"
  | "INTERVENTION_UPDATED"
  | "OPERATOR_ACTION"
  | "SYSTEM_STATUS";

export interface WebSocketMessage<T = unknown> {
  event: WebSocketEventType;
  timestamp: string;
  payload: T;
}

export interface CorridorData {
  id: string;
  name: string;
  description: string;
  junctions: JunctionNode[];
  segments: TrafficState[];
}

export interface AuraFullState {
  corridor: CorridorData;
  predictions: Prediction[];
  cascade: Cascade;
  interventions: Record<string, Intervention>;
  scenarioResults: Record<string, ScenarioResult>;
  decisionCandidate: DecisionCandidate;
  emergencyCorridor: EmergencyCorridorState;
  systemStatus: SystemStatus;
  operatorActions: OperatorAction[];
  lastOperatorAction: OperatorAction | null;
  isMitigated: boolean;
}
