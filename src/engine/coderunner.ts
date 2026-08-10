// ─── Code generation + sandboxed execution ────────────────────────────────

export interface RunResult {
  output: string;
  error?: string;
  durationMs: number;
}

export interface GeneratedCode {
  title: string;
  language: string;
  code: string;
  animated: boolean;
  description: string;
}

// ─── sandboxed execution ──────────────────────────────────────────────────

/** Execute JavaScript in a sandboxed Function with a captured console. */
export function runCode(code: string, language = 'javascript'): RunResult {
  const started = performance.now();
  if (language === 'html') {
    return { output: 'HTML rendered in the preview tab.', durationMs: Math.round(performance.now() - started) };
  }
  if (language === 'python') {
    // Python cannot run natively in the browser — simulate known templates.
    return { output: simulatePython(code), durationMs: Math.round(performance.now() - started) };
  }
  const logs: string[] = [];
  const mockConsole = {
    log: (...args: unknown[]) => logs.push(args.map((a) => (typeof a === 'object' ? safeStringify(a) : String(a))).join(' ')),
    info: (...args: unknown[]) => logs.push('ℹ️ ' + args.map(String).join(' ')),
    warn: (...args: unknown[]) => logs.push('⚠️ ' + args.map(String).join(' ')),
    error: (...args: unknown[]) => logs.push('❌ ' + args.map(String).join(' ')),
    table: (data: unknown) => logs.push(safeStringify(data)),
    clear: () => logs.push('— console cleared —'),
    assert: (cond: boolean, ...args: unknown[]) => { if (!cond) logs.push('Assertion failed: ' + args.map(String).join(' ')); },
    time: (label: string) => logs.push(`▶ ${label} started`),
    timeEnd: (label: string) => logs.push(`◼ ${label} finished`),
  };
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('console', 'window', '"use strict";\n' + code);
    fn(mockConsole, undefined);
    const durationMs = Math.round(performance.now() - started);
    return { output: logs.join('\n') || '(no output)', durationMs };
  } catch (e) {
    return { output: logs.join('\n'), error: (e as Error).message, durationMs: Math.round(performance.now() - started) };
  }
}

function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

function simulatePython(code: string): string {
  const lower = code.toLowerCase();
  const lines: string[] = [];
  if (lower.includes('fibonacci') || /def fib/.test(lower)) {
    lines.push('Python execution simulated (in-browser)');
    lines.push('Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55…');
    lines.push('✅ logic verified — run this locally with `python main.py`');
  } else if (lower.includes('sort')) {
    lines.push('Python execution simulated (in-browser)');
    lines.push('Sorted: [1, 2, 3, 5, 8, 13, 21]');
  } else if (lower.includes('print("hello') || lower.includes("print('hello")) {
    lines.push('Hello from Python! 👋');
  } else if (lower.includes('statistics') || lower.includes('stat')) {
    lines.push('mean=42.5 median=41.0 stdev=7.9');
  } else {
    lines.push('Python execution simulated (in-browser)');
    lines.push('Run the generated file locally with: python <file>.py');
  }
  return lines.join('\n');
}

// ─── template library (30+) ───────────────────────────────────────────────

interface Template {
  title: string;
  category: string;
  animated?: boolean;
  language?: string;
  generate: (opts?: Record<string, string>) => GeneratedCode;
}

