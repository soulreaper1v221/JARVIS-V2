// ─── Sidebar navigation ───────────────────────────────────────────────────

import { memo } from 'react';

export type TabId =
  | 'chat'
  | 'files'
  | 'projects'
  | 'schedule'
  | 'monitor'
  | 'tools'
  | 'apps'
  | 'memory'
  | 'science'
  | 'selfmod'
  | 'integrity'
  | 'profile';

interface TabDef {
  id: TabId;
  label: string;
  icon: string;
  hint?: string;
}

export const TABS: TabDef[] = [
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'files', label: 'Files', icon: '🗂️' },
  { id: 'projects', label: 'Projects', icon: '📁' },
  { id: 'schedule', label: 'Schedule', icon: '📅' }, // ALWAYS visible
  { id: 'monitor', label: 'Monitor', icon: '🖥️' },
  { id: 'tools', label: 'Tools', icon: '🧰' },
  { id: 'apps', label: 'Apps', icon: '🚀' },
  { id: 'memory', label: 'Memory', icon: '🧠' },
  { id: 'science', label: 'Science', icon: '🔬' },
  { id: 'selfmod', label: 'Self-Mod', icon: '🧩' },
  { id: 'integrity', label: 'Integrity', icon: '🛡️' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

interface SidebarProps {
  active: TabId;
  onChange: (tab: TabId) => void;
  pendingCount?: number;
}

function SidebarInner({ active, onChange, pendingCount = 0 }: SidebarProps) {
  return (
    <nav
      className="border-r border-cyan-400/12 z-10"
      style={{
        flexShrink: 0,
        width: 172,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, rgba(10,16,28,0.95), rgba(6,10,16,0.9))',
      }}
    >
      <div className="px-3 pt-3 pb-1.5 text-[9px] font-bold tracking-[0.22em] text-slate-600" style={{ flexShrink: 0 }}>
        NAVIGATION
      </div>
      <div className="overflow-y-auto px-2 pb-3" style={{ flex: 1, minHeight: 0 }}>
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          const isSchedule = tab.id === 'schedule';
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-left transition-all duration-150 group"
              style={{
                background: isActive ? 'linear-gradient(90deg, rgba(0,229,255,0.16), rgba(0,229,255,0.03))' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(0,229,255,0.4)' : isSchedule ? 'rgba(0,229,255,0.12)' : 'transparent'}`,
                boxShadow: isActive ? '0 0 14px rgba(0,229,255,0.12)' : 'none',
              }}
              title={tab.hint ?? tab.label}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              <span
                className="text-[13px] font-medium flex-1"
                style={{ color: isActive ? '#eafcff' : isSchedule ? '#8fb8c9' : '#5d7489' }}
              >
                {tab.label}
              </span>
              {tab.id === 'chat' && pendingCount > 0 && (
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-400/15 border border-cyan-400/30 rounded-full px-1.5">
                  {pendingCount}
                </span>
              )}
              {isActive && <span className="text-cyan-400 text-xs">▸</span>}
            </button>
          );
        })}
      </div>
      <div className="px-3 py-2.5 border-t border-cyan-400/10 text-[9px] font-mono text-slate-600 leading-relaxed" style={{ flexShrink: 0 }}>
        <div className="text-cyan-500/60 mb-1">▌SYSTEM v2.0.0</div>
        <div>local-first · no cloud</div>
        <div>react 19 · vite 7 · single-file</div>
      </div>
    </nav>
  );
}

export const Sidebar = memo(SidebarInner);
