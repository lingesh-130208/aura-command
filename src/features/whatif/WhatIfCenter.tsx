import React, { useState } from "react";
import {
  Intervention,
  ScenarioResult,
  DecisionCandidate,
  InterventionParams,
  OperatorAction,
} from "../../types/traffic";
import { ProvenanceTag } from "../../components/common/ProvenanceTag";
import { StatusPill } from "../../components/common/StatusPill";
import {
  Sliders,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Edit3,
  Flame,
  Radio,
  RefreshCw,
  EyeOff,
  UserCheck,
  Send,
} from "lucide-react";

interface WhatIfCenterProps {
  interventions: Record<string, Intervention>;
  scenarioResults: Record<string, ScenarioResult>;
  decisionCandidate: DecisionCandidate;
  selectedCode: "A" | "B" | "C" | "D" | "E" | "A+B";
  onSelectCode: (code: "A" | "B" | "C" | "D" | "E" | "A+B") => void;
  onRunScenario: (code: "A" | "B" | "C" | "D" | "E" | "A+B", params?: InterventionParams) => Promise<void>;
  onSubmitDecision: (decision: "ACCEPTED" | "MODIFIED" | "REJECTED", code: string, params: InterventionParams, notes?: string) => Promise<OperatorAction>;
  lastAction: OperatorAction | null;
}

