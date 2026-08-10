// ─── Advanced virtual file system with folders ────────────────────────────
// Persisted to localStorage. Supports projects, downloads, and a minimal
// ZIP bundler (stored, no compression) for folder downloads.

export interface VFile {
  name: string;
  path: string;
  content: string;
  type: 'file';
  created: number;
  modified: number;
  size: number;
}

export interface VFolder {
  name: string;
  path: string;
  type: 'folder';
  created: number;
}

export type VNode = VFile | VFolder;

const STORAGE_KEY = 'jarvis.fs.v1';

const BLOCKED_PATTERNS: Array<string | RegExp> = [
  /^\/?(etc|usr|bin|sbin|var|lib|lib64|boot|dev|proc|sys|root|home)\b/,
  /^[a-z]:[\\/](windows|program files|program files \(x86\)|system32|users)/i,
  /(^|\/)node_modules(\/|$)/,
  /(^|\/)(\.git|\.env|\.ssh|\.aws|\.config)(\/|$)/,
  /\.\./,
  /%[a-z0-9]{2}/i,
  /[<>|]/,
  /^~/,
  /^\\/,
  /^\/.*\/.*\/(boot|initrd)/,
];

const BLOCKED_EXTENSIONS = /\.(exe|dll|sys|dmg|iso|bin|msi|bat|cmd|sh|ps1)$/i;

export function isBlocked(path: string): boolean {
  const p = path.trim().replace(/\\/g, '/');
  if (!p || p === '/' || p === '.') return false;
  if (BLOCKED_EXTENSIONS.test(p)) return true;
  return BLOCKED_PATTERNS.some((pat) => (typeof pat === 'string' ? p.includes(pat) : pat.test(p)));
}

export function sanitizePath(path: string): string {
  let p = path.trim().replace(/\\/g, '/');
  p = p.replace(/^\/+/, '').replace(/\/+/g, '/');
  const parts = p.split('/').filter((x) => x && x !== '.');
  const stack: string[] = [];
  for (const part of parts) {
    if (part === '..') { stack.pop(); continue; }
    stack.push(part);
  }
  return stack.join('/');
}

function load(): VNode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as VNode[];
  } catch {
    return [];
  }
}

function save(nodes: VNode[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
  } catch {
    /* storage full — keep in-memory only */
  }
}

const fs: VNode[] = load();
let dirty = false;
function persist(): void {
  if (dirty) return;
  dirty = true;
  setTimeout(() => {
    dirty = false;
    save(fs);
  }, 50);
}

function nodeAt(path: string): VNode | null {
  return fs.find((n) => n.path === path) ?? null;
}

function parentPath(path: string): string {
  const idx = path.lastIndexOf('/');
  return idx <= 0 ? '' : path.slice(0, idx);
}

function existsFolder(path: string): boolean {
  return fs.some((n) => n.type === 'folder' && n.path === path);
}

function ensureParents(path: string): void {
  const parts = path.split('/').filter(Boolean);
  let acc = '';
  for (let i = 0; i < parts.length - 1; i++) {
    acc = acc ? `${acc}/${parts[i]}` : parts[i];
    if (!existsFolder(acc)) {
      fs.push({ name: parts[i], path: acc, type: 'folder', created: Date.now() });
    }
  }
}

// ─── folders ──────────────────────────────────────────────────────────────

export function createFolder(path: string): VFolder | null {
  if (isBlocked(path)) return null;
  const p = sanitizePath(path);
  if (!p || isBlocked(p)) return null;
  ensureParents(p);
  if (existsFolder(p)) return nodeAt(p) as VFolder;
  const folder: VFolder = { name: p.split('/').pop() ?? p, path: p, type: 'folder', created: Date.now() };
  fs.push(folder);
  persist();
  return folder;
}

export function deleteFolder(path: string): boolean {
  const p = sanitizePath(path);
  const target = fs.find((n) => n.path === p && n.type === 'folder');
  if (!target) return false;
  for (let i = fs.length - 1; i >= 0; i--) {
    if (fs[i].path === p || fs[i].path.startsWith(p + '/')) fs.splice(i, 1);
  }
  persist();
  return true;
}

