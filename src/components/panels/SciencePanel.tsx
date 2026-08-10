// ─── Science knowledge panel ──────────────────────────────────────────────

import { useState } from 'react';
import { SCIENCE_DB, formatScienceResponse, crossReference, deepResearch } from '../../engine/science';

export default function SciencePanel({ onNotify }: { onNotify: (msg: string) => void }) {
  const [domain, setDomain] = useState(SCIENCE_DB[0].name);
  const [concept, setConcept] = useState('');
  const [result, setResult] = useState('');
  const [researchQ, setResearchQ] = useState('');
  const [busy, setBusy] = useState(false);

  const active = SCIENCE_DB.find((d) => d.name === domain) ?? SCIENCE_DB[0];

  const showDomain = () => {
    setResult(formatScienceResponse(domain, concept.trim() || undefined));
  };

  const showConcept = (name: string) => {
    setConcept(name);
    setResult(formatScienceResponse(domain, name));
  };

  const runResearch = async () => {
    if (!researchQ.trim()) return;
    setBusy(true);
    setResult(`🔬 Deep research on "${researchQ.trim()}"… combining local DB + live web…`);
    try {
      const out = await deepResearch(researchQ.trim());
      setResult(out);
      onNotify('Deep research complete.');
    } catch (e) {
      setResult(`Research failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const showCross = () => {
    setResult(`🔗 **Cross-references for "${concept || domain}":**\n\n${crossReference(concept || domain, domain).map((r) => `• ${r}`).join('\n') || 'No connections found.'}`);
  };

  return (
    <div className="p-4 overflow-y-auto" style={{ flex: 1, minHeight: 0 }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🔬</span>
          <div>
            <h2 className="text-lg font-bold text-cyan-100 leading-tight">Science Knowledge Base</h2>
            <p className="text-xs text-slate-500">{SCIENCE_DB.length} domains · facts · concepts · formulas</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {SCIENCE_DB.map((d) => (
            <button
              key={d.name}
              onClick={() => { setDomain(d.name); setConcept(''); }}
              className="jv-btn !text-[11px] !py-1.5"
              style={domain === d.name ? { borderColor: 'rgba(0,229,255,0.6)', background: 'rgba(0,229,255,0.12)' } : {}}
            >
              {d.emoji} {d.name[0].toUpperCase() + d.name.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="jv-panel p-4 md:col-span-2">
            <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-3">{active.emoji} {active.name.toUpperCase()} — CONCEPTS</div>
            <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
              {active.concepts.map((c) => (
                <button
                  key={c.name}
                  onClick={() => showConcept(c.name)}
                  className="w-full text-left text-xs p-2 rounded border border-cyan-400/10 hover:border-cyan-400/40 hover:bg-cyan-400/5 transition-all"
                >
                  <span className="font-bold text-cyan-200">{c.name}</span>
                  <span className="text-slate-500"> — {c.definition}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="jv-panel p-4">
            <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-3">FORMULAS{active.formulas ? ` (${active.formulas.length})` : ''}</div>
            {active.formulas ? (
              <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                {active.formulas.map((f) => (
                  <button key={f.name} onClick={() => { setConcept(f.name); setResult(formatScienceResponse(domain, f.name)); }} className="w-full text-left p-2 rounded border border-cyan-400/10 hover:border-cyan-400/40 transition-all">
                    <div className="text-xs font-mono font-bold text-cyan-300">{f.formula}</div>
                    <div className="text-[10px] text-slate-500">{f.name} — {f.meaning}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-600">No formulas in this domain.</div>
            )}
            <div className="flex gap-2 mt-3">
              <button onClick={showDomain} className="jv-btn jv-btn-primary !text-[11px] flex-1">Show {active.name}</button>
              <button onClick={showCross} className="jv-btn !text-[11px]">🔗 Cross-ref</button>
            </div>
          </div>
        </div>

        {/* deep research */}
        <div className="jv-panel p-4 mb-4">
          <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-2">🔬 DEEP RESEARCH</div>
          <div className="flex gap-2">
            <input
              value={researchQ}
              onChange={(e) => setResearchQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runResearch()}
              placeholder="e.g. quantum entanglement — combines local DB + web sources"
              className="jv-input !text-xs flex-1"
            />
            <button onClick={runResearch} disabled={busy} className="jv-btn jv-btn-primary !text-xs">{busy ? '⏳…' : 'Research'}</button>
          </div>
        </div>

        {result && (
          <div className="jv-panel p-4 mb-4 scan-overlay">
            <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-2">RESULT</div>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{result}</div>
          </div>
        )}
      </div>
    </div>
  );
}
