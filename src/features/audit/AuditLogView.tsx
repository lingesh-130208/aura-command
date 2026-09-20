import React from "react";
import { OperatorAction, CitizenAlert } from "../../types/traffic";
import { ProvenanceTag } from "../../components/common/ProvenanceTag";
import {
  ClipboardList,
  UserCheck,
  Send,
  AlertCircle,
  Clock,
  Radio,
  FileText,
} from "lucide-react";

interface AuditLogViewProps {
  operatorActions: OperatorAction[];
  citizenAlert: CitizenAlert;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  operatorActions,
  citizenAlert,
}) => {
  return (
    <div
      id="audit-log-view"
      className="p-4 bg-[#0a0f18] flex flex-col h-full overflow-y-auto font-mono text-xs select-none space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              OPERATIONAL AUDIT TRAIL & CITIZEN ADVISORY LOG
            </h2>
            <ProvenanceTag status="OBSERVED" size="xs" />
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Cryptographically timestamped ledger of operator decisions, scenario runs, and traffic notices.
          </div>
        </div>
      </div>

      {/* Citizen Advisory Broadcast Card (Section 33) */}
      <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-300 uppercase">
            <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>CITIZEN-FACING TRAFFIC ADVISORY PLACEHOLDER</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/40 font-bold">
            {citizenAlert.status}
          </span>
        </div>

        <div className="p-3 rounded border border-slate-800 bg-slate-950 text-xs space-y-1">
          <div className="font-bold text-white">{citizenAlert.title}</div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            "{citizenAlert.message}"
          </p>
          <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-2 border-t border-slate-850">
            <span>
              Target Zones:{" "}
              <strong className="text-slate-200">
                {citizenAlert.targetZones.join(", ")}
              </strong>
            </span>
            <span>•</span>
            <span>
              Channels:{" "}
              <strong className="text-cyan-300">
                {citizenAlert.channels.join(" | ")}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Operator Decisions Ledger */}
      <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            OPERATOR ACTION DECISIONS LEDGER
          </span>
          <span className="text-[10px] text-slate-400">
            {operatorActions.length} Recorded Actions
          </span>
        </div>

        {operatorActions.length === 0 ? (
          <div className="p-4 rounded border border-slate-800/80 bg-slate-950 text-center text-slate-500 text-xs">
            No manual operator decisions logged yet in this session. Visit What-If Center to ACCEPT, MODIFY, or REJECT an intervention.
          </div>
        ) : (
          <div className="space-y-2">
            {operatorActions.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded border border-slate-800 bg-slate-950/80 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold">
                      [{act.timestamp}]
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        act.decision === "ACCEPTED"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                          : act.decision === "REJECTED"
                          ? "bg-rose-950 text-rose-300 border border-rose-500/40"
                          : "bg-amber-950 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {act.decision}
                    </span>
                    <span className="text-white font-semibold">
                      Intervention Code: {act.selectedInterventionCode}
                    </span>
                  </div>

                  <span className="text-slate-400 text-[10px]">
                    Operator: {act.operatorId}
                  </span>
                </div>

                {act.notes && (
                  <div className="text-[11px] text-slate-300 pl-2 border-l-2 border-slate-700">
                    "{act.notes}"
                  </div>
                )}

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>
                    Simulated Outcome:{" "}
                    <strong
                      className={
                        act.simulatedOutcomeState === "MITIGATED"
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }
                    >
                      {act.simulatedOutcomeState}
                    </strong>
                  </span>
                  <ProvenanceTag status="SIMULATED" size="xs" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
