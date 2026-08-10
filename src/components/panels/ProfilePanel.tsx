// ─── Profile / auth panel ─────────────────────────────────────────────────

import { useMemo, useState } from 'react';
import {
  getCurrentUser,
  signUp,
  signIn,
  signOut,
  updateProfile,
  listUsers,
  deleteUser,
  getChatHistory,
  clearChatHistory,
  removeNote,
} from '../../engine/auth';
import { resetBrain } from '../../engine/brain';

export default function ProfilePanel({ onNotify, onUserChange }: { onNotify: (msg: string) => void; onUserChange: () => void }) {
  const [view, setView] = useState<'overview' | 'signin'>('overview');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [newName, setNewName] = useState('');
  const [mood, setMood] = useState('');
  const [, force] = useState(0);
  const user = getCurrentUser();
  const users = listUsers();
  const history = getChatHistory();

  const rerender = () => force((x) => x + 1);
  const stats = useMemo(() => user, [force]); // eslint-disable-line react-hooks/exhaustive-deps

  const doSignUp = () => {
    const r = signUp(name, pin);
    onNotify(r.message);
    if (r.success) { setView('overview'); onUserChange(); }
    rerender();
  };

  const doSignIn = () => {
    const r = signIn(name, pin);
    onNotify(r.message);
    if (r.success) { setView('overview'); onUserChange(); }
    rerender();
  };

  const doSignOut = () => {
    signOut();
    resetBrain();
    onNotify('Signed out — switching to guest.');
    onUserChange();
    rerender();
  };

  const isGuest = user?.id === 'guest';

  return (
    <div className="p-4 overflow-y-auto" style={{ flex: 1, minHeight: 0 }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">👤</span>
          <div>
            <h2 className="text-lg font-bold text-cyan-100 leading-tight">Profile &amp; Preferences</h2>
            <p className="text-xs text-slate-500">local profiles · PIN protected · never leaves this machine</p>
          </div>
          <div className="flex-1" />
          {!isGuest && (
            <button onClick={doSignOut} className="jv-btn !text-xs !text-red-400/90" style={{ borderColor: 'rgba(255,77,109,0.35)' }}>⇥ Sign out</button>
          )}
          <button onClick={() => setView(view === 'overview' ? 'signin' : 'overview')} className="jv-btn !text-xs">
            {view === 'overview' ? (isGuest ? '＋ Sign up / in' : '⇄ Switch user') : '← Back'}
          </button>
        </div>

        {view === 'signin' ? (
          <div className="jv-panel p-6 max-w-md scan-overlay">
            <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-3">AUTHENTICATION</div>
            <div className="space-y-2 mb-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="jv-input !text-sm" />
              <input value={pin} onChange={(e) => setPin(e.target.value)} type="password" placeholder="PIN (3+ chars)" className="jv-input !text-sm" />
            </div>
            <div className="flex gap-2">
              <button onClick={doSignUp} className="jv-btn jv-btn-primary !text-xs flex-1">Create profile</button>
              <button onClick={doSignIn} className="jv-btn !text-xs flex-1">Sign in</button>
            </div>
            <div className="text-[10px] text-slate-600 mt-3">
              Guest works without a profile. Signing up lets me remember your name, interests, notes and stats across sessions.
            </div>
          </div>
        ) : user ? (
          <>
            {/* overview */}
            <div className="jv-panel p-5 mb-4">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black"
                  style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.25), rgba(61,123,255,0.25))', border: '1px solid rgba(0,229,255,0.5)' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-lg font-bold text-cyan-100">{user.name}{isGuest && <span className="text-xs text-slate-500 ml-2">guest</span>}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    joined {new Date(user.createdAt).toLocaleDateString()} · logins: {user.loginCount} · last: {new Date(user.lastLogin).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center mb-4">
                {[
                  ['💬', user.stats.messages, 'sent'],
                  ['🤖', user.stats.jarvisMessages, 'received'],
                  ['😂', user.stats.jokes, 'jokes'],
                  ['🔍', user.stats.searches, 'searches'],
                ].map(([icon, val, label]) => (
                  <div key={label as string} className="bg-black/25 rounded p-2">
                    <div className="text-lg">{icon}</div>
                    <div className="font-mono font-black text-cyan-300">{val as number}</div>
                    <div className="text-[9px] text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-cyan-400/70 mb-1.5">DISPLAY NAME</div>
                  <div className="flex gap-2">
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={user.name} className="jv-input !text-xs flex-1" />
                    <button
                      onClick={() => {
                        if (newName.trim()) {
                          updateProfile({ name: newName.trim() });
                          onNotify(`Name updated to ${newName.trim()}.`);
                          onUserChange();
                          rerender();
                        }
                      }}
                      className="jv-btn !text-xs"
                    >
                      Save
                    </button>
                  </div>
                  <div className="text-[10px] font-bold tracking-widest text-cyan-400/70 mt-3 mb-1.5">MOOD</div>
                  <div className="flex gap-2">
                    <input value={mood} onChange={(e) => setMood(e.target.value)} placeholder={user.mood ?? 'set a mood…'} className="jv-input !text-xs flex-1" />
                    <button onClick={() => { if (mood.trim()) { updateProfile({ mood: mood.trim() }); onNotify('Mood updated.'); rerender(); } }} className="jv-btn !text-xs">Save</button>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-cyan-400/70 mb-1.5">INTERESTS ({user.interests.length})</div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {user.interests.length ? user.interests.map((i) => <span key={i} className="text-[10px] text-cyan-300/80 bg-cyan-400/8 border border-cyan-400/20 rounded px-1.5 py-0.5">{i}</span>) : <span className="text-xs text-slate-600">None yet — discuss a topic 3× and it becomes an interest.</span>}
                  </div>
                  <div className="text-[10px] font-bold tracking-widest text-cyan-400/70 mb-1.5">TOP TOPICS</div>
                  <div className="flex flex-wrap gap-1.5">
                    {user.topTopics.slice(0, 8).map((t) => <span key={t.topic} className="text-[10px] text-slate-400 bg-black/25 rounded px-1.5 py-0.5">{t.topic} ×{t.count}</span>)}
                  </div>
                </div>
              </div>
            </div>

            {/* notes */}
            <div className="jv-panel p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold tracking-widest text-cyan-400/80">📌 NOTES ({user.notes.length})</span>
                <span className="text-[10px] text-slate-600">say "remember …" in chat</span>
              </div>
              {user.notes.length === 0 ? (
                <div className="text-xs text-slate-600">No notes saved.</div>
              ) : (
                <div className="space-y-1.5">
                  {user.notes.map((n, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs p-2 rounded bg-black/20 border border-cyan-400/8">
                      <span className="flex-1 text-slate-300">{n}</span>
                      <button onClick={() => { removeNote(i); rerender(); }} className="text-slate-600 hover:text-red-400">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* chat history */}
            <div className="jv-panel p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold tracking-widest text-cyan-400/80">💾 CHAT HISTORY ({history.length}/100)</span>
                <div className="flex-1" />
                <button onClick={() => { clearChatHistory(); rerender(); }} className="text-[10px] text-slate-500 hover:text-red-400">clear</button>
              </div>
              {history.length === 0 ? (
                <div className="text-xs text-slate-600">No history yet.</div>
              ) : (
                <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
                  {history.slice(-30).reverse().map((m, i) => (
                    <div key={i} className="text-[11px]">
                      <span className={`font-bold ${m.role === 'user' ? 'text-cyan-300' : 'text-violet-300'}`}>{m.role === 'user' ? 'YOU' : 'JARVIS'}</span>
                      <span className="text-slate-600 text-[9px] ml-2">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-slate-400 ml-2">{m.content.length > 100 ? m.content.slice(0, 100) + '…' : m.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* users */}
            <div className="jv-panel p-4">
              <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-2">USERS ({users.length})</div>
              <div className="space-y-1.5">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center gap-2 text-xs p-2 rounded bg-black/20 border border-cyan-400/8">
                    <span className="font-bold text-cyan-200">{u.name}{u.id === user.id && <span className="text-cyan-400 ml-1.5">● you</span>}</span>
                    <span className="text-slate-600 text-[10px]">{u.messageCount} msgs</span>
                    <div className="flex-1" />
                    {u.id !== 'guest' && (
                      <button
                        onClick={() => {
                          const r = signIn(u.name, '');
                          if (!r.success) onNotify(r.message);
                          else { onUserChange(); rerender(); }
                        }}
                        className="text-[10px] text-cyan-400/70 hover:text-cyan-300"
                      >
                        switch
                      </button>
                    )}
                    {u.id !== 'guest' && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${u.name}?`)) {
                            deleteUser(u.id);
                            onNotify(`Deleted ${u.name}.`);
                            onUserChange();
                            rerender();
                          }
                        }}
                        className="text-[10px] text-slate-600 hover:text-red-400"
                      >
                        delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="jv-panel p-8 text-center text-sm text-slate-500">No profile loaded.</div>
        )}
      </div>
    </div>
  );
}
