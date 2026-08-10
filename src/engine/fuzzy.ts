// ─── Fuzzy text correction + normalization ───────────────────────────────

/** 150+ common typos, command words and app names mapped to their fixes. */
export const CORRECTIONS: Array<[string, string]> = [
  // common typos
  ['teh', 'the'], ['recieve', 'receive'], ['seperate', 'separate'], ['definately', 'definitely'],
  ['wich', 'which'], ['thier', 'their'], ['wether', 'whether'], ['untill', 'until'],
  ['alot', 'a lot'], ['begining', 'beginning'], ['beleive', 'believe'], ['calender', 'calendar'],
  ['comming', 'coming'], ['freind', 'friend'], ['gona', 'going to'], ['gonna', 'going to'],
  ['wanna', 'want to'], ['kinda', 'kind of'], ['sorta', 'sort of'], ['dont', 'do not'],
  ['cant', 'cannot'], ['wont', 'will not'], ['isnt', 'is not'], ['wasnt', 'was not'],
  ['arent', 'are not'], ['didnt', 'did not'], ['doesnt', 'does not'], ['couldnt', 'could not'],
  ['shouldnt', 'should not'], ['wouldnt', 'would not'], ['havent', 'have not'], ['hasnt', 'has not'],
  ['im', 'i am'], ['ive', 'i have'], ['id', 'i would'], ['ill', 'i will'], ['youre', 'you are'],
  ['youve', 'you have'], ['theyre', 'they are'], ["we're", 'we are'], ['lets', 'let us'],
  ['whos', 'who is'], ['whats', 'what is'], ['hows', 'how is'], ['wheres', 'where is'],
  ['ther', 'there'], ['wat', 'what'], ['wht', 'what'], ['wen', 'when'], ['waht', 'what'],
  ['wather', 'weather'], ['wheater', 'weather'], ['gud', 'good'], ['gret', 'great'], ['gr8', 'great'],
  ['gooda', 'good'], ['wel', 'well'], ['comon', 'come on'], ['anywya', 'anyway'], ['becuase', 'because'],
  ['hw', 'how'], ['hw', 'how'], ['plz', 'please'], ['pls', 'please'], ['thx', 'thanks'],
  ['ty', 'thank you'], ['k', 'okay'], ['kk', 'okay'], ['yep', 'yes'], ['yea', 'yes'],
  ['nope', 'no'], ['nah', 'no'], ['idk', 'i do not know'], ['idc', 'i do not care'],
  ['lol', 'laughing out loud'], ['brb', 'be right back'], ['btw', 'by the way'],
  ['omg', 'oh my god'], ['imo', 'in my opinion'], ['fyi', 'for your information'],
  ['tbh', 'to be honest'], ['rn', 'right now'], ['asap', 'as soon as possible'],
  ['u', 'you'], ['ur', 'your'], ['ya', 'you'], ['yall', 'you all'], ['ppl', 'people'],
  ['tho', 'though'], ['cuz', 'because'], ['coz', 'because'], ['bcos', 'because'],
  ['gimme', 'give me'], ['lemme', 'let me'], ['gotta', 'got to'], ['hafta', 'have to'],
  ['coulda', 'could have'], ['shoulda', 'should have'], ['woulda', 'would have'],
  ['lotsa', 'lots of'], ['kinda', 'kind of'], ['cmon', 'come on'], ["c'mon", 'come on'],
  ['dunno', 'do not know'], ['sup', 'what is up'], ['howzit', 'how is it'],
  ['luv', 'love'], ['gr8', 'great'], ['2morrow', 'tomorrow'], ['2day', 'today'],
  ['2nite', 'tonight'], ['b4', 'before'], ['bday', 'birthday'], ['msg', 'message'],
  ['pic', 'picture'], ['pics', 'pictures'], ['fav', 'favorite'], ['fave', 'favorite'],
  ['probs', 'probably'], ['prob', 'probably'], ['def', 'definitely'], ['defo', 'definitely'],
  ['certs', 'certainly'], ['bs', 'bullshit'], ['sfw', 'safe for work'], ['nsfw', 'not safe for work'],
  ['fr', 'for real'], ['frfr', 'for real'], ['ngl', 'not going to lie'],
  ['smth', 'something'], ['sth', 'something'], ['smt', 'something'], ['abt', 'about'],
  ['bc', 'because'], ['bcz', 'because'], ['w/', 'with'], ['w/o', 'without'],
  ['&', 'and'], ['n', 'and'],
  // command words
  ['open', 'open'], ['opn', 'open'], ['launch', 'open'], ['luanch', 'open'], ['strt', 'start'],
  ['start', 'start'], ['run', 'run'], ['exec', 'execute'], ['execute', 'execute'],
  ['create', 'create'], ['cr8', 'create'], ['make', 'make'], ['mke', 'make'], ['write', 'write'],
  ['wrte', 'write'], ['save', 'save'], ['sve', 'save'], ['delete', 'delete'], ['del', 'delete'],
  ['rm', 'delete'], ['remove', 'delete'], ['list', 'list'], ['lst', 'list'], ['ls', 'list'],
  ['show', 'show'], ['shw', 'show'], ['display', 'show'], ['search', 'search'],
  ['srch', 'search'], ['find', 'search'], ['lookup', 'search'], ['google', 'search'],
  ['calculate', 'calculate'], ['calc', 'calculate'], ['compute', 'calculate'],
  ['download', 'download'], ['dwnld', 'download'], ['copy', 'copy'], ['cpy', 'copy'],
  ['move', 'move'], ['mv', 'move'], ['rename', 'rename'], ['rnme', 'rename'],
  ['file explorer', 'file explorer'], ['explorer', 'file explorer'],
  ['play', 'play'], ['ply', 'play'], ['tell', 'tell'], ['tl', 'tell'], ['say', 'say'],
  ['joke', 'joke'], ['jok', 'joke'], ['funny', 'joke'], ['sing', 'sing'], ['sng', 'sing'],
  ['dance', 'dance'], ['story', 'story'], ['storytime', 'story'], ['fact', 'fact'],
  ['fct', 'fact'], ['weather', 'weather'], ['wthr', 'weather'], ['time', 'time'],
  ['clock', 'time'], ['help', 'help'], ['hlp', 'help'], ['set', 'set'], ['get', 'get'],
  ['clear', 'clear'], ['clr', 'clear'], ['backup', 'backup'], ['restore', 'restore'],
  ['quit', 'quit'], ['exit', 'exit'], ['bye', 'goodbye'], ['goodbye', 'goodbye'],
  // app names
  ['youtube', 'youtube'], ['youtub', 'youtube'], ['yt', 'youtube'], ['tube', 'youtube'],
  ['spotify', 'spotify'], ['spofity', 'spotify'], ['spotfiy', 'spotify'],
  ['netflix', 'netflix'], ['netfix', 'netflix'], ['netlix', 'netflix'],
  ['discord', 'discord'], ['dicord', 'discord'], ['disord', 'discord'],
  ['twitch', 'twitch'], ['twtich', 'twitch'], ['twitter', 'twitter'], ['twiter', 'twitter'],
  ['x twitter', 'twitter'], ['instagram', 'instagram'], ['insta', 'instagram'], ['ig', 'instagram'],
  ['tiktok', 'tiktok'], ['tictok', 'tiktok'], ['snapchat', 'snapchat'], ['snap', 'snapchat'],
  ['whatsapp', 'whatsapp'], ['whatsap', 'whatsapp'], ['wa', 'whatsapp'],
  ['telegram', 'telegram'], ['telgram', 'telegram'], ['facebook', 'facebook'], ['fb', 'facebook'],
  ['reddit', 'reddit'], ['redit', 'reddit'], ['github', 'github'], ['git hub', 'github'],
  ['stack overflow', 'stack overflow'], ['stackoverflow', 'stack overflow'], ['so', 'stack overflow'],
  ['gmail', 'gmail'], ['gmaill', 'gmail'], ['google', 'google'], ['googel', 'google'],
  ['chrome', 'chrome'], ['crhome', 'chrome'], ['firefox', 'firefox'], ['fire fox', 'firefox'],
  ['edge', 'edge'], ['brave', 'brave'], ['safari', 'safari'], ['opera', 'opera'],
  ['vs code', 'visual studio code'], ['vscode', 'visual studio code'], ['visual studio', 'visual studio'],
  ['code editor', 'visual studio code'], ['intellij', 'intellij idea'], ['pycharm', 'pycharm'],
  ['word', 'microsoft word'], ['excel', 'microsoft excel'], ['powerpoint', 'powerpoint'],
  ['outlook', 'outlook'], ['teams', 'microsoft teams'], ['notion', 'notion'],
  ['slack', 'slack'], ['zoom', 'zoom'], ['meet', 'google meet'], ['google meet', 'google meet'],
  ['steam', 'steam'], ['epic games', 'epic games'], ['epic', 'epic games'],
  ['roblox', 'roblox'], ['roblx', 'roblox'], ['minecraft', 'minecraft'], ['mine craft', 'minecraft'],
  ['fortnite', 'fortnite'], ['fortnight', 'fortnite'], ['valorant', 'valorant'],
  ['cod', 'call of duty'], ['call of duty', 'call of duty'], ['gta', 'grand theft auto'],
  ['gtav', 'grand theft auto v'], ['csgo', 'counter strike'], ['counter strike', 'counter strike'],
  ['pubg', 'pubg'], ['apex', 'apex legends'], ['league', 'league of legends'], ['lol game', 'league of legends'],
  ['overwatch', 'overwatch'], ['rocket league', 'rocket league'], ['fifa', 'fifa'],
  ['photoshop', 'photoshop'], ['ps', 'photoshop'], ['premiere', 'adobe premiere'],
  ['after effects', 'after effects'], ['figma', 'figma'], ['canva', 'canva'],
  ['spotify web', 'spotify'], ['amazon', 'amazon'], ['amzn', 'amazon'], ['ebay', 'ebay'],
  ['paypal', 'paypal'], ['venmo', 'venmo'], ['uber', 'uber'], ['lyft', 'lyft'],
  ['maps', 'google maps'], ['google maps', 'google maps'], ['map', 'google maps'],
  ['translate', 'google translate'], ['drive', 'google drive'], ['google drive', 'google drive'],
  ['dropbox', 'dropbox'], ['icloud', 'icloud'], ['one drive', 'one drive'],
  ['wikipedia', 'wikipedia'], ['wiki', 'wikipedia'], ['calculator app', 'calculator'],
  ['notepad', 'notepad'], ['text editor', 'text editor'], ['terminal', 'terminal'],
  ['cmd', 'terminal'], ['command prompt', 'terminal'], ['powershell', 'powershell'],
  ['file explorer', 'file explorer'], ['explorer', 'file explorer'],
  ['paint', 'paint'], ['mspaint', 'paint'], ['calculator', 'calculator'],
  ['settings', 'settings'], ['control panel', 'control panel'], ['task manager', 'task manager'],
  ['recycle bin', 'recycle bin'], ['camera', 'camera'], ['photos', 'photos'],
  ['music', 'music player'], ['vlc', 'vlc media player'], ['winamp', 'winamp'],
  ['audacity', 'audacity'], ['obs', 'obs studio'], ['blender', 'blender'],
  ['unity', 'unity'], ['unreal', 'unreal engine'], ['godot', 'godot'],
  ['docker', 'docker'], ['kubernetes', 'kubernetes'], ['k8s', 'kubernetes'],
  ['postman', 'postman'], ['insomnia', 'insomnia'], ['git', 'git'], ['bash', 'bash'],
  ['node', 'node js'], ['nodejs', 'node js'], ['npm', 'npm'], ['python', 'python'],
  ['pythn', 'python'], ['py', 'python'], ['java', 'java'], ['javasript', 'javascript'],
  ['js', 'javascript'], ['ts', 'typescript'], ['cpp', 'c plus plus'], ['c++', 'c plus plus'],
  ['c#', 'c sharp'], ['csharp', 'c sharp'], ['rust', 'rust'], ['go lang', 'go'],
];

