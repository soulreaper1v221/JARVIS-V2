// ─── JARVIS-V2 main application ───────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage, InputMode } from './types';
import { restoreSession, getCurrentUser, saveChatMessage as persistChat } from './engine/auth';
import * as brain from './engine/brain';
import type { BrainAction } from './engine/brain';
import Header from './components/Header';
import { Sidebar } from './components/Sidebar';
import type { TabId } from './components/Sidebar';
import ArcReactor from './components/ArcReactor';
import ChatPanel from './components/ChatPanel';
import InputBar from './components/InputBar';
import Sandbox from './components/Sandbox';
import HudBackground from './components/HudBackground';
import SchedulePanel from './components/panels/SchedulePanel';
import FilesPanel from './components/panels/FilesPanel';
import ProjectsPanel from './components/panels/ProjectsPanel';
import MonitorPanel from './components/panels/MonitorPanel';
import ToolsPanel from './components/panels/ToolsPanel';
import AppsPanel from './components/panels/AppsPanel';
import MemoryPanel from './components/panels/MemoryPanel';
import SciencePanel from './components/panels/SciencePanel';
import SelfModPanel from './components/panels/SelfModPanel';
import ProfilePanel from './components/panels/ProfilePanel';
import IntegrityPanel from './components/panels/IntegrityPanel';

interface SandboxState {
  code: string;
  language: string;
  title: string;
  animated: boolean;
}

interface Toast {
  id: number;
  msg: string;
  kind: 'info' | 'ok' | 'err';
}

let idCounter = 0;
const nextId = () => `m${Date.now().toString(36)}${idCounter++}`;

const COMMAND_TABS: Record<string, TabId> = {
  '/chat': 'chat', '/files': 'files', '/projects': 'projects', '/schedule': 'schedule',
  '/monitor': 'monitor', '/tools': 'tools', '/apps': 'apps', '/memory': 'memory',
  '/science': 'science', '/selfmod': 'selfmod', '/integrity': 'integrity', '/profile': 'profile',
};

