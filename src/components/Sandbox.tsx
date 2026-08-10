// ─── Sandbox: CODE editor + PREVIEW iframe ────────────────────────────────

import { useEffect, useMemo, useRef, useState } from 'react';
import { runCode } from '../engine/coderunner';
import type { GeneratedCode } from '../engine/coderunner';

interface SandboxProps {
  code: string;
  language: string;
  title: string;
  animated?: boolean;
  onClose?: () => void;
  height?: number;
}

interface ConsoleLine {
  level: 'log' | 'warn' | 'error' | 'info';
  text: string;
}

/** Wrap user JS in a dark HTML document with console capture. */
export function buildPreviewDoc(jsCode: string): string {
  const escaped = jsCode.replace(/<\/script>/gi, '<\\/script>');
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; background: #060a10; overflow: hidden; }
  #screen { width: 100vw; height: 100vh; display: block; }
  #err {
    display: none; position: fixed; left: 12px; right: 12px; bottom: 12px;
    background: rgba(255, 77, 109, 0.12); border: 1px solid rgba(255, 77, 109, 0.5);
    color: #ff8fa3; font: 12px/1.5 monospace; padding: 10px 14px; border-radius: 8px;
    white-space: pre-wrap; max-height: 40vh; overflow: auto; z-index: 99;
  }
  #runoverlay {
    position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
    font: 14px monospace; color: #0aa3b8; letter-spacing: 2px; pointer-events: none; z-index: 5;
  }
</style>
</head>
<body>
  <canvas id="screen"></canvas>
  <div id="err"></div>
  <div id="runoverlay" style="display:none">JARVIS ▸ RUNNING</div>
  <script>
    (function () {
      var lines = [];
      function post(level, args) {
        try { lines.push({ level: level, text: args.map(String).join(' ') }); } catch (e) {}
        window.parent.postMessage({ source: 'jarvis-sandbox', lines: lines.slice(-200) }, '*');
      }
      console.log = function () { post('log', [].slice.call(arguments)); };
      console.info = function () { post('info', [].slice.call(arguments)); };
      console.warn = function () { post('warn', [].slice.call(arguments)); };
      console.error = function () { post('error', [].slice.call(arguments)); };
      window.addEventListener('error', function (e) {
        var el = document.getElementById('err');
        el.style.display = 'block';
        el.textContent = '❌ ' + (e.message || 'Unknown error') + (e.lineno ? ' (line ' + e.lineno + ')' : '');
        post('error', [e.message || 'Runtime error']);
      });
      document.getElementById('runoverlay').style.display = 'none';
      try {
        ${escaped}
      } catch (err) {
        var el = document.getElementById('err');
        el.style.display = 'block';
        el.textContent = '❌ ' + (err && err.message ? err.message : String(err));
      }
    })();
  </script>
