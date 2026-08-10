// ─── System integrity checks ──────────────────────────────────────────────

export interface CheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  duration: number;
}

export interface IntegrityReport {
  results: CheckResult[];
  totalDuration: number;
  passed: number;
  warnings: number;
  failed: number;
  overall: 'pass' | 'warn' | 'fail';
  timestamp: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function checkLocalStorage(): Promise<CheckResult> {
  const t = performance.now();
  try {
    const key = 'jarvis.integrity.test';
    localStorage.setItem(key, 'ok');
    const read = localStorage.getItem(key);
    localStorage.removeItem(key);
    const ok = read === 'ok';
    return {
      name: 'LocalStorage',
      status: ok ? 'pass' : 'fail',
      message: ok ? 'Read/write OK' : 'Storage returned unexpected value',
      duration: Math.round(performance.now() - t),
    };
  } catch (e) {
    return { name: 'LocalStorage', status: 'fail', message: (e as Error).message, duration: Math.round(performance.now() - t) };
  }
}

export async function checkUserProfile(): Promise<CheckResult> {
  const t = performance.now();
  const { getCurrentUser } = await import('./auth');
  const user = getCurrentUser();
  return {
    name: 'User Profile',
    status: user ? 'pass' : 'fail',
    message: user ? `Profile "${user.name}" — ${user.stats.messages} messages sent` : 'No active profile',
    duration: Math.round(performance.now() - t),
  };
}

export async function checkNetwork(): Promise<CheckResult> {
  const t = performance.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('https://api.duckduckgo.com/?q=jarvis&format=json&no_html=1', { signal: controller.signal });
    clearTimeout(timer);
    return {
      name: 'Network',
      status: res.ok ? 'pass' : 'warn',
      message: res.ok ? 'Internet reachable (DuckDuckGo OK)' : `HTTP ${res.status}`,
      duration: Math.round(performance.now() - t),
    };
  } catch (e) {
    return {
      name: 'Network',
      status: 'warn',
      message: `Offline or blocked: ${(e as Error).message.slice(0, 60)}`,
      duration: Math.round(performance.now() - t),
    };
  }
}

export async function checkMemory(): Promise<CheckResult> {
  const t = performance.now();
  const { getMemoryStats, getAllMemory } = await import('./memory');
  const stats = getMemoryStats();
  const total = getAllMemory().length;
  return {
    name: 'Memory Engine',
    status: total >= 0 ? 'pass' : 'fail',
    message: `${total} turns stored · ${stats.keywordCount} unique keywords`,
    duration: Math.round(performance.now() - t),
  };
}

export async function checkBattery(): Promise<CheckResult> {
  const t = performance.now();
  const { getBattery } = await import('./monitors');
  const battery = await getBattery();
  return {
    name: 'Battery API',
    status: battery ? 'pass' : 'warn',
    message: battery ? `${battery.level}%${battery.charging ? ' (charging)' : ''}` : 'Battery API unavailable in this browser',
    duration: Math.round(performance.now() - t),
  };
}

export async function checkKnowledgeBase(): Promise<CheckResult> {
  const t = performance.now();
  const [knowledge, science] = await Promise.all([import('./knowledge'), import('./science')]);
  const topicCount = Object.keys(knowledge.KNOWLEDGE.topics).length;
  const domainCount = science.SCIENCE_DB.length;
  const facts = knowledge.KNOWLEDGE.topics.ai.facts.length;
  const howTo = Object.keys(knowledge.KNOWLEDGE.howTo).length;
  return {
    name: 'Knowledge Base',
    status: topicCount > 0 ? 'pass' : 'fail',
    message: `${topicCount} topics · ${facts} AI facts · ${domainCount} science domains · ${howTo} how-to guides`,
    duration: Math.round(performance.now() - t),
  };
}

export async function checkCodeRunner(): Promise<CheckResult> {
  const t = performance.now();
  const { runCode } = await import('./coderunner');
  const result = runCode('console.log("ping"); const sum = 2 + 2; console.log(sum);');
  const ok = !result.error && result.output.includes('4');
  return {
    name: 'Code Runner',
    status: ok ? 'pass' : 'fail',
    message: ok ? 'Sandbox executed JS correctly' : `Sandbox failed: ${result.error ?? result.output}`,
    duration: Math.round(performance.now() - t),
  };
}

export async function checkJokeEngine(): Promise<CheckResult> {
  const t = performance.now();
  const { getJoke, getJokeCount } = await import('./tools');
  const joke = getJoke();
  const count = getJokeCount();
  return {
    name: 'Joke Engine',
    status: joke.setup.length > 0 && count >= 70 ? 'pass' : 'warn',
    message: `${count} jokes loaded — next up: "${joke.setup.slice(0, 40)}${joke.setup.length > 40 ? '…' : ''}"`,
    duration: Math.round(performance.now() - t),
  };
}

export async function checkSelfMod(): Promise<CheckResult> {
  const t = performance.now();
  const { listModules, listBackups, listCustomTools, validateCode } = await import('./selfmod');
  const modules = listModules();
  const backups = listBackups();
  const tools = listCustomTools();
  const validation = validateCode('function ok() { return Math.max(1, 2); }');
  return {
    name: 'Self-Mod Engine',
    status: modules.length >= 8 && !validation ? 'pass' : 'warn',
    message: `${modules.length} modules · ${backups.length} backups · ${tools.length} custom tools`,
    duration: Math.round(performance.now() - t),
  };
}

export async function checkGitHub(): Promise<CheckResult> {
  const t = performance.now();
  const { getGitHubToken } = await import('./coderunner');
  const token = getGitHubToken();
  return {
    name: 'GitHub Integration',
    status: token ? 'warn' : 'warn',
    message: token ? 'Token configured — ready to push' : 'No token set — set one with "set github token"',
    duration: Math.round(performance.now() - t),
  };
}

export async function runIntegrityCheck(
  onProgress?: (done: number, total: number, current: CheckResult) => void,
): Promise<IntegrityReport> {
  const started = performance.now();
  const checks: Array<() => Promise<CheckResult>> = [
    checkLocalStorage,
    checkUserProfile,
    checkNetwork,
    checkMemory,
    checkBattery,
    checkKnowledgeBase,
    checkCodeRunner,
    checkJokeEngine,
    checkSelfMod,
    checkGitHub,
  ];
  const results: CheckResult[] = [];
  for (let i = 0; i < checks.length; i++) {
    const result = await checks[i]();
    results.push(result);
    onProgress?.(i + 1, checks.length, result);
    await sleep(80);
  }
  const totalDuration = Math.round(performance.now() - started);
  const passed = results.filter((r) => r.status === 'pass').length;
  const warnings = results.filter((r) => r.status === 'warn').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const overall: IntegrityReport['overall'] = failed > 0 ? 'fail' : warnings > 0 ? 'warn' : 'pass';
  return { results, totalDuration, passed, warnings, failed, overall, timestamp: Date.now() };
}