export const WhatIfCenter: React.FC<WhatIfCenterProps> = ({
  interventions,
  scenarioResults,
  decisionCandidate,
  selectedCode,
  onSelectCode,
  onRunScenario,
  onSubmitDecision,
  lastAction,
}) => {
  const currentIntervention = interventions[selectedCode] || interventions["A"];

  // Editable parameters state
  const [params, setParams] = useState<InterventionParams>({
    greenExtensionSec: currentIntervention?.params?.greenExtensionSec || 15,
    durationSec: currentIntervention?.params?.durationSec || 180,
    diversionFractionPercent: currentIntervention?.params?.diversionFractionPercent || 25,
    meteringRateVehPerMin: currentIntervention?.params?.meteringRateVehPerMin || 18,
  });

  // UI modes
  const [isModifying, setIsModifying] = useState(false);
  const [dontTrustMeActive, setDontTrustMeActive] = useState(false);
  const [operatorNotes, setOperatorNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync params when intervention code changes
  const handleCodeChange = (code: "A" | "B" | "C" | "D" | "E" | "A+B") => {
    onSelectCode(code);
    const target = interventions[code];
    if (target) {
      setParams({
        greenExtensionSec: target.params.greenExtensionSec || 15,
        durationSec: target.params.durationSec || 180,
        diversionFractionPercent: target.params.diversionFractionPercent || 25,
        meteringRateVehPerMin: target.params.meteringRateVehPerMin || 18,
      });
    }
  };

  const handleParamChange = async (key: keyof InterventionParams, val: number) => {
    const updated = { ...params, [key]: val };
    setParams(updated);
    await onRunScenario(selectedCode, updated);
  };

  const handleAction = async (decision: "ACCEPTED" | "MODIFIED" | "REJECTED") => {
    setIsSubmitting(true);
    await onSubmitDecision(decision, selectedCode, params, operatorNotes);
    setIsSubmitting(false);
    if (decision === "MODIFIED") {
      setIsModifying(false);
    }
  };

  return (
    <div
      id="what-if-decision-center"
      className="p-4 bg-[#0a0f18] flex flex-col h-full overflow-y-auto font-mono text-xs select-none space-y-4"
    >
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              WHAT-IF INTERVENTION DECISION CENTER
            </h2>
            <ProvenanceTag status="SIMULATED" size="xs" />
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Current baseline: <span className="text-rose-400 font-bold">NO INTERVENTION (Active queue spillback)</span>
          </div>
        </div>

        {/* DON'T TRUST ME Special Control (Section 14) */}
        <div className="flex items-center gap-2">
          <button
            id="dont-trust-me-toggle-btn"
            onClick={() => setDontTrustMeActive((prev) => !prev)}
            className={`py-1.5 px-3 rounded font-bold transition-all flex items-center gap-1.5 border text-xs ${
              dontTrustMeActive
                ? "bg-amber-950/80 border-amber-400 text-amber-200 ring-2 ring-amber-500/30 shadow-lg"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-amber-500/50"
            }`}
            title="Challenge AI recommendation with counter-factuals & worst-case impacts"
          >
            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
            <span>DON'T TRUST ME MODE</span>
            {dontTrustMeActive && (
              <span className="text-[9px] px-1 bg-amber-400 text-black rounded font-bold">
                ON
              </span>
            )}
          </button>
        </div>
      </div>

      {/* DON'T TRUST ME CALLOUT PANEL (Section 14) */}
      {dontTrustMeActive && (
        <div
          id="dont-trust-me-panel"
          className="p-3.5 rounded-lg border border-amber-500/60 bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/40 text-xs space-y-2.5 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider text-[11px]">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>OPERATOR CHALLENGE: COUNTER-FACTUAL SCRUTINY</span>
            </div>
            <span className="text-[10px] text-amber-400/80">
              DECISION SUPPORT SAFEGUARD
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px]">
            <div className="p-2.5 rounded border border-purple-500/30 bg-slate-900/80">
              <span className="text-[10px] text-purple-400 font-bold uppercase block mb-1">
                AI Recommendation
              </span>
              <span className="text-white font-bold text-xs">
                {decisionCandidate.recommendationTitle}
              </span>
              <p className="text-slate-400 text-[10px] mt-1 leading-snug">
                Extends green by 15s at J7 to drain backlog without rerouting.
              </p>
            </div>

            <div className="p-2.5 rounded border border-sky-500/30 bg-slate-900/80">
              <span className="text-[10px] text-sky-400 font-bold uppercase block mb-1">
                Alternative Candidate
              </span>
              <span className="text-white font-bold text-xs">
                {decisionCandidate.alternativeInterventionTitle}
              </span>
              <p className="text-slate-400 text-[10px] mt-1 leading-snug">
                {decisionCandidate.alternativeRationale}
              </p>
            </div>

            <div className="p-2.5 rounded border border-rose-500/40 bg-slate-900/80">
              <span className="text-[10px] text-rose-400 font-bold uppercase block mb-1">
                Worst Secondary Effect & Risk
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-rose-200 font-bold text-xs">
                  {decisionCandidate.worstSecondaryEffect.location}
                </span>
                <span className="text-amber-300 font-bold">
                  {decisionCandidate.worstSecondaryEffect.probabilityPercent}% PROB
                </span>
              </div>
              <p className="text-slate-400 text-[10px] mt-1 leading-snug">
                {decisionCandidate.worstSecondaryEffect.effect}
              </p>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
            <span>
              Uncertainty Rating:{" "}
              <strong className="text-slate-200">
                {decisionCandidate.uncertaintyRating}
              </strong>
            </span>
            <span className="text-slate-500">
              Human judgment remains authoritative.
            </span>
          </div>
        </div>
      )}

      {/* Intervention Candidate Selectors (A, B, C, D, E, A+B) */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          TEST CANDIDATE INTERVENTIONS:
        </span>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { code: "A" as const, title: "A — SIGNAL", sub: "Extend Green" },
            { code: "B" as const, title: "B — DIVERSION", sub: "Reroute Flow" },
            { code: "C" as const, title: "C — RESTRICT", sub: "Heavy Vehicles" },
            { code: "D" as const, title: "D — METERING", sub: "Control Inflow" },
            { code: "E" as const, title: "E — EMERGENCY", sub: "Corridor Clear" },
            { code: "A+B" as const, title: "A + B COMBINED", sub: "Signal+Divert" },
          ].map((item) => {
            const isSelected = selectedCode === item.code;
            return (
              <button
                key={item.code}
                id={`btn-intervention-${item.code.toLowerCase().replace(/\+/g, "-")}`}
                onClick={() => handleCodeChange(item.code)}
                className={`p-2.5 rounded border text-left transition-all ${
                  isSelected
                    ? "bg-purple-950 border-purple-400 text-purple-200 ring-1 ring-purple-500/50 shadow-md"
                    : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850"
                }`}
              >
                <div className="font-bold text-xs">{item.title}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {item.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Intervention Configuration & Secondary Effects Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Intervention Parameters (Section 10) */}
        <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="text-xs font-bold text-white uppercase">
                {currentIntervention?.title}
              </span>
              <div className="text-[10px] text-slate-400">
                Target Node:{" "}
                <span className="text-cyan-300 font-bold">
                  {currentIntervention?.target}
                </span>
              </div>
            </div>

            <button
              id="toggle-modify-params-btn"
              onClick={() => setIsModifying(!isModifying)}
              className="py-1 px-2 text-[10px] rounded border border-slate-700 hover:border-slate-500 bg-slate-800 text-slate-300 font-semibold flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isModifying ? "Lock Parameters" : "Edit Parameters"}</span>
            </button>
          </div>

          {isModifying && (
            <div className="p-1.5 rounded bg-amber-950/70 border border-amber-500/50 text-[10px] text-amber-200 font-bold flex items-center justify-between">
              <span>PARAMETERS UNLOCKED FOR OPERATOR OVERRIDE</span>
              <span className="text-amber-400 font-mono">Adjust sliders below</span>
            </div>
          )}

          <div className="text-[11px] text-slate-300">
            {currentIntervention?.summary}
          </div>

          {/* Editable Parameters */}
          <div className="space-y-3 pt-1">
            {/* Green Phase Extension Slider */}
            {(selectedCode === "A" || selectedCode === "A+B" || selectedCode === "E") && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Green Extension:</span>
                  <span className="font-bold text-purple-300 font-mono">
                    {params.greenExtensionSec} seconds
                  </span>
                </div>
                <input
                  id="slider-green-extension"
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  disabled={!isModifying}
                  value={params.greenExtensionSec}
                  onChange={(e) =>
                    handleParamChange("greenExtensionSec", Number(e.target.value))
                  }
                  className="w-full accent-purple-500 cursor-pointer disabled:opacity-50"
                />
              </div>
            )}

            {/* Diversion Fraction Slider */}
            {(selectedCode === "B" || selectedCode === "A+B") && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Diversion Fraction:</span>
                  <span className="font-bold text-cyan-300 font-mono">
                    {params.diversionFractionPercent}%
                  </span>
                </div>
                <input
                  id="slider-diversion-fraction"
                  type="range"
                  min="10"
                  max="40"
                  step="5"
                  disabled={!isModifying}
                  value={params.diversionFractionPercent}
                  onChange={(e) =>
                    handleParamChange(
                      "diversionFractionPercent",
                      Number(e.target.value)
                    )
                  }
                  className="w-full accent-cyan-500 cursor-pointer disabled:opacity-50"
                />
              </div>
            )}

            {/* Inflow Metering Rate */}
            {selectedCode === "D" && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Metering Inflow Rate:</span>
                  <span className="font-bold text-amber-300 font-mono">
                    {params.meteringRateVehPerMin} veh/min
                  </span>
                </div>
                <input
                  id="slider-metering-rate"
                  type="range"
                  min="10"
                  max="30"
                  step="2"
                  disabled={!isModifying}
                  value={params.meteringRateVehPerMin}
                  onChange={(e) =>
                    handleParamChange(
                      "meteringRateVehPerMin",
                      Number(e.target.value)
                    )
                  }
                  className="w-full accent-amber-500 cursor-pointer disabled:opacity-50"
                />
              </div>
            )}

            {/* Duration Input */}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-400">Intervention Duration:</span>
              <span className="font-bold text-white font-mono">
                {params.durationSec} sec (3.0 min)
              </span>
            </div>
          </div>
        </div>

        {/* SECONDARY EFFECTS DETECTION (Section 12) */}
        <div
          id="secondary-effects-panel"
          className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-3"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              SECONDARY EFFECTS & DISPLACED RISKS
            </span>
            <ProvenanceTag status="SIMULATED" size="xs" />
          </div>

          <div className="space-y-2.5 pt-1">
            {/* Direct Positive Gain */}
            <div className="p-2.5 rounded border border-emerald-500/30 bg-emerald-950/20 text-xs space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                Direct Benefit
              </span>
              <div className="text-emerald-200 font-medium text-[11px]">
                {currentIntervention?.positiveImpact}
              </div>
            </div>

            {/* Potential Secondary Effect */}
            <div className="p-2.5 rounded border border-amber-500/40 bg-amber-950/25 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-400 font-bold uppercase">
                  Possible Displaced Problem
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {currentIntervention?.secondaryEffect.probabilityPercent}% PROBABILITY
                </span>
              </div>

              <div className="text-slate-200 text-[11px]">
                {currentIntervention?.secondaryEffect.description}
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span>
                  Displaced Location:{" "}
                  <strong className="text-rose-300">
                    {currentIntervention?.secondaryEffect.riskLocation}
                  </strong>
                </span>
                <span>
                  Severity Shift:{" "}
                  <strong className="text-amber-300">
                    {currentIntervention?.secondaryEffect.severityChange}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SCENARIO COMPARISON TABLE (Section 11) */}
      <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            SCENARIO MULTI-DIMENSIONAL COMPARISON
          </span>
          <ProvenanceTag status="SIMULATED" size="xs" />
        </div>

        <div className="overflow-x-auto pt-1">
          <table
            id="scenario-comparison-table"
            className="w-full text-left text-xs border-collapse"
          >
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                <th className="py-1.5 px-2">Dimension</th>
                <th className="py-1.5 px-2 text-rose-300">BASELINE</th>
                <th className="py-1.5 px-2 text-purple-300">A (SIGNAL)</th>
                <th className="py-1.5 px-2 text-cyan-300">B (DIVERT)</th>
                <th className="py-1.5 px-2 text-emerald-300 font-bold">A + B</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              <tr>
                <td className="py-1.5 px-2 text-slate-400">Affected Nodes</td>
                <td className="py-1.5 px-2 text-slate-200">{scenarioResults.BASELINE?.affectedNodes}</td>
                <td className="py-1.5 px-2 text-slate-200">{scenarioResults.A?.affectedNodes}</td>
                <td className="py-1.5 px-2 text-slate-200">{scenarioResults.B?.affectedNodes}</td>
                <td className="py-1.5 px-2 text-emerald-300 font-bold">{scenarioResults["A+B"]?.affectedNodes}</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 text-slate-400">Max Severity Index</td>
                <td className="py-1.5 px-2 text-rose-400 font-bold">{scenarioResults.BASELINE?.maxSeverity}</td>
                <td className="py-1.5 px-2 text-slate-200">{scenarioResults.A?.maxSeverity}</td>
                <td className="py-1.5 px-2 text-slate-200">{scenarioResults.B?.maxSeverity}</td>
                <td className="py-1.5 px-2 text-emerald-300 font-bold">{scenarioResults["A+B"]?.maxSeverity}</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 text-slate-400">Cascade Duration</td>
                <td className="py-1.5 px-2 text-slate-200">{scenarioResults.BASELINE?.cascadeDurationMinutes}m</td>
                <td className="py-1.5 px-2 text-slate-200">{scenarioResults.A?.cascadeDurationMinutes}m</td>
                <td className="py-1.5 px-2 text-slate-200">{scenarioResults.B?.cascadeDurationMinutes}m</td>
                <td className="py-1.5 px-2 text-emerald-300 font-bold">{scenarioResults["A+B"]?.cascadeDurationMinutes}m</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 text-slate-400">Recovery Time</td>
                <td className="py-1.5 px-2 text-slate-200">{scenarioResults.BASELINE?.recoveryTimeMinutes}m</td>
                <td className="py-1.5 px-2 text-slate-200">{scenarioResults.A?.recoveryTimeMinutes}m</td>
                <td className="py-1.5 px-2 text-slate-200">{scenarioResults.B?.recoveryTimeMinutes}m</td>
                <td className="py-1.5 px-2 text-emerald-300 font-bold">{scenarioResults["A+B"]?.recoveryTimeMinutes}m</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 text-slate-400">Emergency Route Delay</td>
                <td className="py-1.5 px-2 text-rose-400">+{scenarioResults.BASELINE?.emergencyImpactMinutes}m</td>
                <td className="py-1.5 px-2 text-slate-200">+{scenarioResults.A?.emergencyImpactMinutes}m</td>
                <td className="py-1.5 px-2 text-slate-200">+{scenarioResults.B?.emergencyImpactMinutes}m</td>
                <td className="py-1.5 px-2 text-emerald-300 font-bold">+{scenarioResults["A+B"]?.emergencyImpactMinutes}m</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 text-slate-400">Secondary Risk Prob</td>
                <td className="py-1.5 px-2 text-slate-400">--</td>
                <td className="py-1.5 px-2 text-amber-300">{scenarioResults.A?.secondaryRiskPercent}%</td>
                <td className="py-1.5 px-2 text-rose-400">{scenarioResults.B?.secondaryRiskPercent}%</td>
                <td className="py-1.5 px-2 text-amber-300 font-bold">{scenarioResults["A+B"]?.secondaryRiskPercent}%</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 text-slate-400">Travel-Time Impact</td>
                <td className="py-1.5 px-2 text-rose-400">+{scenarioResults.BASELINE?.travelTimeImpactPercent}%</td>
                <td className="py-1.5 px-2 text-emerald-400">{scenarioResults.A?.travelTimeImpactPercent}%</td>
                <td className="py-1.5 px-2 text-emerald-400">{scenarioResults.B?.travelTimeImpactPercent}%</td>
                <td className="py-1.5 px-2 text-emerald-300 font-bold">{scenarioResults["A+B"]?.travelTimeImpactPercent}%</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 text-slate-400">Simulation Uncertainty</td>
                <td className="py-1.5 px-2 text-slate-400">±{scenarioResults.BASELINE?.uncertaintyPercent}%</td>
                <td className="py-1.5 px-2 text-slate-400">±{scenarioResults.A?.uncertaintyPercent}%</td>
                <td className="py-1.5 px-2 text-slate-400">±{scenarioResults.B?.uncertaintyPercent}%</td>
                <td className="py-1.5 px-2 text-slate-400">±{scenarioResults["A+B"]?.uncertaintyPercent}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* HUMAN DECISION CONTROLS (Section 13) */}
      <div
        id="human-decision-controls-card"
        className="p-4 rounded-lg border border-cyan-500/50 bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 space-y-3 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>HUMAN OPERATOR AUTHORIZATION</span>
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              AURA Recommends:{" "}
              <span className="text-purple-300">
                {decisionCandidate.recommendationTitle}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded font-bold">
            HUMAN APPROVAL REQUIRED
          </div>
        </div>

        {/* Optional Operator Notes Input */}
        <div>
          <input
            id="operator-decision-notes-input"
            type="text"
            placeholder="Operator log notes (e.g. Authorized 180s green phase to prevent J6 block)..."
            value={operatorNotes}
            onChange={(e) => setOperatorNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Action Decision Buttons */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          <button
            id="operator-accept-btn"
            disabled={isSubmitting}
            onClick={() => handleAction("ACCEPTED")}
            className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded flex items-center justify-center gap-2 text-xs transition-colors shadow-lg shadow-emerald-950/50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ACCEPT PROPOSAL</span>
          </button>

          <button
            id="operator-modify-btn"
            disabled={isSubmitting}
            onClick={() => {
              if (!isModifying) {
                setIsModifying(true);
              } else {
                handleAction("MODIFIED");
              }
            }}
            className={`py-2.5 px-4 disabled:opacity-50 text-white font-bold rounded flex items-center justify-center gap-2 text-xs transition-all shadow-lg ${
              isModifying
                ? "bg-amber-600 hover:bg-amber-500 border border-amber-300 ring-2 ring-amber-500/40 animate-pulse shadow-amber-950"
                : "bg-amber-700 hover:bg-amber-600 shadow-amber-950/50"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{isModifying ? "SUBMIT MODIFIED PLAN" : "MODIFY PARAMS"}</span>
          </button>

          <button
            id="operator-reject-btn"
            disabled={isSubmitting}
            onClick={() => handleAction("REJECTED")}
            className="py-2.5 px-4 bg-rose-800 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded flex items-center justify-center gap-2 text-xs transition-colors shadow-lg shadow-rose-950/50"
          >
            <XCircle className="w-4 h-4" />
            <span>REJECT INTERVENTION</span>
          </button>
        </div>

        {/* Outcome feedback banner if action taken */}
        {lastAction && (
          <div
            id="last-operator-action-feedback"
            className="p-2.5 rounded border border-slate-700 bg-slate-950 text-xs flex items-center justify-between mt-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">[{lastAction.timestamp}]</span>
              <span className="font-bold text-cyan-300">
                Action: {lastAction.decision} ({lastAction.selectedInterventionCode})
              </span>
              <span className="text-slate-400">
                Outcome State:{" "}
                <strong className={lastAction.simulatedOutcomeState === "MITIGATED" ? "text-emerald-400" : "text-rose-400"}>
                  {lastAction.simulatedOutcomeState}
                </strong>
              </span>
            </div>
            <ProvenanceTag status="SIMULATED" size="xs" />
          </div>
        )}
      </div>
    </div>
  );
};
