// ─── Multi-engine parallel web search ─────────────────────────────────────
// All engines are free public APIs with CORS support. Every request is
// wrapped in fetchSafe with an AbortController timeout, and the orchestrator
// uses Promise.allSettled so a failing engine never kills the search.

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  relevance: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  synthesized: string;
  enginesUsed: string[];
  durationMs: number;
  error?: string;
}

export interface MultiSearchOptions {
  engines?: string[];
  timeout?: number;
  deep?: boolean;
}

export function fetchSafe(url: string, timeout = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { signal: controller.signal, headers: { Accept: 'application/json, text/plain, */*' } })
    .finally(() => clearTimeout(timer));
}

async function safeJson<T>(url: string, timeout?: number): Promise<T | null> {
  try {
    const res = await fetchSafe(url, timeout);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function cleanSnippet(text: string, max = 220): string {
  const clean = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
}

// ─── Engines ──────────────────────────────────────────────────────────────

/** DuckDuckGo Instant Answer API. */
export async function searchDDG(query: string): Promise<SearchResult[]> {
  const data = await safeJson<{
    AbstractText?: string;
    AbstractURL?: string;
    Heading?: string;
    RelatedTopics?: Array<{ Text?: string; FirstURL?: string; Topics?: Array<{ Text?: string; FirstURL?: string }> }>;
    Answer?: string;
  }>(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`);
  if (!data) return [];
  const out: SearchResult[] = [];
  if (data.Answer) {
    out.push({ title: data.Heading || query, url: data.AbstractURL || 'https://duckduckgo.com', snippet: data.Answer, source: 'DuckDuckGo', relevance: 0.95 });
  }
  if (data.AbstractText) {
    out.push({ title: data.Heading || query, url: data.AbstractURL || 'https://duckduckgo.com', snippet: cleanSnippet(data.AbstractText), source: 'DuckDuckGo', relevance: 0.9 });
  }
  for (const rt of data.RelatedTopics ?? []) {
    const items = rt.Topics ?? [];
    for (const t of items.length ? items : [rt]) {
      if (t.Text) {
        out.push({ title: t.Text.split(' - ')[0].slice(0, 80), url: t.FirstURL || 'https://duckduckgo.com', snippet: cleanSnippet(t.Text), source: 'DuckDuckGo', relevance: 0.55 });
      }
      if (out.length >= 6) break;
    }
    if (out.length >= 6) break;
  }
  return out;
}

/** Wikipedia REST summary + search. */
export async function searchWiki(query: string): Promise<SearchResult[]> {
  const out: SearchResult[] = [];
  // 1) try the summary endpoint directly
  const summary = await safeJson<{
    title?: string;
    extract?: string;
    content_urls?: { desktop?: { page?: string } };
    description?: string;
  }>(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/\s+/g, '_'))}`);
  if (summary?.extract) {
    out.push({
      title: summary.title ?? query,
      url: summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(query.replace(/\s+/g, '_'))}`,
      snippet: cleanSnippet(summary.extract, 300),
      source: 'Wikipedia',
      relevance: 0.92,
    });
  }
  // 2) search for more
  const search = await safeJson<{
    query?: { search?: Array<{ title: string; snippet: string }> };
  }>(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=5`);
  if (search?.query?.search) {
    for (const hit of search.query.search) {
      if (out.some((r) => r.title === hit.title)) continue;
      out.push({
        title: hit.title,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(hit.title.replace(/\s+/g, '_'))}`,
        snippet: cleanSnippet(hit.snippet),
        source: 'Wikipedia',
        relevance: 0.6,
      });
      if (out.length >= 5) break;
    }
  }
  return out;
}

/** Wiktionary word lookups. */
export async function searchWiktionary(query: string): Promise<SearchResult[]> {
  const word = query.split(/\s+/)[0];
  const data = await safeJson<{
    query?: { pages?: Record<string, { extract?: string; title?: string }> };
  }>(`https://en.wiktionary.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(word)}&format=json&origin=*&redirects=1`);
  if (!data?.query?.pages) return [];
  for (const page of Object.values(data.query.pages)) {
    if (page.extract) {
      return [{
        title: `${page.title ?? word} — definition`,
        url: `https://en.wiktionary.org/wiki/${encodeURIComponent((page.title ?? word).replace(/\s+/g, '_'))}`,
        snippet: cleanSnippet(page.extract.slice(0, 600), 320),
        source: 'Wiktionary',
        relevance: 0.8,
      }];
    }
  }
  return [];
}

/** Stack Overflow via the StackExchange API. */
export async function searchSO(query: string): Promise<SearchResult[]> {
  const data = await safeJson<{
    items?: Array<{ title: string; link: string; tags?: string[]; score?: number }>;
  }>(`https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(query)}&site=stackoverflow&pagesize=5&filter=default`);
  if (!data?.items) return [];
  return data.items.map((i) => ({
    title: i.title,
    url: i.link,
    snippet: `Tags: ${(i.tags ?? []).slice(0, 5).join(', ')} · Score ${i.score ?? 0}`,
    source: 'Stack Overflow',
    relevance: 0.75,
  }));
}

/** OpenLibrary book search. */
export async function searchBooks(query: string): Promise<SearchResult[]> {
  const data = await safeJson<{
    docs?: Array<{ title: string; author_name?: string[]; first_publish_year?: number; key?: string; edition_count?: number }>;
  }>(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`);
  if (!data?.docs) return [];
  return data.docs.map((d) => ({
    title: d.title,
    url: `https://openlibrary.org${d.key ?? ''}`,
    snippet: `by ${(d.author_name ?? ['Unknown']).join(', ')} · first published ${d.first_publish_year ?? '?'} · ${d.edition_count ?? 0} editions`,
    source: 'OpenLibrary',
    relevance: 0.7,
  }));
}

/** arXiv API with XML parsing. */
export async function searchArxiv(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetchSafe(`https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=5`, 10000);
    if (!res.ok) return [];
    const xml = await res.text();
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const entries = doc.querySelectorAll('entry');
    const out: SearchResult[] = [];
    entries.forEach((entry) => {
      const title = entry.querySelector('title')?.textContent?.trim() ?? '';
      const summary = entry.querySelector('summary')?.textContent?.trim() ?? '';
      const id = entry.querySelector('id')?.textContent?.trim() ?? '';
      out.push({
        title: title.slice(0, 120),
        url: id,
        snippet: cleanSnippet(summary, 220),
        source: 'arXiv',
        relevance: 0.65,
      });
    });
    return out;
  } catch {
    return [];
  }
}

/** Wikimedia Commons image search. */
export async function searchCommons(query: string): Promise<SearchResult[]> {
  const data = await safeJson<{
    query?: { search?: Array<{ title: string }> };
  }>(`https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=5`);
  if (!data?.query?.search) return [];
  return data.query.search.map((s) => ({
    title: s.title.replace(/^File:/, ''),
    url: `https://commons.wikimedia.org/wiki/${encodeURIComponent(s.title.replace(/\s+/g, '_'))}`,
    snippet: 'Wikimedia Commons media file',
    source: 'Commons',
    relevance: 0.5,
  }));
}

// ─── Type detection ───────────────────────────────────────────────────────

const CODE_HINTS = /\b(code|function|error|bug|exception|syntax|regex|class|variable|array|string|json|api|python|javascript|typescript|java|c\+\+|css|html|sql|how to|example|snippet|algorithm|sort|loop)\b/i;
const DEFINITION_HINTS = /^(what (is|are|does|was)|define|meaning of|definition of|who is|what's)\b/i;
const SCIENCE_HINTS = /\b(physics|chemistry|biology|astronomy|mathematics|math|medicine|atom|molecule|cell|gravity|quantum|photosynthesis|dna|protein|energy|force|element|planet|star|equation|formula|chemical|enzyme|neuron)\b/i;
const BOOK_HINTS = /\b(book|novel|author|read|reading|edition|literature|story of|written by)\b/i;

export function isCode(query: string): boolean {
  return CODE_HINTS.test(query) && query.split(/\s+/).length > 2;
}
export function isDefinition(query: string): boolean {
  return DEFINITION_HINTS.test(query.trim());
}
export function isScience(query: string): boolean {
  return SCIENCE_HINTS.test(query);
}
export function isBook(query: string): boolean {
  return BOOK_HINTS.test(query);
}

export function detectSearchType(query: string): 'code' | 'definition' | 'science' | 'book' | 'general' {
  if (isScience(query)) return 'science';
  if (isCode(query)) return 'code';
  if (isDefinition(query)) return 'definition';
  if (isBook(query)) return 'book';
  return 'general';
}

/** Expand the query with synonyms for better coverage. */
export function expandQuery(query: string): string {
  const expansions: Array<[RegExp, string]> = [
    [/\bwhat is\b/i, 'what is definition of'],
    [/\bhow do i\b/i, 'how to'],
    [/\bhow does\b/i, 'how does work'],
    [/\bcode for\b/i, 'code example'],
    [/\bfix\b/i, 'fix error solution'],
  ];
  let out = query;
  for (const [re, add] of expansions) {
    if (re.test(out)) {
      out = out.replace(re, (m) => m) + ' ' + add;
      break;
    }
  }
  return out;
}

// ─── Orchestrator ─────────────────────────────────────────────────────────

const ENGINE_MAP: Record<string, (q: string) => Promise<SearchResult[]>> = {
  ddg: searchDDG,
  wiki: searchWiki,
  wiktionary: searchWiktionary,
  so: searchSO,
  books: searchBooks,
  arxiv: searchArxiv,
  commons: searchCommons,
};

export function defaultEngines(query: string): string[] {
  const type = detectSearchType(query);
  switch (type) {
    case 'definition': return ['wiki', 'ddg', 'wiktionary'];
    case 'science': return ['wiki', 'ddg', 'arxiv'];
    case 'code': return ['so', 'wiki', 'ddg'];
    case 'book': return ['books', 'wiki', 'ddg'];
    default: return ['ddg', 'wiki', 'wiktionary'];
  }
}

export async function multiSearch(query: string, opts: MultiSearchOptions = {}): Promise<SearchResponse> {
  const started = performance.now();
  const expanded = opts.deep ? expandQuery(query) : query;
  const engines = opts.engines ?? defaultEngines(query);
  const timeout = opts.timeout ?? 10000;

  const tasks = engines.map(async (name) => {
    const fn = ENGINE_MAP[name];
    if (!fn) return [] as SearchResult[];
    try {
      const results = await Promise.race([
        fn(expanded),
        new Promise<SearchResult[]>((resolve) => setTimeout(() => resolve([]), timeout)),
      ]);
      return results;
    } catch {
      return [] as SearchResult[];
    }
  });

  const settled = await Promise.allSettled(tasks);
  const grouped: SearchResult[][] = settled.map((s, i) => (s.status === 'fulfilled' ? s.value : []));

  // dedupe by normalized title
  const seen = new Set<string>();
  const merged: SearchResult[] = [];
  for (const group of grouped) {
    for (const r of group) {
      const key = r.title.toLowerCase().replace(/\s+/g, ' ').trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(r);
    }
  }

  // relevance sort: title matches first, then snippet matches
  const qWords = new Set(query.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
  for (const r of merged) {
    let score = r.relevance;
    const title = r.title.toLowerCase();
    const snip = r.snippet.toLowerCase();
    for (const w of qWords) {
      if (title.includes(w)) score += 0.15;
      if (snip.includes(w)) score += 0.05;
    }
    if (query.toLowerCase().split(/\s+/).every((w) => w.length > 3 && title.includes(w.toLowerCase()))) score += 0.4;
    r.relevance = Math.min(1, score);
  }
  merged.sort((a, b) => b.relevance - a.relevance);
  const top = merged.slice(0, 8);

  const durationMs = Math.round(performance.now() - started);
  return {
    query,
    results: top,
    synthesized: synthesizeAnswer(query, top),
    enginesUsed: engines,
    durationMs,
    error: top.length === 0 ? 'No results found — all engines returned empty.' : undefined,
  };
}

function synthesizeAnswer(query: string, results: SearchResult[]): string {
  if (!results.length) return `I couldn't find anything solid on "${query}" — try rephrasing it.`;
  const top = results[0];
  const lead = `Here's what I found on **${query}**:\n\n`;
  const main = top.snippet;
  const extras = results.slice(1, 4).map((r, i) => `${i + 2}. **${r.title}** (_${r.source}_) — ${r.snippet}`).join('\n');
  const links = results.slice(0, 3).map((r) => `- ${r.title}: ${r.url}`).join('\n');
  return `${lead}**${top.title}** (_${top.source}_)\n${main}\n\n${extras ? `More sources:\n${extras}\n\n` : ''}**Links:**\n${links}`;
}

export function formatSearchResults(query: string, results: SearchResult[], synthesized?: string): string {
  if (!results.length) return `No results for "${query}". The web engines all came back empty — maybe try different wording?`;
  let out = synthesized ?? synthesizeAnswer(query, results);
  return out;
}
