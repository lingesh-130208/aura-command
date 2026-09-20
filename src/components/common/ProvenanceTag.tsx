import React from "react";
import { DataProvenance } from "../../types/traffic";
import { Eye, Cpu, TrendingUp, FlaskConical, HelpCircle } from "lucide-react";

interface ProvenanceTagProps {
  status: DataProvenance;
  size?: "xs" | "sm" | "md";
  showIcon?: boolean;
}

export const ProvenanceTag: React.FC<ProvenanceTagProps> = ({
  status,
  size = "xs",
  showIcon = true,
}) => {
  const config = {
    OBSERVED: {
      label: "OBSERVED",
      icon: Eye,
      bg: "bg-emerald-950/70 border-emerald-500/40 text-emerald-300",
      indicator: "bg-emerald-400",
      tooltip: "Direct physical sensor observation (cameras, induction loops, radar)",
    },
    ESTIMATED: {
      label: "ESTIMATED",
      icon: Cpu,
      bg: "bg-sky-950/70 border-sky-500/40 text-sky-300",
      indicator: "bg-sky-400",
      tooltip: "Reconstructed state estimation from adjacent sensors & Kalman filter",
    },
    PREDICTED: {
      label: "PREDICTED",
      icon: TrendingUp,
      bg: "bg-amber-950/70 border-amber-500/40 text-amber-300",
      indicator: "bg-amber-400",
      tooltip: "Probabilistic forward horizon forecast from AURA AI engine",
    },
    SIMULATED: {
      label: "SIMULATED",
      icon: FlaskConical,
      bg: "bg-purple-950/70 border-purple-500/40 text-purple-300",
      indicator: "bg-purple-400",
      tooltip: "Digital twin / micro-simulation what-if test outcome",
    },
    UNKNOWN: {
      label: "UNKNOWN",
      icon: HelpCircle,
      bg: "bg-slate-900 border-slate-700 text-slate-400",
      indicator: "bg-slate-500",
      tooltip: "Data unavailable or sensor stream disrupted",
    },
  }[status] || {
    label: status,
    icon: HelpCircle,
    bg: "bg-slate-900 border-slate-700 text-slate-400",
    indicator: "bg-slate-500",
    tooltip: "Unspecified source",
  };

  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.5 tracking-wider gap-1",
    sm: "text-xs px-2 py-0.5 tracking-wider gap-1.5",
    md: "text-xs px-2.5 py-1 tracking-wider gap-1.5 font-medium",
  }[size];

  const IconComponent = config.icon;

  return (
    <span
      id={`provenance-${status.toLowerCase()}-${Math.random().toString(36).substr(2, 4)}`}
      title={config.tooltip}
      className={`inline-flex items-center font-mono uppercase rounded border font-semibold select-none ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.indicator}`} />
      {showIcon && <IconComponent className="w-3 h-3 shrink-0 opacity-80" />}
      <span>{config.label}</span>
    </span>
  );
};
