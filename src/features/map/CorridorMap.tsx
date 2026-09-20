import React, { useState } from "react";
import {
  JunctionNode,
  TrafficState,
  Prediction,
  EmergencyCorridorState,
  DataProvenance,
} from "../../types/traffic";
import { ProvenanceTag } from "../../components/common/ProvenanceTag";
import { StatusPill } from "../../components/common/StatusPill";
import {
  Layers,
  Ambulance,
  AlertTriangle,
  Crosshair,
  Maximize2,
  Minimize2,
  RefreshCw,
  GitCommit,
  Shield,
  Zap,
} from "lucide-react";

interface CorridorMapProps {
  junctions: JunctionNode[];
  segments: TrafficState[];
  predictions: Prediction[];
  emergencyCorridor: EmergencyCorridorState;
  selectedJunctionId: string | null;
  selectedSegmentId: string | null;
  onSelectJunction: (junction: JunctionNode) => void;
  onSelectSegment: (segment: TrafficState) => void;
  highlightedCascadeTarget?: string | null;
  interventionTarget?: string | null;
  showEmergencyHighlight?: boolean;
  mapMode?: "OVERVIEW" | "LIVE_NETWORK" | "RISK_MAP";
}

export const CorridorMap: React.FC<CorridorMapProps> = ({
  junctions,
  segments,
  predictions,
  emergencyCorridor,
  selectedJunctionId,
  selectedSegmentId,
  onSelectJunction,
  onSelectSegment,
  highlightedCascadeTarget,
  interventionTarget = "J7",
  showEmergencyHighlight = true,
  mapMode = "OVERVIEW",
}) => {
  // Layer visibility toggles
  const [layers, setLayers] = useState({
    queues: true,
    risks: mapMode === "RISK_MAP" || mapMode === "OVERVIEW",
    cascadeVectors: mapMode === "RISK_MAP" || mapMode === "OVERVIEW",
    emergencyRoute: true,
    sensorProvenance: mapMode === "LIVE_NETWORK",
  });

  // Sync layers when mapMode changes
  React.useEffect(() => {
    if (mapMode === "RISK_MAP") {
      setLayers({
        queues: true,
        risks: true,
        cascadeVectors: true,
        emergencyRoute: true,
        sensorProvenance: false,
      });
    } else if (mapMode === "LIVE_NETWORK") {
      setLayers({
        queues: true,
        risks: false,
        cascadeVectors: false,
        emergencyRoute: true,
        sensorProvenance: true,
      });
    }
  }, [mapMode]);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Helper to get junction coordinates by ID
  const getJunctionCoords = (id: string) => {
    const j = junctions.find((item) => item.id === id);
    return j ? j.coordinates : { x: 500, y: 300 };
  };

  // Severity color & stroke mapping for road segments
  const getSegmentStroke = (seg: TrafficState) => {
    switch (seg.severity) {
      case "CRITICAL":
        return {
          stroke: "#f43f5e", // Rose 500
          width: 8,
          glow: "rgba(244, 63, 94, 0.4)",
          dash: "none",
        };
      case "HIGH_RISK":
        return {
          stroke: "#f97316", // Orange 500
          width: 7,
          glow: "rgba(249, 115, 22, 0.35)",
          dash: "none",
        };
      case "DETERIORATING":
        return {
          stroke: "#eab308", // Amber 500
          width: 6,
          glow: "rgba(234, 179, 8, 0.25)",
          dash: "none",
        };
      case "NORMAL":
      default:
        return {
          stroke: "#0ea5e9", // Sky 500
          width: 5,
          glow: "transparent",
          dash: "none",
        };
    }
  };

  return (
    <div
      id="main-corridor-map-container"
      className={`relative w-full h-full flex flex-col bg-[#070b12] overflow-hidden border border-slate-800 rounded-lg ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
      }`}
    >
      {/* Top Map Toolbar */}
      <div className="h-10 px-3 border-b border-slate-800/90 bg-[#0c121d] flex items-center justify-between z-10 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            {mapMode === "RISK_MAP"
              ? "RISK MAP MODE:"
              : mapMode === "LIVE_NETWORK"
              ? "LIVE NETWORK SENSORS:"
              : "CORRIDOR TOPOLOGY MAP:"}
          </span>
          <span className="text-xs font-mono text-cyan-400 font-semibold">
            {mapMode === "RISK_MAP"
              ? "PROBABILISTIC SPILLBACK & CASCADE VECTORS"
              : mapMode === "LIVE_NETWORK"
              ? "PHYSICAL INDUCTION LOOPS & RADAR SPEEDS"
              : "AURA DEMO CORRIDOR (9 NODES / 14 LINKS)"}
          </span>
          <ProvenanceTag
            status={
              mapMode === "RISK_MAP"
                ? "PREDICTED"
                : mapMode === "LIVE_NETWORK"
                ? "OBSERVED"
                : "SIMULATED"
            }
            size="xs"
          />
        </div>

        {/* Map Layer Controls */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className="text-slate-500 uppercase text-[10px] mr-1 hidden sm:inline">
            LAYERS:
          </span>

          <button
            id="toggle-layer-queues"
            onClick={() => setLayers((l) => ({ ...l, queues: !l.queues }))}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
              layers.queues
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-slate-900 text-slate-500 border border-slate-800"
            }`}
          >
            QUEUES
          </button>

          <button
            id="toggle-layer-risks"
            onClick={() => setLayers((l) => ({ ...l, risks: !l.risks }))}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
              layers.risks
                ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                : "bg-slate-900 text-slate-500 border border-slate-800"
            }`}
          >
            RISK HALOS
          </button>

          <button
            id="toggle-layer-cascade"
            onClick={() =>
              setLayers((l) => ({ ...l, cascadeVectors: !l.cascadeVectors }))
            }
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
              layers.cascadeVectors
                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                : "bg-slate-900 text-slate-500 border border-slate-800"
            }`}
          >
            CASCADE VECTORS
          </button>

          <button
            id="toggle-layer-emergency"
            onClick={() =>
              setLayers((l) => ({ ...l, emergencyRoute: !l.emergencyRoute }))
            }
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
              layers.emergencyRoute
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-900 text-slate-500 border border-slate-800"
            }`}
          >
            AMBULANCE
          </button>

          <button
            id="toggle-layer-provenance"
            onClick={() =>
              setLayers((l) => ({
                ...l,
                sensorProvenance: !l.sensorProvenance,
              }))
            }
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
              layers.sensorProvenance
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                : "bg-slate-900 text-slate-500 border border-slate-800"
            }`}
          >
            PROVENANCE
          </button>

          <button
            id="toggle-fullscreen-map-btn"
            onClick={() => setIsFullscreen((f) => !f)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors ml-1"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main SVG Map Canvas */}
      <div className="relative flex-1 w-full h-full bg-[#070a10] bg-grid-pattern overflow-hidden flex items-center justify-center">
        <svg
          id="aura-corridor-svg"
          viewBox="0 0 1000 560"
          className="w-full h-full max-h-full select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Pulsing Risk Glow Filter */}
            <filter id="glow-risk" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Emergency Corridor Glow Filter */}
            <filter id="glow-emergency" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Arrow Marker for Directional Links */}
            <marker
              id="traffic-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748b" />
            </marker>

            {/* Cascade Flow Arrow */}
            <marker
              id="cascade-arrow"
              viewBox="0 0 12 12"
              refX="8"
              refY="6"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 2 L 10 6 L 0 10 z" fill="#ef4444" />
            </marker>

            {/* Linear gradients for road ribbons */}
            <linearGradient id="grad-seg-6-7" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="60%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>

            <linearGradient id="grad-emergency" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* 1. Road Underlay / Roadbed Bedding */}
          <g id="road-underlays" opacity="0.6">
            {segments.map((seg) => {
              const start = getJunctionCoords(seg.fromJunction);
              const end = getJunctionCoords(seg.toJunction);
              return (
                <line
                  key={`bed-${seg.segmentId}`}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="#1e293b"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* 2. Emergency Corridor Dedicated Path (J4 -> J5 -> J7 -> J9 -> Hospital) */}
          {layers.emergencyRoute && showEmergencyHighlight && (
            <g id="emergency-corridor-overlay">
              {/* Path line glow */}
              <polyline
                points="160,390 420,370 690,260 620,480 620,530"
                fill="none"
                stroke="#10b981"
                strokeWidth="12"
                strokeOpacity="0.25"
                filter="url(#glow-emergency)"
              />
              <polyline
                points="160,390 420,370 690,260 620,480 620,530"
                fill="none"
                stroke="#34d399"
                strokeWidth="3.5"
                strokeDasharray="8 6"
                className="animate-pulse"
              />

              {/* Hospital Destination Marker */}
              <g transform="translate(620, 530)">
                <circle r="14" fill="#065f46" stroke="#10b981" strokeWidth="2" />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono"
                >
                  +H
                </text>
                <text
                  x="22"
                  y="4"
                  fill="#34d399"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                >
                  HOSPITAL TRAUMA PLAZA
                </text>
              </g>

              {/* Ambulance vehicle animated dot */}
              <g transform="translate(420, 370)">
                <circle r="9" fill="#ef4444" className="animate-ping" opacity="0.6" />
                <circle r="6" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                <text
                  x="12"
                  y="-8"
                  fill="#6ee7b7"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                >
                  MEDIC-04 [ETA 6.2m]
                </text>
              </g>
            </g>
          )}

          {/* 3. Interactive Road Segments */}
          <g id="road-segments">
            {segments.map((seg) => {
              const start = getJunctionCoords(seg.fromJunction);
              const end = getJunctionCoords(seg.toJunction);
              const isSelected = selectedSegmentId === seg.segmentId;
              const style = getSegmentStroke(seg);

              const midX = (start.x + end.x) / 2;
              const midY = (start.y + end.y) / 2;

              // Use special gradient for the critical bottleneck SEG-6-7
              const strokeColor =
                seg.segmentId === "SEG-6-7"
                  ? "url(#grad-seg-6-7)"
                  : style.stroke;

              return (
                <g
                  key={seg.segmentId}
                  id={`road-${seg.segmentId}`}
                  className="cursor-pointer group"
                  onClick={() => onSelectSegment(seg)}
                >
                  {/* Invisible broad click target */}
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="transparent"
                    strokeWidth="24"
                  />

                  {/* Highlight halo when selected */}
                  {isSelected && (
                    <line
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke="#38bdf8"
                      strokeWidth={style.width + 6}
                      strokeOpacity="0.8"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Actual Road Segment Line */}
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={strokeColor}
                    strokeWidth={style.width}
                    strokeLinecap="round"
                    className="transition-all duration-300 group-hover:stroke-cyan-300"
                  />

                  {/* Dashed Center Flow Line */}
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="#0b1320"
                    strokeWidth="1.5"
                    strokeDasharray="6 8"
                  />

                  {/* Directional arrow at midpoint */}
                  <circle
                    cx={midX}
                    cy={midY}
                    r="4"
                    fill="#1e293b"
                    stroke={style.stroke}
                    strokeWidth="1.5"
                  />

                  {/* Queue Bar Overlay (if queues layer enabled and queue > 40m) */}
                  {layers.queues && (seg.queue || 0) > 30 && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-18"
                        y="-16"
                        width="36"
                        height="13"
                        rx="2"
                        fill="#090d16"
                        stroke={style.stroke}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="-7"
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="JetBrains Mono"
                      >
                        Q:{seg.queue}m
                      </text>
                    </g>
                  )}

                  {/* Incident Icon on SEG-6-7 */}
                  {seg.incidentActive && (
                    <g transform={`translate(${midX - 14}, ${midY + 14})`}>
                      <circle r="9" fill="#991b1b" stroke="#f87171" strokeWidth="1.5" />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        !
                      </text>
                      <text
                        x="14"
                        y="3"
                        fill="#fca5a5"
                        fontSize="9"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                      >
                        BOTTLENECK CHOKE
                      </text>
                    </g>
                  )}

                  {/* Provenance badge on segment if enabled */}
                  {layers.sensorProvenance && (
                    <text
                      x={midX}
                      y={midY + 12}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="7"
                      fontFamily="JetBrains Mono"
                    >
                      [{seg.status}]
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* 4. Cascade Propagation Vectors Overlay (E1 J7 -> E2 J7 -> E3 J6 -> E4 J8) */}
          {layers.cascadeVectors && (
            <g id="cascade-propagation-vectors">
              {/* Cascade Vector from J7 to J6 (Upstream spillback) */}
              <path
                d="M 670 250 Q 600 210 540 220"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeDasharray="5 4"
                markerEnd="url(#cascade-arrow)"
              />
              <rect
                x="575"
                y="190"
                width="62"
                height="15"
                rx="2"
                fill="#450a0a"
                stroke="#ef4444"
                strokeWidth="0.8"
              />
              <text
                x="606"
                y="201"
                textAnchor="middle"
                fill="#fecaca"
                fontSize="8"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                SPILLBACK [72%]
              </text>

              {/* Cascade Vector from J7 to J8 (Diversion overload) */}
              <path
                d="M 710 275 Q 770 300 840 370"
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeDasharray="5 4"
                markerEnd="url(#cascade-arrow)"
              />
              <rect
                x="765"
                y="330"
                width="74"
                height="15"
                rx="2"
                fill="#431407"
                stroke="#f97316"
                strokeWidth="0.8"
              />
              <text
                x="802"
                y="341"
                textAnchor="middle"
                fill="#fed7aa"
                fontSize="8"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                OVERLOAD [61%]
              </text>
            </g>
          )}

          {/* 5. Junction Nodes (J1 through J9) */}
          <g id="junction-nodes">
            {junctions.map((j) => {
              const { x, y } = j.coordinates;
              const isSelected = selectedJunctionId === j.id;
              const isTargeted = interventionTarget === j.id;
              const isCascadeHighlight = highlightedCascadeTarget === j.id;

              // Node severity visuals
              let ringColor = "#38bdf8";
              let fillColor = "#0c1829";
              let riskPulse = false;

              if (j.severity === "CRITICAL") {
                ringColor = "#f43f5e";
                fillColor = "#4c0519";
                riskPulse = true;
              } else if (j.severity === "HIGH_RISK") {
                ringColor = "#f97316";
                fillColor = "#431407";
                riskPulse = true;
              } else if (j.severity === "DETERIORATING") {
                ringColor = "#eab308";
                fillColor = "#422006";
              }

              return (
                <g
                  key={j.id}
                  id={`junction-${j.id}`}
                  className="cursor-pointer select-none group"
                  onClick={() => onSelectJunction(j)}
                >
                  {/* Outer Risk Halo Pulse if High Risk & layer enabled */}
                  {layers.risks && riskPulse && (
                    <circle
                      cx={x}
                      cy={y}
                      r="32"
                      fill="none"
                      stroke={ringColor}
                      strokeWidth="2"
                      strokeOpacity="0.4"
                      className="animate-ping"
                    />
                  )}

                  {/* Cascade Explorer highlight circle */}
                  {isCascadeHighlight && (
                    <circle
                      cx={x}
                      cy={y}
                      r="28"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="3"
                      strokeDasharray="4 3"
                    />
                  )}

                  {/* Selection Ring */}
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r="26"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                    />
                  )}

                  {/* Intervention Reticle if targeted */}
                  {isTargeted && (
                    <g transform={`translate(${x}, ${y})`}>
                      <circle
                        r="24"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      <line x1="-28" y1="0" x2="-20" y2="0" stroke="#c084fc" strokeWidth="2" />
                      <line x1="20" y1="0" x2="28" y2="0" stroke="#c084fc" strokeWidth="2" />
                      <line x1="0" y1="-28" x2="0" y2="-20" stroke="#c084fc" strokeWidth="2" />
                      <line x1="0" y1="20" x2="0" y2="28" stroke="#c084fc" strokeWidth="2" />
                    </g>
                  )}

                  {/* Main Junction Body */}
                  <circle
                    cx={x}
                    cy={y}
                    r="18"
                    fill={fillColor}
                    stroke={ringColor}
                    strokeWidth="2.5"
                    className="transition-transform duration-200 group-hover:scale-110"
                  />

                  {/* Inner Node Identifier */}
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    {j.id}
                  </text>

                  {/* Queue Meter Radial / Status Indicator */}
                  {j.estimatedQueueMeters > 50 && (
                    <g transform={`translate(${x + 12}, ${y - 12})`}>
                      <circle r="7" fill="#0f172a" stroke={ringColor} strokeWidth="1.5" />
                      <text
                        x="0"
                        y="2.5"
                        textAnchor="middle"
                        fill="#f1f5f9"
                        fontSize="7"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                      >
                        !
                      </text>
                    </g>
                  )}

                  {/* Label Card Beneath Node */}
                  <g transform={`translate(${x}, ${y + 24})`}>
                    <rect
                      x="-42"
                      y="0"
                      width="84"
                      height="18"
                      rx="3"
                      fill="#0a0f18"
                      fillOpacity="0.9"
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="12"
                      textAnchor="middle"
                      fill="#cbd5e1"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      fontWeight="600"
                    >
                      {j.name.split("—")[1]?.trim() || j.id}
                    </text>
                  </g>

                  {/* Predicted risk tag if high */}
                  {j.predictedSpillbackPercent > 50 && (
                    <g transform={`translate(${x}, ${y - 25})`}>
                      <rect
                        x="-38"
                        y="0"
                        width="76"
                        height="14"
                        rx="2"
                        fill="#450a0a"
                        stroke="#f87171"
                        strokeWidth="0.8"
                      />
                      <text
                        x="0"
                        y="10"
                        textAnchor="middle"
                        fill="#fecaca"
                        fontSize="8"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                      >
                        RISK: {j.predictedSpillbackPercent}%
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Tactical Map Overlay Legend (Bottom Left) */}
        <div className="absolute bottom-3 left-3 bg-[#0c121e]/90 border border-slate-800 p-2.5 rounded shadow-lg backdrop-blur-sm z-10 text-[11px] font-mono pointer-events-auto max-w-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>NETWORK STATUS LEGEND</span>
            <span className="text-[9px] text-slate-500">AURA CORRIDOR</span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-slate-300">Free Flow / Normal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span className="text-slate-300">Deteriorating</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
              <span className="text-slate-300">High Risk Spillback</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span className="text-slate-300">Critical Gridlock</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 border border-emerald-400 shrink-0" />
              <span className="text-slate-300">Ambulance Route</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-rose-500 shrink-0" />
              <span className="text-slate-300">Cascade Vector</span>
            </div>
          </div>
        </div>

        {/* Selected Intervention Target Callout (Top Right inside Map) */}
        {interventionTarget && (
          <div className="absolute top-3 right-3 bg-purple-950/80 border border-purple-500/50 px-3 py-1.5 rounded shadow z-10 text-[11px] font-mono flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-purple-300 animate-spin" />
            <div>
              <span className="text-purple-300 font-bold">
                TARGET INTERVENTION NODE: {interventionTarget}
              </span>
              <div className="text-[10px] text-purple-400">
                AURA Recommends Signal Extension
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
