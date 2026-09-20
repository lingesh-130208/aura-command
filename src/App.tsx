import React, { useState, useEffect } from "react";
import { mockAuraService } from "./services/mockApi";
import {
  AuraFullState,
  JunctionNode,
  TrafficState,
  CascadeEvent,
  InterventionParams,
  OperatorAction,
  SystemMode,
} from "./types/traffic";
import { Header } from "./components/layout/Header";
import { Sidebar, NavViewKey } from "./components/layout/Sidebar";
import { DegradedBanner, DegradedStateKey } from "./components/common/DegradedBanner";
import { CorridorMap } from "./features/map/CorridorMap";
import { NodeInspectorCard } from "./features/map/NodeInspectorCard";
import { SituationPanel } from "./features/situation/SituationPanel";
import { ForecastTimeline } from "./features/timeline/ForecastTimeline";
import { CascadeExplorer } from "./features/cascade/CascadeExplorer";
import { WhatIfCenter } from "./features/whatif/WhatIfCenter";
import { EmergencyCorridorPanel } from "./features/emergency/EmergencyCorridorPanel";
import { HistoricalReplayView } from "./features/replay/HistoricalReplayView";
import { SystemHealthView } from "./features/system/SystemHealthView";
import { AuditLogView } from "./features/audit/AuditLogView";
import { CITIZEN_ADVISORY_SAMPLE } from "./data/corridorData";

