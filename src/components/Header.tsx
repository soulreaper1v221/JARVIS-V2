// ─── Top header bar ───────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import ArcReactor from './ArcReactor';
import { getBattery, isOnline } from '../engine/monitors';

interface HeaderProps {
  userName: string;
  isThinking: boolean;
  isBooting: boolean;
}

export default function Header({ userName, isThinking, isBooting }: HeaderProps) {
  const [now, setNow] = useState(new Date());
  const [online, setOnline] = useState(isOnline());
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    const onLine = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onLine);
    window.addEventListener('offline', onOffline);
    getBattery().then((b) => {
      if (b) setBattery({ level: b.level, charging: b.charging });
    });
    return () => {
      clearInterval(t);
      window.removeEventListener('online', onLine);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return (
    <header
      className="relative z-20 border-b border-cyan-400/15 px-4 scan-beacon"
      style={{
        flexShrink: 0,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: 'linear-gradient(180deg, rgba(11,18,32,0.92), rgba(6,10,16,0.85))',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ width: 42, height: 42, flexShrink: 0 }}>
        <ArcReactor size={42} isThinking={isThinking} isBooting={isBooting} />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="holo-text text-lg font-black tracking-[0.18em] leading-none">JARVIS</h1>
          <span className="text-[9px] font-mono px-1 py-0.5 rounded border border-cyan-400/25 text-cyan-400/80 tracking-widest">
            V2.0
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-500 tracking-wider mt-0.5">
          JUST A RATHER VERY INTELLIGENT SYSTEM
        </div>
      </div>

      <div className="flex-1" />

      {/* status cluster */}
      <div className="hidden md:flex items-center gap-2">
        <span className={`jv-chip ${isThinking ? 'anim-blink' : ''}`} style={isThinking ? { borderColor: 'rgba(0,229,255,0.6)' } : {}}>
          {isThinking ? '◉ THINKING' : '● ONLINE'}
        </span>
        {battery && (
          <span className="jv-chip" style={{ borderColor: 'rgba(34,224,122,0.3)', color: '#22e07a' }}>
            🔋 {battery.level}%{battery.charging ? ' ⚡' : ''}
          </span>
        )}
      </div>

      <div className="text-right">
        <div className="font-mono text-sm font-bold text-cyan-200 tabular-nums leading-none">
          {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className="text-[10px] text-slate-500 leading-none mt-1">
          {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div
        className="flex items-center gap-2 pl-3 ml-1 border-l border-cyan-400/15"
        title={online ? 'Connected' : 'Offline'}
      >
        <span
          className="rounded-full"
          style={{
            width: 9,
            height: 9,
            background: online ? '#22e07a' : '#ff4d6d',
            boxShadow: online ? '0 0 8px rgba(34,224,122,0.8)' : '0 0 8px rgba(255,77,109,0.8)',
          }}
        />
        <span className="text-xs font-semibold text-slate-300 max-w-[110px] truncate">{userName}</span>
      </div>
    </header>
  );
}
