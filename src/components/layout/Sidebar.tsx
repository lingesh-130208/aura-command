import React from "react";
import {
  LayoutDashboard,
  Network,
  AlertOctagon,
  GitFork,
  Sliders,
  Ambulance,
  History,
  ShieldCheck,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";

export type NavViewKey =
  | "OVERVIEW"
  | "LIVE_NETWORK"
  | "RISK_MAP"
  | "CASCADE_EXPLORER"
  | "WHAT_IF_CENTER"
  | "EMERGENCY_MODE"
  | "HISTORICAL_REPLAY"
  | "SYSTEM_HEALTH"
  | "AUDIT_LOG";

interface SidebarProps {
  activeView: NavViewKey;
  onSelectView: (view: NavViewKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  riskCount?: number;
  emergencyActive?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  collapsed,
  onToggleCollapse,
  riskCount = 3,
  emergencyActive = false,
}) => {
  const navItems = [
    {
      key: "OVERVIEW" as NavViewKey,
      label: "Overview",
      icon: LayoutDashboard,
      badge: null,
      badgeColor: "",
    },
    {
      key: "LIVE_NETWORK" as NavViewKey,
      label: "Live Network",
      icon: Network,
      badge: "J1-J9",
      badgeColor: "bg-slate-800 text-slate-400",
    },
    {
      key: "RISK_MAP" as NavViewKey,
      label: "Risk Map",
      icon: AlertOctagon,
      badge: riskCount ? `${riskCount} RISKS` : null,
      badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
    },
    {
      key: "CASCADE_EXPLORER" as NavViewKey,
      label: "Cascade Explorer",
      icon: GitFork,
      badge: "E1→E4",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40",
    },
    {
      key: "WHAT_IF_CENTER" as NavViewKey,
      label: "What-If Center",
      icon: Sliders,
      badge: "A + B",
      badgeColor: "bg-purple-500/20 text-purple-300 border border-purple-500/40",
    },
    {
      key: "EMERGENCY_MODE" as NavViewKey,
      label: "Emergency Mode",
      icon: Ambulance,
      badge: emergencyActive ? "PROTECTED" : "STANDBY",
      badgeColor: emergencyActive
        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse"
        : "bg-rose-500/20 text-rose-300 border border-rose-500/40",
    },
    {
      key: "HISTORICAL_REPLAY" as NavViewKey,
      label: "Historical Replay",
      icon: History,
      badge: "14:50-15:05",
      badgeColor: "bg-slate-800 text-slate-400",
    },
    {
      key: "SYSTEM_HEALTH" as NavViewKey,
      label: "System Health",
      icon: ShieldCheck,
      badge: "7 OK",
      badgeColor: "bg-emerald-950 text-emerald-400 border border-emerald-500/30",
    },
    {
      key: "AUDIT_LOG" as NavViewKey,
      label: "Audit Log",
      icon: ClipboardList,
      badge: null,
      badgeColor: "",
    },
  ];

  return (
    <aside
      id="aura-command-sidebar"
      className={`border-r border-slate-800 bg-[#0a0e17] flex flex-col justify-between shrink-0 transition-all duration-200 z-20 select-none ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Navigation list */}
      <div className="py-3 px-2 flex flex-col gap-1 overflow-y-auto">
        <div className="flex items-center justify-between px-2 mb-2">
          {!collapsed && (
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              OPERATIONS CONSOLE
            </span>
          )}
          <button
            id="sidebar-toggle-btn"
            onClick={onToggleCollapse}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 ml-auto transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {navItems.map((item) => {
          const isActive = activeView === item.key;
          const IconComp = item.icon;

          return (
            <button
              key={item.key}
              id={`nav-item-${item.key.toLowerCase().replace(/_/g, "-")}`}
              onClick={() => onSelectView(item.key)}
              className={`w-full flex items-center rounded px-2.5 py-2 transition-colors text-left font-mono ${
                isActive
                  ? "bg-cyan-950/50 text-cyan-300 border border-cyan-500/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <IconComp
                className={`w-4 h-4 shrink-0 ${
                  isActive ? "text-cyan-400" : "text-slate-400"
                }`}
              />

              {!collapsed && (
                <div className="ml-3 flex items-center justify-between flex-1 truncate">
                  <span className="text-xs font-medium tracking-wide">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Corridor badge in footer */}
      {!collapsed && (
        <div className="p-3 m-2 border border-slate-800/80 bg-slate-950/60 rounded text-[11px] font-mono">
          <div className="flex items-center gap-1 text-slate-400 mb-1">
            <Info className="w-3 h-3 text-cyan-400" />
            <span className="font-semibold text-slate-300">DEMO CORRIDOR</span>
          </div>
          <div className="text-[10px] text-slate-400 leading-tight">
            Fictional corridor topology. Data synthesized for operational decision modeling.
          </div>
        </div>
      )}
    </aside>
  );
};
