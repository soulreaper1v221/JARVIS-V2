// ─── Virtual file system panel ────────────────────────────────────────────

import { useMemo, useState } from 'react';
import {
  listFiles,
  createFile,
  createFolder,
  readFile,
  writeFile,
  deleteFile,
  deleteFolder,
  renameFile,
  moveFile,
  copyFile,
  downloadFile,
  downloadFolder,
  searchFiles,
  createProject,
} from '../../engine/files';
import type { ProjectTemplate } from '../../engine/files';

const LANG_HINT: Record<string, string> = {
  js: 'javascript', ts: 'typescript', py: 'python', html: 'html', css: 'css',
  json: 'json', md: 'markdown', txt: 'text', gsc: 'gsc', java: 'java', c: 'c', cpp: 'cpp',
};

export default function FilesPanel({ onNotify }: { onNotify: (msg: string) => void }) {
  const [folder, setFolder] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [newName, setNewName] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [projName, setProjName] = useState('');
  const [projTemplate, setProjTemplate] = useState<ProjectTemplate>('basic');
  const [, force] = useState(0);

  const rerender = () => force((x) => x + 1);

  const entries = useMemo(() => listFiles(folder), [folder, rerender]); // eslint-disable-line react-hooks/exhaustive-deps
  const searchResults = useMemo(() => (searchQ ? searchFiles(searchQ) : []), [searchQ, rerender]); // eslint-disable-line react-hooks/exhaustive-deps

  const openFile = (path: string) => {
    const file = readFile(path);
    if (file) {
      setSelected(path);
      setContent(file.content);
    }
  };

  const handleSave = () => {
    if (!selected) return;
    writeFile(selected, content);
    onNotify(`Saved ${selected}`);
    rerender();
  };

  const handleDelete = (path: string, isDir: boolean) => {
    const ok = isDir ? deleteFolder(path) : deleteFile(path);
    onNotify(ok ? `Deleted ${path}` : `Could not delete ${path}`);
    if (selected === path) { setSelected(null); setContent(''); }
    rerender();
  };

  const handleCreateFile = () => {
    if (!newName.trim()) return;
    const path = folder ? `${folder}/${newName.trim()}` : newName.trim();
    const file = createFile(path, '');
    if (file) {
      openFile(file.path);
      onNotify(`Created ${file.path}`);
      setNewName('');
      rerender();
    } else {
      onNotify(`"${newName}" is blocked (system paths / executables not allowed).`);
    }
  };

  const handleCreateFolder = () => {
    if (!newName.trim()) return;
    const path = folder ? `${folder}/${newName.trim()}` : newName.trim();
    const ok = createFolder(path);
    onNotify(ok ? `Created folder ${path}` : `Could not create "${newName}"`);
    setNewName('');
    rerender();
  };

  const handleRename = (path: string, isDir: boolean) => {
    const next = window.prompt(`Rename "${path}" to:`, path.split('/').pop());
    if (!next) return;
    const ok = renameFile(path, next);
    onNotify(ok ? `Renamed → ${isDir ? next : path.slice(0, path.lastIndexOf('/') + 1) + next}` : 'Rename failed');
    rerender();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.js,.ts,.py,.html,.css,.json,.csv,.gsc';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      const path = folder ? `${folder}/${file.name}` : file.name;
      createFile(path, text);
      onNotify(`Imported ${file.name} (${file.size} bytes)`);
      rerender();
    };
    input.click();
  };

  const breadcrumbs = useMemo(() => {
    const parts = folder ? folder.split('/') : [];
    const crumbs: Array<{ label: string; path: string }> = [{ label: 'root', path: '' }];
    let acc = '';
    for (const p of parts) {
      acc = acc ? `${acc}/${p}` : p;
      crumbs.push({ label: p, path: acc });
    }
    return crumbs;
  }, [folder]);

  const lang = selected ? LANG_HINT[selected.split('.').pop() ?? ''] ?? 'text' : 'text';

  return (
    <div className="flex" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* left: tree */}
      <div className="w-[300px] border-r border-cyan-400/12 flex flex-col" style={{ minHeight: 0 }}>
        <div className="p-3 border-b border-cyan-400/10" style={{ flexShrink: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🗂️</span>
            <h2 className="text-sm font-bold text-cyan-100 flex-1">Virtual File System</h2>
            <button onClick={handleImport} className="jv-btn !px-2 !py-1 !text-[10px]" title="Import a local file">⬆</button>
          </div>
          <div className="flex gap-1.5 mb-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
              placeholder="name.txt"
              className="jv-input !text-[11px] flex-1 !px-2 !py-1"
            />
            <button onClick={handleCreateFile} className="jv-btn !px-2 !py-1 !text-[11px]" title="New file">📄</button>
            <button onClick={handleCreateFolder} className="jv-btn !px-2 !py-1 !text-[11px]" title="New folder">📂</button>
          </div>
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="🔎 search files (content)"
            className="jv-input !text-[11px] !px-2 !py-1"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2" style={{ minHeight: 0 }}>
          {searchQ ? (
            searchResults.length === 0 ? (
              <div className="text-xs text-slate-600 p-2">No matches.</div>
            ) : (
              searchResults.slice(0, 40).map((f) => (
                <button key={f.path} onClick={() => openFile(f.path)} className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-cyan-400/10 transition-colors">
                  <span className="text-cyan-300 font-mono">{f.path}</span>
                  <span className="text-slate-500 ml-1">({f.size}B)</span>
                </button>
              ))
            )
          ) : entries.length === 0 ? (
            <div className="text-xs text-slate-600 p-2 leading-relaxed">
              Empty{folder ? ' folder' : ''}. Create a file or folder, or import from disk.
            </div>
          ) : (
            entries.map((e) => {
              const path = folder ? `${folder}/${e.name}` : e.name;
              const isDir = e.type === 'directory';
              return (
                <div key={path} className="group flex items-center gap-1 px-1.5 py-1 rounded hover:bg-cyan-400/8 transition-colors">
                  <button
                    onClick={() => (isDir ? setFolder(path) : openFile(path))}
                    className="flex-1 text-left text-xs flex items-center gap-1.5 min-w-0"
                  >
                    <span>{isDir ? '📂' : '📄'}</span>
                    <span className="truncate" style={{ color: selected === path ? '#7df3ff' : '#c4d8e8' }}>{e.name}</span>
                    {!isDir && e.size !== undefined && <span className="text-[10px] text-slate-600 ml-auto shrink-0">{e.size}B</span>}
                  </button>
                  <span className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                    <button onClick={() => handleRename(path, isDir)} className="text-[10px] text-slate-500 hover:text-cyan-300 px-0.5" title="Rename">✎</button>
                    <button onClick={() => onNotify(isDir ? (downloadFolder(path) ? `ZIP created for ${path}` : 'Folder empty') : (downloadFile(path) ? `Downloading ${e.name}` : 'Missing'))} className="text-[10px] text-slate-500 hover:text-cyan-300 px-0.5" title="Download">⬇</button>
                    <button onClick={() => handleDelete(path, isDir)} className="text-[10px] text-slate-500 hover:text-red-400 px-0.5" title="Delete">✕</button>
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* project scaffolder */}
        <div className="p-3 border-t border-cyan-400/10" style={{ flexShrink: 0 }}>
          <div className="text-[10px] font-bold tracking-widest text-cyan-400/70 mb-1.5">⚡ PROJECT SCAFFOLDER</div>
          <div className="flex gap-1.5">
            <input value={projName} onChange={(e) => setProjName(e.target.value)} placeholder="project name" className="jv-input !text-[11px] flex-1 !px-2 !py-1" />
            <select
              value={projTemplate}
              onChange={(e) => setProjTemplate(e.target.value as ProjectTemplate)}
              className="jv-input !text-[11px] !w-20 !px-1 !py-1"
            >
              <option value="basic">basic</option>
              <option value="node">node</option>
              <option value="python">python</option>
              <option value="web">web</option>
              <option value="exe">exe</option>
            </select>
            <button
              onClick={() => {
                if (!projName.trim()) return;
                const ok = createProject(projName, projTemplate);
                onNotify(ok ? `Project "${projName}" scaffolded (${projTemplate}).` : 'Could not create project.');
                setProjName('');
                rerender();
              }}
              className="jv-btn jv-btn-primary !px-2 !py-1 !text-[11px]"
            >
              ⚡
            </button>
          </div>
        </div>
      </div>

      {/* right: editor */}
      <div className="flex-1 flex flex-col" style={{ minWidth: 0, minHeight: 0 }}>
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-cyan-400/10 text-xs font-mono text-slate-500 overflow-x-auto whitespace-nowrap" style={{ flexShrink: 0 }}>
          <button onClick={() => setFolder('')} className="hover:text-cyan-300">~/</button>
          {breadcrumbs.slice(1).map((c) => (
            <span key={c.path} className="flex items-center gap-1">
              <span className="text-slate-700">/</span>
              <button onClick={() => setFolder(c.path)} className="hover:text-cyan-300">{c.label}</button>
            </span>
          ))}
          <span className="flex-1" />
          {folder && (
            <button onClick={() => onNotify(downloadFolder(folder) ? `ZIP bundle downloading…` : 'Folder empty')} className="text-cyan-400/70 hover:text-cyan-300">
              ⬇ bundle
            </button>
          )}
        </div>

        {selected ? (
          <>
            <div className="px-3 py-1.5 border-b border-cyan-400/10 flex items-center gap-2" style={{ flexShrink: 0 }}>
              <span className="text-xs font-mono text-cyan-200 truncate">{selected}</span>
              <span className="jv-chip" style={{ fontSize: 10 }}>{lang}</span>
              <div className="flex-1" />
              <button onClick={handleSave} className="jv-btn jv-btn-primary !px-3 !py-1 !text-[11px]">💾 Save</button>
              <button onClick={() => onNotify(downloadFile(selected) ? `Downloading…` : 'Missing')} className="jv-btn !px-2 !py-1 !text-[11px]">⬇</button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
              className="flex-1 resize-none outline-none p-3 font-mono text-[12px] leading-relaxed"
              style={{ background: 'rgba(6,10,16,0.5)', color: '#cfe4f2', minHeight: 0 }}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-600" style={{ minHeight: 0 }}>
            <div className="text-center">
              <div className="text-4xl mb-3">🗂️</div>
              Select a file to view &amp; edit it<br />
              <span className="text-xs text-slate-700">or ask me in chat: "create file notes.txt: hello"</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
