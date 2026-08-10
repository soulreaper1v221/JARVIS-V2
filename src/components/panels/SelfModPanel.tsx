// ─── Self-modification panel: modules, backups, custom tools ─────────────

import { useMemo, useState } from 'react';
import {
  listModules,
  readModule,
  editModule,
  toggleModule,
  createBackup,
  listBackups,
  restoreBackup,
  addCustomTool,
  removeCustomTool,
  listCustomTools,
  runCustomTool,
  validateCode,
  triggerReload,
  getSystemState,
} from '../../engine/selfmod';

export default function SelfModPanel({ onNotify }: { onNotify: (msg: string) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [toolName, setToolName] = useState('');
  const [toolDesc, setToolDesc] = useState('');
  const [toolCode, setToolCode] = useState('');
  const [toolResult, setToolResult] = useState('');
  const [system, setSystem] = useState<Record<string, unknown> | null>(null);
  const [, force] = useState(0);

  const modules = useMemo(() => listModules(), [force]); // eslint-disable-line react-hooks/exhaustive-deps
  const backups = useMemo(() => listBackups(), [force]); // eslint-disable-line react-hooks/exhaustive-deps
  const tools = useMemo(() => listCustomTools(), [force]); // eslint-disable-line react-hooks/exhaustive-deps
  const rerender = () => force((x) => x + 1);

  const openModule = (id: string) => {
    const m = readModule(id);
    if (m) {
      setSelectedId(id);
      setCode(m.code);
    }
  };

  const saveModule = () => {
    if (!selectedId) return;
    const err = validateCode(code);
    if (err) {
      onNotify(`Blocked: ${err}`);
      return;
    }
    editModule(selectedId, code);
    onNotify(`Module ${selectedId} updated (auto-backup created).`);
    rerender();
  };

  const showSystem = async () => {
    setSystem(await getSystemState());
  };

  const addTool = () => {
    if (!toolName.trim() || !toolCode.trim()) return;
    try {
      const ok = addCustomTool(toolName, toolDesc, toolCode);
      onNotify(ok ? `Custom tool "${toolName}" registered.` : 'Tool name already exists.');
      if (ok) {
        setToolName('');
        setToolDesc('');
        setToolCode('');
        rerender();
      }
    } catch (e) {
      onNotify(`Blocked: ${(e as Error).message}`);
    }
  };

  const runTool = (name: string) => {
    const result = runCustomTool(name);
    setToolResult(result.error ? `❌ ${result.error}` : String(result.output));
  };

  return (
    <div className="p-4 overflow-y-auto" style={{ flex: 1, minHeight: 0 }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🧩</span>
          <div>
            <h2 className="text-lg font-bold text-cyan-100 leading-tight">Self-Modification Console</h2>
            <p className="text-xs text-slate-500">I can edit my own source — backups are automatic, sandbox rules enforced</p>
          </div>
          <div className="flex-1" />
          <button onClick={showSystem} className="jv-btn !text-xs">⚙ System state</button>
          <button onClick={() => { if (confirm('Reload JARVIS? Unsaved module edits will be lost.')) triggerReload(); }} className="jv-btn !text-xs">⟳ Reload</button>
        </div>

        {system && (
          <div className="jv-panel p-4 mb-4">
            <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-2">SYSTEM STATE</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {Object.entries(system).map(([k, v]) => (
                <div key={k} className="bg-black/25 rounded p-2">
                  <div className="text-slate-500 text-[10px] font-mono">{k}</div>
                  <div className="text-cyan-200 font-mono">{String(v)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* modules */}
          <div className="md:col-span-2 space-y-4">
            <div className="jv-panel p-4">
              <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-3">MODULES ({modules.length})</div>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {modules.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-xs p-2 rounded border border-cyan-400/10 hover:border-cyan-400/30 transition-all">
                    <button onClick={() => toggleModule(m.id) && rerender()} className="text-sm" title="Toggle">
                      {m.enabled ? '🟢' : '⚪'}
                    </button>
                    <button onClick={() => openModule(m.id)} className="flex-1 text-left min-w-0">
                      <div className="font-mono font-bold text-cyan-300">{m.id}</div>
                      <div className="text-[10px] text-slate-500 truncate">{m.description}</div>
                    </button>
                    <button onClick={() => openModule(m.id)} className="text-[10px] text-slate-500 hover:text-cyan-300">view</button>
                    <button
                      onClick={() => {
                        const b = createBackup(m.id);
                        onNotify(b ? `Backup ${b.id} created for ${m.id}.` : 'Backup failed.');
                        rerender();
                      }}
                      className="text-[10px] text-slate-500 hover:text-cyan-300"
                    >
                      backup
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {selectedId && (
              <div className="jv-panel p-4 scan-overlay">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold tracking-widest text-cyan-400/80">EDITING: {selectedId}</span>
                  <div className="flex-1" />
                  <button onClick={saveModule} className="jv-btn jv-btn-primary !px-3 !py-1 !text-[11px]">💾 Save (auto-backup)</button>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  rows={14}
                  className="w-full resize-none outline-none p-3 font-mono text-[11px] leading-relaxed rounded-lg"
                  style={{ background: 'rgba(3,6,10,0.8)', color: '#cfe4f2', border: '1px solid rgba(27,42,68,1)' }}
                />
                <div className="text-[10px] text-slate-600 mt-1.5">
                  ⚠ sandbox blocks: eval · require · import · process · fetch · localStorage · prototype manipulation
                </div>
              </div>
            )}
          </div>

          {/* backups + tools */}
          <div className="space-y-4">
            <div className="jv-panel p-4">
              <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-3">BACKUPS ({backups.length}/20)</div>
              {backups.length === 0 ? (
                <div className="text-xs text-slate-600">No backups yet — edits auto-create them.</div>
              ) : (
                <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
                  {backups.slice(0, 10).map((b) => (
                    <div key={b.id} className="text-[11px] p-2 rounded border border-cyan-400/10 bg-black/20">
                      <div className="font-mono text-cyan-300 truncate">{b.label}</div>
                      <div className="text-[10px] text-slate-500">{b.moduleId} · {new Date(b.timestamp).toLocaleString()}</div>
                      <button
                        onClick={() => {
                          if (restoreBackup(b.id)) {
                            onNotify(`Restored ${b.id}.`);
                            rerender();
                            if (selectedId === b.moduleId) openModule(b.moduleId);
                          }
                        }}
                        className="text-[10px] text-cyan-400/70 hover:text-cyan-300 mt-1"
                      >
                        ↺ restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="jv-panel p-4">
              <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-3">CUSTOM TOOLS ({tools.length})</div>
              <div className="space-y-1.5 mb-3 max-h-[180px] overflow-y-auto pr-1">
                {tools.map((t) => (
                  <div key={t.name} className="text-[11px] p-2 rounded border border-cyan-400/10 bg-black/20 flex items-center gap-2">
                    <span className="flex-1 min-w-0">
                      <span className="font-mono text-cyan-200">{t.name}</span>
                      <span className="text-slate-500 text-[10px] block truncate">{t.description}</span>
                    </span>
                    <button onClick={() => runTool(t.name)} className="text-[10px] text-cyan-400/70 hover:text-cyan-300">run</button>
                    <button onClick={() => { removeCustomTool(t.name); rerender(); }} className="text-[10px] text-slate-500 hover:text-red-400">✕</button>
                  </div>
                ))}
                {tools.length === 0 && <div className="text-xs text-slate-600">No custom tools yet.</div>}
              </div>
              <div className="space-y-1.5">
                <input value={toolName} onChange={(e) => setToolName(e.target.value)} placeholder="tool name" className="jv-input !text-[11px] !py-1" />
                <input value={toolDesc} onChange={(e) => setToolDesc(e.target.value)} placeholder="description" className="jv-input !text-[11px] !py-1" />
                <textarea value={toolCode} onChange={(e) => setToolCode(e.target.value)} placeholder={'function(args) {\n  // only Math, Date, JSON, console, args available\n  return "hello custom world";\n}'} rows={4} className="jv-input font-mono !text-[11px]" />
                <button onClick={addTool} className="jv-btn jv-btn-primary !text-[11px] w-full">+ Register tool</button>
              </div>
            </div>

            {toolResult && (
              <div className="jv-panel p-4">
                <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-2">TOOL OUTPUT</div>
                <pre className="text-xs font-mono whitespace-pre-wrap text-cyan-100/90">{toolResult}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