export default function App() {
  // Main application state subscribed from service
  const [auraState, setAuraState] = useState<AuraFullState>(mockAuraService.getState());
  const [activeView, setActiveView] = useState<NavViewKey>("OVERVIEW");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Selection state
  const [selectedJunctionId, setSelectedJunctionId] = useState<string | null>("J7");
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>("E1");
  const [selectedInterventionCode, setSelectedInterventionCode] = useState<"A" | "B" | "C" | "D" | "E" | "A+B">("A");

  // Fault simulation & Degraded state
  const [activeDegradedState, setActiveDegradedState] = useState<DegradedStateKey>("NONE");

  // Replay control state
  const [replayStepIndex, setReplayStepIndex] = useState<number>(4); // default: 15:02 (T+12)

  // Subscribe to service updates
  useEffect(() => {
    const unsubscribe = mockAuraService.subscribeToState((updated: AuraFullState) => {
      setAuraState({ ...updated });
    });
    return () => unsubscribe();
  }, []);

  // Selected junction & segment objects
  const selectedJunction =
    auraState.corridor.junctions.find((j: JunctionNode) => j.id === selectedJunctionId) ||
    auraState.corridor.junctions.find((j: JunctionNode) => j.id === "J7")!;

  const selectedSegment = selectedSegmentId
    ? auraState.corridor.segments.find((s: TrafficState) => s.segmentId === selectedSegmentId) || null
    : null;

  // Primary incident prediction (defaults to J7)
  const primaryPrediction =
    auraState.predictions.find((p) => p.targetId === (selectedJunctionId || "J7")) ||
    auraState.predictions[0];

  // Actions
  const handleSelectJunction = (node: JunctionNode) => {
    setSelectedJunctionId(node.id);
    setSelectedSegmentId(null);
  };

  const handleSelectSegment = (segment: TrafficState) => {
    setSelectedSegmentId(segment.segmentId);
    setSelectedJunctionId(null);
  };

  const handleSelectTimelineEvent = (event: CascadeEvent) => {
    setSelectedEventId(event.id);
    setSelectedJunctionId(event.junctionId);
    setSelectedSegmentId(null);
  };

  const handleRunScenario = async (
    code: "A" | "B" | "C" | "D" | "E" | "A+B",
    params?: InterventionParams
  ) => {
    await mockAuraService.runScenario(code, params);
  };

  const handleSubmitDecision = async (
    decision: "ACCEPTED" | "MODIFIED" | "REJECTED",
    code: string,
    params: InterventionParams,
    notes?: string
  ): Promise<OperatorAction> => {
    return await mockAuraService.submitOperatorDecision(decision, code, params, notes);
  };

  const handleToggleEmergencyProtect = (active: boolean) => {
    mockAuraService.toggleEmergencyProtection(active);
  };

  const handleApplyReplaySnapshot = (snapshot: any) => {
    mockAuraService.applyReplaySnapshot(snapshot);
  };

  // Operating stage detection for header progress indicator
  const activeOperatingStage =
    activeView === "WHAT_IF_CENTER"
      ? "INTERVENTIONS"
      : activeView === "CASCADE_EXPLORER"
      ? "CASCADE"
      : activeView === "EMERGENCY_MODE"
      ? "DECISION"
      : auraState.isMitigated
      ? "DECISION"
      : "DETECT FAILURE";

  return (
    <div
      id="aura-command-root"
      className="flex flex-col h-screen w-screen bg-[#070b12] text-slate-100 overflow-hidden font-sans"
    >
      {/* Degraded system state banner (Section 27) */}
      {activeDegradedState !== "NONE" && (
        <DegradedBanner
          activeDegradedState={activeDegradedState}
          onDismiss={() => setActiveDegradedState("NONE")}
          onToggleState={(key) => setActiveDegradedState(key)}
        />
      )}

      {/* Global Header (Section 3 & 4) */}
      <Header
        systemMode={auraState.systemStatus.mode}
        simulatedTime={auraState.systemStatus.simulatedTime}
        activeOperatingStage={activeOperatingStage}
        onSelectMode={(mode: SystemMode) => {
          if (mode === "REPLAY") setActiveView("HISTORICAL_REPLAY");
          else if (mode === "DIGITAL_TWIN") setActiveView("WHAT_IF_CENTER");
          else if (mode === "DEGRADED") setActiveDegradedState("TRAFFIC_PROVIDER_DEGRADED");
        }}
      />

      {/* Main App Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar Navigation (Section 4) */}
        <Sidebar
          activeView={activeView}
          onSelectView={setActiveView}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          riskCount={auraState.predictions.filter((p) => p.severity === "HIGH_RISK" || p.severity === "CRITICAL").length}
          emergencyActive={auraState.emergencyCorridor.protectionActive}
        />

        {/* Dynamic Center Work Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#070b12]">
          {/* TAB 1: OVERVIEW & LIVE NETWORK & RISK MAP */}
          {(activeView === "OVERVIEW" || activeView === "LIVE_NETWORK" || activeView === "RISK_MAP") && (
            <div className="flex flex-1 h-full overflow-hidden">
              {/* Center Map & Visual Canvas Area */}
              <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* The Corridor Map Canvas */}
                <div className="flex-1 relative overflow-hidden bg-radial-glow">
                  <CorridorMap
                    junctions={auraState.corridor.junctions}
                    segments={auraState.corridor.segments}
                    predictions={auraState.predictions}
                    emergencyCorridor={auraState.emergencyCorridor}
                    selectedJunctionId={selectedJunctionId}
                    selectedSegmentId={selectedSegmentId}
                    onSelectJunction={handleSelectJunction}
                    onSelectSegment={handleSelectSegment}
                    interventionTarget={selectedInterventionCode === "A" ? "J7" : selectedInterventionCode === "B" ? "J5" : "J7"}
                    showEmergencyHighlight={auraState.emergencyCorridor.protectionActive}
                  />

                  {/* Floating Detailed Node / Segment Inspector Card (Section 5) */}
                  {(selectedJunction || selectedSegment) && (
                    <NodeInspectorCard
                      selectedJunction={selectedJunction}
                      selectedSegment={selectedSegment}
                      onClose={() => {
                        setSelectedJunctionId(null);
                        setSelectedSegmentId(null);
                      }}
                      onTargetIntervention={(junctionId) => {
                        setActiveView("WHAT_IF_CENTER");
                      }}
                    />
                  )}
                </div>

                {/* Forecast Timeline at bottom of monitor (Section 8) */}
                <ForecastTimeline
                  events={auraState.cascade.events}
                  selectedEventId={selectedEventId}
                  onSelectEvent={handleSelectTimelineEvent}
                  isMitigated={auraState.isMitigated}
                />
              </div>

              {/* Right Situation & AI Intelligence Panel (Sections 6, 7, 20, 21) */}
              <SituationPanel
                primaryPrediction={primaryPrediction}
                allPredictions={auraState.predictions}
                selectedJunction={selectedJunction}
                onExploreCascade={() => setActiveView("CASCADE_EXPLORER")}
                onSelectPredictionTarget={(targetId) => {
                  setSelectedJunctionId(targetId);
                  setSelectedSegmentId(null);
                }}
                onOpenWhatIf={() => setActiveView("WHAT_IF_CENTER")}
              />
            </div>
          )}

          {/* TAB 2: CASCADE EXPLORER (Section 9) */}
          {activeView === "CASCADE_EXPLORER" && (
            <CascadeExplorer
              cascade={auraState.cascade}
              selectedEventId={selectedEventId}
              onSelectEvent={(ev) => {
                setSelectedEventId(ev.id);
                setSelectedJunctionId(ev.junctionId);
              }}
              onJumpToWhatIf={() => setActiveView("WHAT_IF_CENTER")}
              isMitigated={auraState.isMitigated}
            />
          )}

          {/* TAB 3: WHAT-IF INTERVENTION CENTER (Sections 10, 11, 12, 13, 14) */}
          {activeView === "WHAT_IF_CENTER" && (
            <WhatIfCenter
              interventions={auraState.interventions}
              scenarioResults={auraState.scenarioResults}
              decisionCandidate={auraState.decisionCandidate}
              selectedCode={selectedInterventionCode}
              onSelectCode={setSelectedInterventionCode}
              onRunScenario={handleRunScenario}
              onSubmitDecision={handleSubmitDecision}
              lastAction={auraState.lastOperatorAction}
            />
          )}

          {/* TAB 4: EMERGENCY MODE (Section 15) */}
          {activeView === "EMERGENCY_MODE" && (
            <EmergencyCorridorPanel
              corridor={auraState.emergencyCorridor}
              onToggleProtect={handleToggleEmergencyProtect}
            />
          )}

          {/* TAB 5: HISTORICAL REPLAY (Section 16) */}
          {activeView === "HISTORICAL_REPLAY" && (
            <HistoricalReplayView
              currentStepIndex={replayStepIndex}
              onStepChange={setReplayStepIndex}
              onApplySnapshotToSimulation={handleApplyReplaySnapshot}
            />
          )}

          {/* TAB 6: SYSTEM HEALTH & FAULT INJECTION (Sections 17 & 27) */}
          {activeView === "SYSTEM_HEALTH" && (
            <SystemHealthView
              systemStatus={auraState.systemStatus}
              activeDegradedState={activeDegradedState}
              onSetDegradedState={setActiveDegradedState}
            />
          )}

          {/* TAB 7: AUDIT LOG & CITIZEN BROADCAST (Sections 33 & Ledger) */}
          {activeView === "AUDIT_LOG" && (
            <AuditLogView
              operatorActions={auraState.operatorActions}
              citizenAlert={CITIZEN_ADVISORY_SAMPLE}
            />
          )}
        </div>
      </div>
    </div>
  );
}
