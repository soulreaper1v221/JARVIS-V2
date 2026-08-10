// ─── Self-modification: modules, backups, custom tools ────────────────────

export interface ModuleDef {
  id: string;
  name: string;
  description: string;
  code: string;
  enabled: boolean;
}

export interface BackupRecord {
  id: string;
  moduleId: string;
  label: string;
  code: string;
  timestamp: number;
}

export interface CustomTool {
  name: string;
  description: string;
  code: string;
  created: number;
}

const MODULES_KEY = 'jarvis.modules.v1';
const BACKUPS_KEY = 'jarvis.backups.v1';
const TOOLS_KEY = 'jarvis.tools.v1';
export const MAX_BACKUPS = 20;

const DEFAULT_MODULES: ModuleDef[] = [
  {
    id: 'brain.core',
    name: 'Brain Core',
    description: 'Intent routing and response generation. The heart of JARVIS.',
    enabled: true,
    code: `// brain.core — intent routing
// processInput(normalized) -> string reply
// You can customize greetings and catch-all behavior here.
const GREETINGS = ['hello', 'hi', 'hey', 'yo', 'greetings', 'good morning'];
function onInput(input) {
  if (GREETINGS.some((g) => input.startsWith(g))) return "Hello! How can I help you today?";
  return null;
}`,
  },
  {
    id: 'memory.core',
    name: 'Memory Core',
    description: 'Conversation store, keyword extraction and recall.',
    enabled: true,
    code: `// memory.core — short & long-term memory
// saveTurn(role, content) | searchMemory(query) | getMemoryStats()
// Tune the stop-word list and memory size here.
const MEMORY_LIMIT = 500;
function onTurn(role, content) {
  // hook: runs after every turn is saved
  return null;
}`,
  },
  {
    id: 'knowledge.base',
    name: 'Knowledge Base',
    description: 'Local topics, how-to guides and big questions.',
    enabled: true,
    code: `// knowledge.base — offline knowledge
// getTopicKnowledge(topic) | getHowTo(topic) | getRandomFact()
// Add your own facts and opinions by editing the KNOWLEDGE object.`,
  },
  {
    id: 'search.engine',
    name: 'Search Engine',
    description: 'Multi-engine web search (DDG, Wikipedia, Stack Overflow, arXiv…).',
    enabled: true,
    code: `// search.engine — multiSearch(query, opts)
// Engines: ddg, wiki, wiktionary, so, books, arxiv, commons
// Tune timeouts and engine selection per query type here.`,
  },
  {
    id: 'tools.utilities',
    name: 'Tools & Utilities',
    description: 'Weather, time, calculator, dice, jokes.',
    enabled: true,
    code: `// tools.utilities — getWeatherSimulated(), calculate(), getJoke()
// Add a new tool here and it becomes available in the Tools panel.`,
  },
  {
    id: 'conversation.context',
    name: 'Conversation Context',
    description: 'Threads, sentiment, emotional tone and user facts.',
    enabled: true,
    code: `// conversation.context — addTurn(), detectSentiment(), detectEmotionalTone()
// Customize the emotion lexicon and user-fact extraction patterns here.`,
  },
  {
    id: 'system.monitor',
    name: 'System Monitor',
    description: 'CPU, RAM, network and battery readings.',
    enabled: true,
    code: `// system.monitor — getMonitorData(), getDetailedStatus()
// Adjust the CPU benchmark iterations and RAM heuristics here.`,
  },
  {
    id: 'personality.jokes',
    name: 'Personality & Jokes',
    description: '70+ jokes, personality traits and catchphrases.',
    enabled: true,
    code: `// personality.jokes — getJoke(), personality traits
// Add your own jokes to ALL_JOKES or tweak JARVIS's catchphrases here.`,
  },
];

function loadModules(): ModuleDef[] {
  try {
    const raw = localStorage.getItem(MODULES_KEY);
    if (!raw) return [...DEFAULT_MODULES];
    const parsed = JSON.parse(raw) as ModuleDef[];
    if (!Array.isArray(parsed) || !parsed.length) return [...DEFAULT_MODULES];
    return parsed;
  } catch {
    return [...DEFAULT_MODULES];
  }
}

const modules: ModuleDef[] = loadModules();

function loadBackups(): BackupRecord[] {
  try {
    const raw = localStorage.getItem(BACKUPS_KEY);
    return raw ? (JSON.parse(raw) as BackupRecord[]) : [];
  } catch {
    return [];
  }
}

function loadTools(): CustomTool[] {
  try {
    const raw = localStorage.getItem(TOOLS_KEY);
    return raw ? (JSON.parse(raw) as CustomTool[]) : [];
  } catch {
    return [];
  }
}

let backups: BackupRecord[] = loadBackups();
const customTools: CustomTool[] = loadTools();

function persistModules(): void {
  try { localStorage.setItem(MODULES_KEY, JSON.stringify(modules)); } catch { /* noop */ }
}
function persistBackups(): void {
  try { localStorage.setItem(BACKUPS_KEY, JSON.stringify(backups.slice(0, MAX_BACKUPS))); } catch { /* noop */ }
}
function persistTools(): void {
  try { localStorage.setItem(TOOLS_KEY, JSON.stringify(customTools)); } catch { /* noop */ }
}

// ─── backups ──────────────────────────────────────────────────────────────

export function createBackup(moduleId: string, label?: string): BackupRecord | null {
  const mod = modules.find((m) => m.id === moduleId);
  if (!mod) return null;
  const backup: BackupRecord = {
    id: `b${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`,
    moduleId,
    label: label ?? `auto-${new Date().toLocaleString()}`,
    code: mod.code,
    timestamp: Date.now(),
  };
  backups.unshift(backup);
  backups = backups.slice(0, MAX_BACKUPS);
  persistBackups();
  return backup;
}