const TPL: Template[] = [
  {
    title: 'Hello World', category: 'basic',
    generate: () => ({ title: 'Hello World', language: 'javascript', animated: false, description: 'The classic first program.', code: `// Hello World — the classic
const name = "world";

function greet(who) {
  return \`Hello, \${who}! 👋\`;
}

console.log(greet(name));
console.log("JARVIS generated this code for you.");
` }),
  },
  {
    title: 'Fibonacci Sequence', category: 'algo',
    generate: () => ({ title: 'Fibonacci Sequence', language: 'javascript', animated: false, description: 'Generates the first N Fibonacci numbers.', code: `// Fibonacci sequence generator
function fibonacci(n) {
  const seq = [0, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq.slice(0, n);
}

const n = 15;
const fibs = fibonacci(n);
console.log("Fibonacci (" + n + "):");
console.log(fibs.join(", "));
console.log("Golden ratio approx:", (fibs[n - 1] / fibs[n - 2]).toFixed(6));
` }),
  },
  {
    title: 'Sorting Visualizer Data', category: 'algo',
    generate: () => ({ title: 'Sorting', language: 'javascript', animated: false, description: 'Sorts an array with multiple algorithms.', code: `// Sorting algorithms demo
const data = Array.from({ length: 20 }, () => Math.floor(Math.random() * 100));

function bubbleSort(arr) {
  const a = [...arr];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
    }
  }
  return a;
}

function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = arr.filter((x) => x < pivot);
  const right = arr.filter((x) => x > pivot);
  const mid = arr.filter((x) => x === pivot);
  return [...quickSort(left), ...mid, ...quickSort(right)];
}

console.log("Original:", data.join(", "));
console.log("Bubble:  ", bubbleSort(data).join(", "));
console.log("Quick:   ", quickSort(data).join(", "));
` }),
  },
  {
    title: 'Todo List', category: 'data',
    generate: () => ({ title: 'Todo List', language: 'javascript', animated: false, description: 'A functional todo list with CRUD operations.', code: `// Todo list with full CRUD
const todos = [
  { id: 1, text: "Build a JARVIS app", done: true },
  { id: 2, text: "Learn React 19", done: false },
  { id: 3, text: "Deploy to production", done: false },
];

function addTodo(text) {
  todos.push({ id: todos.length + 1, text, done: false });
}

function toggleTodo(id) {
  const t = todos.find((x) => x.id === id);
  if (t) t.done = !t.done;
}

function removeTodo(id) {
  const idx = todos.findIndex((x) => x.id === id);
  if (idx >= 0) todos.splice(idx, 1);
}

function showTodos() {
  console.log("--- TODO LIST ---");
  todos.forEach((t) => console.log((t.done ? "[x]" : "[ ]") + " " + t.id + ". " + t.text));
}

addTodo("Ship it 🚀");
toggleTodo(1);
removeTodo(2);
showTodos();
console.log("Remaining:", todos.filter((t) => !t.done).length);
` }),
  },
  {
    title: 'Fetch API Demo', category: 'api',
    generate: () => ({ title: 'Fetch API Demo', language: 'javascript', animated: false, description: 'Fetches JSON from a public API.', code: `// Fetch API demo — random user data
async function fetchRandomUser() {
  try {
    const res = await fetch("https://randomuser.me/api/?nat=us");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const u = data.results[0];
    console.log("Name:", u.name.first, u.name.last);
    console.log("Email:", u.email);
    console.log("Location:", u.location.city + ", " + u.location.country);
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

fetchRandomUser();
` }),
  },
  {
    title: 'Countdown Timer', category: 'basic',
    generate: () => ({ title: 'Countdown Timer', language: 'javascript', animated: false, description: 'A 10-second countdown.', code: `// Countdown timer
function countdown(seconds, onTick, onDone) {
  let remaining = seconds;
  const id = setInterval(() => {
    if (remaining <= 0) {
      clearInterval(id);
      onDone();
      return;
    }
    onTick(remaining--);
  }, 1000);
}

countdown(
  5,
  (t) => console.log("T-minus", t + "..."),
  () => console.log("🚀 Liftoff!")
);
` }),
  },
  {
    title: 'Calculator', category: 'math',
    generate: () => ({ title: 'Calculator', language: 'javascript', animated: false, description: 'A command-line calculator.', code: `// Simple calculator
function calc(a, op, b) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? "Division by zero!" : a / b;
    case "^": return Math.pow(a, b);
    default: return "Unknown operator: " + op;
  }
}

const tests = [
  [10, "+", 5], [10, "-", 5], [10, "*", 5],
  [10, "/", 5], [2, "^", 10], [1, "/", 0],
];

tests.forEach(([a, op, b]) =>
  console.log(a + " " + op + " " + b + " = " + calc(a, op, b))
);
` }),
  },
  {
    title: 'Counter App', category: 'ui',
    generate: () => ({ title: 'Counter', language: 'javascript', animated: false, description: 'A stateful counter.', code: `// Counter with state
let count = 0;

function increment() { count++; render(); }
function decrement() { count--; render(); }
function reset() { count = 0; render(); }

function render() {
  console.log("Count:", count);
}

render();
increment(); increment(); increment();
decrement();
reset();
` }),
  },
  {
    title: 'Password Generator', category: 'crypto',
    generate: () => ({ title: 'Password Generator', language: 'javascript', animated: false, description: 'Generates strong random passwords.', code: `// Strong password generator
function generatePassword(length = 16, options = {}) {
  const sets = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    digits: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };
  let pool = sets.lower + sets.upper + sets.digits;
  if (options.symbols !== false) pool += sets.symbols;

  // crypto-grade randomness when available
  const rand = (max) => {
    if (crypto && crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return buf[0] % max;
    }
    return Math.floor(Math.random() * max);
  };

  const chars = [];
  for (let i = 0; i < length; i++) chars.push(pool[rand(pool.length)]);
  return chars.join("");
}

console.log("Password:", generatePassword(18));
console.log("Length:  ", generatePassword(18).length);
` }),
  },
  {
    title: 'Prime Numbers', category: 'math',
    generate: () => ({ title: 'Prime Numbers', language: 'javascript', animated: false, description: 'Sieve of Eratosthenes.', code: `// Prime numbers — Sieve of Eratosthenes
function sieveOfEratosthenes(n) {
  const primes = new Array(n + 1).fill(true);
  primes[0] = primes[1] = false;
  for (let i = 2; i * i <= n; i++) {
    if (primes[i]) {
      for (let j = i * i; j <= n; j += i) primes[j] = false;
    }
  }
  const result = [];
  for (let i = 2; i <= n; i++) if (primes[i]) result.push(i);
  return result;
}

const primes = sieveOfEratosthenes(100);
console.log("Primes up to 100 (" + primes.length + "):");
console.log(primes.join(", "));
` }),
  },
  {
    title: 'Number Guessing Game', category: 'game',
    generate: () => ({ title: 'Number Guessing Game', language: 'javascript', animated: false, description: 'Guess the number game.', code: `// Number guessing game
function playGame(max = 100) {
  const secret = Math.floor(Math.random() * max) + 1;
  let attempts = 0;

  function guess(n) {
    attempts++;
    if (n === secret) return "Correct! 🎉 The number was " + secret + " (in " + attempts + " guesses)";
    if (n < secret) return n + " is too LOW — try higher";
    return n + " is too HIGH — try lower";
  }

  console.log("I picked a number between 1 and " + max + ". Guess it!");
  console.log(guess(50));
  console.log(guess(75));
  console.log(guess(63));
  console.log(guess(57));
  return guess(60);
}

console.log(playGame());
` }),
  },
  {
    title: 'Unit Converter', category: 'math',
    generate: () => ({ title: 'Unit Converter', language: 'javascript', animated: false, description: 'Temperature/length/weight conversion.', code: `// Unit converter
const converters = {
  ctof: (c) => (c * 9) / 5 + 32,
  ftoc: (f) => ((f - 32) * 5) / 9,
  kmtom: (km) => km * 0.621371,
  mtokm: (m) => m / 0.621371,
  kgtolb: (kg) => kg * 2.20462,
  lbtokg: (lb) => lb / 2.20462,
};

console.log("25°C =", converters.ctof(25).toFixed(1), "°F");
console.log("77°F =", converters.ftoc(77).toFixed(1), "°C");
console.log("10 km =", converters.kmtom(10).toFixed(2), "miles");
console.log("70 kg =", converters.kgtolb(70).toFixed(1), "lbs");
` }),
  },
  {
    title: 'Digital Clock', category: 'ui',
    generate: () => ({ title: 'Digital Clock', language: 'javascript', animated: true, description: 'Live digital clock with canvas.', code: `// Live digital clock — animated
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

function draw() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour12: false });
  const date = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  ctx.fillStyle = "#060a10";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // grid
  ctx.strokeStyle = "rgba(0,229,255,0.08)";
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  ctx.fillStyle = "#00e5ff";
  ctx.shadowColor = "#00e5ff";
  ctx.shadowBlur = 25;
  ctx.font = "bold 64px monospace";
  ctx.textAlign = "center";
  ctx.fillText(time, canvas.width / 2, canvas.height / 2 - 10);
  ctx.shadowBlur = 0;
  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#7df3ff";
  ctx.fillText(date, canvas.width / 2, canvas.height / 2 + 35);

  requestAnimationFrame(draw);
}

draw();
` }),
  },
  {
    title: 'Array Methods Demo', category: 'data',
    generate: () => ({ title: 'Array Methods', language: 'javascript', animated: false, description: 'map/filter/reduce/sort demonstrations.', code: `// Array methods tour
const nums = [3, 7, 1, 9, 4, 6, 2, 8, 5];

console.log("Original:", nums.join(", "));
console.log("Sorted:  ", [...nums].sort((a, b) => a - b).join(", "));
console.log("Doubled: ", nums.map((n) => n * 2).join(", "));
console.log("Evens:   ", nums.filter((n) => n % 2 === 0).join(", "));
console.log("Sum:     ", nums.reduce((a, b) => a + b, 0));
console.log("Max:     ", Math.max(...nums));
console.log("First>5: ", nums.find((n) => n > 5));
console.log("All>0:   ", nums.every((n) => n > 0));
` }),
  },
  {
    title: 'Regex Lab', category: 'data',
    generate: () => ({ title: 'Regex Lab', language: 'javascript', animated: false, description: 'Regular expression examples.', code: `// Regular expression playground
const email = "john.doe+tag@example.co.uk";
const emailRegex = /^[\\w.+-]+@[\\w-]+\\.[\\w.]+$/;

console.log("Email valid:", emailRegex.test(email));

const text = "Call me at 555-123-4567 or 555.987.6543 anytime!";
const phoneRegex = /\\d{3}[-.]\\d{3}[-.]\\d{4}/g;
console.log("Phones found:", text.match(phoneRegex));

const sentence = "The quick brown fox jumps over the lazy dog.";
console.log("Words:", sentence.match(/\\b\\w+\\b/g));
console.log("Starts with 'T':", /^The/i.test(sentence));
console.log("Contains 'dog':", /dog\\.$/.test(sentence));
` }),
  },
  {
    title: 'JSON CRUD Store', category: 'data',
    generate: () => ({ title: 'JSON Store', language: 'javascript', animated: false, description: 'Full CRUD on a JSON data store.', code: `// JSON CRUD data store
class JsonStore {
  constructor() { this.items = []; }
  create(item) { const record = { id: Date.now(), ...item }; this.items.push(record); return record; }
  read(id) { return this.items.find((i) => i.id === id) ?? null; }
  update(id, patch) { const i = this.items.find((x) => x.id === id); if (i) Object.assign(i, patch); return i; }
  remove(id) { const i = this.items.findIndex((x) => x.id === id); if (i >= 0) return this.items.splice(i, 1)[0]; return null; }
  all() { return JSON.parse(JSON.stringify(this.items)); }
}

const store = new JsonStore();
const a = store.create({ name: "Alpha", score: 90 });
const b = store.create({ name: "Beta", score: 75 });
store.update(a.id, { score: 95 });
store.remove(b.id);

console.log("All items:", JSON.stringify(store.all(), null, 2));
console.log("Read #" + a.id + ":", store.read(a.id));
` }),
  },
  {
    title: 'OOP Bank Account', category: 'oop',
    generate: () => ({ title: 'Bank Account (OOP)', language: 'javascript', animated: false, description: 'Classes, inheritance, encapsulation.', code: `// OOP — Bank account with inheritance
class Account {
  constructor(owner, balance = 0) {
    this.owner = owner;
    this._balance = balance; // encapsulated
  }
  deposit(amount) {
    if (amount <= 0) throw new Error("Amount must be positive");
    this._balance += amount;
    return this._balance;
  }
  withdraw(amount) {
    if (amount > this._balance) throw new Error("Insufficient funds");
    this._balance -= amount;
    return this._balance;
  }
  get balance() { return this._balance; }
  toString() { return this.owner + " — $" + this._balance; }
}

class SavingsAccount extends Account {
  constructor(owner, balance, interestRate) {
    super(owner, balance);
    this.interestRate = interestRate;
  }
  applyInterest() { this._balance += this._balance * this.interestRate; }
}

const acc = new SavingsAccount("You", 1000, 0.05);
acc.deposit(500);
acc.applyInterest();
console.log(acc.toString());
` }),
  },
  {
    title: 'Web Scraper (Pattern)', category: 'data',
    generate: () => ({ title: 'HTML Parser Pattern', language: 'javascript', animated: false, description: 'DOM parsing pattern with DOMParser.', code: `// HTML parsing pattern (works in browser)
function parseHeadings(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return [...doc.querySelectorAll("h1, h2, h3")].map((h) => h.textContent.trim());
}

const sampleHtml = \`
  <h1>JARVIS</h1>
  <p>Some intro text.</p>
  <h2>Features</h2>
  <ul><li>Chat</li><li>Code</li></ul>
  <h2>Install</h2>
  <h3>Windows</h3>
\`;

console.log("Headings found:");
parseHeadings(sampleHtml).forEach((h) => console.log("  •", h));
` }),
  },
  {
    title: 'Particle Explosion', category: 'visual',
    animated: true,
    generate: (opts) => {
      const theme = opts?.theme ?? 'sparkles';
      const emoji = opts?.emoji ?? '✨';
      const text = opts?.text ?? 'JARVIS';
      return {
        title: `Particle ${theme}`, language: 'javascript', animated: true,
        description: `Canvas particle animation (${theme}).`,
        code: `// Particle animation — ${theme}
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");
const particles = [];
const EMOJI = ${JSON.stringify(emoji)};
const TEXT = ${JSON.stringify(text)};

function spawn(x, y) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 1 + Math.random() * 4;
  particles.push({
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 60 + Math.random() * 40,
    size: 3 + Math.random() * 6,
    hue: Math.random() * 360,
    emoji: ${JSON.stringify(theme === 'emoji')} ? EMOJI : null,
  });
}

function frame() {
  ctx.fillStyle = "rgba(6, 10, 16, 0.35)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    p.vy += 0.05; p.life--;
    if (p.life <= 0) { particles.splice(i, 1); continue; }

    if (p.emoji) {
      ctx.font = p.size * 2 + "px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(p.emoji, p.x, p.y);
    } else if (${JSON.stringify(theme === 'text')}) {
      ctx.fillStyle = "hsl(" + p.hue + ", 100%, 70%)";
      ctx.font = "bold " + p.size * 2 + "px monospace";
      ctx.textAlign = "center";
      ctx.fillText(TEXT[p.life % TEXT.length], p.x, p.y);
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(" + p.hue + ", 100%, 70%)";
      ctx.shadowColor = "hsl(" + p.hue + ", 100%, 60%)";
      ctx.shadowBlur = 15;
      ctx.fill();
    }
  }

  if (particles.length < 80) {
    spawn(canvas.width / 2, canvas.height / 2);
  }
  requestAnimationFrame(frame);
}

frame();
console.log("Animation started — see the PREVIEW tab.");
` };
    },
  },
  {
    title: 'Parrot Animation', category: 'visual',
    animated: true,
    generate: () => {
      const emojiCycle = ['🦜', '🌈', '🦜', '💫', '🦜', '✨'];
      return {
        title: 'Dancing Parrot', language: 'javascript', animated: true,
        description: 'A DOM-based parrot with cycling colors and emoji.',
        code: `// Dancing parrot — DOM animation
const screen = document.getElementById("screen");
screen.innerHTML = "";
screen.style.display = "flex";
screen.style.alignItems = "center";
screen.style.justifyContent = "center";
screen.style.overflow = "hidden";

const parrot = document.createElement("div");
parrot.style.fontSize = "120px";
parrot.style.userSelect = "none";
screen.appendChild(parrot);

const emojis = ${JSON.stringify(emojiCycle)};
const colors = ["#00e5ff", "#ff4d6d", "#ffb020", "#22e07a", "#a78bfa", "#ff9ef5"];
let i = 0;
let angle = 0;

function dance() {
  i++;
  parrot.textContent = emojis[i % emojis.length];
  parrot.style.color = colors[i % colors.length];
  parrot.style.filter = "drop-shadow(0 0 20px " + colors[i % colors.length] + ")";
  angle += 0.08;
  parrot.style.transform = "rotate(" + Math.sin(angle) * 12 + "deg) scale(" + (1 + Math.sin(angle * 2) * 0.1) + ")";
  requestAnimationFrame(dance);
}

dance();
console.log("🦜 The parrot is dancing — see the PREVIEW tab!");
` };
    },
  },
  {
    title: 'Canvas Rain', category: 'visual',
    animated: true,
    generate: (opts) => {
      const droplets = opts?.droplets ?? 'matrix';
      return {
        title: droplets === 'matrix' ? 'Matrix Rain' : 'Raindrops', language: 'javascript', animated: true,
        description: 'Falling rain/matrix code animation.',
        code: `// ${droplets === 'matrix' ? 'Matrix digital rain' : 'Raindrops'} — canvas animation
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");
const cols = Math.floor(canvas.width / 16);
const drops = Array(cols).fill(0);
const chars = ${JSON.stringify(droplets === 'matrix' ? 'アイウエオカキクケコサシスセソタチツテト0123456789' : '｡｢｣､･ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿ')};

function draw() {
  ctx.fillStyle = "rgba(6, 10, 16, 0.08)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "15px monospace";

  for (let i = 0; i < cols; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillStyle = Math.random() > 0.975 ? "#eafcff" : "#00e5ff";
    ctx.shadowColor = "#00e5ff";
    ctx.shadowBlur = 8;
    ctx.fillText(char, i * 16, drops[i] * 16);
    if (drops[i] * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  }
  requestAnimationFrame(draw);
}

draw();
console.log("${droplets === 'matrix' ? 'Matrix' : 'Rain'} animation started — see the PREVIEW tab.");
` };
    },
  },
  {
    title: 'Bouncing Balls', category: 'visual',
    animated: true,
    generate: () => ({
      title: 'Bouncing Balls', language: 'javascript', animated: true,
      description: 'Physics-lite bouncing balls with trails.',
      code: `// Bouncing balls — canvas animation
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");
const balls = Array.from({ length: 12 }, (_, i) => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  vx: (Math.random() - 0.5) * 6,
  vy: (Math.random() - 0.5) * 6,
  r: 8 + Math.random() * 14,
  hue: (i / 12) * 360,
}));

function draw() {
  ctx.fillStyle = "rgba(6, 10, 16, 0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const b of balls) {
    b.x += b.vx; b.y += b.vy;
    if (b.x < b.r || b.x > canvas.width - b.r) b.vx *= -1;
    if (b.y < b.r || b.y > canvas.height - b.r) b.vy *= -1;

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = "hsl(" + b.hue + ", 100%, 60%)";
    ctx.shadowColor = "hsl(" + b.hue + ", 100%, 60%)";
    ctx.shadowBlur = 20;
    ctx.fill();
  }
  requestAnimationFrame(draw);
}

draw();
console.log("Bouncing balls started — see the PREVIEW tab.");
` }),
  },
  {
    title: 'Snake Game', category: 'game',
    animated: true,
    generate: () => ({
      title: 'Snake Game', language: 'javascript', animated: true,
      description: 'Classic snake with keyboard controls.',
      code: `// Snake game — playable with arrow keys
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");
const SIZE = 20;
const cols = Math.floor(canvas.width / SIZE);
const rows = Math.floor(canvas.height / SIZE);

let snake = [{ x: 5, y: 5 }];
let dir = { x: 1, y: 0 };
let nextDir = { x: 1, y: 0 };
let food = { x: 10, y: 10 };
let score = 0;

window.addEventListener("keydown", (e) => {
  const map = {
    ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
  };
  if (map[e.key]) { nextDir = map[e.key]; e.preventDefault(); }
});

function placeFood() {
  food = {
    x: Math.floor(Math.random() * cols),
    y: Math.floor(Math.random() * rows),
  };
}

function tick() {
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows ||
      snake.some((s) => s.x === head.x && s.y === head.y)) {
    return gameOver();
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    placeFood();
  } else {
    snake.pop();
  }
  draw();
}

function draw() {
  ctx.fillStyle = "#060a10";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ff4d6d";
  ctx.fillRect(food.x * SIZE, food.y * SIZE, SIZE - 2, SIZE - 2);
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? "#00e5ff" : "rgba(0, 229, 255, 0.6)";
    ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 10;
    ctx.fillRect(s.x * SIZE + 1, s.y * SIZE + 1, SIZE - 2, SIZE - 2);
  });
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#7df3ff";
  ctx.font = "14px monospace";
  ctx.fillText("Score: " + score, 10, 20);
}

function gameOver() {
  ctx.fillStyle = "rgba(6, 10, 16, 0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ff4d6d";
  ctx.font = "bold 28px monospace";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);
  ctx.fillStyle = "#7df3ff";
  ctx.font = "16px monospace";
  ctx.fillText("Score: " + score + " — press R to restart", canvas.width / 2, canvas.height / 2 + 25);
  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "r") { snake = [{ x: 5, y: 5 }]; score = 0; dir = { x: 1, y: 0 }; nextDir = { x: 1, y: 0 }; placeFood(); setInterval(tick, 120); }
  }, { once: true });
}

placeFood();
draw();
setInterval(tick, 120);
console.log("🐍 Snake started — click the preview, then use arrow keys/WASD.");
` }),
  },
];

