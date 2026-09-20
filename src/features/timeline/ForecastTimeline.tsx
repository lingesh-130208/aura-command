import React from "react";
import { CascadeEvent } from "../../types/traffic";
import { ProvenanceTag } from "../../components/common/ProvenanceTag";
import { StatusPill } from "../../components/common/StatusPill";
import { Clock, ChevronRight, AlertCircle, Sparkles } from "lucide-react";

interface ForecastTimelineProps {
  events: CascadeEvent[];
  selectedEventId: string | null;
  onSelectEvent: (event: CascadeEvent) => void;
  isMitigated?: boolean;
}

export const ForecastTimeline: React.FC<ForecastTimelineProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  isMitigated = false,
}) => {
  return (
    <div
      id="forecast-cascade-timeline"
      className="h-28 border-t border-slate-800 bg-[#080d16] px-4 py-2.5 flex flex-col justify-between shrink-0 select-none font-mono z-20"
    >
      {/* Timeline Header */}
      <div className="flex items-center justify-between text-xs mb-1.5">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            FORECAST TIMELINE & FAILURE PROPAGATION HORIZON
          </span>
          <ProvenanceTag status="PREDICTED" size="xs" />
          {isMitigated && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
              MITIGATION ACTIVE — CASCADE DEFUSED
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span>T+0 (NOW) → T+15m UNMITIGATED TRAJECTORY</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400">CLICK EVENT TO INSPECT NODE</span>
        </div>
      </div>

      {/* Visual Timeline Rail */}
      <div className="relative flex items-center justify-between w-full h-14 overflow-x-auto gap-3 py-1">
        {/* Continuous background connector bar */}
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 z-0" />
        <div
          className={`absolute left-8 top-1/2 -translate-y-1/2 h-0.5 z-0 transition-all duration-700 ${
            isMitigated
              ? "bg-gradient-to-r from-emerald-500 to-sky-500 w-full"
              : "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 w-3/4"
          }`}
        />

        {/* Origin / NOW indicator */}
        <div className="relative z-10 flex flex-col items-center shrink-0">
          <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <span className="text-[10px] font-bold text-cyan-300 mt-1">NOW</span>
        </div>

        {/* Milestone event cards */}
        {events.map((ev, idx) => {
          const isSelected = selectedEventId === ev.id;
          const isLast = idx === events.length - 1;

          return (
            <div
              key={ev.id}
              id={`timeline-node-${ev.id.toLowerCase()}`}
              onClick={() => onSelectEvent(ev)}
              className={`relative z-10 flex flex-col items-center cursor-pointer group transition-all shrink-0 ${
                isSelected ? "scale-105" : "hover:scale-102"
              }`}
            >
              {/* Event card badge */}
              <div
                className={`px-2.5 py-1 rounded border shadow-md flex items-center gap-2 transition-colors ${
                  isSelected
                    ? "bg-cyan-950 border-cyan-400 text-white shadow-cyan-900/40"
                    : ev.status === "MITIGATED"
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                    : ev.severity === "CRITICAL"
                    ? "bg-rose-950/70 border-rose-500/50 text-rose-200"
                    : ev.severity === "HIGH_RISK"
                    ? "bg-orange-950/70 border-orange-500/50 text-orange-200"
                    : "bg-slate-900 border-slate-700 text-slate-300"
                }`}
              >
                {/* Time badge */}
                <span className="text-[10px] font-bold font-mono px-1 py-0.2 bg-black/40 rounded text-cyan-300">
                  {ev.predictedTime}
                </span>

                {/* Event Name */}
                <div className="text-left">
                  <div className="text-[11px] font-bold truncate max-w-[130px]">
                    {ev.title}
                  </div>
                  <div className="text-[9px] text-slate-400 flex items-center gap-1">
                    <span>{ev.junctionName.split(" ")[0]}</span>
                    <span>•</span>
                    <span className="text-amber-300">{ev.probabilityPercent}%</span>
                  </div>
                </div>
              </div>

              {/* Node connector dot on the rail */}
              <div
                className={`w-2.5 h-2.5 rounded-full mt-1 border transition-all ${
                  isSelected
                    ? "bg-cyan-400 border-white ring-2 ring-cyan-500/50"
                    : ev.severity === "CRITICAL"
                    ? "bg-rose-500 border-rose-900"
                    : ev.severity === "HIGH_RISK"
                    ? "bg-orange-500 border-orange-900"
                    : "bg-amber-500 border-amber-900"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
