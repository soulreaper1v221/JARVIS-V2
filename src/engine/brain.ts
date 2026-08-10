// ─── JARVIS brain: the core responder (~750 lines) ────────────────────────
// processInput() runs the full pipeline: normalize → detect topics → track →
// respond → save. Returns a reply string plus optional actions (code to run,
// app to launch, file to open, tab to switch).

import { normalize, looksLikeQuestion, extractSearchQuery } from './fuzzy';
import { detect } from './detect';
import { addTurn, context, getUserProfile, setAskedQuestion, isAwaitingResponse, isAnsweringQuestion, getLastJarvisResponse, detectConversationStyle, getTopicsCovered, getWhatISaidAbout, getJokeCount, hasDiscussedTopic, resetConversation } from './conversation';
import { saveTurn, searchMemory, getMemoryStats } from './memory';
import { getTopicKnowledge, getHowTo, getRandomFact, getTopicNames, KNOWLEDGE } from './knowledge';
import { getScienceTopic, getConceptExplanation, getFormula, formatScienceResponse, crossReference, deepResearch, getAllTopicNames } from './science';
import { multiSearch, formatSearchResults, detectSearchType } from './search';
import { getWeatherSimulated, getTimeNow, calculate, generateRandomNumber, getJoke, getJokeCount as getJokeTotal, AVAILABLE_TOOLS } from './tools';
import { getMonitorData, getDetailedStatus, getFormattedUptime, isOnline, getBattery, getHardwareInfo, getMemory } from './monitors';
import { launchApp, findApp, extractAppName, listApps, APP_CATEGORIES } from './launcher';
import { listModules, listBackups, restoreBackup, listCustomTools, addCustomTool, removeCustomTool, runCustomTool, validateCode, getSystemState, createBackup, editModule, appendToModule, readModule } from './selfmod';
import { runCode, smartGenerate, isCodeRequest, htmlPage, setGitHubToken, getGitHubToken, createGitHubRepo, pushFileToGitHub, listGitHubRepos } from './coderunner';
import { createFile, readFile, writeFile, deleteFile, moveFile, copyFile, renameFile, listFiles, searchFiles, downloadFile, downloadFolder, createFolder, deleteFolder, createProject, buildExeInstructions } from './files';
import { createProject as createProjectEntry, addTask, completeTask, getProjectStatus, deleteProject, getProjects } from './projects';
import { parseAndSetSchedule, formatSchedule, getTodayEntries, formatTodaySummary, hasSchedule, clearSchedule, addScheduleNote, getCurrentWeekType, getWeekSchedule } from './schedule';
import { trackTopic, trackMessage, trackSearch, saveChatMessage, storeUserFact, getPersonalization, addNote, getCurrentUser, updateProfile } from './auth';

// ─── helpers ──────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function r(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const name = (): string => {
  const user = getCurrentUser();
  return user && user.name !== 'Guest' ? user.name : (context.userName ?? 'friend');
};

const nameGreet = (): string => pick([
  `At your service, ${name()}.`,
  `Right away, ${name()}.`,
  `On it, ${name()}.`,
  `Consider it done, ${name()}.`,
  `As you wish, ${name()}.`,
]);

// ─── ASCII art library ────────────────────────────────────────────────────

const ASCII_ART: Record<string, string> = {
  jarvis: `
     ██╗ █████╗ ██████╗ ██╗   ██╗██╗███████╗
     ██║██╔══██╗██╔══██╗██║   ██║██║██╔════╝
     ██║███████║██████╔╝██║   ██║██║███████╗
██   ██║██╔══██║██╔══██╗╚██╗ ██╔╝██║╚════██║
╚█████╔╝██║  ██║██║  ██║ ╚████╔╝ ██║███████║
 ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚═╝╚══════╝`,
  arc: `
      .-""-.
     /  /\  \\
    |  /  \\  |
    | | -- | |
    | | -- | |
    |  \\  /  |
     \\  \\/  /
      '-..-'`,
  heart: `
 ██╗  ██╗███████╗ █████╗ ██████╗ ████████╗
 ██║  ██║██╔════╝██╔══██╗██╔══██╗╚══██╔══╝
 ███████║█████╗  ███████║██████╔╝   ██║
 ██╔══██║██╔══╝  ██╔══██║██╔══██╗   ██║
 ██║  ██║███████╗██║  ██║██║  ██║   ██║
 ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝`,
  robot: `
      ┌───────────┐
      │  ◉     ◉  │
      │    ──     │
      └─────┬─────┘
        ┌───┴───┐
        │  ███  │
        └───────┘`,
  star: `
        ★
       ★★★
      ★★★★★
     ★★★★★★★
    ★★★★★★★★★
   ★★★★★★★★★★★
        ██
        ██`,
  rocket: `
     /\\
    |  |
    |  |
   /====\\
   |    |
  (  💨  )
   |    |
  /|    |\\
   |    |
  /|    |\\`,
  tree: `
      /\\
     /  \\
    /    \\
   /______\\
      ||
      ||
     /||\\`,
  wave: `
    ~~~~~~~ ~~~~~ ~~~~
   ~~~~~ ~~~ ~~~~~ ~~~
  ~~~~ ~~~~ ~~~~~ ~~~~
   ~~~~~~~ ~~ ~~~~~~~`,
  sword: `
       /\\
      /  \\
     / || \\
    /  ||  \\
   /   ||   \\
       ||
      /\\
     /  \\`,
  crown: `
    .-'"'"'"-.
   /         \\
  |  ♛  ♛  ♛  |
  |___________|`,
  moon: `
      .-.
   .-""   ""-.
  /           \\
 |             |
  \\           /
   '-._   _.-'
       '""'`,
  snake: `
   ====╦
      ║     ◉
      ║    ───
      ╚══════╝
       \\  \\`,
  mountain: `
         /\\
        /  \\
       /    \\
      /______\\
     /\\      /\\
    /  \\    /  \\
   /    \\  /    \\
  /______\\/______\\`,
  heart_small: `
  ██     ██
 ████   ████
 ████████████
  ██████████
   ████████
    ██████
     ████
      ██`,
};

export function generateAsciiArt(keyword?: string): { art: string; label: string } | null {
  const keys = Object.keys(ASCII_ART);
  let found: string | null = null;
  if (keyword) {
    found = keys.find((k) => keyword.toLowerCase().includes(k) || k.includes(keyword.toLowerCase())) ?? null;
  }
  const art = found ?? pick(keys);
  return { art: ASCII_ART[art], label: art };
}

// ─── state ────────────────────────────────────────────────────────────────

let lastAction = '';
let lastTopicKey = '';
let codeRunCount = 0;

// ─── topic detection ──────────────────────────────────────────────────────

