// ─── User profiles with localStorage persistence ──────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  pin: string;
  createdAt: number;
  lastLogin: number;
  loginCount: number;
  preferences: Record<string, string>;
  interests: string[];
  topTopics: Array<{ topic: string; count: number }>;
  mood: string | null;
  conversationStyle: string;
  facts: Record<string, string>;
  notes: string[];
  recentSearches: string[];
  favoriteApps: string[];
  stats: {
    messages: number;
    jarvisMessages: number;
    jokes: number;
    searches: number;
    projects: number;
    files: number;
    codeRuns: number;
  };
  chatHistory: Array<{ role: string; content: string; timestamp: number }>;
}

const USERS_KEY = 'jarvis.users.v1';
const SESSION_KEY = 'jarvis.session.v1';

function loadUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as UserProfile[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: UserProfile[]): void {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch { /* noop */ }
}

function loadSession(): string | null {
  try { return localStorage.getItem(SESSION_KEY); } catch { return null; }
}

function saveSession(id: string | null): void {
  try {
    if (id) localStorage.setItem(SESSION_KEY, id);
    else localStorage.removeItem(SESSION_KEY);
  } catch { /* noop */ }
}

let users: UserProfile[] = loadUsers();
let currentUserId: string | null = loadSession();

function ensureGuest(): UserProfile {
  let guest = users.find((u) => u.id === 'guest');
  if (!guest) {
    guest = makeProfile('guest', 'Guest', '');
    users.unshift(guest);
    saveUsers(users);
  }
  return guest;
}

function makeProfile(id: string, name: string, pin: string): UserProfile {
  const now = Date.now();
  return {
    id,
    name,
    pin,
    createdAt: now,
    lastLogin: now,
    loginCount: 0,
    preferences: {},
    interests: [],
    topTopics: [],
    mood: null,
    conversationStyle: 'casual',
    facts: {},
    notes: [],
    recentSearches: [],
    favoriteApps: [],
    stats: { messages: 0, jarvisMessages: 0, jokes: 0, searches: 0, projects: 0, files: 0, codeRuns: 0 },
    chatHistory: [],
  };
}

export function getCurrentUser(): UserProfile | null {
  ensureGuest();
  return users.find((u) => u.id === (currentUserId ?? 'guest')) ?? users[0] ?? null;
}

export function restoreSession(): UserProfile | null {
  ensureGuest();
  if (!currentUserId) {
    currentUserId = 'guest';
    saveSession('guest');
  }
  const user = getCurrentUser();
  if (user) {
    user.lastLogin = Date.now();
    saveUsers(users);
  }
  return user;
}

export function signUp(name: string, pin: string): { success: boolean; message: string; user?: UserProfile } {
  const clean = name.trim();
  if (!clean) return { success: false, message: 'Please enter a name.' };
  if (pin.length < 3) return { success: false, message: 'PIN must be at least 3 characters.' };
  if (users.some((u) => u.name.toLowerCase() === clean.toLowerCase())) {
    return { success: false, message: `A user named "${clean}" already exists. Try signing in.` };
  }
  const id = `u${Date.now().toString(36)}`;
  const user = makeProfile(id, clean, pin);
  user.loginCount = 1;
  users.push(user);
  currentUserId = id;
  saveUsers(users);
  saveSession(id);
  return { success: true, message: `Welcome, ${clean}! Profile created.`, user };
}

export function signIn(name: string, pin: string): { success: boolean; message: string; user?: UserProfile } {
  const user = users.find((u) => u.name.toLowerCase() === name.trim().toLowerCase());
  if (!user) return { success: false, message: `No profile named "${name.trim()}". Sign up first?` };
  if (user.pin && user.pin !== pin) return { success: false, message: 'Wrong PIN. Try again.' };
  if (!user.pin && user.id !== 'guest') return { success: false, message: 'This profile has a PIN set.' };
  user.loginCount += 1;
  user.lastLogin = Date.now();
  currentUserId = user.id;
  saveUsers(users);
  saveSession(user.id);
  return { success: true, message: `Welcome back, ${user.name}!`, user };
}

