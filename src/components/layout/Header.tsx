import React from "react";
import { SystemMode } from "../../types/traffic";
import { ProvenanceTag } from "../common/ProvenanceTag";
import { Activity, Radio, Cpu, Database, AlertCircle, Clock } from "lucide-react";

interface HeaderProps {
  systemMode: SystemMode;
  simulatedTime: string;
  onSelectMode?: (mode: SystemMode) => void;
  activeOperatingStage?: string;
}

export const Header: React.FC<HeaderProps> = ({
  systemMode,
  simulatedTime,
  onSelectMode,
  activeOperatingStage = "DETECT FAILURE",
}) => {
  return (
    <header
      id="aura-command-header"
      className="h-14 border-b border-slate-800 bg-[#0d131f] px-4 flex items-center justify-between shrink-0 select-none z-30"
    >
      {/* Brand & Identity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          {/* Beacon badge */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded border border-cyan-500/40 bg-cyan-950/40 shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                AURA-TWIN
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                v1.0.4-PROTO
              </span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white font-mono flex items-center gap-1.5">
                AURA COMMAND
                <span className="text-red-400 text-sm">🚨</span>
              </h1>
              <span className="hidden xl:inline text-xs text-slate-400">
                Decision Intelligence for Preventing Gridlock
              </span>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-slate-800 hidden md:block" />

        {/* Mode Selector / Indicator - Default is REPLAY */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded px-2.5 py-1">
          <span className="text-[10px] font-mono font-medium text-slate-400 uppercase">
            MODE:
          </span>
          <div className="flex items-center gap-1 font-mono text-xs">
            <button
              id="mode-replay-btn"
              onClick={() => onSelectMode && onSelectMode("REPLAY")}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                systemMode === "REPLAY"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Simulated historical data replay"
            >
              REPLAY
            </button>
            <button
              id="mode-digital-twin-btn"
              onClick={() => onSelectMode && onSelectMode("DIGITAL_TWIN")}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                systemMode === "DIGITAL_TWIN"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Digital twin what-if sandbox active"
            >
              DIGITAL TWIN
            </button>
            <button
              id="mode-degraded-btn"
              onClick={() => onSelectMode && onSelectMode("DEGRADED")}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                systemMode === "DEGRADED"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Sensor degraded fallback state"
            >
              DEGRADED
            </button>
          </div>
        </div>

        {/* Prominent Data Provenance Warning */}
        <div className="hidden lg:flex items-center gap-1.5">
          <ProvenanceTag status="SIMULATED" size="sm" />
          <span className="text-[10px] text-slate-500 font-mono">
            (DEMO CORRIDOR DATA)
          </span>
        </div>
      </div>

      {/* Center Operational Loop Badge */}
      <div className="hidden 2xl:flex items-center gap-1 bg-slate-950/80 border border-slate-800/80 rounded px-2.5 py-1 text-[11px] font-mono text-slate-400">
        <span className="text-slate-500 uppercase text-[9px] tracking-wider mr-1">
          OPERATING LOOP:
        </span>
        {[
          "OBSERVE",
          "RECONSTRUCT",
          "PREDICT",
          "DETECT FAILURE",
          "CASCADE",
          "INTERVENTIONS",
          "DECISION",
        ].map((stage, idx) => {
          const isActive = stage === activeOperatingStage;
          return (
            <React.Fragment key={stage}>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold"
                    : "text-slate-500"
                }`}
              >
                {stage}
              </span>
              {idx < 6 && <span className="text-slate-700">→</span>}
            </React.Fragment>
          );
        })}
      </div>

      {/* Right Telemetry Indicators */}
      <div className="flex items-center gap-3">
        {/* Simulated Time */}
        <div
          id="simulated-time-display"
          className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 font-mono text-xs"
        >
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 text-[10px]">SIM TIME:</span>
          <span className="font-bold text-slate-100 tracking-wider">
            {simulatedTime}
          </span>
        </div>

        {/* Compact Service Nodes */}
        <div className="hidden sm:flex items-center gap-3 text-xs font-mono border-l border-slate-800 pl-3">
          <div className="flex items-center gap-1" title="Data Provider: Synthetic Sensors Stream">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-slate-400">DATA:</span>
            <span className="text-[10px] text-emerald-400 font-semibold">SIMULATED</span>
          </div>

          <div className="flex items-center gap-1" title="AI Inference: Graph Neural Net Engine">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] text-slate-400">AI:</span>
            <span className="text-[10px] text-cyan-400 font-semibold">ONLINE</span>
          </div>

          <div className="flex items-center gap-1" title="Digital Twin: SUMO Micro-Sim Engine">
            <Activity className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] text-slate-400">TWIN:</span>
            <span className="text-[10px] text-purple-400 font-semibold">READY</span>
          </div>

          <div className="flex items-center gap-1" title="System Health: All Subsystems Nominal">
            <Database className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-bold">100%</span>
          </div>
        </div>
      </div>
    </header>
  );
};
