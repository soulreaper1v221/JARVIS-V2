# JARVIS-V2 ⚡

**Just A Rather Very Intelligent System** — a fully self-contained AI assistant that runs 100% in the browser. No cloud, no tracking, no backend. Everything — chat, memory, code execution, search, files, schedule, system monitoring, even self-modification — lives in a single HTML file (~587 KB).

## Stack

- **React 19** · **Vite 7** · **Tailwind CSS 4** · **TypeScript 5.9**
- `vite-plugin-singlefile` — the production build inlines every asset into one `dist/index.html`
- Zero runtime network dependency for the core experience (web search & GitHub are optional extras)

## Commands

```bash
npm install          # install dependencies
npm run dev          # dev server with HMR
npm run build        # typecheck + single-file production build → dist/index.html
node scripts/smoke.mjs   # engine smoke tests (61 checks)
```

## 🌐 Live website

The app is a static single-file site (`dist/index.html`, ~587 KB) and is deployed to **GitHub Pages** via the `.github/workflows/deploy.yml` workflow:

- Live URL: **https://soulreaper1v221.github.io/JARVIS-V2/**
- Every push to `main` or the arena branch rebuilds and republishes automatically.
- **One-time setup:** enable Pages in the repo at *Settings → Pages → Source: **GitHub Actions***. The deploy job checks for this and publishes the moment it's on (no further changes needed).

## What JARVIS can do

| Area | Highlights |
|---|---|
| 💬 **Chat** | ~40 intents, 30+ emotion responses, conversation threads, sentiment, memory recall |
| 💻 **Code** | 30+ templates (games, animations, algorithms, CRUD, bots…), sandboxed execution with console capture + live canvas preview, BO2 GSC modding, GitHub push |
| 🔍 **Search** | Parallel engines: DuckDuckGo, Wikipedia, Wiktionary, Stack Overflow, OpenLibrary, arXiv, Wikimedia Commons — with synthesis + deep research |
| 📅 **Schedule** | Plain-text parsing ("Monday: Math 9-10:30, English 11-12"), rooms, notes, bi-weekly rotation, "do I have class today?" |
| 🗂️ **Files** | Virtual FS with folders, content search, ZIP downloads, project scaffolds (node / python / web / Electron-exe) |
| 📁 **Projects** | Tasks, priorities, progress, status summaries with "focus on next" |
| 🖥️ **Monitor** | Real CPU/RAM/network/battery readings, 10-check integrity suite |
| 🧠 **Memory** | Keyword-indexed conversation store, user facts & preferences, topics covered |
| 🚀 **Apps** | 80+ apps across 9 categories — Electron native → protocol → web fallback |
| 🧩 **Self-Mod** | 8 editable modules, auto-backups (20), sandboxed custom tools, code validation |
| 👤 **Profile** | Local PIN-protected profiles, interests, notes, chat history, stats |

## Architecture

```
src/
├── engine/          # pure logic (no React) — brain, detect, fuzzy, memory,
│                    # conversation, knowledge, science, search, tools, files,
│                    # monitors, launcher, selfmod, coderunner, auth, integrity,
│                    # projects, schedule
├── components/      # ArcReactor, HudBackground, Sandbox, ChatPanel, Header,
│                    # Sidebar, InputBar + 11 panels
├── utils/           # markdown renderer (DOMPurify-sanitized)
├── types.ts         # shared interfaces
├── index.css        # Tailwind 4 + JARVIS theme (holo, scan, animations)
└── App.tsx          # orchestration: boot, tabs, actions, sandbox
```

**Brain pipeline** (`src/engine/brain.ts`): `normalize → detectTopics → auth tracking → Smart Understanding Layer (visual/ASCII/code) → intent routing (~30 cases) → user-fact extraction → self-mod/file handlers → smart catch-all`.

## Security notes

- Code execution uses sandboxed `Function` scopes with mocked consoles; `eval`, `require`, `fetch`, `localStorage`, prototype manipulation are blocked (self-mod validator).
- Preview iframes run with `sandbox="allow-scripts"` and intercept console via `postMessage`.
- The virtual file system blocks system paths, traversal, and executable types.
- Web search, GitHub and battery APIs degrade gracefully when unavailable.

## Electron bridge

The app detects `window.jarvisNative` (Electron preload) for native app launching. Otherwise it falls back to protocol URIs (`youtube://`, `steam://`…) and web URLs.

---

Built with React 19 + Vite 7 + Tailwind 4 + TypeScript 5.9. Single-file output: `dist/index.html` (~587 KB).
