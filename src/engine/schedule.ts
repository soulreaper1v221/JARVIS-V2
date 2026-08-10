// ─── Schedule engine: weekly timetables with bi-weekly support ────────────

export interface ScheduleEntry {
  day: string; // full day name, lowercase
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  label: string;
  room?: string;
  note?: string;
}

export interface ScheduleWeek {
  name: string;
  entries: ScheduleEntry[];
}

export interface ScheduleConfig {
  type: 'class' | 'work' | 'custom';
  weeks: ScheduleWeek[];
  startDate: string; // ISO date of week 1
  notes: string[];
}

const KEY = 'jarvis.schedule.v1';
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_ALIASES: Record<string, string> = {
  mon: 'monday', mo: 'monday', m: 'monday',
  tue: 'tuesday', tues: 'tuesday', tu: 'tuesday', t: 'tuesday',
  wed: 'wednesday', w: 'wednesday',
  thu: 'thursday', thur: 'thursday', thurs: 'thursday', th: 'thursday', r: 'thursday',
  fri: 'friday', f: 'friday',
  sat: 'saturday', sa: 'saturday',
  sun: 'sunday', su: 'sunday',
};

function load(): ScheduleConfig | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ScheduleConfig) : null;
  } catch {
    return null;
  }
}

let config: ScheduleConfig | null = load();
let dirty = false;
function persist(): void {
  if (dirty) return;
  dirty = true;
  setTimeout(() => {
    dirty = false;
    if (config) {
      try { localStorage.setItem(KEY, JSON.stringify(config)); } catch { /* noop */ }
    } else {
      try { localStorage.removeItem(KEY); } catch { /* noop */ }
    }
  }, 50);
}

function dayIndex(day: string): number {
  const d = day.trim().toLowerCase();
  if (DAYS.includes(d)) return DAYS.indexOf(d);
  return DAY_ALIASES[d] !== undefined ? DAYS.indexOf(DAY_ALIASES[d]) : -1;
}

function dayName(day: string): string {
  const d = day.trim().toLowerCase();
  if (DAYS.includes(d)) return d;
  const alias = DAY_ALIASES[d];
  if (alias) return alias;
  // fuzzy
  for (const full of DAYS) {
    if (full.startsWith(d.slice(0, 2))) return full;
  }
  return d;
}

