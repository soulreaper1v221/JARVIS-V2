// ─── App launcher: 70+ apps across 9 categories ───────────────────────────

export interface AppEntry {
  name: string;
  category: AppCategory;
  protocol?: string;
  web: string;
  display: string;
  icon: string;
}

export type AppCategory =
  | 'Gaming'
  | 'Browsers'
  | 'Communication'
  | 'Productivity'
  | 'Entertainment'
  | 'Social'
  | 'Dev'
  | 'AI'
  | 'System';

export const APP_CATEGORIES: AppCategory[] = ['Gaming', 'Browsers', 'Communication', 'Productivity', 'Entertainment', 'Social', 'Dev', 'AI', 'System'];

export const APP_REGISTRY: AppEntry[] = [
  // ── Gaming ──
  { name: 'Steam', category: 'Gaming', protocol: 'steam', web: 'https://store.steampowered.com', display: 'PC game store & library', icon: '🎮' },
  { name: 'Epic Games', category: 'Gaming', protocol: 'com.epicgames.launcher', web: 'https://store.epicgames.com', display: 'Epic game store & free games', icon: '🟣' },
  { name: 'Roblox', category: 'Gaming', protocol: 'roblox', web: 'https://www.roblox.com', display: 'Online game platform', icon: '🟥' },
  { name: 'Minecraft', category: 'Gaming', protocol: 'minecraft', web: 'https://www.minecraft.net', display: 'Block-building sandbox', icon: '⛏️' },
  { name: 'Fortnite', category: 'Gaming', protocol: 'fortnite', web: 'https://www.fortnite.com', display: 'Battle royale & creative', icon: '🏆' },
  { name: 'Valorant', category: 'Gaming', protocol: 'valorant', web: 'https://playvalorant.com', display: 'Tactical FPS by Riot', icon: '🔫' },
  { name: 'Call of Duty', category: 'Gaming', protocol: 'callofduty', web: 'https://www.callofduty.com', display: 'COD HQ & Warzone', icon: '🎯' },
  { name: 'Grand Theft Auto V', category: 'Gaming', protocol: 'gtav', web: 'https://www.rockstargames.com/GTAV', display: 'Open-world crime epic', icon: '🚗' },
  { name: 'Counter-Strike', category: 'Gaming', protocol: 'csgo', web: 'https://www.counter-strike.net', display: 'CS2 competitive FPS', icon: '💥' },
  { name: 'League of Legends', category: 'Gaming', protocol: 'lol', web: 'https://www.leagueoflegends.com', display: 'MOBA by Riot', icon: '⚔️' },
  { name: 'Apex Legends', category: 'Gaming', protocol: 'apex', web: 'https://www.ea.com/games/apex-legends', display: 'Hero battle royale', icon: '🪂' },
  { name: 'Overwatch', category: 'Gaming', protocol: 'overwatch', web: 'https://overwatch.blizzard.com', display: 'Hero shooter by Blizzard', icon: '🦾' },
  { name: 'Rocket League', category: 'Gaming', protocol: 'rocketleague', web: 'https://www.rocketleague.com', display: 'Car soccer', icon: '🚀' },
  { name: 'FIFA', category: 'Gaming', protocol: 'fifa', web: 'https://www.ea.com/games/ea-sports-fc', display: 'Football simulation', icon: '⚽' },
  { name: 'Minecraft Launcher', category: 'Gaming', protocol: 'minecraft-launcher', web: 'https://www.minecraft.net', display: 'Official launcher', icon: '🧱' },
  { name: 'Twitch', category: 'Gaming', protocol: 'twitch', web: 'https://www.twitch.tv', display: 'Live game streaming', icon: '📺' },
  // ── Browsers ──
  { name: 'Chrome', category: 'Browsers', protocol: 'chrome', web: 'https://www.google.com/chrome', display: 'Google\'s browser', icon: '🌐' },
  { name: 'Firefox', category: 'Browsers', protocol: 'firefox', web: 'https://www.mozilla.org/firefox', display: 'Privacy-first browser', icon: '🦊' },
  { name: 'Edge', category: 'Browsers', protocol: 'microsoft-edge', web: 'https://www.microsoft.com/edge', display: 'Microsoft browser', icon: '🧭' },
  { name: 'Brave', category: 'Browsers', protocol: 'brave', web: 'https://brave.com', display: 'Ad-blocking browser', icon: '🦁' },
  { name: 'Safari', category: 'Browsers', protocol: 'safari', web: 'https://www.apple.com/safari', display: 'Apple browser', icon: '🧿' },
  { name: 'Opera', category: 'Browsers', protocol: 'opera', web: 'https://www.opera.com', display: 'Built-in VPN browser', icon: '🔴' },
  // ── Communication ──
  { name: 'Discord', category: 'Communication', protocol: 'discord', web: 'https://discord.com/app', display: 'Voice & text chat for communities', icon: '💬' },
  { name: 'WhatsApp', category: 'Communication', protocol: 'whatsapp', web: 'https://web.whatsapp.com', display: 'Messaging & calls', icon: '🟢' },
  { name: 'Telegram', category: 'Communication', protocol: 'tg', web: 'https://web.telegram.org', display: 'Secure messenger', icon: '✈️' },
  { name: 'Slack', category: 'Communication', protocol: 'slack', web: 'https://app.slack.com', display: 'Team chat & channels', icon: '🟣' },
  { name: 'Zoom', category: 'Communication', protocol: 'zoommtg', web: 'https://zoom.us', display: 'Video conferencing', icon: '🎥' },
  { name: 'Google Meet', category: 'Communication', protocol: 'meet', web: 'https://meet.google.com', display: 'Video meetings', icon: '🤝' },
  { name: 'Microsoft Teams', category: 'Communication', protocol: 'msteams', web: 'https://teams.microsoft.com', display: 'Office collaboration', icon: '👥' },
  { name: 'Outlook', category: 'Communication', protocol: 'outlook', web: 'https://outlook.live.com', display: 'Email & calendar', icon: '📧' },
  { name: 'Gmail', category: 'Communication', protocol: 'googlegmail', web: 'https://mail.google.com', display: 'Google email', icon: '📨' },
  { name: 'Skype', category: 'Communication', protocol: 'skype', web: 'https://web.skype.com', display: 'Calls & messages', icon: '🔷' },
  // ── Productivity ──
  { name: 'Notion', category: 'Productivity', protocol: 'notion', web: 'https://www.notion.so', display: 'All-in-one workspace', icon: '📝' },
  { name: 'Google Docs', category: 'Productivity', protocol: 'gdoc', web: 'https://docs.google.com/document', display: 'Word processing', icon: '📄' },
  { name: 'Google Sheets', category: 'Productivity', protocol: 'gsheet', web: 'https://docs.google.com/spreadsheets', display: 'Spreadsheets', icon: '📊' },
  { name: 'Google Drive', category: 'Productivity', protocol: 'googledrive', web: 'https://drive.google.com', display: 'Cloud storage', icon: '📁' },
  { name: 'OneDrive', category: 'Productivity', protocol: 'onedrive', web: 'https://onedrive.live.com', display: 'Microsoft cloud storage', icon: '☁️' },
  { name: 'Dropbox', category: 'Productivity', protocol: 'dropbox', web: 'https://www.dropbox.com', display: 'File sync & share', icon: '📦' },
  { name: 'Microsoft Word', category: 'Productivity', protocol: 'ms-word', web: 'https://office.live.com/start/Word.aspx', display: 'Documents', icon: '📘' },
  { name: 'Microsoft Excel', category: 'Productivity', protocol: 'ms-excel', web: 'https://office.live.com/start/Excel.aspx', display: 'Spreadsheets', icon: '📗' },
  { name: 'PowerPoint', category: 'Productivity', protocol: 'ms-powerpoint', web: 'https://office.live.com/start/PowerPoint.aspx', display: 'Presentations', icon: '📙' },
  { name: 'Trello', category: 'Productivity', protocol: 'trello', web: 'https://trello.com', display: 'Kanban boards', icon: '🎴' },
  { name: 'Todoist', category: 'Productivity', protocol: 'todoist', web: 'https://todoist.com', display: 'Task manager', icon: '✅' },
  { name: 'Google Calendar', category: 'Productivity', protocol: 'googlecalendar', web: 'https://calendar.google.com', display: 'Schedule & events', icon: '📅' },
  { name: 'Canva', category: 'Productivity', protocol: 'canva', web: 'https://www.canva.com', display: 'Graphic design', icon: '🎨' },
  { name: 'Figma', category: 'Productivity', protocol: 'figma', web: 'https://www.figma.com', display: 'UI/UX design', icon: '🖌️' },
  { name: 'Adobe Photoshop', category: 'Productivity', protocol: 'photoshop', web: 'https://www.adobe.com/products/photoshop.html', display: 'Photo editing', icon: '🖼️' },
  // ── Entertainment ──
  { name: 'YouTube', category: 'Entertainment', protocol: 'youtube', web: 'https://www.youtube.com', display: 'Video platform', icon: '▶️' },
  { name: 'Spotify', category: 'Entertainment', protocol: 'spotify', web: 'https://open.spotify.com', display: 'Music streaming', icon: '🎵' },
  { name: 'Netflix', category: 'Entertainment', protocol: 'netflix', web: 'https://www.netflix.com', display: 'Movies & series', icon: '🎬' },
  { name: 'Amazon Prime Video', category: 'Entertainment', protocol: 'primevideo', web: 'https://www.primevideo.com', display: 'Streaming', icon: '📺' },
  { name: 'Disney+', category: 'Entertainment', protocol: 'disneyplus', web: 'https://www.disneyplus.com', display: 'Disney streaming', icon: '✨' },
  { name: 'Hulu', category: 'Entertainment', protocol: 'hulu', web: 'https://www.hulu.com', display: 'Streaming', icon: '🍿' },
  { name: 'VLC', category: 'Entertainment', protocol: 'vlc', web: 'https://www.videolan.org/vlc', display: 'Media player', icon: '🧡' },
  { name: 'Apple Music', category: 'Entertainment', protocol: 'music', web: 'https://music.apple.com', display: 'Music streaming', icon: '🍎' },
  { name: 'SoundCloud', category: 'Entertainment', protocol: 'soundcloud', web: 'https://soundcloud.com', display: 'Audio platform', icon: '🎧' },
  // ── Social ──
  { name: 'Twitter', category: 'Social', protocol: 'twitter', web: 'https://x.com', display: 'X — microblogging', icon: '🐦' },
  { name: 'Instagram', category: 'Social', protocol: 'instagram', web: 'https://www.instagram.com', display: 'Photo sharing', icon: '📸' },
  { name: 'Facebook', category: 'Social', protocol: 'facebook', web: 'https://www.facebook.com', display: 'Social network', icon: '📘' },
  { name: 'TikTok', category: 'Social', protocol: 'tiktok', web: 'https://www.tiktok.com', display: 'Short video', icon: '🎼' },
  { name: 'Snapchat', category: 'Social', protocol: 'snapchat', web: 'https://web.snapchat.com', display: 'Ephemeral messaging', icon: '👻' },
  { name: 'Reddit', category: 'Social', protocol: 'reddit', web: 'https://www.reddit.com', display: 'Community forums', icon: '👽' },
  { name: 'LinkedIn', category: 'Social', protocol: 'linkedin', web: 'https://www.linkedin.com', display: 'Professional network', icon: '💼' },
  { name: 'Pinterest', category: 'Social', protocol: 'pinterest', web: 'https://www.pinterest.com', display: 'Idea boards', icon: '📌' },
  { name: 'Discord', category: 'Social', protocol: 'discord', web: 'https://discord.com/app', display: 'Community chat', icon: '💬' },
  // ── Dev ──
  { name: 'GitHub', category: 'Dev', protocol: 'github', web: 'https://github.com', display: 'Code hosting', icon: '🐙' },
  { name: 'Stack Overflow', category: 'Dev', protocol: 'stackoverflow', web: 'https://stackoverflow.com', display: 'Developer Q&A', icon: '🧩' },
  { name: 'Visual Studio Code', category: 'Dev', protocol: 'vscode', web: 'https://vscode.dev', display: 'Code editor', icon: '🟦' },
  { name: 'CodePen', category: 'Dev', protocol: 'codepen', web: 'https://codepen.io', display: 'Frontend playground', icon: '🖥️' },
  { name: 'Replit', category: 'Dev', protocol: 'replit', web: 'https://replit.com', display: 'Online IDE', icon: '🔄' },
  { name: 'Docker Hub', category: 'Dev', protocol: 'docker', web: 'https://hub.docker.com', display: 'Containers', icon: '🐳' },
  { name: 'npm', category: 'Dev', protocol: 'npm', web: 'https://www.npmjs.com', display: 'Node package registry', icon: '📦' },
  { name: 'MDN', category: 'Dev', protocol: 'mdn', web: 'https://developer.mozilla.org', display: 'Web docs', icon: '📚' },
  { name: 'Figma', category: 'Dev', protocol: 'figma', web: 'https://www.figma.com', display: 'Design & prototypes', icon: '🖌️' },
  { name: 'Postman', category: 'Dev', protocol: 'postman', web: 'https://www.postman.com', display: 'API testing', icon: '🧪' },
  // ── AI ──
  { name: 'ChatGPT', category: 'AI', protocol: 'chatgpt', web: 'https://chat.openai.com', display: 'OpenAI assistant', icon: '🤖' },
  { name: 'Claude', category: 'AI', protocol: 'claude', web: 'https://claude.ai', display: 'Anthropic assistant', icon: '🧠' },
  { name: 'Gemini', category: 'AI', protocol: 'gemini', web: 'https://gemini.google.com', display: 'Google AI assistant', icon: '✨' },
  { name: 'Perplexity', category: 'AI', protocol: 'perplexity', web: 'https://www.perplexity.ai', display: 'AI search engine', icon: '🔍' },
  { name: 'Midjourney', category: 'AI', protocol: 'midjourney', web: 'https://www.midjourney.com', display: 'AI image generation', icon: '🎭' },
  { name: 'Hugging Face', category: 'AI', protocol: 'huggingface', web: 'https://huggingface.co', display: 'AI model hub', icon: '🤗' },
  { name: 'GitHub Copilot', category: 'AI', protocol: 'copilot', web: 'https://github.com/features/copilot', display: 'AI pair programmer', icon: '🛸' },
  { name: 'JARVIS Hub', category: 'AI', protocol: 'jarvis', web: 'about:blank', display: 'Me! (you\'re already here)', icon: '💎' },
  // ── System ──
  { name: 'File Explorer', category: 'System', protocol: 'explorer', web: 'about:blank', display: 'Browse files (built-in panel)', icon: '🗂️' },
  { name: 'Terminal', category: 'System', protocol: 'terminal', web: 'about:blank', display: 'Command line (built-in panel)', icon: '💻' },
  { name: 'Calculator', category: 'System', protocol: 'calculator', web: 'about:blank', display: 'Built-in calculator', icon: '🧮' },
  { name: 'Notepad', category: 'System', protocol: 'notepad', web: 'about:blank', display: 'Built-in text editor', icon: '📃' },
  { name: 'Settings', category: 'System', protocol: 'settings', web: 'about:blank', display: 'JARVIS settings (Profile tab)', icon: '⚙️' },
  { name: 'Task Manager', category: 'System', protocol: 'taskmanager', web: 'about:blank', display: 'System monitor (Monitor tab)', icon: '📟' },
  { name: 'Control Panel', category: 'System', protocol: 'control', web: 'about:blank', display: 'JARVIS modules (Self-Mod tab)', icon: '🎛️' },
  { name: 'Paint', category: 'System', protocol: 'mspaint', web: 'about:blank', display: 'Draw something — I can render canvas art', icon: '🖍️' },
  { name: 'Screenshot', category: 'System', protocol: 'screenshot', web: 'about:blank', display: 'Monitor panel view', icon: '📸' },
];