export function listFolders(): VFolder[] {
  return fs.filter((n) => n.type === 'folder') as VFolder[];
}

// ─── files ────────────────────────────────────────────────────────────────

export function createFile(path: string, content = ''): VFile | null {
  if (isBlocked(path)) return null;
  const p = sanitizePath(path);
  if (!p || isBlocked(p)) return null;
  ensureParents(p);
  const existing = nodeAt(p);
  const now = Date.now();
  const file: VFile = {
    name: p.split('/').pop() ?? p,
    path: p,
    content,
    type: 'file',
    created: existing ? (existing as VFile).created : now,
    modified: now,
    size: content.length,
  };
  const idx = fs.findIndex((n) => n.path === p);
  if (idx >= 0) fs[idx] = file;
  else fs.push(file);
  persist();
  return file;
}

export function readFile(path: string): VFile | null {
  const p = sanitizePath(path);
  const n = nodeAt(p);
  return n && n.type === 'file' ? (n as VFile) : null;
}

export function writeFile(path: string, content: string): VFile | null {
  return createFile(path, content);
}

export function appendToFile(path: string, content: string): VFile | null {
  const p = sanitizePath(path);
  const existing = nodeAt(p);
  if (existing && existing.type === 'file') {
    return createFile(p, (existing as VFile).content + content);
  }
  return createFile(p, content);
}

export function deleteFile(path: string): boolean {
  const p = sanitizePath(path);
  const idx = fs.findIndex((n) => n.path === p && n.type === 'file');
  if (idx < 0) return false;
  fs.splice(idx, 1);
  persist();
  return true;
}

export function moveFile(from: string, to: string): boolean {
  if (isBlocked(from) || isBlocked(to)) return false;
  const f = sanitizePath(from);
  const t = sanitizePath(to);
  const node = nodeAt(f);
  if (!node || isBlocked(t)) return false;
  ensureParents(t);
  if (node.type === 'file') {
    const file = node as VFile;
    fs[fs.indexOf(node)] = { ...file, path: t, name: t.split('/').pop() ?? t, modified: Date.now() };
  } else {
    const folder = node as VFolder;
    const newPrefix = `${t}/${folder.name}`;
    const moved: VNode[] = [];
    for (let i = fs.length - 1; i >= 0; i--) {
      if (fs[i].path === f) {
        moved.unshift({ ...folder, path: newPrefix });
        fs.splice(i, 1);
      } else if (fs[i].path.startsWith(f + '/')) {
        moved.unshift({ ...fs[i], path: newPrefix + fs[i].path.slice(f.length) });
        fs.splice(i, 1);
      }
    }
    fs.push(...moved);
  }
  persist();
  return true;
}

export function copyFile(from: string, to: string): boolean {
  if (isBlocked(from) || isBlocked(to)) return false;
  const f = sanitizePath(from);
  const t = sanitizePath(to);
  const node = nodeAt(f);
  if (!node || isBlocked(t)) return false;
  ensureParents(t);
  if (node.type === 'file') {
    const file = node as VFile;
    fs.push({ ...file, path: t, name: t.split('/').pop() ?? t, created: Date.now(), modified: Date.now() });
  } else {
    const folder = node as VFolder;
    const newPrefix = t;
    const copy: VNode[] = [];
    for (const n of fs) {
      if (n.path === f) copy.push({ ...folder, path: newPrefix, created: Date.now() });
      else if (n.path.startsWith(f + '/')) {
        if (n.type === 'file') {
          const file = n as VFile;
          copy.push({ ...file, path: newPrefix + n.path.slice(f.length), created: Date.now(), modified: Date.now() });
        } else {
          copy.push({ ...(n as VFolder), path: newPrefix + n.path.slice(f.length), created: Date.now() });
        }
      }
    }
    fs.push(...copy);
  }
  persist();
  return true;
}

export function renameFile(path: string, newName: string): boolean {
  const p = sanitizePath(path);
  const name = newName.trim().replace(/[\\/]/g, '');
  if (!name || isBlocked(p)) return false;
  const node = nodeAt(p);
  if (!node) return false;
  const parent = parentPath(p);
  const newPath = parent ? `${parent}/${name}` : name;
  return moveFile(p, newPath);
}

