// ─── Projects & tasks panel ───────────────────────────────────────────────

import { useMemo, useState } from 'react';
import {
  getProjects,
  createProject,
  addTask,
  setTaskStatus,
  removeTask,
  deleteProject,
  addProjectNote,
  getProjectStatus,
} from '../../engine/projects';
import type { TaskPriority } from '../../engine/projects';

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  high: '#ff4d6d',
  medium: '#ffb020',
  low: '#22e07a',
};

export default function ProjectsPanel({ onNotify }: { onNotify: (msg: string) => void }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [taskText, setTaskText] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [noteText, setNoteText] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [, force] = useState(0);

  const projects = useMemo(() => getProjects(), [force]); // eslint-disable-line react-hooks/exhaustive-deps
  const rerender = () => force((x) => x + 1);

  const handleCreate = () => {
    if (!name.trim()) return;
    const p = createProject(name.trim(), desc);
    onNotify(p ? `Project "${p.name}" created.` : `A project named "${name.trim()}" already exists.`);
    setName('');
    setDesc('');
    rerender();
  };

  const handleAddTask = (projectName: string) => {
    if (!taskText.trim()) return;
    const t = addTask(projectName, taskText, priority);
    onNotify(t ? `Task added to ${projectName}: "${t.text}"` : 'Could not add task.');
    setTaskText('');
    rerender();
  };

  return (
    <div className="p-4 overflow-y-auto" style={{ flex: 1, minHeight: 0 }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📁</span>
          <div>
            <h2 className="text-lg font-bold text-cyan-100 leading-tight">Projects &amp; Tasks</h2>
            <p className="text-xs text-slate-500">{projects.length} projects · {projects.reduce((a, p) => a + p.tasks.length, 0)} tasks</p>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => onNotify(getProjectStatus())}
            className="jv-btn !text-xs"
          >
            🎯 Status summary
          </button>
        </div>

        {/* create form */}
        <div className="jv-panel p-4 mb-4">
          <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-2">NEW PROJECT</div>
          <div className="flex gap-2 mb-2">
            <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreate()} placeholder="Project name" className="jv-input !text-xs flex-1" />
            <button onClick={handleCreate} className="jv-btn jv-btn-primary !text-xs">Create</button>
          </div>
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short description (optional)" className="jv-input !text-xs" />
        </div>

        {projects.length === 0 && (
          <div className="jv-panel p-8 text-center text-sm text-slate-500">
            No projects yet. Create one above, or just ask me in chat: <em className="text-cyan-300">"create project MyApp"</em>
          </div>
        )}

        {projects.map((p) => {
          const done = p.tasks.filter((t) => t.status === 'done').length;
          const pct = p.tasks.length ? Math.round((done / p.tasks.length) * 100) : 0;
          const isOpen = expanded === p.name;
          return (
            <div key={p.name} className="jv-panel p-4 mb-3">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => setExpanded(isOpen ? null : p.name)}
                  className="text-sm font-bold text-cyan-100 hover:text-cyan-300 transition-colors flex items-center gap-2"
                >
                  <span className={`inline-block transition-transform ${isOpen ? 'rotate-90' : ''}`}>▸</span> {p.name}
                </button>
                <span className="jv-chip" style={{ fontSize: 10, borderColor: p.status === 'active' ? 'rgba(34,224,122,0.4)' : 'rgba(255,176,32,0.4)', color: p.status === 'active' ? '#22e07a' : '#ffd28a' }}>
                  {p.status}
                </span>
                <span className="text-[11px] text-slate-500">{done}/{p.tasks.length} done</span>
                <div className="flex-1" />
                <button
                  onClick={() => { deleteProject(p.name); onNotify(`Project "${p.name}" deleted.`); rerender(); }}
                  className="text-[11px] text-slate-600 hover:text-red-400 transition-colors"
                >
                  delete
                </button>
              </div>

              {/* progress bar */}
              <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(27,42,68,0.7)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg, #0aa3b8, #00e5ff)',
                    boxShadow: '0 0 8px rgba(0,229,255,0.5)',
                  }}
                />
              </div>

              {p.description && <div className="text-xs text-slate-500 mb-2">{p.description}</div>}
              <div className="text-[10px] font-mono text-slate-600 mb-1.5">📂 {p.folder}</div>

              {isOpen && (
                <div className="space-y-2 mt-2">
                  {p.tasks.length === 0 && <div className="text-xs text-slate-600 italic">No tasks yet.</div>}
                  {p.tasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-xs bg-black/25 rounded px-2.5 py-1.5 border border-cyan-400/8">
                      <button
                        onClick={() => { setTaskStatus(t.id, t.status === 'done' ? 'todo' : 'done'); rerender(); }}
                        className="text-sm"
                        title="Toggle done"
                      >
                        {t.status === 'done' ? '✅' : t.status === 'in-progress' ? '🔄' : '⬜'}
                      </button>
                      <span className="flex-1" style={{ textDecoration: t.status === 'done' ? 'line-through' : 'none', color: t.status === 'done' ? '#5d7489' : '#d7e6f5' }}>
                        {t.text}
                      </span>
                      <span className="jv-chip" style={{ fontSize: 9, borderColor: PRIORITY_COLOR[t.priority] + '55', color: PRIORITY_COLOR[t.priority] }}>
                        {t.priority}
                      </span>
                      <button
                        onClick={() => { setTaskStatus(t.id, t.status === 'in-progress' ? 'todo' : 'in-progress'); rerender(); }}
                        className="text-[10px] text-slate-500 hover:text-cyan-300"
                      >
                        {t.status === 'in-progress' ? 'pause' : 'start'}
                      </button>
                      <button
                        onClick={() => { removeTask(t.id); rerender(); }}
                        className="text-[10px] text-slate-500 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <input
                      value={taskText}
                      onChange={(e) => setTaskText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTask(p.name)}
                      placeholder={`Add task to ${p.name}…`}
                      className="jv-input !text-xs flex-1 !py-1.5"
                    />
                    <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="jv-input !text-[11px] !w-24 !py-1.5">
                      <option value="high">high</option>
                      <option value="medium">medium</option>
                      <option value="low">low</option>
                    </select>
                    <button onClick={() => handleAddTask(p.name)} className="jv-btn jv-btn-primary !text-xs !py-1.5">Add</button>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <input
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && noteText.trim()) {
                          addProjectNote(p.name, noteText.trim());
                          setNoteText('');
                          rerender();
                        }
                      }}
                      placeholder={`Add note to ${p.name}…`}
                      className="jv-input !text-xs flex-1 !py-1.5"
                    />
                  </div>
                  {p.notes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {p.notes.map((n, i) => (
                        <span key={i} className="text-[11px] text-amber-200/90 bg-amber-400/8 border border-amber-400/25 rounded px-2 py-0.5">📌 {n}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
