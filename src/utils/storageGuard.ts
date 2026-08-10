// ─── Storage guard ────────────────────────────────────────────────────────
// Runs before anything else (imported first in main.tsx). If localStorage is
// unavailable — sandboxed iframes (htmlpreview), file:// in some browsers,
// privacy modes, storage-disabled contexts — install an in-memory fallback
// so the app never crashes on startup and keeps working for the session.

(() => {
  let ok = true;
  try {
    const probe = '__jarvis_storage_probe__';
    window.localStorage.setItem(probe, '1');
    const read = window.localStorage.getItem(probe);
    window.localStorage.removeItem(probe);
    ok = read === '1';
  } catch {
    ok = false;
  }

  if (ok) return;

  const mem = new Map<string, string>();
  const fallback: Storage = {
    get length() {
      return mem.size;
    },
    clear() {
      mem.clear();
    },
    getItem(key: string) {
      return mem.has(key) ? mem.get(key)! : null;
    },
    key(index: number) {
      return [...mem.keys()][index] ?? null;
    },
    removeItem(key: string) {
      mem.delete(key);
    },
    setItem(key: string, value: string) {
      mem.set(key, String(value));
    },
  };

  try {
    Object.defineProperty(window, 'localStorage', {
      value: fallback,
      configurable: true,
      writable: true,
    });
    // eslint-disable-next-line no-console
    console.info('⚠ localStorage unavailable — using in-memory fallback for this session.');
  } catch {
    // give up quietly; nothing else we can do
  }
})();

export {};
