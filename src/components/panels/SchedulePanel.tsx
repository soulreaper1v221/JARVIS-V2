// ─── Schedule panel ───────────────────────────────────────────────────────
// Handles the "no schedule" state internally — always renders.

import { useMemo, useState } from 'react';
import {
  getScheduleData,
  getTodayEntries,
  getWeekSchedule,
  parseAndSetSchedule,
  formatSchedule,
  hasSchedule,
  clearSchedule,
  addScheduleNote,
  getCurrentWeekType,
} from '../../engine/schedule';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const EXAMPLE = 'Monday: Math 9-10:30, English 11-12\nTuesday: Science 9-10 Room 204\nWednesday: OFF\nThursday: PE 2-3, Art 4-5:30\nFriday: History 9-10';

const fmt = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hh} ${period}` : `${hh}:${String(m).padStart(2, '0')} ${period}`;
};

export default function SchedulePanel({ onNotify }: { onNotify: (msg: string) => void }) {
  const [draft, setDraft] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [offset, setOffset] = useState(0);
  const [, force] = useState(0);

  const data = getScheduleData();
  const week = useMemo(() => getWeekSchedule(offset), [offset, force]); // eslint-disable-line react-hooks/exhaustive-deps
  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const todayEntries = getTodayEntries();
  const hasData = hasSchedule();

  const rerender = () => force((x) => x + 1);

  const handleSet = () => {
    if (!draft.trim()) return;
    const result = parseAndSetSchedule(draft);
    onNotify(result.message);
    rerender();
    if (result.success) setDraft('');
  };

  const handleClear = () => {
    clearSchedule();
    onNotify('Schedule cleared.');
    rerender();
  };

  const handleNote = () => {
    if (!noteDraft.trim()) return;
    const ok = addScheduleNote(noteDraft.trim());
    onNotify(ok ? 'Note added to schedule.' : 'Set a schedule first.');
    setNoteDraft('');
    rerender();
  };

  return (
    <div className="p-4 overflow-y-auto" style={{ flex: 1, minHeight: 0 }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📅</span>
          <div>
            <h2 className="text-lg font-bold text-cyan-100 leading-tight">Weekly Schedule</h2>
            <p className="text-xs text-slate-500">
              {hasData
                ? `${data?.type.toUpperCase()} · ${data?.weeks.length ?? 1} week${(data?.weeks.length ?? 1) > 1 ? 's' : ''} · started ${data?.startDate}`
                : 'No schedule configured yet'}
            </p>
          </div>
          <div className="flex-1" />
          {hasData && (
            <>
              <span className="jv-chip">Week {getCurrentWeekType() === 0 ? 'A' : 'B'}</span>
              <button onClick={handleClear} className="jv-btn !text-xs !px-3 !py-1.5 !text-red-400/90" style={{ borderColor: 'rgba(255,77,109,0.35)' }}>
                🗑 Clear
              </button>
            </>
          )}
        </div>

        {!hasData ? (
          /* ── empty state ── */
          <div className="jv-panel p-6 scan-overlay">
            <p className="text-sm text-slate-400 mb-3 leading-relaxed">
              Paste your timetable below — I understand formats like <em>"Monday: Math 9-10:30, English 11-12"</em>,
              <em> "Tue Science 9-10 Room 204"</em>, <em>"Wed OFF"</em> — and bi-weekly schedules separated by <code className="text-cyan-300">|</code>.
            </p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={6}
              placeholder={EXAMPLE}
              className="jv-input font-mono !text-xs mb-3"
            />
            <div className="flex gap-2">
              <button onClick={handleSet} className="jv-btn jv-btn-primary !text-xs">✓ Save schedule</button>
              <button
                onClick={() => setDraft(EXAMPLE)}
                className="jv-btn !text-xs"
              >
                ✨ Load example
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* today summary */}
            <div className="jv-panel px-4 py-3 mb-4" style={{ borderColor: 'rgba(0,229,255,0.3)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="jv-chip" style={{ borderColor: 'rgba(0,229,255,0.5)' }}>TODAY · {today.toUpperCase()}</span>
                {todayEntries.length === 0 && <span className="text-xs text-slate-500">nothing scheduled — free day 🎉</span>}
              </div>
              {todayEntries.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {todayEntries.map((e, i) => (
                    <span key={i} className="text-xs text-cyan-200 bg-cyan-400/8 border border-cyan-400/25 rounded-md px-2.5 py-1.5">
                      {fmt(e.start)}–{fmt(e.end)} · <strong>{e.label}</strong>{e.room ? ` · Room ${e.room}` : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* week view */}
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setOffset(offset - 1)} className="jv-btn !px-2.5 !py-1 !text-xs">◀</button>
              <span className="text-sm font-bold text-cyan-100 flex-1 text-center">
                {offset === 0 ? 'This week' : offset === 1 ? 'Next week' : offset === -1 ? 'Last week' : `Week ${offset + 1}`} — <span className="text-cyan-400">{week.name}</span>
              </span>
              <button onClick={() => setOffset(offset + 1)} className="jv-btn !px-2.5 !py-1 !text-xs">▶</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
              {DAYS.map((day) => {
                const entries = week.entries.filter((e) => e.day === day);
                const isToday = day === today;
                return (
                  <div
                    key={day}
                    className="jv-panel p-3"
                    style={isToday ? { borderColor: 'rgba(0,229,255,0.5)', boxShadow: '0 0 16px rgba(0,229,255,0.1)' } : {}}
                  >
                    <div className="text-[11px] font-bold tracking-widest mb-2" style={{ color: isToday ? '#7df3ff' : '#5d7489' }}>
                      {day.toUpperCase()} {isToday && <span className="text-cyan-400">●</span>}
                    </div>
                    {entries.length === 0 ? (
                      <div className="text-xs text-slate-600 italic">— free —</div>
                    ) : (
                      <div className="space-y-1.5">
                        {entries.map((e, i) => (
                          <div key={i} className="text-xs leading-snug">
                            <span className="font-mono text-cyan-300">{fmt(e.start)}–{fmt(e.end)}</span>
                            <div className="text-slate-300 font-medium">{e.label}</div>
                            {e.room && <div className="text-slate-500 text-[10px]">Room {e.room}</div>}
                            {e.note && <div className="text-slate-500 text-[10px] italic">{e.note}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* notes + re-parse */}
            <div className="jv-panel p-4 mb-4">
              <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-2">📌 NOTES</div>
              <div className="flex gap-2 mb-3">
                <input
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNote()}
                  placeholder="Add a note (exam week, meeting…)"
                  className="jv-input !text-xs flex-1"
                />
                <button onClick={handleNote} className="jv-btn !text-xs">Add</button>
              </div>
              {data?.notes.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {data.notes.map((n, i) => (
                    <span key={i} className="text-[11px] text-amber-200/90 bg-amber-400/8 border border-amber-400/25 rounded px-2 py-0.5">
                      📌 {n}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-600">No notes.</div>
              )}
              <details className="mt-3">
                <summary className="text-xs text-cyan-400/70 cursor-pointer hover:text-cyan-300">Re-parse / replace schedule</summary>
                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={5} placeholder={EXAMPLE} className="jv-input font-mono !text-xs mt-2 mb-2" />
                <button onClick={handleSet} className="jv-btn jv-btn-primary !text-xs">Replace schedule</button>
              </details>
            </div>
          </>
        )}

        <div className="text-[11px] font-mono text-slate-600 leading-relaxed jv-panel p-3">
          <div className="text-cyan-500/70 mb-1">▌ FORMAT GUIDE</div>
          <div>• Lines or commas: <span className="text-slate-400">Monday: Math 9-10:30, English 11-12</span></div>
          <div>• Rooms & notes: <span className="text-slate-400">Tue Science 9-10 Room 204 (bring lab coat)</span></div>
          <div>• Day off: <span className="text-slate-400">Wed OFF</span> · Times: <span className="text-slate-400">9-5 · 09:00-17:00 · 7am-3pm</span></div>
          <div>• Bi-weekly: <span className="text-slate-400">Week A entries | Week B entries</span></div>
          <div>• Ask me in chat: <span className="text-slate-400">"do I have class today?"</span></div>
        </div>
      </div>
    </div>
  );
}
