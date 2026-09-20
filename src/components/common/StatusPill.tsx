import React from "react";
import { TrafficSeverity } from "../../types/traffic";
import { CheckCircle2, AlertTriangle, AlertOctagon, Flame, Ban, HelpCircle } from "lucide-react";

interface StatusPillProps {
  status: TrafficSeverity;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  size = "sm",
  showLabel = true,
}) => {
  const config = {
    NORMAL: {
      label: "NORMAL",
      icon: CheckCircle2,
      textColor: "text-emerald-300",
      bgColor: "bg-emerald-950/60",
      borderColor: "border-emerald-500/40",
      dotColor: "bg-emerald-400",
      subtext: "Free flow",
    },
    DETERIORATING: {
      label: "DETERIORATING",
      icon: AlertTriangle,
      textColor: "text-amber-300",
      bgColor: "bg-amber-950/60",
      borderColor: "border-amber-500/50",
      dotColor: "bg-amber-400",
      subtext: "Queue accumulating",
    },
    HIGH_RISK: {
      label: "HIGH RISK",
      icon: AlertOctagon,
      textColor: "text-orange-300",
      bgColor: "bg-orange-950/70",
      borderColor: "border-orange-500/60",
      dotColor: "bg-orange-400 animate-pulse",
      subtext: "Spillback imminent",
    },
    CRITICAL: {
      label: "CRITICAL",
      icon: Flame,
      textColor: "text-rose-200",
      bgColor: "bg-rose-950/80",
      borderColor: "border-rose-500/70",
      dotColor: "bg-rose-400 animate-ping",
      subtext: "Gridlock threshold",
    },
    DEGRADED: {
      label: "DEGRADED",
      icon: Ban,
      textColor: "text-slate-300",
      bgColor: "bg-slate-900",
      borderColor: "border-slate-600",
      dotColor: "bg-slate-400",
      subtext: "Sensor stream degraded",
    },
    NO_DATA: {
      label: "NO DATA",
      icon: HelpCircle,
      textColor: "text-slate-400",
      bgColor: "bg-slate-950",
      borderColor: "border-slate-800",
      dotColor: "bg-slate-600",
      subtext: "Signal offline",
    },
  }[status] || {
    label: status,
    icon: HelpCircle,
    textColor: "text-slate-300",
    bgColor: "bg-slate-900",
    borderColor: "border-slate-700",
    dotColor: "bg-slate-400",
    subtext: "",
  };

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 gap-1.5",
    md: "text-xs px-2.5 py-1 gap-2 font-medium",
    lg: "text-sm px-3 py-1.5 gap-2.5 font-semibold",
  }[size];

  const IconComp = config.icon;

  return (
    <span
      id={`status-pill-${status.toLowerCase()}`}
      className={`inline-flex items-center rounded border font-mono uppercase tracking-wide shrink-0 ${config.bgColor} ${config.borderColor} ${config.textColor} ${sizeClasses}`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${config.dotColor}`} />
      <IconComp className="w-3.5 h-3.5 shrink-0" />
      {showLabel && <span className="font-semibold">{config.label}</span>}
    </span>
  );
};