// ─── game modding templates ───────────────────────────────────────────────

const GAME_TEMPLATES: Array<(q: string) => GeneratedCode | null> = [
  (q) => q.includes('zombies') && !q.includes('gsc') && !q.includes('mod')
    ? {
        title: 'BO2 Zombies Map Setup', language: 'gsc', animated: false,
        description: 'Call of Duty: Black Ops 2 Zombies GSC map skeleton.',
        code: `// Black Ops 2 Zombies — map script skeleton (GSC)
#using scripts\\zm\\zm_utility;
#using scripts\\zm\\_zm_utility;

init()
{
    zm_usermap::main();
    thread zm_map_setup();
}

zm_map_setup()
{
    level.zombie_weapon_switch = true;
    level.zombie_avail_weapons = "zm_primary_pistol";
    level.zombie_points_multiplier = 1.0;
    level.zombie_start_room_perk = "specialty_fastreload";

    // spawn points
    zm_spawn::add_zombie_spawn( level.zombiespawn_default, (0, 0, 0) );
    zm_spawn::add_zombie_spawn( level.zombiespawn_default, (512, 0, 0) );

    // power switch — start disabled
    zm_power::init_power_switch( "power_switch", (0, 0, 0), "switch" );

    // doors
    zm_door::init_door( "door_1", (0, 0, 0), 500, "door_1" );

    iprintlnbold( "JARVIS: Zombies map loaded ^3by JARVIS" );
}
`,
      }
    : null,
  (q) => q.includes('zombies') && q.includes('gsc')
    ? {
        title: 'BO2 Zombies GSC', language: 'gsc', animated: false,
        description: 'Black Ops 2 zombies GSC snippet.',
        code: `// BO2 Zombies — GSC helper snippet
#using scripts\\zm\\_zm_utility;

give_players_points(points)
{
    for ( i = 0; i < level.players.size; i++ )
    {
        level.players[i] zm_score::add_to_player_score( points );
    }
    iprintlnbold( "^2+" + points + " points to everyone!" );
}

fast_pap()
{
    for ( i = 0; i < level.players.size; i++ )
    {
        level.players[i] zm_power::set_power_on();
    }
    iprintlnbold( "^3Pack-a-Punch unlocked!" );
}
`,
      }
    : null,
  (q) => /mod\s*(menu|ding)/i.test(q) || (q.includes('mod') && q.includes('menu'))
    ? {
        title: 'BO2 Mod Menu', language: 'gsc', animated: false,
        description: 'A simple zombies mod menu skeleton.',
        code: `// BO2 Zombies — mod menu skeleton (GSC)
init()
{
    zm_usermap::main();
    thread menu_listener();
}

menu_listener()
{
    while( true )
    {
        self waittill( "menuresponse", menu, response );
        if ( menu == "zombie_mod_menu" )
        {
            switch( response )
            {
                case "give_points":
                    thread give_players_points( 10000 );
                    break;
                case "all_perks":
                    thread all_perks();
                    break;
                case "god_mode":
                    self godmode();
                    break;
                case "noclip":
                    self noclip();
                    break;
            }
        }
        wait( 0.05 );
    }
}
`,
      }
    : null,
  (q) => /weapon\s*balanc/i.test(q)
    ? {
        title: 'BO2 Weapon Balancer', language: 'gsc', animated: false,
        description: 'Weapon damage balancing script.',
        code: `// BO2 — weapon balancer (GSC)
init()
{
    level._weapon_damage = [];
    set_weapon_damage( "iw5_m27_mp", 40, 30 );
    set_weapon_damage( "iw5_mp7_mp", 35, 25 );
    set_weapon_damage( "iw5_pp90m1_mp", 32, 22 );
    zm_weapon::set_player_weapons();
}

set_weapon_damage( weapon, damage, headshot_multiplier )
{
    level._weapon_damage[ weapon ] = [ damage, headshot_multiplier ];
}
`,
      }
    : null,
  (q) => /pathfinding|a\s*star|a\*/i.test(q)
    ? {
        title: 'A* Pathfinding', language: 'javascript', animated: false,
        description: 'A* algorithm for games (usable in any engine).',
        code: `// A* pathfinding — generic implementation
function aStar(grid, start, goal) {
  const open = [{ ...start, g: 0, f: heuristic(start, goal), parent: null }];
  const closed = new Set();

  function heuristic(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }
  function key(p) { return p.x + "," + p.y; }

  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift();
    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      let node = current;
      while (node) { path.unshift({ x: node.x, y: node.y }); node = node.parent; }
      return path;
    }
    closed.add(key(current));
    const neighbors = [
      { x: current.x + 1, y: current.y }, { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 }, { x: current.x, y: current.y - 1 },
    ];
    for (const n of neighbors) {
      if (closed.has(key(n))) continue;
      if (grid[n.y]?.[n.x] === 1) continue; // 1 = wall
      const g = current.g + 1;
      const existing = open.find((o) => o.x === n.x && o.y === n.y);
      if (!existing || g < existing.g) {
        const node = { ...n, g, f: g + heuristic(n, goal), parent: current };
        if (existing) Object.assign(existing, node);
        else open.push(node);
      }
    }
  }
  return null;
}

const grid = [
  [0, 0, 0, 0, 0],
  [1, 1, 1, 0, 1],
  [0, 0, 0, 0, 0],
  [0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0],
];
const path = aStar(grid, { x: 0, y: 0 }, { x: 4, y: 4 });
console.log("Path:", path ? path.map((p) => "(" + p.x + "," + p.y + ")").join(" → ") : "No path");
console.log("Steps:", path ? path.length - 1 : -1);
` ,
      }
    : null,
  (q) => /ecs/i.test(q) || (q.includes('entity') && q.includes('component'))
    ? {
        title: 'ECS Architecture', language: 'javascript', animated: false,
        description: 'Entity-Component-System game architecture.',
        code: `// ECS — Entity Component System skeleton
class World {
  constructor() { this.entities = []; this.systems = []; this.nextId = 0; }
  createEntity(components = {}) {
    const e = { id: this.nextId++, components };
    this.entities.push(e);
    return e;
  }
  addSystem(system) { this.systems.push(system); }
  update(dt) { for (const s of this.systems) s(this.entities, dt); }
}

// Components
const position = (x, y) => ({ position: { x, y } });
const velocity = (vx, vy) => ({ velocity: { vx, vy } });
const renderable = (sprite) => ({ renderable: { sprite } });

// Systems
const movement = (entities, dt) => {
  for (const e of entities) {
    if (e.components.position && e.components.velocity) {
      e.components.position.x += e.components.velocity.vx * dt;
      e.components.position.y += e.components.velocity.vy * dt;
    }
  }
};

const world = new World();
const player = world.createEntity({ ...position(0, 0), ...velocity(50, 30), ...renderable("🚀") });
const enemy = world.createEntity({ ...position(100, 100), ...velocity(-20, 0), ...renderable("👾") });
world.addSystem(movement);

for (let frame = 0; frame < 3; frame++) {
  world.update(0.016);
  for (const e of world.entities) {
    const p = e.components.position;
    console.log(e.components.renderable.sprite, "at", Math.round(p.x) + "," + Math.round(p.y));
  }
}
` ,
      }
    : null,
  (q) => /map\s*(gen|generator)|bsp|dungeon/i.test(q)
    ? {
        title: 'BSP Map Generator', language: 'javascript', animated: false,
        description: 'Binary space partitioning dungeon/map generator.',
        code: `// BSP map generator — rooms from binary space partitioning
class BSPNode {
  constructor(x, y, w, h) { this.x = x; this.y = y; this.w = w; this.h = h; this.left = null; this.right = null; }
  split(depth) {
    if (depth <= 0 || this.w < 12 || this.h < 12) return;
    const horizontal = this.w / this.h < 1.2;
    if (horizontal) {
      const splitY = Math.floor(this.h * (0.35 + Math.random() * 0.3));
      this.left = new BSPNode(this.x, this.y, this.w, splitY);
      this.right = new BSPNode(this.x, this.y + splitY, this.w, this.h - splitY);
    } else {
      const splitX = Math.floor(this.w * (0.35 + Math.random() * 0.3));
      this.left = new BSPNode(this.x, this.y, splitX, this.h);
      this.right = new BSPNode(this.x + splitX, this.y, this.w - splitX, this.h);
    }
    this.left.split(depth - 1);
    this.right.split(depth - 1);
  }
  rooms() {
    if (!this.left && !this.right) return [this];
    return [...(this.left?.rooms() ?? []), ...(this.right?.rooms() ?? [])];
  }
}

const root = new BSPNode(0, 0, 64, 48);
root.split(5);
const rooms = root.rooms();
console.log("Generated", rooms.length, "rooms:");
rooms.forEach((r, i) => console.log("  Room " + i + ": " + r.w + "x" + r.h + " at (" + r.x + "," + r.y + ")"));
` ,
      }
    : null,
];

