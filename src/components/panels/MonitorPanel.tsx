// ─── System monitor panel ─────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { getMonitorData, getMemory, getNetwork, getBattery, getHardwareInfo, getFormattedUptime, isOnline } from '../../engine/monitors';
import type { MonitorData } from '../../types';

function Gauge({ label, value, unit, color, icon }: { label: string; value: number; unit: string; color: string; icon: string }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="jv-panel p-4 flex flex-col items-center">
      <div className="relative" style={{ width: 110, height: 110 }}>
        <svg viewBox="0 0 110 110" className="w-full h-full -rotate-90">
          <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(27,42,68,0.9)" strokeWidth="9" />
          <circle
            cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (c * pct) / 100}
            style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dashoffset .6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl">{icon}</span>
          <span className="text-lg font-black font-mono" style={{ color }}>{Math.round(pct)}{unit}</span>
        </div>
      </div>
      <div className="text-[11px] font-bold tracking-widest text-slate-400 mt-2">{label}</div>
    </div>
  );
}

export default function MonitorPanel({ onNotify }: { onNotify: (msg: string) => void }) {
  const [data, setData] = useState<MonitorData>(() => getMonitorData());
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  const [hardware] = useState(() => getHardwareInfo());
  const [running, setRunning] = useState(true);
  const [details, setDetails] = useState('');

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setData(getMonitorData());
    }, 1500);
    getBattery().then((b) => b && setBattery({ level: b.level, charging: b.charging }));
    return () => clearInterval(t);
  }, [running]);

  const mem = getMemory();
  const net = getNetwork();

  const refresh = () => {
    setData(getMonitorData());
    onNotify('Snapshot refreshed.');
  };

  const fetchDetails = async () => {
    setDetails('Pulling diagnostics…');
    const { getDetailedStatus } = await import('../../engine/monitors');
    const text = await getDetailedStatus();
    setDetails(text);
    onNotify('Full diagnostic ready.');
  };

  return (
    <div className="p-4 overflow-y-auto" style={{ flex: 1, minHeight: 0 }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🖥️</span>
          <div>
            <h2 className="text-lg font-bold text-cyan-100 leading-tight">System Monitor</h2>
            <p className="text-xs text-slate-500">
              Live readings · refresh: 1.5s · <span style={{ color: isOnline() ? '#22e07a' : '#ff4d6d' }}>{isOnline() ? 'online' : 'offline'}</span>
            </p>
          </div>
          <div className="flex-1" />
          <button onClick={fetchDetails} className="jv-btn !text-xs">🧾 Full diagnostic</button>
          <button onClick={() => setRunning(!running)} className="jv-btn !text-xs">
            {running ? '⏸ Pause' : '▶ Resume'}
          </button>
          <button onClick={refresh} className="jv-btn !text-xs">⟳</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Gauge label="CPU" value={data.cpu} unit="%" color="#00e5ff" icon="⚡" />
          <Gauge label="RAM" value={data.ram} unit="%" color="#3d7bff" icon="🧠" />
          <Gauge label="NET ↓" value={Math.min(100, data.network.down * 4)} unit="%" color="#22e07a" icon="📡" />
          <Gauge label="NET ↑" value={Math.min(100, data.network.up * 8)} unit="%" color="#ffb020" icon="📤" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="jv-panel p-4">
            <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-3">NETWORK</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Download</span><span className="font-mono text-cyan-200">{net.down} Mbps</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Upload</span><span className="font-mono text-cyan-200">{net.up} Mbps</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="font-mono text-cyan-200">{net.type}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Latency</span><span className="font-mono text-cyan-200">{net.rtt} ms</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Uptime</span><span className="font-mono text-cyan-200">{getFormattedUptime(data.uptime)}</span></div>
            </div>
          </div>
          <div className="jv-panel p-4">
            <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-3">MEMORY</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Used</span><span className="font-mono text-cyan-200">{(mem.used / 1048576).toFixed(0)} MB</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-mono text-cyan-200">{(mem.total / 1048576).toFixed(0)} MB</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Percent</span><span className="font-mono text-cyan-200">{mem.percent}%</span></div>
              {battery && (
                <>
                  <div className="flex justify-between"><span className="text-slate-500">Battery</span><span className="font-mono text-cyan-200">{battery.level}%{battery.charging ? ' ⚡' : ''}</span></div>
                </>
              )}
              <div className="flex justify-between"><span className="text-slate-500">Cores</span><span className="font-mono text-cyan-200">{hardware.cores}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Device RAM</span><span className="font-mono text-cyan-200">{hardware.deviceMemoryGB} GB</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Platform</span><span className="font-mono text-cyan-200 truncate max-w-[130px]">{hardware.platform}</span></div>
            </div>
          </div>
        </div>

        {details && (
          <div className="jv-panel p-4 mb-4 scan-overlay">
            <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-2">DIAGNOSTIC</div>
            <pre className="text-xs text-cyan-100/90 font-mono whitespace-pre-wrap leading-relaxed">{details}</pre>
          </div>
        )}

        <div className="jv-panel p-3 text-[11px] font-mono text-slate-600 leading-relaxed">
          <div className="text-cyan-500/70 mb-1">▌ NOTES</div>
          <div>• CPU is estimated via a 100K sqrt benchmark — a heavier tab load = higher %</div>
          <div>• RAM % uses performance.memory when available (Chromium), otherwise an estimate</div>
          <div>• Ask me in chat: "system status" or "detailed status"</div>
        </div>
      </div>
    </div>
  );
}