export default function App() {
  // ── state ──
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [booting, setBooting] = useState(true);
  const [bootPct, setBootPct] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>('chat');
  const [sandbox, setSandbox] = useState<SandboxState | null>(null);
  const [mode, setMode] = useState<InputMode>('chat');
  const [userName, setUserName] = useState('Guest');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const bootedRef = useRef(false);

  const pushToast = useCallback((msg: string, kind: Toast['kind'] = 'info') => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, msg, kind }].slice(-4));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  const appendJarvis = useCallback((content: string, type: ChatMessage['type'] = 'text', delay = 0) => {
    const msg: ChatMessage = {
      id: nextId(),
      role: 'jarvis',
      content,
      timestamp: new Date(),
      type,
    };
    if (delay > 0) {
      setTimeout(() => setMessages((prev) => [...prev, msg]), delay);
    } else {
      setMessages((prev) => [...prev, msg]);
    }
  }, []);

  // ── effects (all declared before any conditional return) ──
  useEffect(() => {
    restoreSession();
    const user = getCurrentUser();
    setUserName(user?.name ?? 'Guest');
    // boot sequence
    const tick = setInterval(() => {
      setBootPct((p) => Math.min(100, p + Math.random() * 22));
    }, 180);
    const finish = setTimeout(() => {
      clearInterval(tick);
      setBooting(false);
      if (!bootedRef.current) {
        bootedRef.current = true;
        const user2 = getCurrentUser();
        const greeting =
          user2 && user2.name !== 'Guest'
            ? `Welcome back, **${user2.name}**. All systems restored — memory, files and schedule intact.\n\nWhat shall we work on today?`
            : 'All systems online. I\'m **JARVIS** — your local AI assistant.\n\nAsk me anything: chat, code, search, schedule, files, or say "help" for the full command list.';
        appendJarvis(greeting);
        persistChat('jarvis', greeting);
      }
    }, 2300);
    return () => {
      clearInterval(tick);
      clearTimeout(finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── action handler ──
  const handleActions = useCallback((actions: BrainAction[]) => {
    for (const a of actions) {
      switch (a.type) {
        case 'code': {
          if (a.code) {
            setSandbox({ code: a.code.code, language: a.code.language, title: a.code.title, animated: a.code.animated });
            setActiveTab('chat');
          }
          break;
        }
        case 'tab': {
          const valid: TabId[] = ['chat', 'files', 'projects', 'schedule', 'monitor', 'tools', 'apps', 'memory', 'science', 'selfmod', 'integrity', 'profile'];
          if (a.tab && valid.includes(a.tab as TabId)) setActiveTab(a.tab as TabId);
          break;
        }
        case 'app':
          pushToast(`${a.app?.name ?? 'App'} launched (${a.app?.method ?? 'web'})`, 'ok');
          break;
        case 'file':
          pushToast(`File ${a.filePath ? `"${a.filePath}"` : ''} saved to the file system`, 'ok');
          break;
        case 'toast':
          if (a.message) pushToast(a.message);
          break;
        case 'search': {
          if (a.query) {
            brain.asyncSearch(a.query).then((reply) => appendJarvis(reply, 'tool-result'));
          }
          break;
        }
        case 'research': {
          if (a.query) {
            brain.runResearch(a.query).then((reply) => appendJarvis(reply, 'tool-result'));
          }
          break;
        }
        case 'github': {
          if (a.text) {
            brain.runGithubCommand(a.text).then((reply) => appendJarvis(reply, 'tool-result')).catch((e) => appendJarvis(`GitHub error: ${(e as Error).message}`, 'error'));
          }
          break;
        }
        case 'system': {
          brain.runDetailedStatus().then((reply) => appendJarvis(reply, 'tool-result'));
          break;
        }
        default:
          break;
      }
    }
  }, [appendJarvis, pushToast]);

  // ── send handler ──
  const sendMessage = useCallback((raw: string, inputMode: InputMode) => {
    const text = raw.trim();
    if (!text || thinking) return;

    // quick slash commands
    if (inputMode === 'command' && text.startsWith('/')) {
      const cmd = text.toLowerCase().split(/\s+/)[0];
      if (cmd === '/clear') {
        setMessages([]);
        return;
      }
      if (cmd === '/reset') {
        brain.resetBrain();
        setMessages([]);
        setSandbox(null);
        appendJarvis('Conversation reset — clean slate. 🧠');
        return;
      }
      const tab = COMMAND_TABS[cmd];
      if (tab) {
        setActiveTab(tab);
        return;
      }
    }

    const userMsg: ChatMessage = { id: nextId(), role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setThinking(true);

    setTimeout(() => {
      try {
        const resp = brain.processInput(text);
        setMessages((prev) => [...prev, { id: nextId(), role: 'jarvis', content: resp.reply, timestamp: new Date() }]);
        handleActions(resp.actions);
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'jarvis', content: `⚠️ I hit an error processing that: ${(e as Error).message}`, timestamp: new Date(), type: 'error' },
        ]);
      } finally {
        setThinking(false);
      }
    }, 260 + Math.random() * 420);
  }, [thinking, appendJarvis, handleActions]);

  const notify = useCallback((msg: string) => pushToast(msg, 'ok'), [pushToast]);

  const onUserChange = useCallback(() => {
    setUserName(getCurrentUser()?.name ?? 'Guest');
    setMessages((prev) => [
      ...prev.slice(-40),
      { id: nextId(), role: 'system', content: `Switched to profile **${getCurrentUser()?.name ?? 'Guest'}**.`, timestamp: new Date() },
    ]);
  }, []);

  const renderPanel = () => {
    switch (activeTab) {
      case 'files': return <FilesPanel onNotify={notify} />;
      case 'projects': return <ProjectsPanel onNotify={notify} />;
      case 'schedule': return <SchedulePanel onNotify={notify} />;
      case 'monitor': return <MonitorPanel onNotify={notify} />;
      case 'tools': return <ToolsPanel onNotify={notify} />;
      case 'apps': return <AppsPanel onNotify={notify} />;
      case 'memory': return <MemoryPanel onNotify={notify} />;
      case 'science': return <SciencePanel onNotify={notify} />;
      case 'selfmod': return <SelfModPanel onNotify={notify} />;
      case 'integrity': return <IntegrityPanel onNotify={notify} />;
      case 'profile': return <ProfilePanel onNotify={notify} onUserChange={onUserChange} />;
      default: return null;
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#060a10' }}>
      <HudBackground />
      <Header userName={userName} isThinking={thinking} isBooting={booting} />

      {/* body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, position: 'relative', zIndex: 1 }}>
        <Sidebar active={activeTab} onChange={setActiveTab} />

        {activeTab === 'chat' ? (
          /* ── chat column ── */
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
            {/* messages */}
            <ChatPanel messages={messages} isThinking={thinking} userName={userName} onSuggestion={(s) => sendMessage(s, mode)} />
            {/* sandbox */}
            {sandbox && (
              <div className="px-3 pb-2" style={{ flexShrink: 0 }}>
                <Sandbox
                  key={sandbox.title + sandbox.code.length}
                  code={sandbox.code}
                  language={sandbox.language}
                  title={sandbox.title}
                  animated={sandbox.animated}
                  height={264}
                  onClose={() => setSandbox(null)}
                />
              </div>
            )}
            {/* input */}
            <InputBar onSend={sendMessage} disabled={thinking} mode={mode} onModeChange={setMode} />
          </main>
        ) : (
          /* ── panel column ── */
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
            {renderPanel()}
          </main>
        )}
      </div>

      {/* toasts */}
      <div className="fixed bottom-5 right-5 space-y-2" style={{ zIndex: 80 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className="anim-fade-up jv-panel px-4 py-2.5 text-xs font-medium"
            style={{
              borderColor: t.kind === 'ok' ? 'rgba(34,224,122,0.4)' : t.kind === 'err' ? 'rgba(255,77,109,0.4)' : 'rgba(0,229,255,0.35)',
              color: t.kind === 'ok' ? '#a5f3c8' : t.kind === 'err' ? '#ff8fa3' : '#c9ecf5',
              background: 'rgba(8,13,24,0.95)',
              boxShadow: '0 8px 28px rgba(0,0,0,0.5)',
            }}
          >
            {t.kind === 'ok' ? '✓ ' : t.kind === 'err' ? '✗ ' : '▸ '}{t.msg}
          </div>
        ))}
      </div>

      {/* boot overlay */}
      {booting && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center"
          style={{
            zIndex: 100,
            background: 'radial-gradient(ellipse at center, #0a1424 0%, #060a10 70%)',
            transition: 'opacity .5s',
            display: 'flex',
          }}
        >
          <div style={{ width: 190, height: 190, marginBottom: 26 }}>
            <div style={{ width: '100%', height: '100%' }}>
              {/* inline reactor at boot scale */}
              <BootReactor size={190} />
            </div>
          </div>
          <div className="holo-text text-2xl font-black tracking-[0.3em] anim-flicker mb-2">JARVIS</div>
          <div className="text-[10px] font-mono text-cyan-500/70 tracking-[0.25em] mb-8">INITIALIZING CORE SYSTEMS</div>
          <div className="w-72 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(27,42,68,0.7)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${bootPct}%`,
                background: 'linear-gradient(90deg, #0aa3b8, #00e5ff)',
                boxShadow: '0 0 12px rgba(0,229,255,0.8)',
              }}
            />
          </div>
          <div className="mt-3 font-mono text-[10px] text-slate-600 tabular-nums">{Math.floor(bootPct)}%</div>
        </div>
      )}
    </div>
  );
}

function BootReactor({ size }: { size: number }) {
  return <ArcReactor size={size} isBooting />;
}
