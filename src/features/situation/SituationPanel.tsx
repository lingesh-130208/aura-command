import React, { useState } from "react";
import {
  Prediction,
  JunctionNode,
  VehicleMixBreakdown,
  TrafficSeverity,
} from "../../types/traffic";
import { ProvenanceTag } from "../../components/common/ProvenanceTag";
import { StatusPill } from "../../components/common/StatusPill";
import { AI_REASONING_J7 } from "../../data/corridorData";
import {
  AlertTriangle,
  Flame,
  GitFork,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  Brain,
  Car,
  Bike,
  Bus,
  Truck,
  Sparkles,
} from "lucide-react";

interface SituationPanelProps {
  primaryPrediction: Prediction;
  allPredictions: Prediction[];
  selectedJunction: JunctionNode;
  onExploreCascade: () => void;
  onSelectPredictionTarget: (targetId: string) => void;
  onOpenWhatIf: () => void;
}

export const SituationPanel: React.FC<SituationPanelProps> = ({
  primaryPrediction,
  allPredictions,
  selectedJunction,
  onExploreCascade,
  onSelectPredictionTarget,
  onOpenWhatIf,
}) => {
  const [activeTab, setActiveTab] = useState<"ACTIVE_FAILURE" | "RISK_FORECAST" | "REASONING" | "VEHICLE_MIX">("ACTIVE_FAILURE");

  return (
    <div
      id="aura-situation-panel"
      className="w-96 border-l border-slate-800 bg-[#0a0f18] flex flex-col h-full shrink-0 select-none overflow-hidden font-mono"
    >
      {/* Top Header & Tab Navigation */}
      <div className="border-b border-slate-800 bg-[#0d131f] p-3 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>INTELLIGENCE & SITUATION</span>
          </div>
          <ProvenanceTag status="PREDICTED" size="xs" />
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-4 gap-1 text-[10px]">
          <button
            id="tab-active-failure"
            onClick={() => setActiveTab("ACTIVE_FAILURE")}
            className={`py-1 rounded text-center font-semibold transition-colors ${
              activeTab === "ACTIVE_FAILURE"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            ACTIVE
          </button>
          <button
            id="tab-risk-forecast"
            onClick={() => setActiveTab("RISK_FORECAST")}
            className={`py-1 rounded text-center font-semibold transition-colors ${
              activeTab === "RISK_FORECAST"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            RISKS
          </button>
          <button
            id="tab-reasoning"
            onClick={() => setActiveTab("REASONING")}
            className={`py-1 rounded text-center font-semibold transition-colors ${
              activeTab === "REASONING"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            WHY J7?
          </button>
          <button
            id="tab-vehicle-mix"
            onClick={() => setActiveTab("VEHICLE_MIX")}
            className={`py-1 rounded text-center font-semibold transition-colors ${
              activeTab === "VEHICLE_MIX"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            VEHICLES
          </button>
        </div>
      </div>

      {/* Content scroll area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* TAB 1: DEVELOPING TRAFFIC FAILURE (Section 6) */}
        {activeTab === "ACTIVE_FAILURE" && (
          <div className="space-y-3">
            {/* Primary Incident Alert Card */}
            <div
              id="developing-traffic-failure-card"
              className="p-3 rounded-lg border border-amber-500/40 bg-gradient-to-b from-amber-950/40 to-slate-900/90 text-xs space-y-2.5 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  DEVELOPING TRAFFIC FAILURE
                </span>
                <StatusPill status="HIGH_RISK" size="sm" />
              </div>

              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex justify-between items-baseline border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-bold text-white">
                    {primaryPrediction.targetName}
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Primary issue:</span>
                  <span className="font-bold text-amber-200">
                    {primaryPrediction.primaryIssue}
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Current state:</span>
                  <span className="text-amber-400 font-semibold uppercase">
                    DETERIORATING (23 km/h)
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Predicted event:</span>
                  <span className="font-bold text-rose-400">
                    {primaryPrediction.eventType}
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Probability:</span>
                  <span className="font-mono text-base font-bold text-amber-300">
                    {Math.round(primaryPrediction.probability * 100)}%
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Likely time:</span>
                  <span className="font-bold text-cyan-300">
                    {primaryPrediction.timeWindow}
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Potential impact:</span>
                  <span className="font-bold text-rose-300">
                    {primaryPrediction.potentialImpact}
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-slate-400">Severity:</span>
                  <span className="font-bold text-orange-400 uppercase">
                    HIGH
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  id="explore-cascade-btn"
                  onClick={onExploreCascade}
                  className="py-2 px-2.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 rounded text-cyan-200 font-bold transition-colors flex items-center justify-center gap-1.5 text-[11px]"
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Explore Cascade</span>
                </button>
                <button
                  id="intervene-btn"
                  onClick={onOpenWhatIf}
                  className="py-2 px-2.5 bg-purple-950 hover:bg-purple-900 border border-purple-500/50 rounded text-purple-200 font-bold transition-colors flex items-center justify-center gap-1.5 text-[11px]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>What-If Intervene</span>
                </button>
              </div>
            </div>

            {/* Downstream Storage Warning */}
            <div className="p-2.5 rounded border border-slate-800 bg-slate-900/70 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  RESERVOIR CAPACITY SATURATION
                </span>
                <span className="text-amber-400 font-bold">86%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: "86%" }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                <span>Deceleration buffer: 36m remaining</span>
                <span className="text-rose-400 font-semibold">
                  Spillback onset: ~3.5m
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI RISK PANEL (Section 7) */}
        {activeTab === "RISK_FORECAST" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-200 uppercase">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI RISK FORECAST</span>
              </div>
              <ProvenanceTag status="PREDICTED" size="xs" />
            </div>

            {/* Ranked risks list */}
            <div className="space-y-2">
              {allPredictions.map((pred, index) => {
                const rank = String(index + 1).padStart(2, "0");
                const percent = Math.round(pred.probability * 100);

                return (
                  <div
                    key={pred.id}
                    id={`risk-card-${pred.targetId.toLowerCase()}`}
                    onClick={() => onSelectPredictionTarget(pred.targetId)}
                    className="p-2.5 rounded border border-slate-800 hover:border-cyan-500/50 bg-slate-900/80 cursor-pointer transition-all hover:bg-slate-850 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-bold text-sm">
                          {rank}
                        </span>
                        <span className="font-bold text-white">
                          {pred.targetId}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {pred.targetName.split("—")[1]?.trim() || pred.targetName}
                        </span>
                      </div>
                      <StatusPill status={pred.severity} size="sm" />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-rose-300 font-bold tracking-wide text-[11px]">
                        {pred.eventType}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-300 font-bold font-mono text-sm">
                          {percent}%
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {pred.timeWindow}
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 truncate">
                      Impact: {pred.potentialImpact}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Visible Note Mandated by Prompt Section 7 */}
            <div className="p-2.5 rounded border border-slate-800/80 bg-slate-950/80 text-[10px] text-slate-400 leading-normal">
              <div className="flex items-center gap-1 font-semibold text-slate-300 mb-0.5">
                <HelpCircle className="w-3 h-3 text-cyan-400" />
                <span>PROBABILISTIC FORECAST NOTICE</span>
              </div>
              Predictions are probabilistic and may change as new observations
              arrive. Not guaranteed certainty.
            </div>
          </div>
        )}

        {/* TAB 3: AI REASONING / EXPLANATION (Section 21) */}
        {activeTab === "REASONING" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs font-bold text-purple-300 uppercase">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>{AI_REASONING_J7.title}</span>
              </div>
              <ProvenanceTag status="PREDICTED" size="xs" />
            </div>

            <div className="text-[11px] text-slate-400 leading-tight">
              {AI_REASONING_J7.subtitle}
            </div>

            {/* Structured 5 points */}
            <div className="space-y-2 pt-1">
              {AI_REASONING_J7.points.map((point, i) => (
                <div
                  key={i}
                  className="p-2 rounded border border-slate-800/80 bg-slate-900/60 text-[11px] flex items-start gap-2.5"
                >
                  <span className="font-mono font-bold text-cyan-400 shrink-0 w-4">
                    {i + 1}.
                  </span>
                  <span className="text-slate-200 leading-snug">{point}</span>
                </div>
              ))}
            </div>

            {/* Structured demo disclaimer note */}
            <div className="p-2 rounded border border-purple-500/30 bg-purple-950/20 text-[10px] text-purple-300 leading-normal">
              {AI_REASONING_J7.notice}
            </div>
          </div>
        )}

        {/* TAB 4: VEHICLE MIX (Section 20) */}
        {activeTab === "VEHICLE_MIX" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase flex items-center gap-1.5">
                VEHICLE COMPOSITION: {selectedJunction.id}
              </span>
              <ProvenanceTag status="ESTIMATED" size="xs" />
            </div>

            <div className="text-[10px] text-slate-400">
              Distribution estimated from upstream radar loop classification (5-min window).
            </div>

            {/* Vehicle Mix Rows */}
            <div className="space-y-2 pt-1">
              {[
                {
                  code: "2W",
                  name: "Two-Wheelers / Motorcycles",
                  percent: selectedJunction.vehicleMix.twoWheelerPercent,
                  color: "bg-emerald-500",
                  icon: Bike,
                },
                {
                  code: "AUTO",
                  name: "Auto-Rickshaws / Para-transit",
                  percent: selectedJunction.vehicleMix.autoRickshawPercent,
                  color: "bg-amber-500",
                  icon: Bike,
                },
                {
                  code: "CAR",
                  name: "Passenger Cars / Taxis",
                  percent: selectedJunction.vehicleMix.carPercent,
                  color: "bg-sky-500",
                  icon: Car,
                },
                {
                  code: "BUS",
                  name: "Transit / City Buses",
                  percent: selectedJunction.vehicleMix.busPercent,
                  color: "bg-purple-500",
                  icon: Bus,
                },
                {
                  code: "HGV",
                  name: "Heavy Goods Vehicles / Trucks",
                  percent: selectedJunction.vehicleMix.heavyGoodsPercent,
                  color: "bg-rose-500",
                  icon: Truck,
                },
              ].map((v) => {
                const IconComp = v.icon;
                return (
                  <div
                    key={v.code}
                    className="p-2 rounded border border-slate-800 bg-slate-900/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <IconComp className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-200">
                          {v.code}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({v.name})
                        </span>
                      </div>
                      <span className="font-bold font-mono text-white">
                        {v.percent}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`${v.color} h-1.5 rounded-full`}
                        style={{ width: `${v.percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-2 rounded border border-slate-800 bg-slate-950 text-[10px] text-slate-400 font-mono">
              STATUS: <span className="text-sky-300 font-bold">ESTIMATED</span>
              <p className="mt-0.5">
                Prototype uses synthetic priors; real production binds via roadside edge AI classifiers.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