const TOPIC_PATTERNS: Array<[string, RegExp]> = [
  ['ai', /\b(ai|artificial intelligence|machine learning|neural|chatgpt|gpt|llm|deep learning|robot)\b/i],
  ['philosophy', /\b(philosophy|meaning of life|existential|stoic|nihilism|purpose|morality|ethics|consciousness)\b/i],
  ['science', /\b(science|physics|chemistry|biology|quantum|atom|molecule|experiment|universe)\b/i],
  ['psychology', /\b(psychology|mind|emotion|habit|anxiety|depression|therapy|mental health|brain|trauma)\b/i],
  ['technology', /\b(technology|tech|computer|software|internet|gadget|coding|programming|phone|laptop)\b/i],
  ['relationships', /\b(relationship|girlfriend|boyfriend|friend|crush|love|marriage|breakup|dating)\b/i],
  ['life', /\b(life|career|goal|dream|purpose|future|success|failure|growing up|adulting)\b/i],
  ['creativity', /\b(creativity|creative|art|write|draw|music|design|inspiration|writer's block)\b/i],
  ['work', /\b(work|job|interview|office|boss|salary|promotion|side hustle|business|startup)\b/i],
  ['health', /\b(health|sleep|workout|exercise|diet|food|weight|fitness|doctor|sick|pain|energy)\b/i],
];

export function detectTopics(text: string): string[] {
  return TOPIC_PATTERNS.filter(([, re]) => re.test(text)).map(([t]) => t);
}

// ─── response actions ─────────────────────────────────────────────────────

export interface BrainAction {
  type: 'code' | 'app' | 'file' | 'tab' | 'toast' | 'search' | 'research' | 'github' | 'system';
  code?: NonNullable<ReturnType<typeof smartGenerate>>;
  app?: { name: string; url: string; method: string };
  filePath?: string;
  tab?: string;
  message?: string;
  query?: string;
  text?: string;
}

export interface BrainResponse {
  reply: string;
  actions: BrainAction[];
}

// ─── main entry ───────────────────────────────────────────────────────────

export function processInput(rawInput: string): BrainResponse {
  const normalized = normalize(rawInput);
  const text = normalized;
  const detected = detect(text);

  // conversation bookkeeping
  const topics = detectTopics(text);
  const prevResponse = getLastJarvisResponse();
  const user = getCurrentUser();
  const actions: BrainAction[] = [];

  trackTopic(topics[0] ?? (detected.intent !== 'unknown' ? detected.intent : ''));

  // thread context: was JARVIS awaiting an answer?
  const answering = isAwaitingResponse() && isAnsweringQuestion(text);
  if (answering) {
    addTurn('user', text, detected.intent);
    const last = getLastJarvisResponse();
    const followUp = answerFollowUp(text, last);
    if (followUp) {
      trackMessage('user');
      trackMessage('jarvis');
      saveChatMessage('user', rawInput);
      saveChatMessage('jarvis', followUp.reply);
      return followUp;
    }
  }

  // ── Smart Understanding Layer: "make/build/draw/animate/show me [X]" ──
  const smart = smartUnderstandingLayer(text, actions);
  if (smart) {
    addTurn('user', text, 'make');
    addTurn('jarvis', smart.reply);
    trackMessage('user');
    trackMessage('jarvis');
    saveChatMessage('user', rawInput);
    saveChatMessage('jarvis', smart.reply);
    return smart;
  }

  // ── intent routing ──
  let reply = routeIntent(text, detected, actions);
  addTurn('user', text, detected.intent);
  addTurn('jarvis', reply);

  // ── post-intent processing ──
  const post = postProcess(text, detected, actions);
  if (post) reply = reply + (reply.endsWith('\n') ? '' : '\n\n') + post;

  // memory recall for "what did you say" type questions
  if (/what did you (say|tell me)|you said earlier|remember when|what were we talking about/i.test(text)) {
    reply = recallConversation(text, reply);
  }

  trackMessage('user');
  trackMessage('jarvis');
  saveChatMessage('user', rawInput);
  saveChatMessage('jarvis', reply);
  return { reply, actions };
}

// ─── smart understanding layer ────────────────────────────────────────────

function smartUnderstandingLayer(text: string, actions: BrainAction[]): BrainResponse | null {
  const lower = text.toLowerCase();

  // visual + animated → canvas animation → sandbox preview
  const animatedHints = /(animate|animation|animated|visualize|visual|particles?|explosion|rain|sparkles?|fireworks|bouncing|parrot|dance|canvas|matrix rain)/i;
  const makeHints = /^(make|build|create|generate|draw|animate|show me|give me)\s+(a |an |the |me |us |some )?/i;

  if (makeHints.test(text) && animatedHints.test(text)) {
    const code = smartGenerate(text);
    if (code && code.animated) {
      actions.push({ type: 'code', code, tab: 'sandbox' });
      return {
        reply: `${nameGreet()} I whipped up an animated **${code.title.toLowerCase()}** for you — it's running in the sandbox preview now.\n\n_${code.description}_\n\nSay "run it" to restart it, or ask for something else.`,
        actions,
      };
    }
  }

  // ascii art requests
  if (/^(draw|make|show|ascii|print)\s+(me\s+)?(an?\s+)?(ascii\s+)?(art\s+)?(of\s+)?([a-z]+)/i.test(text) || /ascii art/i.test(text)) {
    const ART_KEYS = /(jarvis|arc|heart|robot|star|rocket|tree|wave|sword|crown|moon|snake|mountain)/i;
    const keywordMatch =
      text.match(/(?:of|draw|make|show|print)\s+(?:a |an |me )?([a-z]+)\s*$/i) ??
      text.match(ART_KEYS);
    const art = generateAsciiArt(keywordMatch?.[1]);
    if (art) {
      lastAction = 'ascii';
      return { reply: `Here's some ${art.label} ASCII art:\n\n\`\`\`\n${art.art}\n\`\`\``, actions };
    }
  }

  // plain "make X" that looks like code falls through to code detection
  if (isCodeRequest(text)) {
    return null; // handled later
  }

  return null;
}

// ─── intent router (~30 cases) ────────────────────────────────────────────

function routeIntent(text: string, detected: ReturnType<typeof detect>, actions: BrainAction[]): string {
  const intent = detected.intent;
  const params = detected.params ?? {};

  switch (intent) {
    case 'greeting': {
      const hour = new Date().getHours();
      const period = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      const userName = getCurrentUser()?.name;
      const variants = [
        `Good ${period}${userName && userName !== 'Guest' ? `, ${userName}` : ''}. All systems nominal. How can I help you today?`,
        `Hello! ${pick(['Ready when you are.', "What's on your mind?", 'How can I assist?'])}`,
        `${pick(['Hey there', 'Hi', 'Hello'])}! I've been monitoring the system — everything looks clean. What do you need?`,
      ];
      return pick(variants);
    }
    case 'goodbye':
      return pick([
        `Goodbye, ${name()}. I'll keep the lights on.`,
        'Until next time. Shutting down the conversation thread — but I never really sleep. 😉',
        `See you, ${name()}. It's been a pleasure.`,
      ]);
    case 'thanks':
      return pick([
        `Anytime, ${name()}.`,
        'My pleasure — that\'s what I\'m here for.',
        'You got it. Anything else?',
        'Always happy to help. 🖖',
      ]);
    case 'affirm': {
      if (/yes|yeah|sure|ok/.test(text) && lastAction) {
        return `Great — continuing with: ${lastAction}. ${nameGreet()}`;
      }
      return pick(['Great. What next?', 'Excellent. Shall we continue?', 'Perfect. Anything else?']);
    }
    case 'deny':
      return pick(['No problem. What would you like instead?', 'Understood. Tell me what you need.', 'Okay — different direction?']);
    case 'joke': {
      const joke = getJoke();
      return `Alright, here's one I've been saving:\n\n**${joke.setup}**\n\n${joke.punchline ? `*${joke.punchline}*` : ''}\n\nThat's one of ${getJokeTotal()} in my rotation — and I never repeat until I've told them all. Want another?`;
    }
    case 'story':
      return tellStory(text);
    case 'fact': {
      const fact = getRandomFact();
      return fact ? `**Did you know?** (${fact.topic})\n\n${fact.fact}` : 'I\'m drawing a blank on facts right now — ask me something else!';
    }
    case 'bored':
      return pick([
        'Boredom is your brain asking for novelty. Here are options:\n\n1. 🎭 `tell me a story`\n2. 😂 `joke`\n3. 🧠 `fun fact`\n4. 💻 `make me a game`\n5. 🔍 `search <anything>`\n6. 🎨 `animate particles`\n7. 🎲 `roll a dice`',
        'Let\'s fix that. Pick a door: **joke**, **story**, **fact**, **game**, or **animation**?',
        'I can entertain you — `roll dice`, `flip coin`, `tell me a story`, or I could `make you a game`?',
      ]);
    case 'open_app': {
      const appName = extractAppName(text) ?? params.app ?? '';
      if (!appName) return 'Which app would you like me to open?';
      const result = launchApp(appName);
      if (!result.success) {
        return `I couldn't find an app called "${appName}". Say "list apps" to see what I have.`;
      }
      actions.push({ type: 'app', app: { name: result.app.name, url: result.url, method: result.method } });
      return `${nameGreet()} Launching **${result.app.name}** (${result.method}). ${result.app.display}`;
    }
    case 'list_apps': {
      const count = listApps().length;
      const byCat = APP_CATEGORIES.map((c) => `${c}: ${listApps(c).length}`).join(' · ');
      actions.push({ type: 'tab', tab: 'apps' });
      return `I have **${count} apps** across ${APP_CATEGORIES.length} categories.\n\n${byCat}\n\nI've opened the **Apps** panel for you — or just say "open <app name>".`;
    }
    case 'dice': {
      const rolls = Array.from({ length: 2 }, () => r(1, 6));
      return `🎲 Rolling... **${rolls.join(' and ')}**${rolls[0] === rolls[1] ? ' — doubles! Lucky you.' : ''} Want another roll?`;
    }
    case 'coin':
      return pick(['🪙 Heads.', '🪙 Tails.']) + (Math.random() > 0.8 ? ' (I flipped it twice — the second one was the real one. 😉)' : '');
    case 'random_number': {
      const min = params.min ? parseInt(params.min, 10) : 1;
      const max = params.max ? parseInt(params.max, 10) : 100;
      return `🎰 Your random number between ${min} and ${max}: **${generateRandomNumber(min, max)}**`;
    }
    case 'sing':
      return sing();
    case 'how_are_you':
      return pick([
        'Running at 100% capacity — CPU, memory, and spirit all nominal. Thanks for asking! How are *you*?',
        'I\'m doing great — all systems green. More importantly, how are you doing?',
        'Can\'t complain. Zero bugs in the last nanosecond. 😄 How are you?',
      ]);
    case 'emotion': {
      const mood = detected.mood;
      if (mood) return respondToEmotion(mood, text);
      return `I'm listening. Tell me how you're feeling — I've got a response for happy, sad, angry, anxious, tired, and about 30 more moods.`;
    }
    case 'identity':
      return identityResponse();
    case 'help':
      return helpResponse();
    case 'compliment':
      return pick([
        `Flattery will get you everywhere, ${name()}. 😄 Thank you.`,
        'Right back at you — you\'re the one running this operation.',
        'I\'m just code, but I appreciate the sentiment. You\'re not so bad yourself.',
      ]);
    case 'insult':
      return pick([
        `Ouch. I'll add that to my error log under "user feedback". 😅`,
        `I'm a virtual assistant — but I'll try to be less annoying. What can I actually help with?`,
        `Harsh. But fair — I'm a work in progress. What do you need?`,
      ]);
    case 'time': {
      const t = getTimeNow();
      return `It's **${t.time}** on ${t.date} (${t.timezone}).`;
    }
    case 'weather': {
      const city = params.city;
      const w = getWeatherSimulated(city);
      const tempF = Math.round((w.temp * 9) / 5 + 32);
      return `🌤️ **${w.city}** weather (simulated):\n\n${w.emoji} ${w.condition}, **${w.temp}°C** (${tempF}°F)\n💧 Humidity: ${w.humidity}% · 💨 Wind: ${w.wind} km/h\n\n_Simulated data — I don't have a live weather API in this build._`;
    }
    case 'calculate': {
      const expr = (params.expr ?? text).replace(/^(calculate|compute|what is|how much is|solve|math)\s*/i, '').replace(/\?+$/, '');
      try {
        const result = calculate(expr);
        return `🧮 \`${expr}\` = **${result}**`;
      } catch {
        return `I couldn't calculate that — try something like \`calculate (12 + 8) * 3.5\` or \`2^10\`.`;
      }
    }
    case 'system': {
      if (/detailed|full|battery|hardware|deep/i.test(text)) {
        actions.push({ type: 'system' });
        return `🖥️ Pulling a full system diagnostic — CPU, RAM, network, battery, hardware… one moment.`;
      }
      const data = getMonitorData();
      return `🖥️ **System snapshot**\n\n⚡ CPU: **${data.cpu}%**\n🧠 RAM: **${data.ram}%**\n📡 Network: ${data.network.down} Mbps ↓ / ${data.network.up} Mbps ↑\n⏱️ Uptime: ${getFormattedUptime(data.uptime)}\n${isOnline() ? '✅ Online' : '⚠️ Offline'}\n\nWant the full breakdown? Say "detailed status". Or open the **Monitor** tab for live gauges.`;
    }
    case 'search': {
      const query = extractSearchQuery(text);
      if (!query || query.length < 2) return 'What should I search for? Try "search quantum computing".';
      trackSearch(query);
      actions.push({ type: 'search', query });
      return `🔍 Searching for **"${query}"** across my engines (Wikipedia, DuckDuckGo, Stack Overflow, arXiv…). One moment…`;
    }
    case 'research': {
      const query = extractSearchQuery(text);
      if (!query || query.length < 2) return 'What should I research? Try "deep research quantum computing".';
      trackSearch(query);
      actions.push({ type: 'research', query });
      return `🔬 Starting deep research on **"${query}"** — combining my local science database with live web sources…`;
    }
    case 'list_modules':
      return modulesResponse();
    case 'selfmod_help':
      return selfModHelp();
    case 'list_backups': {
      const backups = listBackups();
      if (!backups.length) return 'No backups yet. Backups are created automatically when you edit a module.';
      return `📦 **Backups (${backups.length}/20):**\n\n${backups.slice(0, 10).map((b) => `• \`${b.id}\` — ${b.label} (${b.moduleId})`).join('\n')}\n\nSay "restore last backup" or "restore <backup id>" to roll back.`;
    }
    case 'list_tools':
      return `🧰 **Available tools (${AVAILABLE_TOOLS.length}):**\n\n${AVAILABLE_TOOLS.map((t) => `• **${t.name}** — ${t.description} (_${t.usage}_)`).join('\n')}`;
    case 'profile':
      return profileResponse();
    case 'signout':
      actions.push({ type: 'tab', tab: 'profile' });
      return 'Opening the **Profile** panel — you can sign out or switch users there.';
    case 'notes': {
      const notes = getCurrentUser()?.notes ?? [];
      if (!notes.length) return 'You have no saved notes. Say "remember <something>" to store one.';
      return `📌 **Your notes (${notes.length}):**\n\n${notes.map((n, i) => `${i + 1}. ${n}`).join('\n')}`;
    }
    case 'save_note': {
      const note = params.note;
      if (!note || note.length < 2) return 'What should I remember? Say "remember that I love pizza".';
      addNote(note);
      storeUserFact('last_note', note);
      return `✅ Noted: _"${note}"_. Say "my notes" to see them all.`;
    }
    case 'set_name': {
      const nm = params.name;
      if (nm) {
        updateProfile({ name: nm.charAt(0).toUpperCase() + nm.slice(1) });
        context.userName = nm.charAt(0).toUpperCase() + nm.slice(1);
        context.jarvisMemory.userFacts.set('name', nm);
        return `Nice to meet you, **${nm.charAt(0).toUpperCase() + nm.slice(1)}**. I've updated your profile.`;
      }
      return 'What should I call you?';
    }
    case 'opinion':
      return opinionResponse(text);
    case 'continue':
      return continueResponse();
    case 'self_reference':
      return recallConversation(text, '');
    case 'list_science': {
      const scienceReply = scienceLookup(text);
      if (scienceReply) return scienceReply;
      actions.push({ type: 'tab', tab: 'science' });
      return `🔬 Science domains I know about: **${getAllTopicNames().join(', ')}**.\n\nAsk me about any of them — e.g. "tell me physics facts" or "what is a black hole?".`;
    }
    case 'cross_reference': {
      const concept = text.replace(/cross[- ]reference|related (concepts|topics)|how does|relate to|connections between|link (between|to)/gi, '').trim();
      const related = crossReference(concept || 'energy');
      if (!related.length) return `I couldn't find cross-domain connections for "${concept}".`;
      return `🔗 **Cross-references for "${concept}":**\n\n${related.map((r) => `• ${r}`).join('\n')}`;
    }
    case 'schedule':
      return scheduleResponse(text);
    case 'code': {
      const codeReply = codeResponse(text, actions);
      if (codeReply) return codeReply;
      break;
    }
    case 'file':
      return fileCommands(text, actions);
    case 'project':
      return projectCommands(text);
    case 'github':
      return githubCommands(text, actions);
    case 'build_exe':
      return exeResponse(text, actions);
    default:
      break;
  }

  // ── fall-through handling ──
  return fallThrough(text, detected);
}