export const CORRECTION_MAP: Record<string, string> = Object.fromEntries(CORRECTIONS);

/** Levenshtein edit distance between two strings. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/** Fuzzy-match a word against a dictionary of keys. */
export function fuzzyMatchWord(
  word: string,
  dict: Record<string, string>,
  threshold = 0.78,
): string | null {
  if (dict[word]) return dict[word];
  const lower = word.toLowerCase();
  let best: string | null = null;
  let bestScore = 0;
  for (const key of Object.keys(dict)) {
    const dist = levenshtein(lower, key);
    const score = 1 - dist / Math.max(lower.length, key.length);
    if (score >= threshold && score > bestScore) {
      bestScore = score;
      best = dict[key];
    }
  }
  return best;
}

/** Intent keyword dictionary used for fuzzy matching. */
export const INTENT_WORDS: Record<string, string> = {
  hello: 'greeting', hi: 'greeting', hey: 'greeting', yo: 'greeting', greetings: 'greeting',
  morning: 'greeting', afternoon: 'greeting', evening: 'greeting', sup: 'greeting',
  bye: 'goodbye', goodbye: 'goodbye', quit: 'goodbye', exit: 'goodbye', see: 'goodbye',
  later: 'goodbye', sleep: 'goodbye', night: 'goodbye',
  thanks: 'thanks', thank: 'thanks', appreciate: 'thanks', grateful: 'thanks', thx: 'thanks',
  yes: 'affirm', yeah: 'affirm', yep: 'affirm', sure: 'affirm', correct: 'affirm', right: 'affirm',
  ok: 'affirm', okay: 'affirm', definitely: 'affirm', absolutely: 'affirm', indeed: 'affirm',
  no: 'deny', nope: 'deny', nah: 'deny', wrong: 'deny', never: 'deny', dont: 'deny', not: 'deny',
  joke: 'joke', funny: 'joke', humor: 'joke', laugh: 'joke', hilarious: 'joke',
  story: 'story', tale: 'story', anecdote: 'story',
  fact: 'fact', trivia: 'fact', interesting: 'fact', cool: 'fact', wow: 'fact',
  bored: 'bored', boring: 'bored', nothing: 'bored', entertain: 'bored',
  open: 'open_app', launch: 'open_app', start: 'open_app', run: 'open_app', play: 'open_app',
  apps: 'list_apps', programs: 'list_apps', applications: 'list_apps',
  dice: 'dice', roll: 'dice', die: 'dice',
  coin: 'coin', flip: 'coin', heads: 'coin', tails: 'coin',
  number: 'random_number', random: 'random_number', generate: 'random_number',
  sing: 'sing', song: 'sing', music: 'sing',
  how: 'how_are_you', are: 'how_are_you', doing: 'how_are_you', feeling: 'emotion', feel: 'emotion',
  who: 'identity', your: 'identity', jarvis: 'identity', name: 'identity', creator: 'identity',
  help: 'help', commands: 'help', options: 'help', features: 'help', what: 'help', can: 'help', do: 'help',
  compliment: 'compliment', nice: 'compliment', good: 'compliment', awesome: 'compliment', great: 'compliment',
  insult: 'insult', stupid: 'insult', dumb: 'insult', bad: 'insult', suck: 'insult', hate: 'insult',
  time: 'time', clock: 'time', date: 'time', today: 'time',
  weather: 'weather', temperature: 'weather', rain: 'weather', forecast: 'weather',
  calculate: 'calculate', math: 'calculate', compute: 'calculate', plus: 'calculate', minus: 'calculate', times: 'calculate', divided: 'calculate',
  system: 'system', status: 'system', monitor: 'system', stats: 'system', cpu: 'system', memory: 'system', ram: 'system',
  search: 'search', google: 'search', lookup: 'search', find: 'search', web: 'search', wikipedia: 'search',
  research: 'research', deep: 'research', study: 'research',
  modules: 'list_modules', module: 'list_modules',
  selfmod: 'selfmod_help', modify: 'selfmod_help', edit: 'selfmod_help', customize: 'selfmod_help', hack: 'selfmod_help',
  backup: 'list_backups', restore: 'list_backups', backups: 'list_backups',
  tools: 'list_tools', tool: 'list_tools',
  profile: 'profile', account: 'profile', me: 'profile',
  signout: 'signout', logout: 'signout', sign: 'signout',
  notes: 'notes', note: 'save_note', remember: 'save_note',
  opinion: 'opinion', think: 'opinion', believe: 'opinion', view: 'opinion',
  continue: 'continue', again: 'continue', more: 'continue', another: 'continue',
  science: 'list_science', formula: 'list_science', physics: 'list_science', chemistry: 'list_science', biology: 'list_science',
  cross: 'cross_reference', related: 'cross_reference', reference: 'cross_reference',
  schedule: 'schedule', class: 'schedule', timetable: 'schedule', homework: 'schedule', exam: 'schedule',
};

