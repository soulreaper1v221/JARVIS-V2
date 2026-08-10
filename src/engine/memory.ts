// ─── In-memory conversation store with keyword extraction ────────────────
import type { MemoryEntry } from '../types';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when', 'while',
  'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up',
  'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'once',
  'here', 'there', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 'just', 'can', 'will', 'would', 'could', 'should', 'may', 'might',
  'must', 'shall', 'do', 'does', 'did', 'have', 'has', 'had', 'is', 'are', 'was',
  'were', 'be', 'been', 'being', 'it', 'its', 'this', 'that', 'these', 'those',
  'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my',
  'your', 'our', 'their', 'what', 'which', 'who', 'whom', 'whose', 'how', 'why',
  'am', 'as', 'also', 'want', 'need', 'like', 'get', 'one', 'two', 'yes', 'yeah',
  'ok', 'okay', 'please', 'thanks', 'thank', 'sure', 'right', 'got', 'let', 'go',
  'tell', 'say', 'said', 'really', 'actually', 'maybe', 'well', 'hey', 'hi',
  'hello', 'oh', 'ah', 'um', 'uh', 'hmm', 'now', 'today', 'know', 'think', 'see',
  'look', 'make', 'use', 'using', 'give', 'take', 'put', 'try', 'trying', 'back',
  'around', 'away', 'still', 'even', 'though', 'although', 'because', 'since',
  'until', 'while', 'via', 'per', 'upon', 'among', 'within', 'without', 'yes',
]);

export function extractKeywords(content: string, limit = 6): string[] {
  const words = content
    .toLowerCase()
    .replace(/[^a-z0-9\s'\-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of words) {
    const clean = w.replace(/^['\-]+|['\-]+$/g, '');
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    out.push(clean);
    if (out.length >= limit) break;
  }
  return out;
}

const store: MemoryEntry[] = [];
let nextId = 1;

export function saveTurn(role: 'user' | 'jarvis' | 'system', content: string): MemoryEntry {
  const entry: MemoryEntry = {
    id: nextId++,
    role,
    content,
    timestamp: new Date().toISOString(),
    keywords: extractKeywords(content),
  };
  store.push(entry);
  if (store.length > 500) store.shift(); // keep memory bounded
  return entry;
}

export function getRecentContext(limit = 10): MemoryEntry[] {
  return store.slice(-limit);
}

/** Partial-keyword matching search over the memory store. */
export function searchMemory(query: string): MemoryEntry[] {
  const qk = extractKeywords(query, 12);
  if (qk.length === 0) return [];
  return store
    .map((e) => {
      let score = 0;
      for (const kw of qk) {
        for (const ek of e.keywords) {
          if (ek === kw) score += 3;
          else if (ek.startsWith(kw) || kw.startsWith(ek)) score += 2;
          else if (ek.includes(kw) || kw.includes(ek)) score += 1;
        }
        if (e.content.toLowerCase().includes(kw)) score += 1;
      }
      return { entry: e, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.entry)
    .slice(0, 12);
}

export function getAllMemory(): MemoryEntry[] {
  return [...store];
}

export function clearMemory(): void {
  store.length = 0;
}

export interface MemoryStats {
  totalTurns: number;
  userTurns: number;
  jarvisTurns: number;
  keywordCount: number;
  topKeywords: string[];
}

export function getMemoryStats(): MemoryStats {
  const counts = new Map<string, number>();
  for (const e of store) {
    for (const kw of e.keywords) counts.set(kw, (counts.get(kw) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k]) => k);
  return {
    totalTurns: store.length,
    userTurns: store.filter((e) => e.role === 'user').length,
    jarvisTurns: store.filter((e) => e.role === 'jarvis').length,
    keywordCount: counts.size,
    topKeywords: top,
  };
}