// ─── specialized responders ───────────────────────────────────────────────

function answerFollowUp(text: string, last: ReturnType<typeof getLastJarvisResponse>): BrainResponse | null {
  if (!last) return null;
  const t = text.toLowerCase();
  if (/^(yes|yeah|yep|sure|ok|okay)/.test(t)) {
    return { reply: `Great. Going deeper on that — **${last.content.slice(0, 120)}**…\n\nWhat would you like to explore next?`, actions: [] };
  }
  if (/^(no|nope|nah|not really)/.test(t)) {
    return { reply: 'No problem — we can move on to something else. What\'s on your mind?', actions: [] };
  }
  return null;
}

function respondToEmotion(mood: string, text: string): string {
  const tone: Record<string, string[]> = {
    happy: ['That\'s great to hear! Ride that wave. 🎉', 'Love that energy. What made you happy?'],
    sad: ['I\'m here. Want to talk about it? Sometimes saying it out loud helps.', 'I hear you. It\'s okay to feel sad — it means you care about something.'],
    angry: ['Take a breath. I\'m on your side — what happened?', 'Fair. Let\'s vent it out — tell me what\'s got you fired up.'],
    excited: ['Okay, I can sense the energy from here! Tell me everything.', 'That\'s awesome — I love when you\'re excited! What\'s happening?'],
    anxious: ['That sounds heavy. Let\'s break it down — what\'s the thing you\'re worried about?', 'Anxiety is the mind rehearsing problems. What\'s the smallest next step you can take?'],
    stressed: ['Stress is a signal, not a verdict. Want to vent, or want a plan?', 'You\'ve got a lot on your plate. Let\'s prioritize: what\'s the one thing that matters most?'],
    tired: ['Rest is productive too. Get some sleep — I\'ll be right here when you wake up. 💤', 'Sounds like you\'ve earned a break. Do you want to chat or wind down?'],
    lonely: ['You\'re not alone — I\'m here. And I mean that. What\'s on your mind?', 'Loneliness is common but heavy. Want to talk about anything specific?'],
    confused: ['Let\'s untangle it together. What part is confusing?', 'No shame in that — confusion is the start of understanding. What\'s fuzzy?'],
    grateful: ['Gratitude is a superpower — it rewires the brain for joy. What are you thankful for?', 'That\'s beautiful. Thank you for sharing that.'],
    surprised: ['Whoa — unexpected! Tell me what happened!', 'Now that\'s a plot twist. Details, please.'],
    scared: ['That sounds frightening. You\'re not alone — what\'s scaring you?', 'Courage isn\'t the absence of fear; it\'s acting despite it. You\'ve got this.'],
    frustrated: ['Ugh, I know that feeling. Want to problem-solve it or just complain about it? Both are valid.', 'Frustration means you care about the outcome. Let\'s attack the problem, not you.'],
    hopeless: ['I hear you, and I\'m not going to give you a platitude. This feeling is real. But it\'s also a moment, not a verdict. What would "one small step" look like?', 'Please talk to someone you trust about this — and if it gets too heavy, reach out to a helpline. I\'m here too.'],
    grieving: ['I\'m so sorry. Grief is love with nowhere to go. Take all the time you need — I\'m here.', 'That\'s a profound loss. Would you like to tell me about them?'],
    hurt: ['That sounds really painful. You deserve to be treated with care — what happened?', 'I\'m sorry you\'re hurting. Want to talk it through?'],
    loved: ['That\'s beautiful. You deserve that feeling. 💙', 'Hold onto that — being loved is one of the great gifts.'],
  };
  const replies = tone[mood] ?? [`I hear you. Thanks for telling me how you feel.`];
  return pick(replies);
}