export interface FileSystemEntry {
  name: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: string;
}

const toEntry = (n: VNode, fullPath = false): FileSystemEntry => ({
  name: fullPath ? n.path : n.name,
  type: n.type === 'folder' ? 'directory' : 'file',
  size: n.type === 'file' ? (n as VFile).size : undefined,
  modified: n.type === 'file' ? new Date((n as VFile).modified).toLocaleString() : undefined,
});

export function listFiles(folder?: string): FileSystemEntry[] {
  const base = folder ? sanitizePath(folder) : '';
  return fs
    .filter((n) => {
      const parent = parentPath(n.path);
      return base ? parent === base : parent === '';
    })
    .map((n) => toEntry(n))
    .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'directory' ? -1 : 1));
}

export function listAllFiles(folder?: string): FileSystemEntry[] {
  const base = folder ? sanitizePath(folder) : '';
  return fs
    .filter((n) => {
      if (base) {
        return n.path.startsWith(base + '/') || n.path === base;
      }
      return true;
    })
    .map((n) => toEntry(n, true));
}

export function searchFiles(query: string): VFile[] {
  const q = query.toLowerCase();
  return fs.filter((n) =>
    n.type === 'file' &&
    (n.name.toLowerCase().includes(q) || (n as VFile).content.toLowerCase().includes(q)),
  ) as VFile[];
}

export function getFileContent(path: string): string {
  return readFile(path)?.content ?? '';
}

// ─── downloads ────────────────────────────────────────────────────────────

export function downloadFile(path: string): boolean {
  const file = readFile(path);
  if (!file) return false;
  const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

// ─── minimal ZIP writer (stored entries + CRC32) ─────────────────────────

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildZip(files: Array<{ path: string; content: string }>): Blob {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const f of files) {
    const name = encoder.encode(f.path);
    const data = encoder.encode(f.content);
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length + data.length);
    const dv = new DataView(local.buffer);
    dv.setUint32(0, 0x04034b50, true);
    dv.setUint16(4, 20, true); // version needed
    dv.setUint16(6, 0x0800, true); // utf-8 flag
    dv.setUint16(8, 0, true); // stored
    dv.setUint32(14, crc, true);
    dv.setUint32(18, data.length, true);
    dv.setUint32(22, data.length, true);
    dv.setUint16(26, name.length, true);
    local.set(name, 30);
    local.set(data, 30 + name.length);
    chunks.push(local);

    const cen = new Uint8Array(46 + name.length);
    const cdv = new DataView(cen.buffer);
    cdv.setUint32(0, 0x02014b50, true);
    cdv.setUint16(4, 20, true);
    cdv.setUint16(6, 20, true);
    cdv.setUint16(8, 0x0800, true);
    cdv.setUint16(10, 0, true);
    cdv.setUint32(16, crc, true);
    cdv.setUint32(20, data.length, true);
    cdv.setUint32(24, data.length, true);
    cdv.setUint16(28, name.length, true);
    cdv.setUint32(42, offset, true);
    cen.set(name, 46);
    central.push(cen);
    offset += local.length;
  }
  const centralSize = central.reduce((a, c) => a + c.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  const all = [...chunks, ...central, eocd];
  return new Blob(all as unknown as BlobPart[], { type: 'application/zip' });
}