// ─── Electron native bridge ───────────────────────────────────────────────

declare global {
  interface Window {
    jarvisNative?: {
      launch: (url: string) => boolean;
      openApp: (name: string) => boolean;
      platform: string;
    };
  }
}

export interface LaunchResult {
  app: AppEntry;
  url: string;
  method: 'native' | 'protocol' | 'web';
  success: boolean;
}

/** Find an app by exact, partial, or fuzzy name match. */
export function findApp(query: string): AppEntry | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const exact = APP_REGISTRY.find((a) => a.name.toLowerCase() === q);
  if (exact) return exact;
  const partial = APP_REGISTRY.find(
    (a) => a.name.toLowerCase().includes(q) || q.includes(a.name.toLowerCase()),
  );
  if (partial) return partial;
  // word-level match ("call of duty" → "Call of Duty")
  const qWords = q.split(/\s+/).filter((w) => w.length > 2);
  const scored = APP_REGISTRY
    .map((a) => {
      const nameWords = a.name.toLowerCase().split(/\s+/);
      const hits = qWords.filter((w) => nameWords.some((nw) => nw.startsWith(w) || w.startsWith(nw))).length;
      return { a, score: hits / Math.max(qWords.length, 1) };
    })
    .sort((x, y) => y.score - x.score);
  if (scored.length && scored[0].score >= 0.6) return scored[0].a;
  return null;
}