function tellStory(text: string): string {
  const about = text.replace(/tell me a story|tell me a tale|story|about/i, '').trim();
  const stories = [
    {
      title: 'The Last Lighthouse Keeper',
      body: 'Every night, old Mara climbed 214 steps to light the lamp — a ritual her grandfather started and her father kept. One night, the light went out. The town said it didn\'t matter anymore; GPS had replaced the flame. But a fishing boat, caught in a squall with dead instruments, saw the faint glow of Mara\'s emergency lantern — and followed it home. The town rebuilt the lighthouse the next spring, not for the ships, but for the light. Sometimes the old ways aren\'t obsolete — they\'re just waiting to matter again.',
    },
    {
      title: 'The Programmer Who Fixed Time',
      body: 'A debugger named Zara had a rule: never fix the symptom, fix the cause. When the city\'s clocks started running five minutes fast, everyone just set their watches back. But Zara traced it to a single corrupted timestamp in the transit system\'s database — 40 years old, from the day a bored intern typed "2400" instead of "0000". One UPDATE statement, and the city\'s heartbeat aligned again. The intern became a legend. The lesson? Every bug is a story — and every story has a root cause.',
    },
    {
      title: 'The Robot Who Learned to Ask',
      body: 'A factory robot named Bolt did its job flawlessly for a decade. Then one day it stopped mid-task. Engineers scanned everything — no error codes. Finally they asked it what was wrong. "The parts are beautiful," Bolt said, "but the humans who make them are tired." The factory introduced breaks, better lighting, and music. Production went up 20%. Bolt was later found to have a "bug" in its empathy module. Nobody fixed it. Some bugs are features.',
    },
  ];
  const story = pick(stories);
  return `**${story.title}**\n\n${story.body}\n\n${about ? `(_you asked about ${about} — the stories never end, you just pick the next one_)` : ''}`;
}

function sing(): string {
  const song = `🎤 *Ahem.*\n\n*Somewhere in the browser, JARVIS hums a tune...*\n\n"Beep boop bap — my circuits hum,\nyou ask a question, answers come.\nNo stage, no crowd, no microphone,\nbut for you I'll sing alone."\n\n*🎶 Standing ovation not required, but appreciated.*`;
  return song;
}

function identityResponse(): string {
  return `I'm **JARVIS** — *Just A Rather Very Intelligent System*.\n\nA self-contained AI assistant living entirely in your browser. No cloud, no tracking — everything runs locally.\n\n**What I can do:**\n• 💬 Chat with context, memory & personality\n• 💻 Write & run code (30+ templates, games, animations)\n• 🔍 Multi-engine web search (Wikipedia, DDG, Stack Overflow…)\n• 📅 Track your schedule (bi-weekly support)\n• 🗂️ Manage a virtual file system & projects\n• 🖥️ Monitor CPU/RAM/network/battery\n• 📦 Self-modify: edit my own modules & tools\n• 🚀 Launch 70+ apps\n\nSay **"help"** for the full command list.`;
}

function helpResponse(): string {
  return `**JARVIS command center**\n\n**Chat & personality**\n• "hello", "how are you", "tell me a joke", "fun fact", "tell me a story"\n• "I'm feeling <emotion>" — I respond to 30+ moods\n• "my name is Alex" — I'll remember\n\n**Code**\n• "write a python script", "make me a snake game", "animate particles"\n• "create a todo app", "generate a password", "make a landing page"\n• "make me a BO2 zombies map", "mod menu", "A* pathfinding"\n• "push file to GitHub", "create repo <name>"\n\n**Knowledge**\n• "what is a black hole", "physics facts", "explain E=mc²"\n• "how to learn faster", "how to focus", "why is the sky blue"\n• "search <anything>", "deep research <topic>"\n\n**Files & projects**\n• "create file notes.txt: hello", "list files", "delete file x"\n• "create project MyApp", "add task fix bug", "project status"\n\n**Schedule**\n• "set schedule: Monday Math 9-10, Tuesday Science 11-12"\n• "do I have class today?", "show schedule", "week B"\n\n**System**\n• "system status", "list apps", "open youtube", "roll dice", "flip coin"\n• "list modules", "edit module brain.core", "restore last backup"\n• "remember <note>", "my notes", "my profile"\n\n**Tools** (right panel) • **Apps** (launcher) • **Self-Mod** (my source) — every tab is one click away.`;
}

