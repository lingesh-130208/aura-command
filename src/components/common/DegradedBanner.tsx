import React from "react";
import { AlertCircle, AlertTriangle, ShieldAlert, X } from "lucide-react";

export type DegradedStateKey =
  | "NONE"
  | "DIGITAL_TWIN_UNAVAILABLE"
  | "TRAFFIC_PROVIDER_DEGRADED"
  | "AI_INFERENCE_OFFLINE"
  | "STALE_DATA"
  | "INSUFFICIENT_DATA";

interface DegradedBannerProps {
  activeDegradedState: DegradedStateKey;
  onDismiss?: () => void;
  onToggleState?: (state: DegradedStateKey) => void;
}

export const DEGRADED_STATE_CONFIGS: Record<
  DegradedStateKey,
  {
    title: string;
    description: string;
    impact: string;
    severity: "warning" | "error" | "info";
  }
> = {
  NONE: {
    title: "ALL SERVICES NOMINAL",
    description: "Digital twin, state estimator, and AI prediction clusters operating normally.",
    impact: "Full simulation & prediction capabilities active.",
    severity: "info",
  },
  DIGITAL_TWIN_UNAVAILABLE: {
    title: "DIGITAL TWIN UNAVAILABLE",
    description:
      "Live risk prediction remains available, but intervention simulation cannot currently be validated through SUMO micro-sim.",
    impact: "What-If intervention scenarios use fallback Kalman statistical projection.",
    severity: "error",
  },
  TRAFFIC_PROVIDER_DEGRADED: {
    title: "TRAFFIC DATA STREAM DEGRADED",
    description: "Direct camera feed sensor telemetry is experiencing 18% packet loss.",
    impact: "State estimation uncertainty widened to ±28%. Kalman reconstruction active.",
    severity: "warning",
  },
  AI_INFERENCE_OFFLINE: {
    title: "AI GRAPH INFERENCE ENGINE OFFLINE",
    description: "Neural network prediction pipeline failed to return 5-minute probabilistic horizon.",
    impact: "Reverted to deterministic deterministic time-to-spillback calculation.",
    severity: "error",
  },
  STALE_DATA: {
    title: "STALE TELEMETRY DETECTED",
    description: "Last sensor observation timestamp is > 45 seconds old for segments SEG-6-7 and SEG-7-8.",
    impact: "Predictions marked with elevated UNCERTAINTY flag.",
    severity: "warning",
  },
  INSUFFICIENT_DATA: {
    title: "INSUFFICIENT VEHICLE CLASSIFICATION DATA",
    description: "Vehicle class distribution cannot be verified for J1 and J4 entrance gates.",
    impact: "Vehicle mix values are strictly ESTIMATED from historical prior distributions.",
    severity: "warning",
  },
};

export const DegradedBanner: React.FC<DegradedBannerProps> = ({
  activeDegradedState,
  onDismiss,
  onToggleState,
}) => {
  if (activeDegradedState === "NONE") return null;

  const config = DEGRADED_STATE_CONFIGS[activeDegradedState];
  const isError = config.severity === "error";

  return (
    <div
      id="degraded-system-banner"
      className={`px-4 py-2 border-b flex items-center justify-between gap-3 text-xs ${
        isError
          ? "bg-rose-950/80 border-rose-500/60 text-rose-200"
          : "bg-amber-950/80 border-amber-500/60 text-amber-200"
      }`}
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        {isError ? (
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        )}
        <div className="font-mono font-bold tracking-wider uppercase shrink-0">
          [{config.title}]
        </div>
        <div className="truncate text-slate-300 font-medium">
          {config.description}
        </div>
        <div className="hidden lg:inline text-slate-400 font-mono text-[11px] truncate">
          Impact: {config.impact}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onToggleState && (
          <select
            id="degraded-state-selector"
            value={activeDegradedState}
            onChange={(e) => onToggleState(e.target.value as DegradedStateKey)}
            className="bg-slate-900 border border-slate-700 text-[11px] rounded px-2 py-0.5 text-slate-200 focus:outline-none"
          >
            <option value="NONE">Clear Error State</option>
            <option value="DIGITAL_TWIN_UNAVAILABLE">Simulate Digital Twin Down</option>
            <option value="TRAFFIC_PROVIDER_DEGRADED">Simulate Data Stream Degraded</option>
            <option value="AI_INFERENCE_OFFLINE">Simulate AI Offline</option>
            <option value="STALE_DATA">Simulate Stale Data</option>
            <option value="INSUFFICIENT_DATA">Simulate Insufficient Data</option>
          </select>
        )}
        {onDismiss && (
          <button
            id="dismiss-degraded-banner-btn"
            onClick={onDismiss}
            className="p-1 hover:bg-slate-800/80 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Dismiss warning"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