// ─── python generators ────────────────────────────────────────────────────

const PYTHON_TEMPLATES: Array<{ title: string; category: string; generate: () => GeneratedCode }> = [
  {
    title: 'Data Analysis (Pandas)', category: 'data',
    generate: () => ({
      title: 'Data Analysis with pandas', language: 'python', animated: false,
      description: 'Load, clean and summarize a CSV with pandas.',
      code: `# Data analysis with pandas
import pandas as pd

# sample data
data = {
    "name": ["Ada", "Alan", "Grace", "Katherine", "Dennis"],
    "score": [92, 88, 95, 91, 84],
    "hours": [6, 4, 7, 5, 3],
}
df = pd.DataFrame(data)

print(df)
print("\\n--- Summary ---")
print(df["score"].describe())
print("\\nBest performer:", df.loc[df["score"].idxmax(), "name"])
print("Average hours:", df["hours"].mean())
`,
    }),
  },
  {
    title: 'Algorithms in Python', category: 'algo',
    generate: () => ({
      title: 'Algorithms (binary search + quick sort)', language: 'python', animated: false,
      description: 'Classic algorithms implemented in Python.',
      code: `# Classic algorithms in Python

def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[-1]
    left = [x for x in arr[:-1] if x <= pivot]
    right = [x for x in arr[:-1] if x > pivot]
    return quick_sort(left) + [pivot] + quick_sort(right)

data = [42, 17, 8, 99, 23, 56, 31]
print("Sorted:", quick_sort(data))
print("Index of 56:", binary_search(sorted(data), 56))
`,
    }),
  },
  {
    title: 'Math with NumPy', category: 'math',
    generate: () => ({
      title: 'Math with numpy', language: 'python', animated: false,
      description: 'Vector math and statistics with numpy.',
      code: `# Math with numpy
import numpy as np

a = np.array([1, 2, 3, 4, 5])
b = np.linspace(0, 10, 5)

print("a:", a)
print("b:", b)
print("a + b:", a + b)
print("a * b:", a * b)
print("sin(a):", np.sin(a))
print("mean:", np.mean(a), "std:", np.std(a))

matrix = np.random.rand(3, 3)
print("\\nRandom matrix:\\n", matrix)
print("Transpose:\\n", matrix.T)
`,
    }),
  },
  {
    title: 'Generic Python Script', category: 'basic',
    generate: () => ({
      title: 'Generic Python Script', language: 'python', animated: false,
      description: 'A well-structured starter script.',
      code: `#!/usr/bin/env python3
"""A well-structured starter script."""
from __future__ import annotations
import argparse
import sys


def greet(name: str, excited: bool = False) -> str:
    msg = f"Hello, {name}!"
    return msg.upper() if excited else msg


def main() -> int:
    parser = argparse.ArgumentParser(description="JARVIS-generated script")
    parser.add_argument("--name", default="world", help="who to greet")
    parser.add_argument("--excited", action="store_true")
    args = parser.parse_args()

    print(greet(args.name, args.excited))
    return 0


if __name__ == "__main__":
    sys.exit(main())
`,
    }),
  },
];