export function listBackups(moduleId?: string): BackupRecord[] {
  return moduleId ? backups.filter((b) => b.moduleId === moduleId) : [...backups];
}

/** Restore a backup by id, label, or "last". */
export function restoreBackup(ref: string): boolean {
  if (ref.toLowerCase() === 'last') {
    const b = backups[0];
    if (!b) return false;
    return applyBackup(b);
  }
  const b = backups.find((x) => x.id === ref || x.label.toLowerCase().includes(ref.toLowerCase()));
  if (!b) return false;
  return applyBackup(b);
}

function applyBackup(b: BackupRecord): boolean {
  const mod = modules.find((m) => m.id === b.moduleId);
  if (!mod) return false;
  mod.code = b.code;
  persistModules();
  return true;
}

// ─── modules ──────────────────────────────────────────────────────────────

export function listModules(): ModuleDef[] {
  return modules.map((m) => ({ ...m }));
}

export function readModule(id: string): ModuleDef | null {
  const m = modules.find((x) => x.id === id);
  return m ? { ...m } : null;
}

export function editModule(id: string, newCode: string): boolean {
  const mod = modules.find((m) => m.id === id);
  if (!mod) return false;
  createBackup(id); // auto-backup before edit
  mod.code = newCode;
  mod.enabled = true;
  persistModules();
  return true;
}

export function appendToModule(id: string, snippet: string): boolean {
  const mod = modules.find((m) => m.id === id);
  if (!mod) return false;
  mod.code = mod.code + '\n' + snippet;
  persistModules();
  return true;
}

export function toggleModule(id: string): boolean {
  const mod = modules.find((m) => m.id === id);
  if (!mod) return false;
  mod.enabled = !mod.enabled;
  persistModules();
  return true;
}

// ─── custom tools ─────────────────────────────────────────────────────────

export function addCustomTool(name: string, description: string, code: string): boolean {
  if (!name.trim() || !code.trim()) return false;
  if (customTools.some((t) => t.name.toLowerCase() === name.toLowerCase())) return false;
  const err = validateCode(code);
  if (err) throw new Error(err);
  customTools.push({ name: name.trim(), description: description.trim() || 'Custom tool', code, created: Date.now() });
  persistTools();
  return true;
}

export function removeCustomTool(name: string): boolean {
  const idx = customTools.findIndex((t) => t.name.toLowerCase() === name.toLowerCase());
  if (idx < 0) return false;
  customTools.splice(idx, 1);
  persistTools();
  return true;
}

export function listCustomTools(): CustomTool[] {
  return customTools.map((t) => ({ ...t }));
}

/** Sandboxed custom-tool runner: only Math, Date, JSON and arguments exposed. */
export function runCustomTool(name: string, args: unknown[] = []): { output: unknown; error?: string } {
  const tool = customTools.find((t) => t.name.toLowerCase() === name.toLowerCase());
  if (!tool) return { output: null, error: `Unknown custom tool: ${name}` };
  const err = validateCode(tool.code);
  if (err) return { output: null, error: err };
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('Math', 'Date', 'JSON', 'console', 'args', `"use strict";\n${tool.code}`);
    const logs: string[] = [];
    const mockConsole = {
      log: (...a: unknown[]) => logs.push(a.map(String).join(' ')),
      error: (...a: unknown[]) => logs.push('ERR: ' + a.map(String).join(' ')),
      warn: (...a: unknown[]) => logs.push('WARN: ' + a.map(String).join(' ')),
    };
    const result = fn(Math, Date, JSON, mockConsole, args);
    if (logs.length) return { output: logs.join('\n') };
    return { output: result ?? undefined };
  } catch (e) {
    return { output: null, error: (e as Error).message };
  }
}

// ─── code validation ──────────────────────────────────────────────────────

const BLOCKED_PATTERNS: Array<[RegExp, string]> = [
  [/\beval\s*\(/i, 'eval() is blocked'],
  [/\brequire\s*\(/i, 'require() is blocked (no Node access)'],
  [/\bimport\s+[("']/i, 'import statements are blocked'],
  [/\bprocess\b/i, 'process is blocked (no Node access)'],
  [/localStorage/i, 'localStorage is blocked in sandboxed code'],
  [/document\.(cookie|write)|navigator\.sendBeacon/i, 'exfiltration attempts are blocked'],
  [/\b__proto__\b|\bprototype\s*[.[]|Object\.prototype/i, 'prototype manipulation is blocked'],
  [/fetch\s*\(/i, 'network calls are blocked in sandboxed code'],
  [/new\s+Function/i, 'nested Function construction is blocked'],
  [/\bXMLHttpRequest\b/i, 'network calls are blocked in sandboxed code'],
  [/<script/i, 'script injection is blocked'],
];

export function validateCode(code: string): string | null {
  for (const [re, msg] of BLOCKED_PATTERNS) {
    if (re.test(code)) return msg;
  }
  return null;
}

// ─── system state & reload ────────────────────────────────────────────────

export async function getSystemState(): Promise<Record<string, unknown>> {
  const { getMemory, isOnline, measureCpu } = await import('./monitors');
  const battery = await (await import('./monitors')).getBattery();
  return {
    version: '2.0.0',
    online: isOnline(),
    cpu: `${measureCpu()}%`,
    ram: `${getMemory().percent}%`,
    battery: battery ? `${battery.level}%` : 'N/A',
    modules: modules.length,
    modulesEnabled: modules.filter((m) => m.enabled).length,
    backups: backups.length,
    customTools: customTools.length,
    storage: localStorage.length,
  };
}

export function triggerReload(): void {
  window.location.reload();
}
