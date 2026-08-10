// ─── Memory & conversation context panel ──────────────────────────────────

import { useMemo, useState } from 'react';
import { getAllMemory, getMemoryStats, searchMemory, clearMemory } from '../../engine/memory';
import { getTopicsCovered, getUserProfile, getRecentStatements, getOpinionsShared, getThreadDepth, isAwaitingResponse, detectConversationStyle, context } from '../../engine/conversation';

export default function MemoryPanel({ onNotify }: { onNotify: (msg: string) => void }) {
  const [query, setQuery] = useState('');
  const [, force] = useState(0);
  const rerender = () => force((x) => x + 1);

  const stats = useMemo(() => getMemoryStats(), [force]); // eslint-disable-line react-hooks/exhaustive-deps
  const all = useMemo(() => getAllMemory(), [force]); // eslint-disable-line react-hooks/exhaustive-deps
  const results = useMemo(() => (query.trim() ? searchMemory(query) : []), [query, force]); // eslint-disable-line react-hooks/exhaustive-deps
  const profile = getUserProfile();
  const topics = getTopicsCovered().slice(-12);
  const statements = getRecentStatements().slice(0, 5);
  const opinions = getOpinionsShared().slice(0, 5);
  const style = detectConversationStyle();

  const handleClear = () => {
    clearMemory();
    onNotify('Conversation memory cleared.');
    rerender();
  };

  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-4 overflow-y-auto" style={{ flex: 1, minHeight: 0 }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🧠</span>
          <div>
            <h2 className="text-lg font-bold text-cyan-100 leading-tight">Memory &amp; Context</h2>
            <p className="text-xs text-slate-500">
              {stats.totalTurns} turns · {stats.keywordCount} keywords · style: {style} · thread depth: {getThreadDepth()} · {isAwaitingResponse() ? 'awaiting your answer ⏳' : 'no pending question'}
            </p>
          </div>
          <div className="flex-1" />
          <button onClick={handleClear} className="jv-btn !text-xs !text-red-400/90" style={{ borderColor: 'rgba(255,77,109,0.35)' }}>🗑 Clear</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {/* stats */}
          <div className="jv-panel p-4">
            <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-3">STATS</div>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div className="bg-black/25 rounded p-2"><div className="text-xl font-black font-mono text-cyan-300">{stats.totalTurns}</div><div className="text-[10px] text-slate-500">turns</div></div>
              <div className="bg-black/25 rounded p-2"><div className="text-xl font-black font-mono text-cyan-300">{stats.userTurns}</div><div className="text-[10px] text-slate-500">yours</div></div>
              <div className="bg-black/25 rounded p-2"><div className="text-xl font-black font-mono text-cyan-300">{stats.jarvisTurns}</div><div className="text-[10px] text-slate-500">mine</div></div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {stats.topKeywords.map((k) => (
                <span key={k} className="text-[10px] font-mono text-cyan-300/80 bg-cyan-400/8 border border-cyan-400/20 rounded px-1.5 py-0.5">{k}</span>
              ))}
            </div>
          </div>

          {/* profile */}
          <div className="jv-panel p-4">
            <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-3">WHAT I KNOW ABOUT YOU</div>
            {Object.keys(profile).length === 0 && <div className="text-xs text-slate-600">Nothing yet — tell me things like "my name is Alex" or "I like space".</div>}
            <div className="space-y-1.5">
              {Object.entries(profile).slice(0, 12).map(([k, v]) => (
                <div key={k} className="text-xs flex gap-2">
                  <span className="text-cyan-400/70 font-mono shrink-0">{k}:</span>
                  <span className="text-slate-300 truncate">{v}</span>
                </div>
              ))}
            </div>
            {topics.length > 0 && (
              <>
                <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mt-4 mb-2">TOPICS COVERED</div>
                <div className="flex flex-wrap gap-1.5">
                  {topics.map((t) => <span key={t} className="text-[10px] text-slate-400 bg-black/25 rounded px-1.5 py-0.5">{t}</span>)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* search */}
        <div className="jv-panel p-4 mb-4">
          <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-2">🔎 SEARCH MEMORY</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="partial keyword match — e.g. python"
            className="jv-input !text-xs mb-3"
          />
          {query.trim() ? (
            results.length === 0 ? (
              <div className="text-xs text-slate-600">No memory matches "{query}".</div>
            ) : (
              results.map((e) => (
                <div key={e.id} className="text-xs py-2 border-b border-cyan-400/8 last:border-0">
                  <div className="flex gap-2 items-center">
                    <span className={`px-1 rounded text-[9px] font-bold ${e.role === 'user' ? 'text-cyan-300 bg-cyan-400/10' : 'text-violet-300 bg-violet-400/10'}`}>
                      {e.role === 'user' ? 'YOU' : 'JARVIS'}
                    </span>
                    <span className="text-slate-600 font-mono text-[10px]">{fmtTime(e.timestamp)}</span>
                  </div>
                  <div className="text-slate-300 mt-1">{e.content.length > 200 ? e.content.slice(0, 200) + '…' : e.content}</div>
                  <div className="flex gap-1 mt-1">
                    {e.keywords.map((k) => <span key={k} className="text-[9px] text-cyan-500/60 font-mono">{k}</span>)}
                  </div>
                </div>
              ))
            )
          ) : (
            <div className="text-xs text-slate-600">Search the full conversation store, or browse the last {Math.min(all.length, 15)} turns below.</div>
          )}
        </div>

        {/* recent turns */}
        {!query.trim() && (
          <div className="jv-panel p-4 mb-4">
            <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-3">RECENT TURNS ({Math.min(all.length, 15)})</div>
            <div className="space-y-2">
              {all.slice(-15).reverse().map((e) => (
                <div key={e.id} className="text-xs">
                  <span className={`px-1 rounded text-[9px] font-bold mr-2 ${e.role === 'user' ? 'text-cyan-300 bg-cyan-400/10' : 'text-violet-300 bg-violet-400/10'}`}>
                    {e.role.toUpperCase()}
                  </span>
                  <span className="text-slate-500">{fmtTime(e.timestamp)}</span>
                  <div className="text-slate-400 mt-0.5 pl-1">{e.content.length > 160 ? e.content.slice(0, 160) + '…' : e.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* statements & opinions */}
        {(statements.length > 0 || opinions.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="jv-panel p-4">
              <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-2">MY RECENT STATEMENTS</div>
              {statements.map((s, i) => <div key={i} className="text-xs text-slate-400 py-1 border-b border-cyan-400/8 last:border-0">“{s}”</div>)}
            </div>
            <div className="jv-panel p-4">
              <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-2">MY OPINIONS SHARED</div>
              {opinions.map((s, i) => <div key={i} className="text-xs text-slate-400 py-1 border-b border-cyan-400/8 last:border-0">“{s}”</div>)}
            </div>
          </div>
        )}

        {context.jarvisMemory.userConcerns.length > 0 && (
          <div className="jv-panel p-4">
            <div className="text-[11px] font-bold tracking-widest text-amber-400/80 mb-2">💛 THINGS YOU SHARED WHEN DOWN</div>
            <div className="space-y-1.5">
              {context.jarvisMemory.userConcerns.slice(-5).map((c, i) => (
                <div key={i} className="text-xs text-slate-400">• {c}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
