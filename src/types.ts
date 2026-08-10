// ─── JARVIS-V2 shared types ────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'jarvis' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'file-result' | 'tool-result' | 'reasoning' | 'error';
  metadata?: Record<string, unknown>;
}

export interface FileEntry {
  name: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: string;
}

export interface MemoryEntry {
  id: number;
  role: string;
  content: string;
  timestamp: string;
  keywords: string[];
}

export interface MonitorData {
  cpu: number;
  ram: number;
  network: { up: number; down: number };
  uptime: number;
}

export interface ProjectFile {
  path: string;
  name: string;
  language: string;
  content: string;
  description: string;
}

export type InputMode = 'chat' | 'command';
