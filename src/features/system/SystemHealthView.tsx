import React from "react";
import { SystemStatus, ServiceHealth } from "../../types/traffic";
import { ProvenanceTag } from "../../components/common/ProvenanceTag";
import { DegradedStateKey, DEGRADED_STATE_CONFIGS } from "../../components/common/DegradedBanner";
import {
  ShieldCheck,
  Server,
  Activity,
  Cpu,
  Database,
  Radio,
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface SystemHealthViewProps {
  systemStatus: SystemStatus;
  activeDegradedState: DegradedStateKey;
  onSetDegradedState: (state: DegradedStateKey) => void;
}

export const SystemHealthView: React.FC<SystemHealthViewProps> = ({
  systemStatus,
  activeDegradedState,
  onSetDegradedState,
}) => {
  return (
    <div
      id="system-health-view"
      className="p-4 bg-[#0a0f18] flex flex-col h-full overflow-y-auto font-mono text-xs select-none space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              AURA SYSTEM SUBSYSTEM HEALTH & INTEGRATION BUS
            </h2>
            <ProvenanceTag status="OBSERVED" size="xs" />
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Operational Mode: <span className="text-amber-300 font-bold">{systemStatus.mode}</span> • 
            Telemetry Freshness: <span className="text-cyan-300 font-bold">{systemStatus.dataFreshnessSecondsAgo}s ago</span> • 
            Subsystems: <span className="text-emerald-300 font-bold">7 / 7 AVAILABLE</span>
          </div>
        </div>

        {/* Degraded State Interactive Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 uppercase">
            SIMULATE FAULT:
          </span>
          <select
            id="simulate-fault-selector"
            value={activeDegradedState}
            onChange={(e) => onSetDegradedState(e.target.value as DegradedStateKey)}
            className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
          >
            <option value="NONE">Nominal (All Healthy)</option>
            <option value="DIGITAL_TWIN_UNAVAILABLE">Digital Twin Unavailable</option>
            <option value="TRAFFIC_PROVIDER_DEGRADED">Traffic Provider Stream Degraded</option>
            <option value="AI_INFERENCE_OFFLINE">AI Inference Offline</option>
            <option value="STALE_DATA">Stale Sensor Telemetry</option>
            <option value="INSUFFICIENT_DATA">Insufficient Classification Data</option>
          </select>
        </div>
      </div>

      {/* Services Grid (Section 17) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {systemStatus.services.map((svc) => {
          const isFaulty =
            (activeDegradedState === "DIGITAL_TWIN_UNAVAILABLE" && svc.key === "digital_twin") ||
            (activeDegradedState === "TRAFFIC_PROVIDER_DEGRADED" && svc.key === "traffic_data") ||
            (activeDegradedState === "AI_INFERENCE_OFFLINE" && svc.key === "ai_inference");

          const status = isFaulty ? "DEGRADED" : svc.status;

          return (
            <div
              key={svc.key}
              id={`service-health-${svc.key}`}
              className={`p-3.5 rounded-lg border transition-all ${
                isFaulty
                  ? "bg-rose-950/40 border-rose-500/50"
                  : "bg-slate-900/80 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-xs">
                  {svc.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    status === "AVAILABLE"
                      ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                      : "bg-rose-950 text-rose-300 border-rose-500/50 animate-pulse"
                  }`}
                >
                  {status}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 leading-tight mb-2">
                {svc.notes}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                <span>Latency: <strong className="text-cyan-300">{svc.latencyMs}ms</strong></span>
                <span>Heartbeat: <strong className="text-slate-300">{svc.lastHeartbeat}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Architecture Topology Callout (Section 32) */}
      <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/60 space-y-3">
        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          FUTURE BACKEND ARCHITECTURE ALIGNMENT
        </span>

        <div className="p-3 bg-[#070c14] border border-slate-800 rounded text-[11px] font-mono leading-relaxed text-slate-300">
          <div className="text-cyan-400 font-bold mb-1">
            AURA COMMAND (Control Room Frontend)
          </div>
          <div className="text-slate-500">↓ REST / WebSockets</div>
          <div className="text-slate-200">
            FastAPI Gateway ──→ State Reconstruction Engine (Kalman Filter)
          </div>
          <div className="text-slate-500">↓</div>
          <div className="text-purple-300">
            AI Graph Neural Net Inference (Failure & Spillback Horizon)
          </div>
          <div className="text-slate-500">↓</div>
          <div className="text-amber-300">
            Cascade Propagation Graph Engine (DAG Delays)
          </div>
          <div className="text-slate-500">↓</div>
          <div className="text-sky-300">
            Digital Twin Simulation (SUMO Micro-Simulation Clusters)
          </div>
          <div className="text-slate-500">↓</div>
          <div className="text-emerald-300 font-bold">
            Decision Recommendation Engine (Human Operator in the Loop)
          </div>
        </div>

        <p className="text-[10px] text-slate-400 leading-normal">
          The frontend strictly decouples presentation from simulation math. In production, mock services in <code className="text-slate-300">src/services/mockApi.ts</code> will directly connect to FastAPI endpoints and real-time WebSockets without UI rewrites.
        </p>
      </div>
    </div>
  );
};