/** Common words that must never be altered by fuzzy matching. */
const NEVER_FUZZY = new Set([
  'file', 'files', 'who', 'what', 'why', 'how', 'when', 'where', 'which', 'research', 'search',
  'the', 'and', 'for', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'not', 'but',
  'open', 'close', 'list', 'show', 'create', 'make', 'write', 'read', 'save', 'delete',
  'move', 'copy', 'rename', 'set', 'get', 'run', 'play', 'start', 'stop', 'help', 'hello',
  'please', 'can', 'you', 'your', 'with', 'from', 'into', 'about', 'will', 'would', 'could',
  'should', 'do', 'does', 'did', 'this', 'that', 'there', 'here', 'tell', 'say', 'joke',
  'story', 'fact', 'time', 'weather', 'system', 'status', 'memory', 'backup', 'restore',
  'tool', 'tools', 'apps', 'app', 'project', 'projects', 'task', 'schedule', 'class',
  'week', 'science', 'physics', 'math', 'music', 'video', 'code', 'script', 'program',
  'python', 'game', 'bot', 'animation', 'github', 'token', 'repo', 'folder', 'note',
  'notes', 'remember', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
  'sunday', 'morning', 'afternoon', 'evening', 'night', 'today', 'tomorrow', 'yesterday',
]);