export function downloadFolder(path: string): boolean {
  const base = sanitizePath(path);
  const files = fs.filter(
    (n) => n.type === 'file' && (base === '' || n.path.startsWith(base + '/') || n.path === base),
  ) as VFile[];
  if (!files.length) return false;
  const zip = buildZip(files.map((f) => ({ path: f.path, content: f.content })));
  const url = URL.createObjectURL(zip);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${base || 'jarvis-fs'}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

// ─── project templates ────────────────────────────────────────────────────

export type ProjectTemplate = 'basic' | 'node' | 'javascript' | 'python' | 'web' | 'html' | 'exe' | 'desktop';

export function createProject(name: string, template: ProjectTemplate = 'basic'): boolean {
  const safe = sanitizePath(name).split('/').filter(Boolean).join('-');
  if (!safe) return false;
  const root = `projects/${safe}`;
  const mk = (p: string, content: string) => createFile(`${root}/${p}`, content);
  createFolder(root);

  switch (template) {
    case 'node':
    case 'javascript': {
      mk('package.json', JSON.stringify({ name: safe, version: '1.0.0', main: 'src/index.js', scripts: { start: 'node src/index.js' } }, null, 2));
      mk('src/index.js', '// JARVIS Node.js project\nconst express = require("express");\n\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.get("/", (req, res) => {\n  res.send("Hello from JARVIS!");\n});\n\napp.listen(PORT, () => {\n  console.log(`Server running on http://localhost:${PORT}`);\n});\n');
      mk('README.md', `# ${safe}\n\nNode.js project scaffolded by JARVIS.\n`);
      break;
    }
    case 'python': {
      mk('main.py', '# JARVIS Python project\nimport sys\n\n\ndef main():\n    print("Hello from JARVIS!")\n    print(f"Python {sys.version_info.major}.{sys.version_info.minor}")\n\n\nif __name__ == "__main__":\n    main()\n');
      mk('requirements.txt', '# dependencies\n# requests==2.31.0\n');
      mk('README.md', `# ${safe}\n\nPython project scaffolded by JARVIS.\n`);
      break;
    }
    case 'web':
    case 'html': {
      mk('index.html', '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>JARVIS Web Project</title>\n  <link rel="stylesheet" href="styles.css" />\n</head>\n<body>\n  <h1>Hello from JARVIS! 🚀</h1>\n  <script src="app.js"></script>\n</body>\n</html>\n');
      mk('styles.css', 'body {\n  font-family: system-ui, sans-serif;\n  background: #060a10;\n  color: #d7e6f5;\n  display: grid;\n  place-items: center;\n  min-height: 100vh;\n}\n\nh1 {\n  background: linear-gradient(90deg, #00e5ff, #3d7bff);\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;\n}\n');
      mk('app.js', 'console.log("JARVIS web project loaded!");\n');
      break;
    }
    case 'exe':
    case 'desktop': {
      mk('package.json', JSON.stringify({ name: safe, version: '1.0.0', main: 'main.js', scripts: { start: 'electron .', dist: 'electron-builder' }, devDependencies: { electron: '^31.0.0', 'electron-builder': '^24.13.3' } }, null, 2));
      mk('main.js', 'const { app, BrowserWindow } = require("electron");\n\nfunction createWindow() {\n  const win = new BrowserWindow({\n    width: 900,\n    height: 650,\n    backgroundColor: "#060a10",\n    webPreferences: { nodeIntegration: true },\n  });\n  win.loadFile("index.html");\n}\n\napp.whenReady().then(createWindow);\napp.on("window-all-closed", () => {\n  if (process.platform !== "darwin") app.quit();\n});\n');
      mk('index.html', '<!doctype html>\n<html>\n<head><meta charset="UTF-8" /><title>JARVIS Desktop App</title></head>\n<body style="background:#060a10;color:#00e5ff;font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0">\n  <h1>⚡ JARVIS Desktop</h1>\n</body>\n</html>\n');
      mk('README.md', `# ${safe}\n\nElectron desktop app scaffolded by JARVIS.\n\n${buildExeInstructions()}`);
      break;
    }
    default: {
      mk('README.md', `# ${safe}\n\nCreated by JARVIS at ${new Date().toLocaleString()}.\n`);
      mk('notes.txt', 'Welcome to your JARVIS workspace.\n');
    }
  }
  return true;
}

export function buildExeInstructions(): string {
  return [
    '## Building a .exe from the Electron template',
    '',
    '1. `cd` into the project folder',
    '2. `npm install`',
    '3. `npm run dist` (uses electron-builder)',
    '4. Output appears in `dist/` — a Windows installer (.exe) and portable build',
    '',
    'Cross-platform targets: add `--win`, `--mac`, or `--linux` flags to `npm run dist`.',
    'Icon: place `build/icon.ico` (Windows) or `build/icon.icns` (macOS) in the project.',
  ].join('\n');
}