/** Parse a time like "9", "9:30", "09:00", "7am", "3pm", "14:30" → "HH:MM". */
function parseTime(t: string): string | null {
  const raw = t.trim().toLowerCase();
  let m = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const meridiem = m[3];
  if (hour < 0 || hour > 23 || min < 0 || min > 59) return null;
  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function fmt12(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hh} ${period}` : `${hh}:${String(m).padStart(2, '0')} ${period}`;
}

function isoWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

/** Weeks since the configured start date → 0 or 1 for bi-weekly. */
export function getCurrentWeekType(): number {
  if (!config) return 0;
  const start = new Date(config.startDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000);
  if (diffDays < 0) return 0;
  return Math.floor(diffDays / 7) % Math.max(config.weeks.length, 1);
}

export function getDayEntries(day: string): ScheduleEntry[] {
  if (!config) return [];
  const d = dayName(day);
  const weekType = getCurrentWeekType();
  const week = config.weeks[weekType] ?? config.weeks[0];
  if (!week) return [];
  return week.entries
    .filter((e) => e.day === d)
    .sort((a, b) => a.start.localeCompare(b.start));
}

export function getTodayEntries(): ScheduleEntry[] {
  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  return getDayEntries(today);
}

export function getWeekSchedule(offset = 0): ScheduleWeek {
  const empty: ScheduleWeek = { name: 'empty', entries: [] };
  if (!config) return empty;
  const weekType = getCurrentWeekType();
  const idx = (weekType + offset + config.weeks.length * 2) % config.weeks.length;
  return config.weeks[idx] ?? empty;
}

/**
 * Parse schedules from many formats:
 *  "Monday: Math 9-10:30, English 11-12"   (line or comma separated)
 *  "Tue Science 9-10 Room 204"
 *  "Wed OFF"
 *  "9-5", "09:00-17:00", "7am-3pm"
 *  Day aliases M/T/W/R/F, bi-weekly via "Week A | Week B" separator
 */
export function parseAndSetSchedule(
  text: string,
  opts: { type?: ScheduleConfig['type']; startDate?: string; label?: string } = {},
): { success: boolean; message: string; config: ScheduleConfig } {
  const raw = text.trim();
  const weeks: ScheduleWeek[] = [];
  const weekChunks = raw.split(/\s*\|\s*|;\s*week\s+[ab]+\s*:/i).map((c) => c.trim()).filter(Boolean);

  const chunkEntries = (chunk: string): ScheduleEntry[] => {
    const entries: ScheduleEntry[] = [];
    // split into lines, then each line into comma-separated pieces
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const pieces = line.split(',').map((p) => p.trim()).filter(Boolean);
      let currentDay = '';
      for (const piece of pieces) {
        if (/^off$/i.test(piece)) continue; // "Wed OFF" handled below
        const dayMatch = piece.match(/^(mon(?:day)?|tue(?:sday)?|tues|wed(?:nesday)?|thu(?:rsday)?|thur|thurs|fri(?:day)?|sat(?:urday)?|sun(?:day)?|m|t|w|r|f)\b/i);
        let day = '';
        let rest = piece;
        if (dayMatch) {
          currentDay = dayName(dayMatch[1]);
          day = currentDay;
          rest = piece.slice(dayMatch[0].length).trim().replace(/^[:\-–]+\s*/, '');
        } else if (currentDay) {
          // comma-separated entries inherit the day ("Monday: Math 9-10, English 11-12")
          day = currentDay;
        }
        if (!day) continue;
        if (/^off$/i.test(rest)) continue; // "Wed OFF"
        // time range: "9-10:30", "09:00-17:00", "7am-3pm", "9:30-11", "9 - 10"
        const timeMatch = rest.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:-|–|—|to)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
        if (!timeMatch) continue;
        let start = parseTime(timeMatch[1]);
        let end = parseTime(timeMatch[2]);
        if (!start || !end) continue;
        // "9-5" means 9 AM – 5 PM: if the end time is <= start and neither side
        // spelled out AM/PM, assume the end is in the afternoon.
        const startHasMeridiem = /(?:am|pm)\b/i.test(timeMatch[1]);
        const endHasMeridiem = /(?:am|pm)\b/i.test(timeMatch[2]);
        if (!startHasMeridiem && !endHasMeridiem && end <= start) {
          const [eh] = end.split(':').map(Number);
          end = `${String((eh + 12) % 24).padStart(2, '0')}:${end.split(':')[1]}`;
        }
        // label is everything after the time range, minus room/note markers
        let label = rest.replace(timeMatch[0], '').trim();
        let room: string | undefined;
        let note: string | undefined;
        const roomMatch = label.match(/^(?:room|in|@)\s+([a-z0-9 .-]+)/i) ?? label.match(/\b(?:room|@)\s+([a-z0-9 .-]+)/i);
        if (roomMatch) {
          room = roomMatch[1].trim();
          label = label.replace(roomMatch[0], '').trim();
        }
        const noteMatch = label.match(/\((.*?)\)$/);
        if (noteMatch) {
          note = noteMatch[1].trim();
          label = label.replace(noteMatch[0], '').trim();
        }
        if (!label) label = 'Session';
        entries.push({ day, start, end, label, room, note });
      }
    }
    return entries;
  };

  if (weekChunks.length === 0) return { success: false, message: 'I could not parse that. Try: "Monday: Math 9-10:30, English 11-12".', config: emptyConfig() };
  weekChunks.forEach((chunk, i) => {
    weeks.push({
      name: opts.label ? `${opts.label} ${i + 1}` : `Week ${String.fromCharCode(65 + i)}`,
      entries: chunkEntries(chunk),
    });
  });

  if (!weeks.length || weeks.every((w) => w.entries.length === 0)) {
    return { success: false, message: 'No valid entries found. Example: "Mon Math 9-10 Room 204, Tue English 11-12, Wed OFF".', config: emptyConfig() };
  }

  config = {
    type: opts.type ?? 'custom',
    weeks: weeks.length ? weeks : [{ name: 'Week A', entries: [] }],
    startDate: opts.startDate ?? isoWeekStart(),
    notes: [],
  };
  persist();
  const total = config.weeks.reduce((a, w) => a + w.entries.length, 0);
  return {
    success: true,
    message: `Schedule set! ${config.weeks.length} week${config.weeks.length > 1 ? 's' : ''}, ${total} entries, starting ${config.startDate}.`,
    config,
  };
}

function emptyConfig(): ScheduleConfig {
  return { type: 'custom', weeks: [], startDate: isoWeekStart(), notes: [] };
}

export function addScheduleNote(note: string): boolean {
  if (!config) return false;
  config.notes.unshift(note);
  config.notes = config.notes.slice(0, 30);
  persist();
  return true;
}

export function formatSchedule(): string {
  if (!config || !config.weeks.length) return 'No schedule set. Try "set my schedule: Monday Math 9-10, Tuesday Science 11-12".';
  const weekType = getCurrentWeekType();
  const week = config.weeks[weekType] ?? config.weeks[0];
  const lines: string[] = [`📅 **Current week: ${week.name}** (${config.type})`];
  for (const day of DAYS) {
    const entries = week.entries.filter((e) => e.day === day);
    if (!entries.length) continue;
    const dayLabel = day[0].toUpperCase() + day.slice(1);
    lines.push(`\n**${dayLabel}:**`);
    for (const e of entries) {
      lines.push(`  ${fmt12(e.start)} – ${fmt12(e.end)} · ${e.label}${e.room ? ` (Room ${e.room})` : ''}${e.note ? ` — ${e.note}` : ''}`);
    }
  }
  if (config.weeks.length > 1) {
    lines.push(`\n_Bi-weekly rotation: next week is ${config.weeks[(weekType + 1) % config.weeks.length].name}_`);
  }
  if (config.notes.length) {
    lines.push(`\n📌 Notes: ${config.notes.map((n) => `"${n}"`).join(', ')}`);
  }
  return lines.join('\n');
}

export function hasSchedule(): boolean {
  return !!config && config.weeks.some((w) => w.entries.length > 0);
}

export function clearSchedule(): boolean {
  config = null;
  persist();
  return true;
}

export function getScheduleData(): ScheduleConfig | null {
  return config ? JSON.parse(JSON.stringify(config)) : null;
}

/** Human "do I have class today?" answer. */
export function formatTodaySummary(): string {
  const entries = getTodayEntries();
  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  if (!config) return `No schedule set — say "set schedule: Monday Math 9-10" to add one.`;
  if (!entries.length) return `You have nothing scheduled today (${today[0].toUpperCase() + today.slice(1)}). Free day! 🎉`;
  const lines = [`Today (${today[0].toUpperCase() + today.slice(1)}) you have ${entries.length} item${entries.length > 1 ? 's' : ''}:`];
  for (const e of entries) {
    lines.push(`• ${fmt12(e.start)} – ${fmt12(e.end)} — ${e.label}${e.room ? ` (Room ${e.room})` : ''}`);
  }
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const upcoming = entries.find((e) => {
    const [h, m] = e.start.split(':').map(Number);
    return h * 60 + m > nowMin;
  });
  if (upcoming) {
    const [h, m] = upcoming.start.split(':').map(Number);
    const mins = h * 60 + m - nowMin;
    lines.push(`\n⏰ Next up: **${upcoming.label}** in ${mins} minutes (${fmt12(upcoming.start)})`);
  }
  return lines.join('\n');
}
