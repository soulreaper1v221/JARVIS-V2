// ─── Message input bar ────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import type { InputMode } from '../types';

interface InputBarProps {
  onSend: (text: string, mode: InputMode) => void;
  disabled?: boolean;
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  suggestions?: string[];
}

const QUICK = [
  'tell me a joke',
  'system status',
  'open youtube',
  'set schedule: Monday Math 9-10',
  'write a snake game',
];

export default function InputBar({ onSend, disabled, mode, onModeChange, suggestions }: InputBarProps) {
  const [text, setText] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 140) + 'px';
    }
  }, [text]);

  const submit = () => {
    const value = text.trim();
    if (!value || disabled) return;
    onSend(value, mode);
    setText('');
    if (taRef.current) taRef.current.style.height = 'auto';
  };

  const quick = suggestions ?? QUICK;

  return (
    <div
      className="border-t border-cyan-400/15 px-3 pt-2 pb-2.5"
      style={{
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(6,10,16,0.6), rgba(8,13,24,0.95))',
      }}
    >
      {/* quick suggestions */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 hide-scroll" style={{ scrollbarWidth: 'none' }}>
        {quick.slice(0, 5).map((q) => (
          <button
            key={q}
            onClick={() => onSend(q, mode)}
            className="shrink-0 text-[11px] px-2.5 py-1 rounded-full border border-cyan-400/20 text-slate-400 hover:text-cyan-300 hover:border-cyan-400/50 transition-colors"
            style={{ background: 'rgba(0,229,255,0.04)' }}
          >
            {q}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2">
        {/* mode toggle */}
        <div className="flex flex-col items-center gap-1" style={{ flexShrink: 0 }}>
          <button
            onClick={() => onModeChange(mode === 'chat' ? 'command' : 'chat')}
            className="jv-btn !px-2.5 !py-1.5 !text-[11px]"
            title="Toggle input mode"
            style={mode === 'command' ? { borderColor: 'rgba(255,176,32,0.6)', color: '#ffd28a', background: 'rgba(255,176,32,0.08)' } : {}}
          >
            {mode === 'chat' ? '💬 CHAT' : '⌨ CMD'}
          </button>
          <span className="text-[9px] font-mono text-slate-600">{mode === 'chat' ? 'natural' : 'direct'}</span>
        </div>

        <div className="flex-1 min-w-0 relative">
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={mode === 'chat' ? 'Ask JARVIS anything… (Enter to send, Shift+Enter for newline)' : 'Enter a command… e.g. /files, /monitor, create file x.txt: hi'}
            rows={1}
            className="w-full resize-none outline-none rounded-xl pl-4 pr-14 py-2.5 text-sm leading-relaxed"
            style={{
              background: 'rgba(6,10,16,0.9)',
              border: '1px solid rgba(27,42,68,1)',
              color: '#d7e6f5',
              maxHeight: 140,
              transition: 'border-color .15s',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(0,229,255,0.6)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(27,42,68,1)')}
          />
          <button
            onClick={submit}
            disabled={!text.trim() || disabled}
            className="absolute right-2 bottom-2 jv-btn jv-btn-primary !p-2 !rounded-lg"
            style={{ width: 34, height: 34 }}
            title="Send"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