const CONTRACTIONS: Array<[RegExp, string]> = [
  [/\bdon't\b/gi, 'do not'], [/\bcan't\b/gi, 'cannot'], [/\bwon't\b/gi, 'will not'],
  [/\bisn't\b/gi, 'is not'], [/\baren't\b/gi, 'are not'], [/\bwasn't\b/gi, 'was not'],
  [/\bweren't\b/gi, 'were not'], [/\bdoesn't\b/gi, 'does not'], [/\bdidn't\b/gi, 'did not'],
  [/\bcouldn't\b/gi, 'could not'], [/\bshouldn't\b/gi, 'should not'], [/\bwouldn't\b/gi, 'would not'],
  [/\bhaven't\b/gi, 'have not'], [/\bhasn't\b/gi, 'has not'], [/\bhadn't\b/gi, 'had not'],
  [/\bi'm\b/gi, 'i am'], [/\bwe're\b/gi, 'we are'], [/\byou're\b/gi, 'you are'],
  [/\bthey're\b/gi, 'they are'], [/\bit's\b/gi, 'it is'], [/\bthat's\b/gi, 'that is'],
  [/\bwhat's\b/gi, 'what is'], [/\bwho's\b/gi, 'who is'], [/\bwhere's\b/gi, 'where is'],
  [/\bhow's\b/gi, 'how is'], [/\bwhen's\b/gi, 'when is'], [/\blet's\b/gi, 'let us'],
  [/\bi've\b/gi, 'i have'], [/\byou've\b/gi, 'you have'], [/\bwe've\b/gi, 'we have'],
  [/\bthey've\b/gi, 'they have'], [/\bi'll\b/gi, 'i will'], [/\byou'll\b/gi, 'you will'],
  [/\bwe'll\b/gi, 'we will'], [/\bthey'll\b/gi, 'they will'], [/\bit'll\b/gi, 'it will'],
  [/\bi'd\b/gi, 'i would'], [/\byou'd\b/gi, 'you would'], [/\bhe'd\b/gi, 'he would'],
  [/\bshe'd\b/gi, 'she would'], [/\bthey'd\b/gi, 'they would'], [/\bit'd\b/gi, 'it would'],
  [/\bshe's\b/gi, 'she is'], [/\bhe's\b/gi, 'he is'], [/\bthere's\b/gi, 'there is'],
  [/\bhere's\b/gi, 'here is'], [/\bgonna\b/gi, 'going to'], [/\bwanna\b/gi, 'want to'],
  [/\bgotta\b/gi, 'got to'], [/\bgimme\b/gi, 'give me'], [/\blemme\b/gi, 'let me'],
  [/\boughta\b/gi, 'ought to'], [/\bkinda\b/gi, 'kind of'], [/\bsorta\b/gi, 'sort of'],
  [/\bc'mon\b/gi, 'come on'], [/\bcmon\b/gi, 'come on'], [/\bcuz\b/gi, 'because'],
  [/\bcoz\b/gi, 'because'], [/\b'cause\b/gi, 'because'], [/\bimma\b/gi, 'i am going to'],
  [/\bdunno\b/gi, 'do not know'], [/\bsupposed to\b/gi, 'supposed to'],
];

/** Normalize raw user text: lowercase, fix typos, expand contractions. */
export function normalize(text: string): string {
  let out = ' ' + text.trim().replace(/\s+/g, ' ') + ' ';
  // 1) exact dictionary corrections (word-boundary, case-insensitive)
  const lower = out.toLowerCase();
  for (const [from, to] of CORRECTIONS) {
    if (from.length < 2) continue;
    const re = new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (re.test(lower)) {
      out = out.replace(re, to);
    }
  }
  // 2) contraction expansion
  for (const [re, to] of CONTRACTIONS) out = out.replace(re, to);
  // 3) fuzzy-match unknown words against the correction dictionary
  //    (only longer words, high confidence, and never common words)
  const words = out.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const w = words[i].replace(/[^a-zA-Z']/g, '');
    if (w.length < 4 || NEVER_FUZZY.has(w)) continue;
    const fix = fuzzyMatchWord(w, CORRECTION_MAP, 0.85);
    if (fix && fix !== w) words[i] = words[i].replace(w, fix);
  }
  return words.join(' ').replace(/\s+/g, ' ').trim();
}

/** Heuristic: does this text look like a question? */
export function looksLikeQuestion(text: string): boolean {
  const t = text.trim();
  if (t.endsWith('?')) return true;
  return /^(what|why|how|when|where|who|which|whom|whose|is|are|can|could|would|should|do|does|did|will|shall|may|might|am)\b/i.test(t);
}

/** Strip conversational filler to find the real search query. */
export function extractSearchQuery(text: string): string {
  return normalize(text)
    .replace(/^(please|pls|hey|hi|hello|jarvis|yo|ok|okay|so|umm|uh|like)\s+/gi, '')
    .replace(/^(search|google|look up|lookup|find|what is|what are|whats|who is|who are|tell me about|tell me|about|explain|define)\s+/gi, '')
    .replace(/\?+$/g, '')
    .trim();
}