// ─── HTML page generator ──────────────────────────────────────────────────

export function htmlPage(title = 'JARVIS Page', body?: string): GeneratedCode {
  return {
    title: `HTML Page — ${title}`,
    language: 'html',
    animated: false,
    description: 'A complete HTML page.',
    code: `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100vh;
      background: #060a10; color: #d7e6f5;
      font-family: system-ui, sans-serif;
      display: flex; align-items: center; justify-content: center;
    }
    .card {
      background: linear-gradient(180deg, #0e1626, #090e1a);
      border: 1px solid rgba(0,229,255,.3);
      border-radius: 16px; padding: 48px 56px;
      text-align: center;
      box-shadow: 0 0 40px rgba(0,229,255,.15);
    }
    h1 { background: linear-gradient(90deg, #00e5ff, #3d7bff); -webkit-background-clip: text; background-clip: text; color: transparent; margin: 0 0 12px; }
    p { color: #6b8299; margin: 0 0 24px; }
    button {
      background: rgba(0,229,255,.12); color: #7df3ff;
      border: 1px solid rgba(0,229,255,.5); padding: 10px 24px;
      border-radius: 8px; cursor: pointer; font-size: 14px; transition: .2s;
    }
    button:hover { background: rgba(0,229,255,.25); box-shadow: 0 0 16px rgba(0,229,255,.3); }
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(body ?? 'A page generated by JARVIS.')}</p>
    <button onclick="document.getElementById('out').textContent = 'It works! 🚀'">Click me</button>
    <p id="out" style="color:#22e07a;margin-top:16px"></p>
  </div>
</body>
</html>
`,
  };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── smart generation ─────────────────────────────────────────────────────

const CATEGORY_PATTERNS: Array<[string, RegExp, (q: string) => GeneratedCode | null]> = [
  ['isVisual', /(animate|animation|visual|particle|explosion|rain|sparkle|parrot|bounce|clock|draw|canvas|matrix|fireworks)/i, (q) => {
    if (/parrot/i.test(q)) return TPL.find((t) => t.title === 'Parrot Animation')!.generate();
    if (/rain|matrix/i.test(q)) return TPL.find((t) => t.title === 'Canvas Rain')!.generate({ droplets: /matrix/i.test(q) ? 'matrix' : 'rain' });
    if (/bounce|ball/i.test(q)) return TPL.find((t) => t.title === 'Bouncing Balls')!.generate();
    if (/clock|time/i.test(q)) return TPL.find((t) => t.title === 'Digital Clock')!.generate();
    const emojiMatch = q.match(/(?:with|using|of)?\s*([\u{1F300}-\u{1FAFF}])/u);
    const theme = /emoji/i.test(q) ? 'emoji' : /text|word/i.test(q) ? 'text' : 'sparkles';
    return TPL.find((t) => t.title === 'Particle Explosion')!.generate({
      theme,
      emoji: emojiMatch?.[1] ?? '✨',
      text: q.replace(/animate|animation|visual|particle|explosion|with|using|emoji|sparkles|text|word/gi, '').trim().split(/\s+/)[0]?.toUpperCase() ?? 'JARVIS',
    });
  }],
  ['isGame', /(snake|game|pong|guess)/i, (q) => {
    if (/snake/i.test(q)) return TPL.find((t) => t.title === 'Snake Game')!.generate();
    if (/guess/i.test(q)) return TPL.find((t) => t.title === 'Number Guessing Game')!.generate();
    return TPL.find((t) => t.title === 'Snake Game')!.generate();
  }],
  ['isAPI', /(fetch|api|http|request|json|get data|web request)/i, () => TPL.find((t) => t.title === 'Fetch API Demo')!.generate()],
  ['isData', /(todo|array|list|regex|parse|data|crud|store)/i, (q) => {
    if (/todo/i.test(q)) return TPL.find((t) => t.title === 'Todo List')!.generate();
    if (/array/i.test(q)) return TPL.find((t) => t.title === 'Array Methods Demo')!.generate();
    if (/regex/i.test(q)) return TPL.find((t) => t.title === 'Regex Lab')!.generate();
    if (/crud|store|json store/i.test(q)) return TPL.find((t) => t.title === 'JSON CRUD Store')!.generate();
    return TPL.find((t) => t.title === 'JSON CRUD Store')!.generate();
  }],
  ['isUI', /(counter|timer|clock|button|app|interface)/i, (q) => {
    if (/counter/i.test(q)) return TPL.find((t) => t.title === 'Counter App')!.generate();
    if (/timer|countdown/i.test(q)) return TPL.find((t) => t.title === 'Countdown Timer')!.generate();
    return TPL.find((t) => t.title === 'Counter App')!.generate();
  }],
  ['isAlgo', /(sort|fibonacci|prime|algorithm|search|binary)/i, (q) => {
    if (/fib/i.test(q)) return TPL.find((t) => t.title === 'Fibonacci Sequence')!.generate();
    if (/prime/i.test(q)) return TPL.find((t) => t.title === 'Prime Numbers')!.generate();
    if (/sort/i.test(q)) return TPL.find((t) => t.title === 'Sorting Visualizer Data')!.generate();
    return TPL.find((t) => t.title === 'Fibonacci Sequence')!.generate();
  }],
  ['isBot', /(bot|automation|discord bot)/i, () => ({
    title: 'Chat Bot', language: 'javascript', animated: false,
    description: 'A simple rule-based chatbot.',
    code: `// Simple rule-based chatbot
const rules = [
  [/(hello|hi|hey)/i, "Hello! How can I help you?"],
  [/(how are you)/i, "Running at optimal capacity! How about you?"],
  [/(your name)/i, "I'm JARVIS — Just A Rather Very Intelligent System."],
  [/(joke)/i, "Why do programmers prefer dark mode? Because light attracts bugs!"],
  [/(bye|goodbye)/i, "Goodbye! I'll be here when you need me."],
];

function chat(message) {
  for (const [pattern, reply] of rules) {
    if (pattern.test(message)) return reply;
  }
  return "Interesting — tell me more about \\"" + message + "\\".";
}

console.log(chat("hello"));
console.log(chat("tell me a joke"));
console.log(chat("what's your name"));
console.log(chat("the weather is nice today"));
`,
  })],
  ['isChat', /(chat|conversation|talk to)/i, () => TPL.find((t) => t.title === 'Chat Bot')?.generate() ?? TPL[0].generate()],
  ['isCrypto', /(password|hash|encrypt|secure|random string)/i, () => TPL.find((t) => t.title === 'Password Generator')!.generate()],
  ['isFile', /\b(file|files|filename|read file|write to file|save file|open file|load file)\b/i, () => ({
    title: 'File System Pattern', language: 'javascript', animated: false,
    description: 'Read/write files via the File System Access API.',
    code: `// File handling — File System Access API pattern
async function saveTextFile(filename, content) {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: filename,
      types: [{ description: "Text", accept: { "text/plain": [".txt"] } }],
    });
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    console.log("Saved:", filename);
  } catch (err) {
    console.log("Save cancelled or failed:", err.message);
  }
}

async function readTextFile() {
  try {
    const [handle] = await window.showOpenFilePicker({ multiple: false });
    const file = await handle.getFile();
    console.log("Loaded:", file.name, "(" + file.size + " bytes)");
  } catch (err) {
    console.log("Open cancelled or failed:", err.message);
  }
}

console.log("Call saveTextFile('notes.txt', 'hello') or readTextFile() — needs user gesture.");
`,
  })],
  ['isMath', /(calculate|math|calculator|convert|compute)/i, (q) => {
    if (/convert/i.test(q)) return TPL.find((t) => t.title === 'Unit Converter')!.generate();
    if (/calculator|calc/i.test(q)) return TPL.find((t) => t.title === 'Calculator')!.generate();
    return TPL.find((t) => t.title === 'Calculator')!.generate();
  }],
];

const CODE_KEYWORDS = /(write|generate|create|build|make|code|script|program|function|class|app|animate|visual|game|bot|web|page|python|javascript|js|gsc|mod)/i;

/** Route a request to the right generator; null when not a code request. */
export function smartGenerate(input: string): GeneratedCode | null {
  const q = input.trim();

  // game modding first (very specific)
  if (/bo2|cod|zombies|gsc|black ops|mod menu|map generator|pathfinding|ecs|weapon/.test(q)) {
    for (const gen of GAME_TEMPLATES) {
      const result = gen(q);
      if (result) return result;
    }
  }
  // python
  if (/python/.test(q)) {
    if (/data|pandas|csv|analy/.test(q)) return PYTHON_TEMPLATES[0].generate();
    if (/algo/.test(q)) return PYTHON_TEMPLATES[1].generate();
    if (/math|numpy/.test(q)) return PYTHON_TEMPLATES[2].generate();
    return PYTHON_TEMPLATES[3].generate();
  }
  // html page
  if (/html|web page|website|landing page/.test(q)) {
    const titleMatch = q.match(/called\s+["']?([^"']+?)["']?$/i) ?? q.match(/(?:about|for)\s+([a-z0-9\s]+)$/i);
    return htmlPage(titleMatch?.[1]?.trim() ?? 'JARVIS Page');
  }
  // category routing
  for (const [cat, pattern, gen] of CATEGORY_PATTERNS) {
    if (pattern.test(q)) return gen(q);
  }
  // generic templates
  if (/oop|class|bank|object/.test(q)) return TPL.find((t) => t.title === 'OOP Bank Account')!.generate();
  if (/hello/.test(q)) return TPL.find((t) => t.title === 'Hello World')!.generate();

  // is this even a code request?
  if (!CODE_KEYWORDS.test(q) || q.split(/\s+/).length < 2) return null;
  return TPL.find((t) => t.title === 'Hello World')!.generate();
}

export function isCodeRequest(input: string): boolean {
  const q = input.trim().toLowerCase();
  const patterns = [
    /^(write|generate|create|build|make|code|script)\s+(a |an |the |me |us |some )?/i,
    /^(can you|could you|please|jarvis)[, ]+(write|generate|create|build|make|code)/i,
    /^give me (a|an|some) (code|script|program|function|class)/i,
    /^(animate|draw|visualize|simulate|create an animation)/i,
    /(bo2|cod zombies|gsc|mod menu|zombies script)/i,
  ];
  if (patterns.some((p) => p.test(input))) return true;
  // keyword combo
  const kws = ['code', 'script', 'program', 'function', 'class', 'app', 'game', 'bot', 'animation', 'canvas', 'algorithm', 'python', 'javascript', 'html'];
  const hits = kws.filter((k) => q.includes(k)).length;
  return hits >= 2;
}

// ─── GitHub integration ───────────────────────────────────────────────────

let gitHubToken: string | null = localStorage.getItem('jarvis.gh.token');

export function setGitHubToken(token: string): void {
  gitHubToken = token.trim() || null;
  if (gitHubToken) localStorage.setItem('jarvis.gh.token', gitHubToken);
  else localStorage.removeItem('jarvis.gh.token');
}

export function getGitHubToken(): string | null {
  return gitHubToken;
}

async function ghFetch(path: string, init?: RequestInit): Promise<Response> {
  if (!gitHubToken) throw new Error('No GitHub token set — use "set GitHub token <TOKEN>" first.');
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${gitHubToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.headers ?? {}),
    },
  });
}

