// ─── Project & task management (localStorage) ─────────────────────────────

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  project: string;
  text: string;
  priority: TaskPriority;
  status: TaskStatus;
  created: number;
}

export interface Project {
  name: string;
  description: string;
  folder: string;
  created: number;
  status: 'active' | 'paused' | 'archived';
  tasks: Task[];
  notes: string[];
}

const KEY = 'jarvis.projects.v1';

function load(): Project[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Project[]) : [];
  } catch {
    return [];
  }
}

const projects: Project[] = load();
let dirty = false;
function persist(): void {
  if (dirty) return;
  dirty = true;
  setTimeout(() => {
    dirty = false;
    try { localStorage.setItem(KEY, JSON.stringify(projects)); } catch { /* noop */ }
  }, 50);
}

const uid = () => `t${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

export function createProject(name: string, description = '', folder?: string): Project | null {
  const clean = name.trim();
  if (!clean) return null;
  if (projects.some((p) => p.name.toLowerCase() === clean.toLowerCase())) {
    return null;
  }
  const project: Project = {
    name: clean,
    description: description.trim(),
    folder: folder?.trim() || `projects/${clean.toLowerCase().replace(/[^a-z0-9-]+/g, '-')}`,
    created: Date.now(),
    status: 'active',
    tasks: [],
    notes: [],
  };
  projects.push(project);
  persist();
  return project;
}

export function addTask(projectName: string, text: string, priority: TaskPriority = 'medium'): Task | null {
  const project = projects.find((p) => p.name.toLowerCase() === projectName.toLowerCase());
  if (!project || !text.trim()) return null;
  const task: Task = {
    id: uid(),
    project: project.name,
    text: text.trim(),
    priority,
    status: 'todo',
    created: Date.now(),
  };
  project.tasks.push(task);
  persist();
  return task;
}

export function setTaskStatus(taskId: string, status: TaskStatus): boolean {
  for (const p of projects) {
    const task = p.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = status;
      persist();
      return true;
    }
  }
  return false;
}

export function completeTask(taskId: string): boolean {
  return setTaskStatus(taskId, 'done');
}

export function removeTask(taskId: string): boolean {
  for (const p of projects) {
    const idx = p.tasks.findIndex((t) => t.id === taskId);
    if (idx >= 0) {
      p.tasks.splice(idx, 1);
      persist();
      return true;
    }
  }
  return false;
}

export function addProjectNote(projectName: string, note: string): boolean {
  const project = projects.find((p) => p.name.toLowerCase() === projectName.toLowerCase());
  if (!project) return false;
  project.notes.unshift(note);
  persist();
  return true;
}

export function getProjectStatus(projectName?: string): string {
  if (projectName) {
    const p = projects.find((x) => x.name.toLowerCase() === projectName.toLowerCase());
    if (!p) return `No project named "${projectName}". Say "create project ${projectName}" to make one.`;
    return formatProject(p);
  }
  if (!projects.length) return 'No projects yet. Try "create project MyApp" to get started.';
  const lines = projects.map((p) => {
    const done = p.tasks.filter((t) => t.status === 'done').length;
    return `• **${p.name}** — ${done}/${p.tasks.length} tasks done (${p.status})`;
  });
  const active = projects.filter((p) => p.status === 'active' && p.tasks.some((t) => t.status !== 'done'));
  const focus = active
    .flatMap((p) => p.tasks.filter((t) => t.status !== 'done').map((t) => ({ p: p.name, t })))
    .sort((a, b) => (a.t.priority === 'high' ? -1 : 1) - (b.t.priority === 'high' ? -1 : 1))
    .slice(0, 3);
  const focusLines = focus.length
    ? `\n\n🎯 **Focus on next:**\n${focus.map((f) => `• [${f.t.priority.toUpperCase()}] ${f.p}: ${f.t.text}`).join('\n')}`
    : '';
  return lines.join('\n') + focusLines;
}

function formatProject(p: Project): string {
  const lines = [`📁 **${p.name}** — ${p.description || 'no description'}`];
  const done = p.tasks.filter((t) => t.status === 'done').length;
  lines.push(`Status: ${p.status} · ${done}/${p.tasks.length} tasks done`);
  if (p.tasks.length) {
    lines.push('Tasks:');
    for (const t of p.tasks) {
      const icon = t.status === 'done' ? '✅' : t.status === 'in-progress' ? '🔄' : '⬜';
      lines.push(`  ${icon} [${t.priority}] ${t.text}`);
    }
  }
  if (p.notes.length) lines.push(`Notes (${p.notes.length})`);
  return lines.join('\n');
}

export function deleteProject(name: string): boolean {
  const idx = projects.findIndex((p) => p.name.toLowerCase() === name.toLowerCase());
  if (idx < 0) return false;
  projects.splice(idx, 1);
  persist();
  return true;
}

export function getProjects(): Project[] {
  return projects.map((p) => ({ ...p, tasks: [...p.tasks] }));
}

export function getProject(name: string): Project | null {
  const p = projects.find((x) => x.name.toLowerCase() === name.toLowerCase());
  return p ? { ...p, tasks: [...p.tasks] } : null;
}

export function getTaskCount(): number {
  return projects.reduce((a, p) => a + p.tasks.length, 0);
}
