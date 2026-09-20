import React from "react";
import { EmergencyCorridorState } from "../../types/traffic";
import { ProvenanceTag } from "../../components/common/ProvenanceTag";
import { StatusPill } from "../../components/common/StatusPill";
import {
  Ambulance,
  Shield,
  ShieldCheck,
  Clock,
  AlertTriangle,
  ArrowRight,
  Hospital,
  Flame,
  Radio,
} from "lucide-react";

interface EmergencyCorridorPanelProps {
  corridor: EmergencyCorridorState;
  onToggleProtect: (active: boolean) => void;
}

export const EmergencyCorridorPanel: React.FC<EmergencyCorridorPanelProps> = ({
  corridor,
  onToggleProtect,
}) => {
  return (
    <div
      id="emergency-corridor-view"
      className="p-4 bg-[#0a0f18] flex flex-col h-full overflow-y-auto font-mono text-xs select-none space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Ambulance className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              EMERGENCY CORRIDOR INTELLIGENCE
            </h2>
            <ProvenanceTag status="SIMULATED" size="xs" />
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Active Priority Route: <span className="text-emerald-300 font-bold">{corridor.name}</span>
          </div>
        </div>

        {/* Protection Toggle Button */}
        <button
          id="protect-emergency-corridor-btn"
          onClick={() => onToggleProtect(!corridor.protectionActive)}
          className={`py-2 px-4 rounded font-bold transition-all flex items-center gap-2 text-xs border ${
            corridor.protectionActive
              ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-900/50"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700"
          }`}
        >
          {corridor.protectionActive ? (
            <>
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>CORRIDOR PROTECTED (ACTIVE)</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>PROTECT EMERGENCY CORRIDOR</span>
            </>
          )}
        </button>
      </div>

      {/* Critical Vehicle Mission Card */}
      <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">
              {corridor.activeVehicle.callSign}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40 font-bold">
              {corridor.activeVehicle.type}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <StatusPill status={corridor.corridorStatus === "CLEAR" ? "NORMAL" : "HIGH_RISK"} size="sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] pt-1">
          <div className="p-2.5 rounded border border-slate-800 bg-slate-950/60">
            <span className="text-slate-400 text-[10px] block">Origin Sector:</span>
            <strong className="text-white text-xs">{corridor.activeVehicle.origin}</strong>
          </div>

          <div className="p-2.5 rounded border border-slate-800 bg-slate-950/60">
            <span className="text-slate-400 text-[10px] block">Destination:</span>
            <strong className="text-emerald-300 text-xs flex items-center gap-1">
              <Hospital className="w-3.5 h-3.5" />
              {corridor.activeVehicle.destination}
            </strong>
          </div>

          <div className="p-2.5 rounded border border-slate-800 bg-slate-950/60">
            <span className="text-slate-400 text-[10px] block">Estimated Transit ETA:</span>
            <strong className="text-amber-300 text-xs font-mono">
              {corridor.protectionActive ? "2.0 MIN (-4.2m cleared)" : `${corridor.activeVehicle.etaMinutes} MIN`}
            </strong>
          </div>
        </div>
      </div>

      {/* Corridor Path Waypoints */}
      <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/80 space-y-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
          PATH WAYPOINTS & PROPAGATION OBSTRUCTION RISK
        </span>

        <div className="flex items-center justify-between overflow-x-auto py-3 gap-2">
          {corridor.path.map((node, i) => (
            <React.Fragment key={node}>
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                    node === "J7"
                      ? corridor.protectionActive
                        ? "bg-emerald-950 border-emerald-400 text-white"
                        : "bg-rose-950 border-rose-500 text-white animate-pulse"
                      : "bg-slate-950 border-slate-700 text-slate-300"
                  }`}
                >
                  {node}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 font-semibold">
                  {node === "HOSPITAL" ? "HOSPITAL" : `Node ${node}`}
                </span>
                {node === "J7" && !corridor.protectionActive && (
                  <span className="text-[9px] text-rose-400 font-bold">
                    OBSTRUCTION RISK
                  </span>
                )}
              </div>

              {i < corridor.path.length - 1 && (
                <div className="flex-1 h-0.5 bg-slate-700 min-w-[24px] relative">
                  <ArrowRight className="w-3 h-3 text-slate-500 absolute -top-1.5 left-1/2 -translate-x-1/2" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Threat Diagnosis */}
        <div className="p-3 rounded border border-slate-800 bg-slate-950 text-[11px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Predicted Obstruction:</span>
            <span className="text-rose-300 font-bold">
              {corridor.predictedObstruction}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Estimated Clearance Required:</span>
            <span className="text-white font-mono">
              {corridor.estimatedClearanceMinutes} min
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Intervention Preemption:</span>
            <span
              className={`font-bold ${
                corridor.clearancePreemptionApplied
                  ? "text-emerald-400"
                  : "text-amber-400"
              }`}
            >
              {corridor.clearancePreemptionApplied
                ? "GREEN WAVE PREEMPTION ARMED"
                : "AWAITING OPERATOR DISPATCH"}
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer from Section 15 */}
      <div className="p-3 rounded border border-slate-800/80 bg-slate-950/60 text-[10px] text-slate-400 leading-normal">
        <span className="font-bold text-slate-300">
          OPERATIONAL SAFETY NOTICE:
        </span>{" "}
        This prototype represents AI decision support and simulation analysis only.
        It does not assert autonomous physical actuation over municipal traffic signal hardware.
      </div>
    </div>
  );
};