export function signOut(): void {
  currentUserId = null;
  saveSession(null);
}

export function updateProfile(patch: Partial<Pick<UserProfile, 'name' | 'pin' | 'mood' | 'conversationStyle' | 'preferences'>>): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  Object.assign(user, patch);
  saveUsers(users);
  return true;
}

/** Track a discussed topic — becomes an interest after 3 discussions. */
export function trackTopic(topic: string): void {
  const user = getCurrentUser();
  if (!user || !topic) return;
  const existing = user.topTopics.find((t) => t.topic.toLowerCase() === topic.toLowerCase());
  if (existing) existing.count += 1;
  else user.topTopics.push({ topic, count: 1 });
  const top = user.topTopics.find((t) => t.topic.toLowerCase() === topic.toLowerCase())!;
  if (top.count >= 3 && !user.interests.includes(top.topic)) {
    user.interests.push(top.topic);
  }
  user.topTopics.sort((a, b) => b.count - a.count);
  user.topTopics = user.topTopics.slice(0, 20);
  saveUsers(users);
}

export function trackMessage(role: 'user' | 'jarvis'): void {
  const user = getCurrentUser();
  if (!user) return;
  if (role === 'user') user.stats.messages += 1;
  else user.stats.jarvisMessages += 1;
  saveUsers(users);
}

export function trackJoke(): void {
  const user = getCurrentUser();
  if (!user) return;
  user.stats.jokes += 1;
  saveUsers(users);
}

export function trackSearch(query: string): void {
  const user = getCurrentUser();
  if (!user) return;
  user.stats.searches += 1;
  user.recentSearches.unshift(query);
  user.recentSearches = [...new Set(user.recentSearches)].slice(0, 15);
  saveUsers(users);
}

export function storeUserFact(key: string, value: string): void {
  const user = getCurrentUser();
  if (!user) return;
  user.facts[key] = value;
  saveUsers(users);
}

export function addNote(note: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  user.notes.unshift(note);
  user.notes = user.notes.slice(0, 50);
  saveUsers(users);
  return true;
}

export function removeNote(index: number): boolean {
  const user = getCurrentUser();
  if (!user || index < 0 || index >= user.notes.length) return false;
  user.notes.splice(index, 1);
  saveUsers(users);
  return true;
}

export function getPersonalization(): string {
  const user = getCurrentUser();
  if (!user) return '';
  const parts: string[] = [];
  if (user.interests.length) parts.push(`interests: ${user.interests.join(', ')}`);
  if (Object.keys(user.facts).length) {
    parts.push(`facts: ${Object.entries(user.facts).map(([k, v]) => `${k}=${v}`).join(', ')}`);
  }
  return parts.join(' · ');
}

export function saveChatMessage(role: string, content: string): void {
  const user = getCurrentUser();
  if (!user) return;
  user.chatHistory.push({ role, content, timestamp: Date.now() });
  user.chatHistory = user.chatHistory.slice(-100);
  saveUsers(users);
}

export function getChatHistory(): Array<{ role: string; content: string; timestamp: number }> {
  return getCurrentUser()?.chatHistory ?? [];
}

export function clearChatHistory(): void {
  const user = getCurrentUser();
  if (!user) return;
  user.chatHistory = [];
  saveUsers(users);
}

export function listUsers(): Array<{ id: string; name: string; lastLogin: number; messageCount: number }> {
  return users.map((u) => ({ id: u.id, name: u.name, lastLogin: u.lastLogin, messageCount: u.stats.messages }));
}

export function deleteUser(id: string): boolean {
  if (id === 'guest') return false;
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) return false;
  users.splice(idx, 1);
  if (currentUserId === id) {
    currentUserId = 'guest';
    saveSession('guest');
  }
  saveUsers(users);
  return true;
}
