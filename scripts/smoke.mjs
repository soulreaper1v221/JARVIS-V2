// JARVIS engine smoke test — bundles engines with esbuild, exercises core paths.
import { build } from 'esbuild';
import { writeFileSync } from 'fs';

const stubs = `
// browser API stubs for node
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.has(k) ? store.get(k) : null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  get length() { return store.size; },
  key: (i) => [...store.keys()][i] ?? null,
  clear: () => store.clear(),
};
globalThis.performance = globalThis.performance ?? { now: () => Date.now() };
Object.defineProperty(globalThis, 'navigator', { value: { onLine: true, language: 'en-US', platform: 'node', hardwareConcurrency: 8, userAgent: 'smoke' }, configurable: true });
globalThis.document = { createElement: () => ({ style: {}, click() {}, remove() {} }), body: { appendChild() {} } };
globalThis.window = globalThis;
`;

writeFileSync('/home/user/JARVIS-V2/.smoke-stubs.mjs', stubs);

const entry = `
import './.smoke-stubs.mjs';
import * as brain from './src/engine/brain.ts';
import { normalize, fuzzyMatchWord, levenshtein } from './src/engine/fuzzy.ts';
import { parseAndSetSchedule, formatSchedule, getTodayEntries, getCurrentWeekType } from './src/engine/schedule.ts';
import { getJoke, getJokeCount, calculate, getWeatherSimulated } from './src/engine/tools.ts';
import { smartGenerate, runCode, isCodeRequest } from './src/engine/coderunner.ts';
import { createFile, readFile, listFiles, createProject, searchFiles } from './src/engine/files.ts';
import { getMemoryStats, searchMemory, saveTurn } from './src/engine/memory.ts';
import { getMonitorData, getFormattedUptime } from './src/engine/monitors.ts';
import { detect } from './src/engine/detect.ts';
import { generateAsciiArt } from './src/engine/brain.ts';

let failures = 0;
const check = (name, cond, detail = '') => {
  if (cond) console.log('  ✓', name);
  else { failures++; console.log('  ✗ FAIL', name, detail); }
};

// ── fuzzy ──
console.log('fuzzy:');
check('normalize fixes typo', normalize('teh wather is gud') === 'the weather is good');
check('normalize expands contraction', normalize("i don't know").includes('do not'));
check('levenshtein distance', levenshtein('kitten', 'sitting') === 3);
check('fuzzy match word', fuzzyMatchWord('youtub', { youtube: 'youtube' }, 0.7) === 'youtube');

// ── tools ──
console.log('tools:');
check('joke count >= 70', getJokeCount() >= 70, String(getJokeCount()));
const j1 = getJoke(), j2 = getJoke();
check('jokes served sequentially', j1.setup !== j2.setup);
check('calculate', calculate('2^10') === 1024);
check('calculate sqrt', calculate('sqrt(16)') === 4);
check('weather city', getWeatherSimulated('paris').city === 'Paris');
check('weather unknown city', getWeatherSimulated('Atlantis').city === 'Atlantis');

// ── schedule ──
console.log('schedule:');
const sched = parseAndSetSchedule('Monday: Math 9-10:30, English 11-12 | Tue Science 9-10 Room 204, Wed OFF');
check('schedule parses bi-weekly', sched.success, sched.message);
check('schedule has 2 weeks', sched.config.weeks.length === 2, String(sched.config.weeks.length));
check('week A entries', sched.config.weeks[0].entries.length === 2, String(sched.config.weeks[0].entries.length));
check('week B room', sched.config.weeks[1].entries.some(e => e.label === 'Science' && e.room === '204'));
check('week type computed', typeof getCurrentWeekType() === 'number');
check('formatSchedule works', formatSchedule().includes('Week'));
const sched2 = parseAndSetSchedule('Mon 9-5 | Tue 7am-3pm');
check('time formats', sched2.config.weeks[0].entries[0].start === '09:00' && sched2.config.weeks[0].entries[0].end === '17:00', JSON.stringify(sched2.config.weeks[0].entries[0]));

// ── code ──
console.log('coderunner:');
check('smartGenerate hello', smartGenerate('write a hello world program')?.title === 'Hello World');
const snake = smartGenerate('make me a snake game');
check('smartGenerate snake animated', !!snake && snake.animated, JSON.stringify(snake?.title));
const particles = smartGenerate('animate particles with sparkles');
check('smartGenerate particles', !!particles && particles.animated);
const py = smartGenerate('write a python script for data analysis');
check('smartGenerate python', py?.language === 'python');
const res = runCode('console.log(2 + 2); console.log("hi");');
check('runCode output', res.output.includes('4') && res.output.includes('hi'), res.output);
const bad = runCode('throw new Error("boom");');
check('runCode catches errors', !!bad.error && bad.error.includes('boom'), bad.error ?? '');
check('isCodeRequest', isCodeRequest('write a fibonacci function'));
check('isCodeRequest negative', !isCodeRequest('what is the weather'));
check('html page generator', smartGenerate('make me a landing page about space')?.language === 'html');

// ── files ──
console.log('files:');
check('create nested file', !!createFile('docs/notes/readme.md', '# hi'));
check('auto parent folders', listFiles('docs').length >= 1);
check('read file', readFile('docs/notes/readme.md')?.content === '# hi');
check('write file', !!createFile('a.txt', 'x'));
check('search files', searchFiles('hi').some(f => f.path === 'docs/notes/readme.md'));
check('createProject node', createProject('smokeApp', 'node'));
check('project files exist', !!readFile('projects/smokeApp/src/index.js'));
check('blocked paths', !createFile('../evil.txt', 'x') && !createFile('/etc/passwd', 'x') && !createFile('C:\\\\Windows\\\\system32\\\\x.dll', 'x'));
check('blocked traversal', !createFile('a/../../b.txt', 'x'));

// ── memory ──
console.log('memory:');
saveTurn('user', 'I love Python programming and neural networks');
saveTurn('jarvis', 'Python is excellent for machine learning');
const stats = getMemoryStats();
check('memory stats', stats.totalTurns === 2, String(stats.totalTurns));
check('keywords extracted', stats.keywordCount > 0, String(stats.keywordCount));
check('search memory', searchMemory('neural').length >= 1);
check('stop words filtered', !stats.topKeywords.includes('and'));

// ── detect ──
console.log('detect:');
check('greeting', detect('hey jarvis').intent === 'greeting');
check('joke intent', detect('tell me a joke').intent === 'joke');
check('emotion mood', detect("i'm feeling anxious today").mood === 'anxious');
check('weather', detect('what is the weather in London').intent === 'weather');
check('calculate', detect('calculate 12 * 4').intent === 'calculate');
check('schedule', detect('do I have class today').intent === 'schedule');

// ── brain ──
console.log('brain:');
const greet = brain.processInput('hello');
check('greeting reply', greet.reply.length > 10, greet.reply.slice(0, 60));
const joke = brain.processInput('tell me a joke');
check('joke reply', joke.reply.includes('**'));
const sys = brain.processInput('system status');
check('system reply', sys.reply.includes('CPU'));
const code = brain.processInput('write me a fibonacci sequence program');
check('code action', code.actions.some(a => a.type === 'code'), JSON.stringify(code.actions.map(a => a.type)));
const anim = brain.processInput('animate a particle explosion for me');
check('animation action', anim.actions.some(a => a.type === 'code' && a.code?.animated));
const schedCmd = brain.processInput('set schedule: Monday Math 9-10, Tuesday Science 11-12');
check('schedule command', schedCmd.reply.includes('Schedule set'));
const ascii = brain.processInput('draw me a robot ascii art');
check('ascii art', ascii.reply.includes('┌') || ascii.reply.includes('█'), ascii.reply.slice(0, 60));
check('ascii art generator', !!generateAsciiArt('robot'));
const fileCmd = brain.processInput('create file hello.txt: Hello world');
check('file command', fileCmd.reply.includes('created'));
check('file actually created', !!readFile('hello.txt'));
const who = brain.processInput('who are you');
check('identity', who.reply.includes('JARVIS'));
const help = brain.processInput('help');
check('help', help.reply.includes('command'));
const emo = brain.processInput("I'm really stressed about my exam tomorrow");
check('emotion response', emo.reply.length > 20);
const search = brain.processInput('search quantum entanglement');
check('search action', search.actions.some(a => a.type === 'search'));
const research = brain.processInput('deep research black holes');
check('research action', research.actions.some(a => a.type === 'research'));
const note = brain.processInput('remember that my favorite color is teal');
check('save note', note.reply.includes('Noted'));
const opinion = brain.processInput('what do you think about artificial intelligence');
check('opinion reply', opinion.reply.length > 20);
const sci = brain.processInput('tell me about physics');
check('science reply', sci.reply.toLowerCase().includes('physics'));
const weather = brain.processInput('what is the weather in Tokyo');
check('weather reply', weather.reply.includes('Tokyo'));
const time = brain.processInput('what time is it');
check('time reply', time.reply.includes('It'));

// ── monitors ──
console.log('monitors:');
const md = getMonitorData();
check('monitor data shape', typeof md.cpu === 'number' && typeof md.ram === 'number' && typeof md.uptime === 'number');
check('uptime format', getFormattedUptime(65) === '1m 5s');

console.log('\\n' + (failures === 0 ? '✅ ALL SMOKE TESTS PASSED' : \`❌ \${failures} FAILURES\`));
process.exit(failures === 0 ? 0 : 1);
`;

writeFileSync('/home/user/JARVIS-V2/.smoke-entry.mjs', entry);
await build({
  entryPoints: ['.smoke-entry.mjs'],
  absWorkingDir: '/home/user/JARVIS-V2',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: '/tmp/jarvis-smoke.mjs',
  logLevel: 'error',
});
const { execSync } = await import('child_process');
try {
  execSync('node /tmp/jarvis-smoke.mjs', { stdio: 'inherit' });
} catch {
  process.exit(1);
}