export function launchApp(name: string): LaunchResult {
  const app = findApp(name);
  if (!app) {
    return { app: { name, category: 'System', web: '', display: '', icon: '❓' }, url: '', method: 'web', success: false };
  }
  // 1) Electron native bridge
  if (window.jarvisNative?.launch) {
    try {
      const ok = window.jarvisNative.launch(app.web || `${app.protocol}://`);
      if (ok) return { app, url: app.web, method: 'native', success: true };
    } catch { /* fall through */ }
  }
  // 2) protocol URI
  if (app.protocol) {
    try {
      window.open(`${app.protocol}://`, '_self');
      return { app, url: `${app.protocol}://`, method: 'protocol', success: true };
    } catch { /* fall through */ }
  }
  // 3) web fallback
  if (app.web && app.web !== 'about:blank') {
    window.open(app.web, '_blank', 'noopener,noreferrer');
    return { app, url: app.web, method: 'web', success: true };
  }
  return { app, url: app.web, method: 'web', success: false };
}

export function listApps(category?: AppCategory): AppEntry[] {
  if (!category) return [...APP_REGISTRY];
  return APP_REGISTRY.filter((a) => a.category === category);
}

/** Natural language app-name extraction ("can you open youtube for me"). */
export function extractAppName(text: string): string | null {
  const t = text.trim();
  const patterns = [
    /^(?:open|launch|start|run|play)\s+(?:the\s+|me\s+)?(.+?)(?:\s+for\s+me)?[?.!]?$/i,
    /^(?:can you|please|could you|would you)\s+(?:open|launch|start|run|play)\s+(?:the\s+|me\s+)?(.+?)[?.!]?$/i,
    /^(?:go to|take me to|open up)\s+(?:the\s+)?(.+?)[?.!]?$/i,
    /^(?:play|put on|start)\s+(?:some\s+|the\s+)?(.+?)(?:\s+for\s+me)?[?.!]?$/i,
  ];
  for (const p of patterns) {
    const m = t.match(p);
    if (m) {
      const candidate = m[1].trim().replace(/^(the|a|an)\s+/i, '');
      if (candidate.length > 1 && candidate.length < 40) return candidate;
    }
  }
  return null;
}

export function getAppCount(): number {
  return APP_REGISTRY.length;
}
