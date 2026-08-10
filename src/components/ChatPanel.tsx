// ─── Chat message list ────────────────────────────────────────────────────

import { useEffect, useMemo, useRef } from 'react';
import type { ChatMessage } from '../types';
import { renderMarkdown } from '../utils/markdown';
import ArcReactor from './ArcReactor';

interface ChatPanelProps {
  messages: ChatMessage[];
  isThinking: boolean;
  userName: string;
  onSuggestion: (text: string) => void;
}

const TYPE_META: Record<string, { icon: string; label: string; color: string }> = {
  'file-result': { icon: '🗂️', label: 'FILE', color: '#ffb020' },
  'tool-result': { icon: '🛠️', label: 'TOOL', color: '#22e07a' },
  reasoning: { icon: '🧠', label: 'REASONING', color: '#a78bfa' },
  error: { icon: '⚠️', label: 'ERROR', color: '#ff4d6d' },
};

const WELCOME_SUGGESTIONS = [
  'who are you',
  'tell me a joke',
  'system status',
  'what can you do',
  'write a snake game',
  'search quantum computing',
];

function MessageBubble({ msg, isLast, userName }: { msg: ChatMessage; isLast: boolean; userName: string }) {
  const isUser = msg.role === 'user';
  const type = msg.type && msg.type !== 'text' ? TYPE_META[msg.type] : null;
  const html = useMemo(() => (msg.role === 'jarvis' || msg.role === 'system' ? renderMarkdown(msg.content) : ''), [msg.content, msg.role]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
    } catch { /* noop */ }
  };

  return (
    <div className={`flex flex-col gap-1.5 anim-fade-up ${isUser ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center gap-2 px-1 text-[10px] font-mono text-slate-500">
        <span style={{ color: isUser ? '#7df3ff' : '#00e5ff' }}>{isUser ? userName || 'YOU' : 'JARVIS'}</span>
        {type && <span className="px-1 rounded border text-[9px]" style={{ borderColor: type.color + '55', color: type.color }}>{type.icon} {type.label}</span>}
        <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <button onClick={copy} className="opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity text-[10px] text-slate-500 hover:text-cyan-300">⧉</button>
      </div>

      {msg.role === 'user' ? (
        <div
          className="msg-bubble text-right"
          style={{
            background: 'linear-gradient(135deg, rgba(0,229,255,0.16), rgba(61,123,255,0.14))',
            border: '1px solid rgba(0,229,255,0.28)',
            color: '#eafcff',
          }}
        >
          <span className="whitespace-pre-wrap">{msg.content}</span>
        </div>
      ) : (
        <div
          className="msg-bubble w-full max-w-[92%]"
          style={{
            background: 'linear-gradient(180deg, rgba(14,22,38,0.92), rgba(9,14,26,0.94))',
            border: '1px solid rgba(27,42,68,0.9)',
            color: '#d7e6f5',
            boxShadow: isLast ? '0 0 18px rgba(0,229,255,0.07)' : '0 4px 16px rgba(0,0,0,0.35)',
          }}
        >
          <div
            className="text-[13.5px]"
            style={{ lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
    </div>
  );
}

export default function ChatPanel({ messages, isThinking, userName, onSuggestion }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, isThinking]);

  const welcome = messages.length === 0;

  return (
    <div
      ref={scrollRef}
      className="px-4 py-4"
      style={{ flex: 1, overflowY: 'auto', minHeight: 0, scrollBehavior: 'smooth' }}
    >
      {welcome ? (
        <div className="h-full flex flex-col items-center justify-center text-center px-6" style={{ minHeight: '100%' }}>
          <div className="anim-float mb-4" style={{ width: 130, height: 130 }}>
            <ArcReactor size={130} isThinking={false} />
          </div>
          <h2 className="holo-text text-2xl font-black tracking-[0.14em] mb-2 anim-flicker">JARVIS ONLINE</h2>
          <p className="text-slate-500 text-sm max-w-md leading-relaxed mb-6">
            All systems operational. Ask me anything — I can chat, write &amp; run code, search the web,
            manage your schedule and files, monitor this machine, and even modify my own modules.
          </p>
          <div className="grid grid-cols-2 gap-2 max-w-md w-full">
            {WELCOME_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestion(s)}
                className="jv-btn !justify-start !text-left !text-xs !py-2.5 !px-3"
              >
                <span className="text-cyan-400/60 text-[10px]">▸</span> {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto flex flex-col gap-4" style={{ paddingBottom: 8 }}>
          {messages.map((m, i) => (
            <div key={m.id} className="group">
              <MessageBubble msg={m} isLast={i === messages.length - 1} userName={userName} />
            </div>
          ))}
          {isThinking && (
            <div className="flex items-center gap-2.5 pl-1 anim-fade-up">
              <div style={{ width: 34, height: 34 }}>
                <ArcReactor size={34} isThinking />
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="rounded-full"
                    style={{
                      width: 7,
                      height: 7,
                      background: '#00e5ff',
                      animation: `blink 1.2s ${i * 0.2}s step-end infinite`,
                      boxShadow: '0 0 6px rgba(0,229,255,0.7)',
                    }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-mono text-cyan-500/70 tracking-wider">PROCESSING</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
