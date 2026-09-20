import React from "react";
import { JunctionNode, TrafficState } from "../../types/traffic";
import { ProvenanceTag } from "../../components/common/ProvenanceTag";
import { StatusPill } from "../../components/common/StatusPill";
import { MetricBox } from "../../components/common/MetricBox";
import {
  X,
  Gauge,
  Hourglass,
  Percent,
  TrendingDown,
  Navigation,
  Layers,
  AlertCircle,
  Radio,
} from "lucide-react";

interface NodeInspectorCardProps {
  selectedJunction: JunctionNode | null;
  selectedSegment: TrafficState | null;
  onClose: () => void;
  onTargetIntervention?: (junctionId: string) => void;
}

export const NodeInspectorCard: React.FC<NodeInspectorCardProps> = ({
  selectedJunction,
  selectedSegment,
  onClose,
  onTargetIntervention,
}) => {
  if (!selectedJunction && !selectedSegment) return null;

  return (
    <div
      id="node-inspector-card"
      className="absolute bottom-4 right-4 w-96 max-w-[calc(100%-2rem)] bg-[#0b121e]/95 border border-slate-700/80 rounded-lg shadow-2xl backdrop-blur-md z-30 p-4 font-mono text-xs select-none"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              {selectedJunction ? "JUNCTION INSPECTION" : "ROAD SEGMENT INSPECTION"}
            </span>
            <ProvenanceTag
              status={selectedJunction ? selectedJunction.dataStatus : selectedSegment?.status || "ESTIMATED"}
              size="xs"
            />
          </div>
          <h3 className="text-sm font-bold text-white tracking-wide">
            {selectedJunction ? selectedJunction.name : selectedSegment?.name}
          </h3>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {selectedJunction
              ? `Node Type: ${selectedJunction.type} | Segments: ${selectedJunction.connectedSegments.join(", ")}`
              : `Link: ${selectedSegment?.fromJunction} → ${selectedSegment?.toJunction} (Speed Limit: ${selectedSegment?.speedLimit} km/h)`}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <StatusPill
            status={selectedJunction ? selectedJunction.severity : selectedSegment?.severity || "NORMAL"}
            size="sm"
          />
          <button
            id="close-node-inspector-btn"
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors ml-1"
            title="Close inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      {selectedJunction && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <MetricBox
              label="Current Speed"
              value={selectedJunction.currentSpeed}
              unit="km/h"
              provenance="OBSERVED"
              subtext="Camera radar loop"
              alert={selectedJunction.currentSpeed < 25}
            />
            <MetricBox
              label="Estimated Queue"
              value={selectedJunction.estimatedQueueMeters}
              unit="m"
              provenance="ESTIMATED"
              subtext="Accumulated backlog"
              alert={selectedJunction.estimatedQueueMeters > 120}
            />
            <MetricBox
              label="Capacity Stress"
              value={`${selectedJunction.capacityStressPercent}%`}
              provenance="ESTIMATED"
              subtext="Saturation index"
              alert={selectedJunction.capacityStressPercent > 75}
            />
            <MetricBox
              label="Spillback Risk"
              value={`${selectedJunction.predictedSpillbackPercent}%`}
              provenance="PREDICTED"
              subtext={`Window: ${selectedJunction.predictedWindow}`}
              alert={selectedJunction.predictedSpillbackPercent > 50}
            />
          </div>

          {/* Probabilistic Window & Confidence */}
          <div className="p-2.5 rounded border border-slate-800 bg-slate-900/60 flex items-center justify-between text-[11px]">
            <div>
              <span className="text-slate-400">Prediction Window:</span>{" "}
              <span className="text-amber-300 font-bold">
                {selectedJunction.predictedWindow}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Confidence:</span>{" "}
              <span className="text-cyan-300 font-bold">
                {selectedJunction.confidencePercent}%
              </span>{" "}
              <ProvenanceTag status="PREDICTED" size="xs" showIcon={false} />
            </div>
          </div>

          {/* Signal Phase if Available */}
          {selectedJunction.activeSignals && (
            <div className="p-2 rounded border border-slate-800/80 bg-slate-950/60 text-[11px] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-slate-400">Active Phase:</span>
                <span className="text-emerald-300 font-bold">
                  {selectedJunction.activeSignals.currentPhase}
                </span>
              </div>
              <div className="text-slate-400 text-[10px]">
                Green Rem:{" "}
                <span className="text-white font-bold">
                  {selectedJunction.activeSignals.greenRemainingSec}s
                </span>{" "}
                / Cycle: {selectedJunction.activeSignals.cycleLengthSec}s
              </div>
            </div>
          )}

          {/* Action button: Target for Intervention */}
          {onTargetIntervention && (
            <button
              id="target-junction-for-intervention-btn"
              onClick={() => onTargetIntervention(selectedJunction.id)}
              className="w-full py-1.5 px-3 bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/50 rounded text-purple-200 font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>TEST INTERVENTIONS FOR {selectedJunction.id}</span>
            </button>
          )}
        </div>
      )}

      {selectedSegment && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <MetricBox
              label="Speed"
              value={selectedSegment.speed || "--"}
              unit="km/h"
              provenance={selectedSegment.status}
              subtext={`Limit: ${selectedSegment.speedLimit} km/h`}
              alert={(selectedSegment.speed || 50) < 25}
            />
            <MetricBox
              label="Volume Flow"
              value={selectedSegment.flow || "--"}
              unit="veh/h"
              provenance={selectedSegment.status}
              subtext="Throughput"
            />
            <MetricBox
              label="Density"
              value={selectedSegment.density || "--"}
              unit="veh/km"
              provenance={selectedSegment.status}
              alert={(selectedSegment.density || 0) > 60}
            />
            <MetricBox
              label="Backlog Queue"
              value={selectedSegment.queue || 0}
              unit="m"
              provenance="ESTIMATED"
              alert={(selectedSegment.queue || 0) > 100}
            />
          </div>

          {selectedSegment.incidentActive && (
            <div className="p-2.5 rounded border border-rose-500/50 bg-rose-950/30 text-rose-200 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Active Segment Alert:</span>
                <div className="text-[10px] text-rose-300 mt-0.5">
                  {selectedSegment.incidentDescription}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
