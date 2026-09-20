import React, { useState, useEffect } from "react";
import { ProvenanceTag } from "../../components/common/ProvenanceTag";
import { StatusPill } from "../../components/common/StatusPill";
import {
  REPLAY_TIMELINE_STEPS,
  ReplaySnapshot,
} from "../../data/corridorData";
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Clock,
  History,
  AlertTriangle,
} from "lucide-react";

interface HistoricalReplayViewProps {
  currentStepIndex: number;
  onStepChange: (stepIndex: number) => void;
  onApplySnapshotToSimulation: (snapshot: ReplaySnapshot) => void;
}

export const HistoricalReplayView: React.FC<HistoricalReplayViewProps> = ({
  currentStepIndex,
  onStepChange,
  onApplySnapshotToSimulation,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState<1 | 2 | 5>(1);

  const currentSnapshot = REPLAY_TIMELINE_STEPS[currentStepIndex] || REPLAY_TIMELINE_STEPS[4];

  // Auto-play timer
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      const intervalMs = 2500 / playSpeed;
      timer = setInterval(() => {
        if (currentStepIndex >= REPLAY_TIMELINE_STEPS.length - 1) {
          setIsPlaying(false);
        } else {
          const next = currentStepIndex + 1;
          onStepChange(next);
          onApplySnapshotToSimulation(REPLAY_TIMELINE_STEPS[next]);
        }
      }, intervalMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, playSpeed, currentStepIndex, onStepChange, onApplySnapshotToSimulation]);

  const handleSelectStep = (idx: number) => {
    onStepChange(idx);
    onApplySnapshotToSimulation(REPLAY_TIMELINE_STEPS[idx]);
  };

  const handleReset = () => {
    setIsPlaying(false);
    onStepChange(0);
    onApplySnapshotToSimulation(REPLAY_TIMELINE_STEPS[0]);
  };

  return (
    <div
      id="historical-replay-view"
      className="p-4 bg-[#0a0f18] flex flex-col h-full overflow-y-auto font-mono text-xs select-none space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              HISTORICAL REPLAY & CASCADE DETERIORATION TIMELINE
            </h2>
            <ProvenanceTag status="SIMULATED" size="xs" />
          </div>
          <div className="text-[11px] text-amber-400/90 mt-0.5 font-bold">
            REPLAY MODE — SIMULATED HISTORICAL DATA (NOT LIVE SENSORS)
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {/* Speed selector */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded p-0.5 text-[10px]">
            {([1, 2, 5] as const).map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaySpeed(speed)}
                className={`px-1.5 py-0.5 rounded font-bold ${
                  playSpeed === speed
                    ? "bg-amber-500/20 text-amber-300"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <button
            id="replay-play-pause-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`py-1.5 px-3 rounded font-bold transition-all flex items-center gap-1.5 border ${
              isPlaying
                ? "bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-950"
                : "bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PLAY</span>
              </>
            )}
          </button>

          <button
            id="replay-reset-btn"
            onClick={handleReset}
            className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-300 font-bold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Current Replay Status Card */}
      <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-base font-bold text-white tracking-widest font-mono">
              {currentSnapshot.time}
            </span>
            <span className="text-slate-400 text-[11px]">
              (T+{currentSnapshot.minuteOffset} min)
            </span>
          </div>

          <StatusPill status={currentSnapshot.severity} size="md" />
        </div>

        <p className="text-slate-200 text-xs leading-relaxed">
          {currentSnapshot.description}
        </p>

        {/* Telemetry Snapshot at this moment */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="p-2.5 rounded border border-slate-800 bg-slate-950">
            <span className="text-slate-400 text-[10px] block">J7 Queue:</span>
            <strong className="text-white text-sm font-mono">
              {currentSnapshot.j7QueueMeters} m
            </strong>
          </div>
          <div className="p-2.5 rounded border border-slate-800 bg-slate-950">
            <span className="text-slate-400 text-[10px] block">J7 Velocity:</span>
            <strong className="text-white text-sm font-mono">
              {currentSnapshot.j7SpeedKmh} km/h
            </strong>
          </div>
          <div className="p-2.5 rounded border border-slate-800 bg-slate-950">
            <span className="text-slate-400 text-[10px] block">J7 Spillback Risk:</span>
            <strong className="text-amber-300 text-sm font-mono">
              {currentSnapshot.j7RiskPercent}%
            </strong>
          </div>
          <div className="p-2.5 rounded border border-slate-800 bg-slate-950">
            <span className="text-slate-400 text-[10px] block">J8 Overload Risk:</span>
            <strong className="text-rose-300 text-sm font-mono">
              {currentSnapshot.j8RiskPercent}%
            </strong>
          </div>
        </div>
      </div>

      {/* Visual Scrubber Timeline (14:50 to 15:05) */}
      <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/80 space-y-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
          TIMELINE SCRUBBER (14:50 → 15:05)
        </span>

        <div className="grid grid-cols-6 gap-2">
          {REPLAY_TIMELINE_STEPS.map((step, idx) => {
            const isCurrent = idx === currentStepIndex;
            return (
              <button
                key={step.time}
                onClick={() => handleSelectStep(idx)}
                className={`p-2.5 rounded border text-left transition-all ${
                  isCurrent
                    ? "bg-amber-950/80 border-amber-400 text-amber-200 ring-2 ring-amber-500/30 shadow-md"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="font-bold text-[11px]">{step.time}</div>
                <div className="text-[10px] mt-0.5 font-semibold text-slate-300">
                  T+{step.minuteOffset}m
                </div>
                <div className="text-[9px] mt-1 text-slate-400 truncate">
                  Q: {step.j7QueueMeters}m
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-2">
          <div
            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentStepIndex + 1) / REPLAY_TIMELINE_STEPS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="p-3 rounded border border-slate-800 bg-slate-950/80 text-[10px] text-slate-400 leading-normal">
        <span className="font-bold text-slate-300">REPLAY INTELLIGENCE:</span>{" "}
        This historical replay demonstrates how the unmitigated baseline scenario evolves from free-flow at 14:50 to full gridlock at 15:05. Notice how queue growth at J7 begins compounding after 14:56.
      </div>
    </div>
  );
};
