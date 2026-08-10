// ─── Minimal markdown renderer + sanitization ─────────────────────────────
// Supports: headings, bold, italic, inline code, fenced code blocks,
// bullet/numbered lists, blockquotes, links, hr, line breaks.

import DOMPurify from 'dompurify';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(text: string): string {
  let out = escapeHtml(text);
  // inline code first (protect from other transforms)
  const codeSpans: string[] = [];
  out = out.replace(/`([^`]+)`/g, (_m, c) => {
    codeSpans.push(c);
    return `\u0000${codeSpans.length - 1}\u0000`;
  });
  // links [text](url)
  out = out.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 underline decoration-cyan-400/40 hover:text-cyan-200">$1</a>');
  // bold
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
  // italic
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em class="text-cyan-100/90 italic">$2</em>');
  out = out.replace(/_([^_\n]+)_/g, '<em class="italic">$1</em>');
  // restore code spans
  out = out.replace(/\u0000(\d+)\u0000/g, (_m, i) => `<code class="bg-cyan-400/10 text-cyan-300 px-1.5 py-0.5 rounded text-[0.85em] font-mono border border-cyan-400/20">${codeSpans[Number(i)]}</code>`);
  return out;
}

export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let inCode = false;
  let codeLang = '';
  let codeBuf: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listType === 'ul') { out.push('</ul>'); listType = null; }
    else if (listType === 'ol') { out.push('</ol>'); listType = null; }
  };
  const flushCode = () => {
    if (!inCode) return;
    const lang = /^[a-z0-9+#-]*$/.test(codeLang) ? codeLang : '';
    const html = codeBuf.join('\n');
    out.push(`<pre class="code-block"><div class="code-lang">${lang || 'code'}</div><code>${escapeHtml(html)}</code></pre>`);
    inCode = false;
    codeBuf = [];
    codeLang = '';
  };

  for (const raw of lines) {
    const line = raw;

    if (/^```/.test(line)) {
      if (inCode) {
        flushCode();
      } else {
        flushList();
        inCode = true;
        codeLang = line.slice(3).trim();
        codeBuf = [];
      }
      continue;
    }
    if (inCode) { codeBuf.push(line); continue; }

    const trimmed = line.trim();
    if (!trimmed) { flushList(); out.push(''); continue; }

    // hr
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushList();
      out.push('<hr class="border-cyan-400/20 my-3" />');
      continue;
    }
    // headings
    const h = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flushList();
      const level = h[1].length;
      const cls = level === 1 ? 'text-white text-lg font-bold mt-3 mb-1.5'
        : level === 2 ? 'text-cyan-100 text-base font-bold mt-2.5 mb-1'
          : 'text-cyan-200/90 text-[15px] font-semibold mt-2 mb-1';
      out.push(`<h${level} class="${cls}">${inline(h[2])}</h${level}>`);
      continue;
    }
    // blockquote
    if (/^>\s?/.test(trimmed)) {
      flushList();
      out.push(`<blockquote class="border-l-2 border-cyan-400/50 pl-3 my-2 text-cyan-100/80 italic">${inline(trimmed.replace(/^>\s?/, ''))}</blockquote>`);
      continue;
    }
    // bullet list
    const ul = trimmed.match(/^[-*•]\s+(.*)$/);
    if (ul) {
      if (listType !== 'ul') {
        flushList();
        out.push('<ul class="list-none space-y-1 my-2">');
        listType = 'ul';
      }
      out.push(`<li class="flex gap-2"><span class="text-cyan-400 shrink-0">▸</span><span>${inline(ul[1])}</span></li>`);
      continue;
    }
    // numbered list
    const ol = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (ol) {
      if (listType !== 'ol') {
        flushList();
        out.push('<ol class="list-none space-y-1 my-2">');
        listType = 'ol';
      }
      out.push(`<li class="flex gap-2"><span class="text-cyan-400 shrink-0 font-mono text-xs mt-0.5">›</span><span>${inline(ol[1])}</span></li>`);
      continue;
    }
    flushList();
    out.push(`<p class="my-1.5 leading-relaxed">${inline(trimmed)}</p>`);
  }
  flushCode();
  flushList();
  return DOMPurify.sanitize(out.join('\n'), { ADD_ATTR: ['target', 'rel'] });
}
