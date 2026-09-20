import React from "react";
import { DataProvenance } from "../../types/traffic";
import { ProvenanceTag } from "./ProvenanceTag";

interface MetricBoxProps {
  id?: string;
  label: string;
  value: string | number;
  unit?: string;
  provenance: DataProvenance;
  subtext?: string;
  trend?: "up" | "down" | "stable";
  alert?: boolean;
}

export const MetricBox: React.FC<MetricBoxProps> = ({
  id,
  label,
  value,
  unit,
  provenance,
  subtext,
  alert = false,
}) => {
  return (
    <div
      id={id || `metric-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
      className={`p-2.5 rounded border bg-slate-900/80 transition-colors ${
        alert
          ? "border-amber-500/50 bg-amber-950/20"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
          {label}
        </span>
        <ProvenanceTag status={provenance} size="xs" showIcon={false} />
      </div>

      <div className="flex items-baseline gap-1.5">
        <span
          className={`font-mono text-xl font-bold tracking-tight ${
            alert ? "text-amber-300" : "text-slate-100"
          }`}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-slate-400 font-medium">
            {unit}
          </span>
        )}
      </div>

      {subtext && (
        <div className="text-[10px] text-slate-500 mt-1 font-mono truncate">
          {subtext}
        </div>
      )}
    </div>
  );
};
