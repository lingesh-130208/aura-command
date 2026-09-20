import React from "react";
import { Cascade, CascadeEvent } from "../../types/traffic";
import { ProvenanceTag } from "../../components/common/ProvenanceTag";
import { StatusPill } from "../../components/common/StatusPill";
import {
  GitFork,
  ArrowDown,
  Clock,
  Zap,
  Target,
  AlertOctagon,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface CascadeExplorerProps {
  cascade: Cascade;
  selectedEventId: string | null;
  onSelectEvent: (event: CascadeEvent) => void;
  onJumpToWhatIf: () => void;
  isMitigated?: boolean;
}

export const CascadeExplorer: React.FC<CascadeExplorerProps> = ({
  cascade,
  selectedEventId,
  onSelectEvent,
  onJumpToWhatIf,
  isMitigated = false,
}) => {
  return (
    <div
      id="cascade-explorer-view"
      className="p-4 bg-[#0a0f18] flex flex-col h-full overflow-y-auto font-mono text-xs select-none space-y-4"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              CASCADE PROPAGATION GRAPH EXPLORER
            </h2>
            <ProvenanceTag status="PREDICTED" size="xs" />
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Root Junction: <span className="text-amber-300 font-bold">{cascade.rootJunctionId}</span> • 
            Unmitigated Cascade Duration: <span className="text-rose-400 font-bold">{cascade.unmitigatedDurationMin} min</span> • 
            Gridlock Risk: <span className="text-rose-300 font-bold">{cascade.estimatedGridlockRiskPercent}%</span>
          </div>
        </div>

        <button
          id="cascade-mitigate-btn"
          onClick={onJumpToWhatIf}
          className="py-1.5 px-3 bg-purple-900/60 hover:bg-purple-800 border border-purple-500/50 rounded text-purple-200 font-bold transition-colors flex items-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5 text-purple-300" />
          <span>SIMULATE INTERVENTIONS</span>
        </button>
      </div>

      {/* Interactive Propagation Chain */}
      <div className="max-w-3xl mx-auto w-full space-y-3 py-2">
        {cascade.events.map((ev, index) => {
          const isSelected = selectedEventId === ev.id;
          const nextRel = cascade.relationships.find(
            (r) => r.sourceEventId === ev.id
          );

          return (
            <React.Fragment key={ev.id}>
              {/* Event Card */}
              <div
                id={`cascade-card-${ev.id.toLowerCase()}`}
                onClick={() => onSelectEvent(ev)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer shadow-lg ${
                  isSelected
                    ? "bg-slate-900 border-cyan-400 ring-1 ring-cyan-500/40"
                    : ev.status === "MITIGATED"
                    ? "bg-emerald-950/40 border-emerald-500/30 hover:border-emerald-500/60"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      {ev.id}
                    </span>
                    <h3 className="font-bold text-white text-sm">
                      {ev.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      @{ev.junctionName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded">
                      {ev.probabilityPercent}% PROB
                    </span>
                    <StatusPill status={ev.severity} size="sm" />
                  </div>
                </div>

                <div className="text-slate-300 text-[11px] leading-relaxed mb-2">
                  {ev.description}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span>
                      Predicted Horizon:{" "}
                      <strong className="text-cyan-300">{ev.predictedTime}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Classification:{" "}
                      <strong className="text-slate-200">{ev.eventType}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-cyan-400 font-semibold hover:underline">
                    <Target className="w-3 h-3" />
                    <span>Click to highlight {ev.junctionId} on Map</span>
                  </div>
                </div>
              </div>

              {/* Transition Link / Relationship between events */}
              {nextRel && (
                <div className="flex flex-col items-center py-1">
                  <div className="h-3 w-0.5 bg-slate-700" />
                  <div className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 flex items-center gap-2 shadow-inner">
                    <ArrowDown className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-slate-400 uppercase">
                      RELATIONSHIP:
                    </span>
                    <span className="font-bold text-rose-300">
                      {nextRel.relationship}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400">PROPAGATION DELAY:</span>
                    <span className="font-bold text-amber-300">
                      {nextRel.delaySeconds} SEC
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400">PROB:</span>
                    <span className="font-bold text-white">
                      {Math.round(nextRel.probability * 100)}%
                    </span>
                  </div>
                  <div className="h-3 w-0.5 bg-slate-700" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Footer explanation */}
      <div className="p-3 rounded border border-slate-800 bg-slate-950/70 text-[11px] text-slate-400 leading-normal max-w-3xl mx-auto w-full">
        <span className="font-bold text-slate-300">
          CASCADE MODEL TOPOLOGY:
        </span>{" "}
        Directed Acyclic Graph (DAG) simulated from downstream roadway storage
        curves and queue accumulation gradients. Demonstrates time-dependent
        multi-junction locking.
      </div>
    </div>
  );
};
