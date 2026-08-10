// ─── App launcher panel ───────────────────────────────────────────────────

import { useMemo, useState } from 'react';
import { APP_CATEGORIES, listApps, launchApp } from '../../engine/launcher';
import type { AppCategory } from '../../engine/launcher';
import { trackTopic } from '../../engine/auth';

export default function AppsPanel({ onNotify }: { onNotify: (msg: string) => void }) {
  const [category, setCategory] = useState<AppCategory | 'all'>('all');
  const [query, setQuery] = useState('');

  const apps = useMemo(() => {
    let list = category === 'all' ? listApps() : listApps(category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.display.toLowerCase().includes(q));
    }
    return list;
  }, [category, query]);

  const handleLaunch = (name: string) => {
    const result = launchApp(name);
    trackTopic('apps');
    if (result.success) {
      onNotify(`${result.method === 'native' ? '⚡' : result.method === 'protocol' ? '🔗' : '🌐'} Launched ${result.app.name} (${result.method}).`);
    } else {
      onNotify(`Could not launch "${name}".`);
    }
  };

  const count = useMemo(() => listApps().length, []);

  return (
    <div className="p-4 overflow-y-auto" style={{ flex: 1, minHeight: 0 }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🚀</span>
          <div>
            <h2 className="text-lg font-bold text-cyan-100 leading-tight">App Launcher</h2>
            <p className="text-xs text-slate-500">{count} apps · {APP_CATEGORIES.length} categories · native → protocol → web fallback</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setCategory('all')}
            className="jv-btn !text-[11px] !py-1.5"
            style={category === 'all' ? { borderColor: 'rgba(0,229,255,0.6)', background: 'rgba(0,229,255,0.12)' } : {}}
          >
            ALL
          </button>
          {APP_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="jv-btn !text-[11px] !py-1.5"
              style={category === c ? { borderColor: 'rgba(0,229,255,0.6)', background: 'rgba(0,229,255,0.12)' } : {}}
            >
              {c}
            </button>
          ))}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔎 filter apps…"
            className="jv-input !text-xs !w-44 !py-1.5 ml-auto"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {apps.map((app) => (
            <button
              key={app.name + app.category}
              onClick={() => handleLaunch(app.name)}
              className="jv-panel p-3 text-left hover:!border-cyan-400/50 transition-all group"
              style={{ cursor: 'pointer' }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl group-hover:scale-110 transition-transform">{app.icon}</span>
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-cyan-100 truncate">{app.name}</div>
                  <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">{app.category}</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 leading-snug line-clamp-2">{app.display}</div>
              <div className="text-[10px] font-mono text-cyan-500/50 mt-1.5 group-hover:text-cyan-300 transition-colors">
                ▶ launch {app.protocol ? `(${app.protocol}://)` : '(web)'}
              </div>
            </button>
          ))}
        </div>

        {apps.length === 0 && (
          <div className="jv-panel p-8 text-center text-sm text-slate-500">No apps match "{query}".</div>
        )}
      </div>
    </div>
  );
}