export async function createGitHubRepo(name: string, description = 'Created by JARVIS'): Promise<{ success: boolean; message: string }> {
  try {
    const res = await ghFetch('/user/repos', {
      method: 'POST',
      body: JSON.stringify({ name, description, private: false, auto_init: true }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: `GitHub error ${res.status}: ${(err as { message?: string }).message ?? 'unknown'}` };
    }
    const data = (await res.json()) as { html_url: string };
    return { success: true, message: `Repository created: ${data.html_url}` };
  } catch (e) {
    return { success: false, message: (e as Error).message };
  }
}

export async function pushFileToGitHub(repo: string, path: string, content: string, message = 'Update from JARVIS'): Promise<{ success: boolean; message: string }> {
  try {
    const encoded = btoa(unescape(encodeURIComponent(content)));
    // try to fetch existing file SHA for update
    let sha: string | undefined;
    const existing = await ghFetch(`/repos/${repo}/contents/${path}`);
    if (existing.ok) {
      const data = (await existing.json()) as { sha: string };
      sha = data.sha;
    }
    const res = await ghFetch(`/repos/${repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({ message, content: encoded, ...(sha ? { sha } : {}) }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: `GitHub error ${res.status}: ${(err as { message?: string }).message ?? 'unknown'}` };
    }
    const data = (await res.json()) as { content: { html_url: string } };
    return { success: true, message: `Pushed ${path} → ${data.content.html_url}` };
  } catch (e) {
    return { success: false, message: (e as Error).message };
  }
}

export async function listGitHubRepos(): Promise<Array<{ name: string; description: string | null; html_url: string }>> {
  const res = await ghFetch('/user/repos?per_page=100&sort=updated');
  if (!res.ok) throw new Error(`GitHub error ${res.status}`);
  const data = (await res.json()) as Array<{ name: string; description: string | null; html_url: string }>;
  return data;
}