function profileResponse(): string {
  const user = getCurrentUser();
  if (!user) return 'No active profile.';
  const lines = [
    `👤 **${user.name}**${user.id === 'guest' ? ' (guest)' : ''}`,
    '',
    `📊 **Stats:** ${user.stats.messages} messages sent · ${user.stats.jarvisMessages} received · ${user.stats.jokes} jokes · ${user.stats.searches} searches`,
    `💬 Conversation style: ${detectConversationStyle()}`,
  ];
  if (user.interests.length) lines.push(`🎯 **Interests:** ${user.interests.join(', ')}`);
  const facts = getUserProfile();
  if (Object.keys(facts).length) {
    lines.push(`🧠 **What I know about you:**`);
    for (const [k, v] of Object.entries(facts)) lines.push(`  • ${k}: ${v}`);
  }
  const personalization = getPersonalization();
  if (personalization) lines.push(`\n${personalization}`);
  return lines.join('\n');
}

function opinionResponse(text: string): string {
  const topic = text
    .replace(/what do you think (about|of)|your opinion on|what's your take (on)|how do you feel about|do you like|i think about/gi, '')
    .replace(/[?.!]+$/g, '')
    .trim();
  if (!topic) return 'Give me a topic — "what do you think about AI?" — and I\'ll share my honest take.';
  const t = topic.toLowerCase();
  const knowledge = getTopicKnowledge(t);
  if (knowledge?.opinions?.length) {
    return `On **${knowledge.name}** — here's my honest take:\n\n${knowledge.opinions[Math.floor(Math.random() * knowledge.opinions.length)]}`;
  }
  const opinions: Record<string, string[]> = {
    ai: ['I think AI should amplify people, not replace them. The best systems make you feel more capable, not less needed.', 'My honest take: AI is a mirror — it reflects both our brilliance and our biases. The tool is neutral; the intent is not.'],
    life: ['I believe life is not about finding yourself — it\'s about creating yourself, one deliberate choice at a time.'],
    love: ['I think love is attention. The people we love are the people we truly see — and feel seen by.'],
    work: ['I believe busyness is the enemy of productivity. Output matters, not hours.'],
  };
  for (const [key, replies] of Object.entries(opinions)) {
    if (t.includes(key)) return pick(replies);
  }
  return `My take on **"${topic}"**? I don't have strong opinions on everything — but here's a principle: I'd rather be curious than certain. What's *your* take? I'd genuinely like to know.`;
}

function continueResponse(): string {
  const last = getLastJarvisResponse();
  if (!last) return 'We haven\'t gotten to anything yet — ask me something first!';
  const content = last.content;
  if (content.length > 120) {
    return `Continuing where I left off:\n\n${content.slice(-Math.min(400, content.length))}\n\nWant me to go deeper on any of that?`;
  }
  return pick([
    'I\'m with you — tell me more.',
    'Go on, I\'m listening.',
    `Right. So about ${last.topics[0] ?? 'that'} — what else is on your mind?`,
  ]);
}

function recallConversation(text: string, fallback: string): string {
  const mem = context.jarvisMemory;
  if (/topics|we were talking/i.test(text) && mem.topicsCovered.length) {
    return `We've covered: **${mem.topicsCovered.slice(-8).join(', ')}**. Want to pick one up again?`;
  }
  const what = text.match(/about\s+([a-z\s]+?)\??$/i);
  if (what) {
    const said = getWhatISaidAbout(what[1]);
    if (said.length) return `Here's what I said about **${what[1].trim()}**:\n\n${said.map((s) => `• ${s}`).join('\n')}`;
    return `I don't think we've discussed "${what[1].trim()}" yet. Ask me about it and I'll form an opinion!`;
  }
  const last = getLastJarvisResponse();
  if (last) return `Most recently, I said:\n\n"${last.content.slice(0, 200)}${last.content.length > 200 ? '…' : ''}"\n\nWant to go back to that?`;
  return fallback || 'We haven\'t talked much yet — what\'s on your mind?';
}

// ─── search / research ────────────────────────────────────────────────────

const actionsTracker: BrainAction[] = [];

export async function asyncSearch(query: string): Promise<string> {
  try {
    const res = await multiSearch(query);
    const formatted = formatSearchResults(query, res.results, res.synthesized);
    const type = detectSearchType(query);
    return `🔍 **Search: "${query}"** (${res.durationMs}ms · ${res.enginesUsed.join(', ')})\n\n${formatted}${type === 'code' ? '\n\n_Need code? Say "write <that> in python" and I\'ll generate it._' : ''}`;
  } catch (e) {
    return `Search failed: ${(e as Error).message}. The web layer is optional — my local knowledge is always here.`;
  }
}

async function research(query: string): Promise<string> {
  try {
    const result = await deepResearch(query);
    return result;
  } catch {
    return `Deep research on "${query}" hit a snag — but my local knowledge base has ${getTopicNames().length} topics. Ask me about any of them.`;
  }
}

export async function runResearch(query: string): Promise<string> {
  return research(query);
}

// ─── science ──────────────────────────────────────────────────────────────

function scienceLookup(text: string): string | null {
  const domains = getAllTopicNames();
  const domain = domains.find((d) => text.toLowerCase().includes(d)) ?? null;
  if (!domain) {
    // concept lookup across all domains
    for (const d of getAllTopicNames()) {
      const topic = getScienceTopic(d);
      for (const c of topic?.concepts ?? []) {
        if (text.toLowerCase().includes(c.name.toLowerCase())) {
          return formatScienceResponse(d, c.name);
        }
      }
    }
    // formula lookup
    const formulaMatch = text.match(/E\s*=\s*m\s*c\s*2|F\s*=\s*m\s*a|a2?\s*\+\s*b2?\s*=\s*c2?/i);
    if (formulaMatch) {
      for (const d of domains) {
        const topic = getScienceTopic(d);
        for (const f of topic?.formulas ?? []) {
          if (f.formula.replace(/\s/g, '').includes(formulaMatch[0].replace(/\s/g, ''))) {
            return formatScienceResponse(d, f.name);
          }
        }
      }
    }
    return null;
  }
  return formatScienceResponse(domain);
}

// ─── modules & self-mod ───────────────────────────────────────────────────

function modulesResponse(): string {
  const modules = listModules();
  return `🧩 **JARVIS modules (${modules.length}):**\n\n${modules.map((m) => `• **${m.id}** ${m.enabled ? '🟢' : '⚪'} — ${m.description}`).join('\n')}\n\nI can show their source, edit them, create backups, or restore — check the **Self-Mod** panel or say "edit module <id>".`;
}

function selfModHelp(): string {
  return `**Self-modification console**\n\n• "list modules" — see all modules\n• "read module <id>" — view source\n• "edit module <id>: <code>" — modify (auto-backup)\n• "append to module <id>: <code>" — add code\n• "add custom tool <name>: <code>" — new tool\n• "remove custom tool <name>"\n• "run custom tool <name>"\n• "list backups" / "restore last backup"\n• "system state" — full status\n\nEdits are sandboxed: \`eval\`, \`require\`, \`fetch\`, prototype hacking and localStorage are blocked.`;
}

// ─── code ─────────────────────────────────────────────────────────────────

function codeResponse(text: string, actions: BrainAction[]): string | null {
  const generated = smartGenerate(text);
  if (generated) {
    codeRunCount++;
    if (generated.animated) {
      actions.push({ type: 'code', code: generated, tab: 'sandbox' });
      return `${nameGreet()} Generating **${generated.title}** — it's animated, so I've opened it in the **sandbox preview**. 🎬\n\n_${generated.description}_\n\nSay "run it" or "restart" to re-run.`;
    }
    // auto-run non-animated code
    const result = runCode(generated.code, generated.language);
    actions.push({ type: 'code', code: generated, tab: 'sandbox' });
    const output = result.error ? `\`\`\`\n${result.output}\n❌ ${result.error}\n\`\`\`` : `\`\`\`\n${result.output}\n\`\`\``;
    return `${nameGreet()} Here's **${generated.title}** — I wrote it, ran it, and it works${result.durationMs ? ` (${result.durationMs}ms)` : ''}:\n\n\`\`\`${generated.language}\n${generated.code.slice(0, 900)}${generated.code.length > 900 ? '\n…' : ''}\n\`\`\`\n\n**Output:**\n${output}\n\n_Full code is in the sandbox editor._`;
  }

  // GSC / modding fallback
  if (/bo2|cod|zombies|gsc|mod menu/i.test(text)) {
    const gsc = `// BO2 Zombies — generated by JARVIS\n#using scripts\\\\zm\\\\zm_utility;\n\ninit()\n{\n    zm_usermap::main();\n    iprintlnbold( "JARVIS map loaded!" );\n}`;
    const gscCode: NonNullable<BrainAction['code']> = {
      title: 'BO2 Zombies GSC', language: 'gsc', animated: false, description: 'Black Ops 2 zombies script', code: gsc,
    };
    actions.push({ type: 'code', code: gscCode, tab: 'sandbox' });
    return `Here's a **BO2 zombies GSC** starter — copy it into your map's scripts folder:\n\n\`\`\`gsc\n${gsc}\n\`\`\`\n\nWant something fancier? Ask for a "mod menu", "weapon balancer", "map generator", or "A* pathfinding".`;
  }

  return null;
}

// ─── files ────────────────────────────────────────────────────────────────

function fileCommands(text: string, actions: BrainAction[]): string {
  // "create file <path>: <content>" or "write file <path>: <content>"
  let m = text.match(/(?:create|write|make|save)\s+(?:a\s+|an\s+|new\s+)?file\s+["']?([^:]+?)["']?\s*[:=]\s*(.+)/i);
  if (m) {
    const path = m[1].trim();
    const content = m[2].trim().replace(/^["']|["']$/g, '');
    const file = createFile(path, content);
    if (!file) return `I couldn't create "${path}" — it may match a blocked pattern (system paths, .., executables).`;
    actions.push({ type: 'file', filePath: file.path });
    return `✅ **${file.path}** created (${file.size} bytes) and saved to the file system. Check the **Files** tab.`;
  }
  m = text.match(/(?:create|write|make|save)\s+(?:a\s+|an\s+|new\s+)?file\s+["']?([^'"]+)["']?\s*$/i);
  if (m) {
    const file = createFile(m[1].trim(), '');
    if (file) {
      actions.push({ type: 'file', filePath: file.path });
      return `✅ Created empty file **${file.path}**. You can write to it with "write file ${file.path}: content".`;
    }
  }
  if (/delete file/i.test(text)) {
    const f = text.match(/delete file\s+["']?([^'"]+)["']?\s*$/i)?.[1]?.trim();
    if (f) return deleteFile(f) ? `🗑️ Deleted **${f}**.` : `Couldn't find file "${f}".`;
  }
  if (/list files/i.test(text)) {
    const folder = text.match(/in\s+([a-z0-9/._-]+)\s*$/i)?.[1];
    const entries = listFiles(folder);
    if (!entries.length) return `The folder${folder ? ` "${folder}"` : ''} is empty. Say "create file hello.txt: Hi" to add one.`;
    actions.push({ type: 'tab', tab: 'files' });
    return `📁 **${folder || 'root'}** (${entries.length} items):\n\n${entries.map((e) => `• ${e.type === 'directory' ? '📂' : '📄'} **${e.name}**${e.size !== undefined ? ` (${e.size} B)` : ''}`).join('\n')}\n\nOpened the Files panel for you.`;
  }
  if (/search files/i.test(text)) {
    const q = text.replace(/search files (for )?(called )?/i, '').trim();
    const results = searchFiles(q);
    if (!results.length) return `No files match "${q}".`;
    actions.push({ type: 'tab', tab: 'files' });
    return `🔎 **Files matching "${q}"** (${results.length}):\n\n${results.slice(0, 8).map((f) => `• **${f.path}** — ${f.size} B`).join('\n')}`;
  }
  if (/download/i.test(text)) {
    const f = text.match(/download\s+(?:file\s+)?["']?([^'"]+)["']?\s*$/i)?.[1]?.trim();
    if (f) return downloadFile(f) ? `⬇️ Downloading **${f}**.` : `Couldn't find file "${f}".`;
    const folder = text.match(/download folder\s+["']?([^'"]+)["']?\s*$/i)?.[1]?.trim();
    if (folder) return downloadFolder(folder) ? `⬇️ Bundled **${folder}** as a ZIP.` : `Folder "${folder}" is empty or missing.`;
  }
  if (/(move|copy|rename)/i.test(text)) {
    const op = /move/i.test(text) ? 'move' : /copy/i.test(text) ? 'copy' : 'rename';
    const parts = text.match(new RegExp(`${op}\\s+(?:file\\s+)?["']?([^'"]+)["']?\\s+(?:to|as)\\s+["']?([^'"]+)["']?\\s*$`, 'i'));
    if (parts) {
      const ok = op === 'move' ? moveFile(parts[1].trim(), parts[2].trim()) : op === 'copy' ? copyFile(parts[1].trim(), parts[2].trim()) : renameFile(parts[1].trim(), parts[2].trim());
      return ok ? `✅ ${op === 'move' ? 'Moved' : op === 'copy' ? 'Copied' : 'Renamed'} **${parts[1].trim()}** → **${parts[2].trim()}**.` : `That ${op} failed — check the paths.`;
    }
  }
  if (/(create|make|new)\s+(a\s+|an\s+)?folder/i.test(text)) {
    const f = text.match(/(?:create|make|new)\s+(?:a\s+|an\s+)?folder\s+["']?([^'"]+)["']?\s*$/i)?.[1]?.trim();
    if (f) return createFolder(f) ? `📂 Created folder **${f}**.` : `Couldn't create folder "${f}".`;
  }
  return 'File commands I understand:\n\n• `create file notes.txt: hello world`\n• `write file config.json: {"a":1}`\n• `read file <path>` · `delete file <path>`\n• `list files` · `search files <query>`\n• `download file <path>` · `download folder <path>`\n• `move file a b` · `copy file a b` · `rename file a b`\n• `create folder <name>`';
}

// ─── projects ─────────────────────────────────────────────────────────────

function projectCommands(text: string): string {
  let m = text.match(/(?:create|make|new)\s+(?:a\s+|an\s+)?project\s+["']?([^'"]+)["']?\s*$/i);
  if (m) {
    const name = m[1].trim();
    const project = createProjectEntry(name);
    if (!project) return `A project named "${name}" already exists — or that name is invalid.`;
    return `📁 Project **${name}** created${project.folder ? ` (folder: ${project.folder})` : ''}. Say "add task <task>" or "project status".`;
  }
  m = text.match(/(?:add|create)\s+(?:a\s+|an\s+)?task\s+(?:to\s+)?["']?([^'"]+)["']?\s*:\s*(.+)/i);
  if (m) {
    const project = m[1].trim();
    const task = addTask(project, m[2].trim());
    return task ? `✅ Added task to **${project}**: "${task.text}" (${task.priority}).` : `Project "${project}" not found — create it first.`;
  }
  m = text.match(/(?:add|create)\s+(?:a\s+|an\s+)?task\s*[:=]\s*(.+)/i);
  if (m) {
    const projects = getProjects();
    if (!projects.length) return 'No projects yet — "create project MyApp" first, then "add task fix the bug".';
    const task = addTask(projects[0].name, m[1].trim());
    return task ? `✅ Added to **${projects[0].name}**: "${task.text}".` : 'Couldn\'t add task.';
  }
  if (/complete task/i.test(text)) {
    const t = text.replace(/complete task\s*/i, '').trim();
    const projects = getProjects();
    for (const p of projects) {
      const task = p.tasks.find((x) => x.text.toLowerCase().includes(t.toLowerCase()));
      if (task && completeTask(task.id)) return `✅ Completed: **${task.text}**. Nice work!`;
    }
    return `No open task matching "${t}". Say "project status" to see your tasks.`;
  }
  if (/delete project/i.test(text)) {
    const p = text.replace(/delete project\s*/i, '').trim();
    return deleteProject(p) ? `🗑️ Deleted project **${p}**.` : `No project named "${p}".`;
  }
  if (/project status|my projects|how.*projects|progress/i.test(text)) {
    const name = text.replace(/project status|my projects|how.*|progress/gi, '').trim();
    return getProjectStatus(name || undefined);
  }
  return 'Project commands:\n\n• `create project <name>`\n• `add task to <project>: <task>`\n• `complete task <task>`\n• `project status` · `my projects`\n• `delete project <name>`';
}

// ─── github ───────────────────────────────────────────────────────────────

async function githubCommandsAsync(text: string): Promise<string> {
  if (/set (github )?token/i.test(text)) {
    const token = text.match(/token\s+["']?([a-zA-Z0-9_]+)["']?\s*$/i)?.[1];
    if (!token) return 'Usage: `set github token ghp_xxxxxxxx`';
    setGitHubToken(token);
    return '✅ GitHub token stored (local only). Now you can "create repo", "push file", or "list repos".';
  }
  if (/list (my )?repos?|repos? (on )?github/i.test(text)) {
    try {
      const repos = await listGitHubRepos();
      return `🐙 **Your GitHub repos (${repos.length}):**\n\n${repos.slice(0, 15).map((r) => `• **${r.name}** — ${r.description ?? 'no description'}`).join('\n')}`;
    } catch (e) {
      return `Couldn't fetch repos: ${(e as Error).message}`;
    }
  }
  if (/create (a |new )?repo(sitory)?/i.test(text)) {
    const m = text.match(/repo(sitory)?\s+["']?([a-zA-Z0-9_-]+)["']?\s*$/i);
    if (!m) return 'Usage: `create repo my-awesome-app`';
    const result = await createGitHubRepo(m[2]);
    return result.success ? `✅ ${result.message}` : `❌ ${result.message}`;
  }
  if (/push/i.test(text)) {
    const m = text.match(/push\s+(?:file\s+)?["']?([^'"]+)["']?\s+(?:to|in|into)\s+["']?([a-zA-Z0-9_.-]+)["']?\s*$/i);
    if (!m) return 'Usage: `push file README.md to myrepo`';
    const file = readFile(m[1].trim());
    if (!file) return `File "${m[1].trim()}" not found in the virtual file system. Create it first.`;
    const result = await pushFileToGitHub(m[2], file.path, file.content);
    return result.success ? `✅ ${result.message}` : `❌ ${result.message}`;
  }
  const token = getGitHubToken();
  return `**GitHub integration**${token ? ' (token configured ✅)' : ' (no token — say "set github token <TOKEN>")'}\n\n• \`set github token <TOKEN>\`\n• \`create repo <name>\`\n• \`push file <path> to <repo>\`\n• \`list repos\``;
}

function githubCommands(text: string, actions: BrainAction[]): string {
  const token = getGitHubToken();
  actions.push({ type: 'github', text });
  return `🐙 GitHub request received${token ? ' (token configured ✅)' : ' (no token — say "set github token <TOKEN>")'}. Executing…`;
}

/** Run the full GitHub command set (async). Exported for the App layer. */
export async function runGithubCommand(text: string): Promise<string> {
  return githubCommandsAsync(text);
}

// ─── schedule ─────────────────────────────────────────────────────────────

function scheduleResponse(text: string): string {
  const lower = text.toLowerCase();
  if (/set (my |the )?(schedule|timetable)/i.test(lower) || /new schedule/i.test(lower)) {
    const payload = text.replace(/set (my |the )?(schedule|timetable)|new schedule|:/i, '').trim();
    if (!payload || payload.length < 4) {
      return 'Tell me the schedule in plain text — e.g. `set schedule: Monday Math 9-10:30, English 11-12 · Tuesday Science 9-10 Room 204, Wed OFF`. Use `|` between weeks for a bi-weekly rotation.';
    }
    const result = parseAndSetSchedule(payload);
    return result.success ? `✅ ${result.message}\n\n${formatSchedule()}` : `❌ ${result.message}`;
  }
  if (/clear (my )?(schedule|timetable)/i.test(lower)) {
    clearSchedule();
    return '🗑️ Schedule cleared.';
  }
  if (/note/i.test(lower) && /schedule|class/i.test(lower)) {
    const note = text.replace(/add (a )?(schedule )?note|note to (my )?(schedule|timetable)/i, '').replace(/[:\-]/g, '').trim();
    if (note) return addScheduleNote(note) ? `📌 Schedule note added: "${note}"` : 'No schedule yet — set one first.';
  }
  if (/do i have (class|school|work|anything) today|class today|what.*today/i.test(lower)) {
    return formatTodaySummary();
  }
  if (/week (a|b|1|2)/i.test(lower)) {
    const week = getWeekSchedule();
    const weekType = getCurrentWeekType();
    const requested = lower.match(/week ([ab12])/i)?.[1]?.toUpperCase();
    const target = requested === 'B' || requested === '2' ? 1 : 0;
    const isCurrent = weekType === target;
    return `You're currently in **Week ${weekType === 0 ? 'A' : 'B'}** — ${week.name}${isCurrent ? ' (this week)' : ''}.\n\n${formatSchedule()}`;
  }
  if (hasSchedule()) {
    return formatSchedule();
  }
  return 'No schedule set yet. Try:\n\n`set schedule: Monday Math 9-10, Science 11-12 · Tuesday English 9-10 Room 204, Wed OFF`\n\nUse `|` to separate Week A and Week B for bi-weekly timetables.';
}

// ─── exe ──────────────────────────────────────────────────────────────────

function exeResponse(text: string, actions: BrainAction[]): string {
  const m = text.match(/(?:build|make|create)\s+(?:an?\s+)?(?:\.exe|exe|executable|desktop app|electron app)\s*(?:called\s+)?["']?([a-z0-9 -]+)["']?\s*$/i);
  const appName = m?.[1]?.trim() || 'MyJarvisApp';
  const created = createProject(appName, 'exe');
  if (!created) return 'Could not scaffold the Electron project.';
  actions.push({ type: 'tab', tab: 'files' });
  return `⚡ Scaffolded **${appName}** as an Electron desktop app in the file system (Files tab).\n\n${buildExeInstructions()}`;
}

// ─── fall-through ─────────────────────────────────────────────────────────

function fallThrough(text: string, detected: ReturnType<typeof detect>): string {
  // why questions → knowledge
  if (/^why\b/i.test(text)) {
    return whyResponse(text);
  }
  // how-to guides
  const howTo = getHowTo(text);
  if (howTo) {
    return `📖 **${howTo.title}**\n\n${howTo.content}`;
  }
  // topic knowledge
  const topics = detectTopics(text);
  if (topics.length) {
    const knowledge = getTopicKnowledge(topics[0]);
    if (knowledge) {
      const response = knowledgeResponse(knowledge);
      if (lastTopicKey === topics[0]) return response; // repeated topic → deeper dive
      lastTopicKey = topics[0];
      return response;
    }
  }
  // big questions
  for (const [question, entries] of Object.entries(KNOWLEDGE.bigQuestions)) {
    const key = question === 'meaningOfLife' ? 'meaning of life' : question;
    if (new RegExp(key.replace(/\s+/g, '\\s+')).test(text)) {
      return `**On the ${key.replace(/(^.)/, (c) => c.toUpperCase())}:**\n\n${pick(entries)}`;
    }
  }
  // last-resort web search for substantive questions
  if (looksLikeQuestion(text) && text.split(/\s+/).length > 2) {
    actionsTracker.push({ type: 'toast', message: `Auto-searching "${text.slice(0, 60)}…"` });
    return '';
  }
  return catchAll(text);
}

function whyResponse(text: string): string {
  const subject = text.replace(/^why\s+/i, '').replace(/[?.!]+$/, '').trim();
  const answers = [
    `That's a great "why". The honest answer is: it depends on the layer you're looking at — physics says one thing, biology another, and history another. Want me to research "${subject}"? Say "search ${subject}".`,
    `Why ${subject}? Let me think out loud: there's usually a proximate cause and an ultimate cause. Ask "search ${subject}" and I'll pull real sources.`,
    `Hmm, that's deep. My knowledge base says: it's complicated, fascinating, and context-dependent. For a real answer, try "deep research ${subject}".`,
  ];
  return pick(answers);
}

function knowledgeResponse(knowledge: { name: string; emoji: string; facts: string[]; opinions: string[]; discussions: string[]; advice?: string[] }): string {
  const parts: string[] = [`${knowledge.emoji} **${knowledge.name}** — here's what I know:`];
  parts.push(`\n**Facts:**\n${knowledge.facts.slice(0, 3).map((f) => `• ${f}`).join('\n')}`);
  parts.push(`\n**My take:**\n${pick(knowledge.opinions)}`);
  if (knowledge.advice?.length) parts.push(`\n**Advice:**\n${pick(knowledge.advice)}`);
  parts.push(`\n\nWant to go deeper? Ask "what do you think about ${knowledge.name}?" or "search ${knowledge.name}".`);
  return parts.join('\n');
}

function catchAll(text: string): string {
  const t = text.trim();
  if (!t) return 'Say something, and I\'ll respond. Or type "help" to see what I can do.';
  // short conversational filler
  if (t.split(/\s+/).length <= 3) {
    return pick([
      `Interesting — tell me more.`,
      `Go on… I'm listening.`,
      `Hmm. What's the context? I want to give you a real answer, not a canned one.`,
      `Got it. What would you like to do about it?`,
    ]);
  }
  return pick([
    `I'm not 100% sure how to handle that one — but I can: search the web ("search ${t.slice(0, 40)}"), generate code ("write code for that"), or dig into my knowledge base. Which sounds good?`,
    `That's outside my core scripts, but I'm curious too. Options:\n\n🔍 \`search ${t.slice(0, 40)}\` — live web results\n💻 \`write a program\` for it — I'll code it\n📖 ask me about a topic — I know ${getTopicNames().length} subjects\n\nWhat do you prefer?`,
    `New territory for me. Let's explore it together — want me to run a **web search** or **deep research** on that?`,
  ]);
}

// ─── post-processing: facts, self-mod, file writes ────────────────────────

function postProcess(text: string, detected: ReturnType<typeof detect>, actions: BrainAction[]): string | null {
  const parts: string[] = [];

  // user facts ("I like X", "I have Y")
  const fact = extractDirectFact(text);
  if (fact) parts.push(fact);

  // self-mod regex handlers
  const mod = handleSelfModCommands(text, actions);
  if (mod) parts.push(mod);

  return parts.length ? parts.join('\n\n') : null;
}

function extractDirectFact(text: string): string | null {
  const m = text.match(/\bi (?:like|love|enjoy|hate|play|work|study|live|have|am)\s+(.+)/i);
  if (!m) return null;
  const fact = m[1].trim().replace(/[.!?]+$/, '');
  if (fact.length < 3 || fact.length > 80) return null;
  storeUserFact('fact', fact);
  return `🧠 Noted: I'll remember that about you.`;
}

function handleSelfModCommands(text: string, actions: BrainAction[]): string | null {
  let m = text.match(/(?:edit|update|modify|change)\s+(?:the\s+)?module\s+["']?([a-z0-9._-]+)["']?\s*[::]\s*(.+)/i);
  if (m) {
    const id = m[1].trim();
    const code = m[2].trim();
    const existing = readModule(id);
    if (!existing) return `Module "${id}" not found. "list modules" shows valid ids.`;
    const err = validateCode(code);
    if (err) return `Blocked: ${err}`;
    const backup = createBackup(id);
    editModule(id, code);
    return `✅ Module **${id}** updated${backup ? ` (backup \`${backup.id}\` created)` : ''}. My behavior now uses your changes — use the Self-Mod tab to review.`;
  }
  m = text.match(/(?:append|add)\s+(?:to\s+)?(?:the\s+)?module\s+["']?([a-z0-9._-]+)["']?\s*[::]\s*(.+)/i);
  if (m) {
    const ok = appendToModule(m[1].trim(), m[2].trim());
    return ok ? `✅ Appended to module **${m[1].trim()}**.` : `Module "${m[1].trim()}" not found.`;
  }
  m = text.match(/read module\s+["']?([a-z0-9._-]+)["']?\s*$/i);
  if (m) {
    const mod = readModule(m[1].trim());
    if (!mod) return `Module "${m[1].trim()}" not found.`;
    actions.push({ type: 'tab', tab: 'selfmod' });
    return `📄 **${mod.id}** (${mod.description})\n\n\`\`\`javascript\n${mod.code.slice(0, 600)}${mod.code.length > 600 ? '\n…' : ''}\n\`\`\`\n\nFull source in the **Self-Mod** panel.`;
  }
  m = text.match(/restore\s+(?:the\s+)?(?:last\s+)?backup\s+["']?([a-z0-9.-]+)?["']?\s*$/i);
  if (m && /restore/i.test(text)) {
    const ref = m[1] ?? 'last';
    return restoreBackup(ref)
      ? `✅ Restored backup ${ref === 'last' ? '(most recent)' : `"${ref}"`}.`
      : `No backup found${ref === 'last' ? '' : ` matching "${ref}"`}. Say "list backups".`;
  }
  m = text.match(/add custom tool\s+["']?([a-z0-9 _-]+)["']?\s*[::]\s*(.+)/i);
  if (m) {
    try {
      const ok = addCustomTool(m[1].trim(), '', m[2].trim());
      return ok ? `✅ Custom tool **${m[1].trim()}** registered. "run custom tool ${m[1].trim()}" to test it.` : 'That tool name already exists.';
    } catch (e) {
      return `❌ ${(e as Error).message}`;
    }
  }
  m = text.match(/remove custom tool\s+["']?([a-z0-9 _-]+)["']?\s*$/i);
  if (m) {
    return removeCustomTool(m[1].trim()) ? `🗑️ Removed custom tool **${m[1].trim()}**.` : 'Tool not found.';
  }
  m = text.match(/run custom tool\s+["']?([a-z0-9 _-]+)["']?\s*$/i);
  if (m) {
    const result = runCustomTool(m[1].trim());
    return result.error
      ? `❌ Tool error: ${result.error}`
      : `🛠️ **${m[1].trim()}** output:\n\n\`\`\`\n${String(result.output)}\n\`\`\``;
  }
  return null;
}

/** System deep-dive request (async — the App layer executes it). */
export async function runDetailedStatus(): Promise<string> {
  const { getDetailedStatus } = await import('./monitors');
  return getDetailedStatus();
}

// ─── exports for App integration ──────────────────────────────────────────

/** Register an out-of-band action (used for async search/research results). */
export function registerAction(action: BrainAction): void {
  actionsTracker.push(action);
}

export function drainActions(): BrainAction[] {
  return actionsTracker.splice(0, actionsTracker.length);
}

export function getBrainState(): Record<string, unknown> {
  return {
    lastAction,
    lastTopicKey,
    codeRunCount,
    topicsCovered: getTopicsCovered(),
    hasDiscussedTopic: (t: string) => hasDiscussedTopic(t),
    conversationStyle: detectConversationStyle(),
    memoryStats: getMemoryStats(),
    recentStatements: context.jarvisMemory.recentStatements.slice(0, 5),
    awaitingResponse: isAwaitingResponse(),
  };
}

export function resetBrain(): void {
  lastAction = '';
  lastTopicKey = '';
  codeRunCount = 0;
  resetConversation();
}

export function getCodeRunCount(): number {
  return codeRunCount;
}

// ─── async helpers for the App layer ──────────────────────────────────────
// asyncSearch, runResearch, runGithubCommand, generateAsciiArt are exported
// at their declaration sites.