</body>
</html>`;
}

export default function Sandbox({ code, language, title, animated = false, onClose, height }: SandboxProps) {
  const [tab, setTab] = useState<'code' | 'preview'>(animated ? 'preview' : 'code');
  const [edited, setEdited] = useState(code);
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([]);
  const [running, setRunning] = useState(false);
  const [previewDoc, setPreviewDoc] = useState('');
  const gutterRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const lineCount = useMemo(() => edited.split('\n').length, [edited]);

  useEffect(() => {
    setEdited(code);
    setConsoleLines([]);
    if (animated) setTab('preview');
  }, [code, animated]);

  // listen for console messages from the preview iframe
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.source === 'jarvis-sandbox' && Array.isArray(e.data.lines)) {
        setConsoleLines(e.data.lines as ConsoleLine[]);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (tab === 'preview') {
      setPreviewDoc(language === 'html' ? edited : buildPreviewDoc(edited));
    }
  }, [tab, edited, language]);

  // auto-run non-animated JS once on mount
  useEffect(() => {
    if (language === 'javascript' && !animated) {
      const t = setTimeout(() => handleRun(false), 300);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRun = (switchToPreview: boolean) => {
    setRunning(true);
    setTimeout(() => {
      if (language === 'html' || animated) {
        setTab('preview');
        setPreviewDoc(language === 'html' ? edited : buildPreviewDoc(edited));
      } else {
        const result = runCode(edited, language);
        const lines: ConsoleLine[] = [];
        if (result.output) {
          for (const l of result.output.split('\n')) lines.push({ level: 'log', text: l });
        }
        if (result.error) lines.push({ level: 'error', text: result.error });
        setConsoleLines(lines);
        if (switchToPreview && !result.error) setTab('preview');
      }
      setRunning(false);
    }, 60);
  };

  const syncScroll = () => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const canRun = language === 'javascript' || language === 'html' || language === 'python' || language === 'gsc';

  return (
    <div
      className="jv-panel scan-overlay overflow-hidden"
      style={{ height: height ?? 300, display: 'flex', flexDirection: 'column', flexShrink: 0 }}
    >
      {/* header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-cyan-400/15" style={{ flexShrink: 0 }}>
        <span className="text-cyan-400 font-mono text-xs">▣</span>
        <span className="text-cyan-100 text-xs font-semibold truncate">{title || 'Sandbox'}</span>
        <span className="jv-chip" style={{ fontSize: 10 }}>{language}</span>
        {animated && <span className="jv-chip" style={{ fontSize: 10, borderColor: 'rgba(34,224,122,0.4)', color: '#22e07a' }}>▶ animated</span>}
        <div className="flex-1" />
        <button
          onClick={() => setTab('code')}
          className="px-2 py-0.5 text-[11px] rounded font-semibold transition-colors"
          style={{
            background: tab === 'code' ? 'rgba(0,229,255,0.15)' : 'transparent',
            color: tab === 'code' ? '#7df3ff' : '#6b8299',
          }}
        >
          CODE
        </button>
        <button
          onClick={() => { setTab('preview'); setPreviewDoc(language === 'html' ? edited : buildPreviewDoc(edited)); }}
          className="px-2 py-0.5 text-[11px] rounded font-semibold transition-colors"
          style={{
            background: tab === 'preview' ? 'rgba(0,229,255,0.15)' : 'transparent',
            color: tab === 'preview' ? '#7df3ff' : '#6b8299',
          }}
        >
          PREVIEW
        </button>
        <button
          onClick={() => handleRun(true)}
          disabled={!canRun}
          className="jv-btn jv-btn-primary !px-3 !py-0.5 !text-[11px]"
          title="Run (Ctrl+Enter)"
        >
          {running ? '⏳ Running…' : '▶ Run'}
        </button>
        {onClose && (
          <button onClick={onClose} className="px-1.5 py-0.5 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors" title="Close">
            ✕
          </button>
        )}
      </div>

      {tab === 'code' ? (
        <div className="flex flex-1 min-h-0">
          {/* line numbers */}
          <div
            ref={gutterRef}
            className="select-none text-right pr-2 pl-1 py-2 overflow-hidden border-r border-cyan-400/10 font-mono"
            style={{ background: 'rgba(6,10,16,0.6)', color: '#2c4a66', fontSize: 12, lineHeight: '19px', minWidth: 44, flexShrink: 0 }}
          >
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          {/* editor */}
          <textarea
            ref={textareaRef}
            value={edited}
            onChange={(e) => setEdited(e.target.value)}
            onScroll={syncScroll}
            spellCheck={false}
            className="flex-1 min-w-0 resize-none outline-none p-2 font-mono"
            style={{ background: 'rgba(6,10,16,0.4)', color: '#d7e6f5', fontSize: 12, lineHeight: '19px', tabSize: 2 }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleRun(false);
              }
              if (e.key === 'Tab') {
                e.preventDefault();
                const el = e.currentTarget;
                const start = el.selectionStart;
                const end = el.selectionEnd;
                const next = edited.slice(0, start) + '  ' + edited.slice(end);
                setEdited(next);
                requestAnimationFrame(() => {
                  el.selectionStart = el.selectionEnd = start + 2;
                });
              }
            }}
          />
          {/* console output */}
          <div
            className="w-64 min-w-0 overflow-y-auto border-l border-cyan-400/10 p-2 font-mono"
            style={{ background: 'rgba(3,6,10,0.7)', fontSize: 11, lineHeight: '1.5', flexShrink: 0 }}
          >
            <div className="text-[10px] font-bold tracking-widest text-cyan-500/70 mb-1.5">CONSOLE</div>
            {consoleLines.length === 0 && <div className="text-slate-600 text-[11px]">No output yet.</div>}
            {consoleLines.map((l, i) => (
              <div
                key={i}
                className="whitespace-pre-wrap break-words mb-0.5"
                style={{ color: l.level === 'error' ? '#ff8fa3' : l.level === 'warn' ? '#ffd28a' : l.level === 'info' ? '#7df3ff' : '#b8d4e8' }}
              >
                {l.level === 'error' ? '❌ ' : l.level === 'warn' ? '⚠️ ' : ''}{l.text}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 flex-col">
          <div className="flex-1 min-h-0 relative bg-black">
            {language === 'gsc' || language === 'python' ? (
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                <div className="text-slate-500 text-sm max-w-md leading-relaxed">
                  {language === 'python'
                    ? '🐍 Python cannot run natively in the browser.\n\nCopy this script to a local file and run it with `python main.py` — the sandbox console shows a simulated output.'
                    : '🎮 GSC is a Call of Duty scripting language — it runs inside the game engine.\n\nCopy this script into your BO2 map scripts folder (e.g. `mapname.gsc`).'}
                </div>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                title="sandbox-preview"
                sandbox="allow-scripts allow-modals allow-pointer-lock allow-same-origin"
                srcDoc={previewDoc}
                className="w-full h-full border-0"
                style={{ background: '#060a10' }}
              />
            )}
          </div>
        </div>
      )}

      {/* status bar */}
      <div className="flex items-center gap-3 px-3 py-1 border-t border-cyan-400/10 text-[10px] font-mono" style={{ flexShrink: 0, color: '#3c5a74' }}>
        <span>{language} · {lineCount} lines</span>
        <span className="text-cyan-600">▸</span>
        <span className="truncate">sandboxed · no network · Ctrl+Enter to run</span>
        <div className="flex-1" />
        <span className={running ? 'text-cyan-400 anim-blink' : 'text-green-500'}>
          {running ? '● RUNNING' : '● IDLE'}
        </span>
      </div>
    </div>
  );
}
