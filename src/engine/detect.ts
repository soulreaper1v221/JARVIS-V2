// ─── Intent detection: ~40 intents with scoring ───────────────────────────

export interface IntentResult {
  intent: string;
  score: number;
  needsSearch: boolean;
  needsScience: boolean;
  isQuestion: boolean;
  isFollowUp: boolean;
  isCommand: boolean;
  mood?: string;
  params?: Record<string, string>;
}

interface IntentRule {
  intent: string;
  patterns: RegExp[];
  weight?: number;
  flags?: Partial<Pick<IntentResult, 'needsSearch' | 'needsScience' | 'isQuestion' | 'isCommand' | 'mood'>>;
}

const RULES: IntentRule[] = [
  { intent: 'greeting', patterns: [/^(hi|hello|hey|yo|hiya|howdy|greetings|good (morning|afternoon|evening))\b/i, /^(sup|what's up|whats up|whats good)\b/i], weight: 3 },
  { intent: 'goodbye', patterns: [/\b(bye|goodbye|see you|see ya|good night|goodnight|peace out|gotta go|i'm out|im out)\b/i], weight: 2 },
  { intent: 'thanks', patterns: [/\b(thanks|thank you|thx|tyvm|appreciate (it|that)|grateful)\b/i], weight: 2 },
  { intent: 'affirm', patterns: [/^(yes|yeah|yep|yup|sure|correct|right|ok|okay|alright|absolutely|definitely|indeed|true|affirmative)\b/i, /^yeah sure/i], weight: 1.5 },
  { intent: 'deny', patterns: [/^(no|nope|nah|not really|negative|wrong|incorrect)\b/i, /^(no thanks|no thank you|not that)\b/i], weight: 1.5 },
  { intent: 'joke', patterns: [/\b(joke|jokes|funny|make me laugh|humor|humour|comedy|tell me something funny)\b/i], weight: 2 },
  { intent: 'story', patterns: [/\b(story|stories|tale|anecdote|bedtime story|fable)\b/i], weight: 2 },
  { intent: 'fact', patterns: [/\b(fact|facts|trivia|fun fact|did you know|interesting fact|random fact)\b/i], weight: 2 },
  { intent: 'bored', patterns: [/\b(bored|boring|nothing to do|entertain me|kill time|i'm bored)\b/i], weight: 2 },
  { intent: 'open_app', patterns: [/\b(open|launch|start|run|play|go to|take me to|fire up)\s+(the\s+)?[a-z]+\b/i], weight: 1.5, flags: { isCommand: true } },
  { intent: 'list_apps', patterns: [/\b(list|show|what)\s+(me\s+)?(all\s+)?(apps|applications|programs|software)\b/i, /\bwhat apps do you (have|know)\b/i], weight: 2 },
  { intent: 'dice', patterns: [/\b(roll|throw|toss)\s+(a\s+)?dice?\b/i, /\bdice\b/i], weight: 2 },
  { intent: 'coin', patterns: [/\bflip\s+(a\s+)?coin\b/i, /\b(coin flip|heads or tails)\b/i], weight: 2 },
  { intent: 'random_number', patterns: [/\b(random number|random no|pick a number|give me a number|random integer)\b/i], weight: 2 },
  { intent: 'sing', patterns: [/\b(sing|song|serenade|hum)\b/i, /\bsing me something\b/i], weight: 2 },
  { intent: 'how_are_you', patterns: [/\bhow are you\b/i, /\bhow's it going\b/i, /\bhow do you feel\b/i, /\bwhat's up with you\b/i], weight: 2 },
  {
    intent: 'emotion', patterns: [
      /\bi'?m (feeling|so|really|very)?\s*(happy|sad|angry|mad|excited|anxious|nervous|worried|tired|exhausted|bored|confused|stressed|overwhelmed|lonely|grateful|hopeful|proud|guilty|jealous|shy|surprised|scared|afraid|calm|nostalgic|frustrated|annoyed|disappointed|sick|depressed|down|glad|content|inspired|motivated|insecure|hurt|hopeless)\b/i,
      /\bi feel (so |really |very )?(happy|sad|angry|mad|excited|anxious|nervous|worried|tired|bored|confused|stressed|overwhelmed|lonely|grateful|hopeful|proud|guilty|jealous|shy|surprised|scared|afraid|calm|nostalgic|frustrated|annoyed|disappointed|sick|down|glad|content|inspired|motivated|insecure|hurt|hopeless)\b/i,
    ], weight: 2.5,
  },
  { intent: 'identity', patterns: [/\b(who are you|what are you|your name|jarvis|tell me about yourself|what can you do|who made you|who created you)\b/i], weight: 2 },
  { intent: 'help', patterns: [/\b(help|commands|options|features|what can i do|how do i use|tutorial|guide me)\b/i], weight: 2 },
  { intent: 'compliment', patterns: [/\b(you('re| are) (awesome|amazing|great|the best|smart|cool|clever|incredible|brilliant)|i love you|nice job|good job)\b/i], weight: 2 },
  { intent: 'insult', patterns: [/\b(you('re| are) (stupid|dumb|useless|terrible|awful|bad|the worst)|you suck|shut up)\b/i], weight: 2 },
  { intent: 'time', patterns: [/\b(what time|time is it|the time|current time|what's the date|today'?s date|what day is)\b/i], weight: 2 },
  { intent: 'weather', patterns: [/\b(weather|temperature|forecast|raining|rainy|sunny|snow|cloudy|hot|cold outside)\b/i], weight: 2 },
  { intent: 'calculate', patterns: [/\b(calculate|compute|math|what is \d|how much is|evaluate|solve|equals|plus|minus|times|divided by)\b/i, /^[\d(][\d+\-*/().^% ]*[\d)]\??$/], weight: 2.5 },
  { intent: 'system', patterns: [/\b(system status|system stats|status report|monitor|how's the system|performance|cpu usage|ram usage|memory usage|diagnostics|hardware)\b/i, /\bwhat's my (cpu|ram|memory|battery)\b/i], weight: 2 },
  { intent: 'search', patterns: [/\b(search|google|look up|lookup|find (out|info|about)|what is the (meaning|definition)|web search|who is|what are|research online|look it up)\b/i], weight: 1.5, flags: { needsSearch: true, isQuestion: true } },
  { intent: 'research', patterns: [/\b(research|deep research|study|investigate|analyze in depth)\b/i], weight: 2, flags: { needsSearch: true, isQuestion: true } },
  { intent: 'list_modules', patterns: [/\b(list|show|view)\s+(the\s+)?modules?\b/i, /\bwhat modules\b/i], weight: 2 },
  { intent: 'selfmod_help', patterns: [/\b(self[- ]mod|modify (yourself|your (code|brain|modules))|edit (a|your|the) module|customize (yourself|your)|hack yourself|add a custom tool|show (me )?backups)\b/i], weight: 2 },
  { intent: 'list_backups', patterns: [/\b(list|show|view)\s+(the\s+)?backups?\b/i, /\b(restore|rollback|undo)\s+(the\s+)?(last )?(backup|change|edit)\b/i], weight: 2 },
  { intent: 'list_tools', patterns: [/\b(list|show|view)\s+(the\s+)?(tools|utilities)\b/i, /\bwhat tools\b/i], weight: 2 },
  { intent: 'profile', patterns: [/\b(my profile|show (me )?my (profile|account|stats)|profile info|who am i|what do you know about me)\b/i], weight: 2 },
  { intent: 'signout', patterns: [/\b(sign out|signout|log out|logout|switch user|switch profile)\b/i], weight: 2, flags: { isCommand: true } },
  { intent: 'notes', patterns: [/\b(my notes|show (me )?notes|list notes|view notes)\b/i], weight: 2 },
  { intent: 'save_note', patterns: [/\b(remember|note this|write this down|save a note|note:|remind me)\b/i, /\badd (a )?note\b/i], weight: 2, flags: { isCommand: true } },
  { intent: 'set_name', patterns: [/\b(call me|my name is|i am called|you can call me)\b/i], weight: 2.5 },
  { intent: 'opinion', patterns: [/\b(what do you think about|your opinion on|what's your take|how do you feel about|do you like)\b/i], weight: 2, flags: { isQuestion: true } },
  { intent: 'continue', patterns: [/\b(continue|go on|keep going|tell me more|more|another one|again|next)\b/i], weight: 1.5 },
  { intent: 'self_reference', patterns: [/\b(what did you (say|tell me)|you said earlier|what were we talking about|remember when)\b/i], weight: 2 },
  { intent: 'list_science', patterns: [/\b(science (facts|topics)|physics|chemistry|biology|astronomy|mathematics|medicine|earth science|computer science|formula|periodic table|explain (the )?(concept|formula))\b/i], weight: 1.5, flags: { needsScience: true } },
  { intent: 'cross_reference', patterns: [/\b(cross[- ]reference|related (concepts|topics)|how does .+ relate to|connections between|link (between|to))\b/i], weight: 2, flags: { needsScience: true } },
  { intent: 'schedule', patterns: [/\b(schedule|timetable|class(es)? today|do i have (class|work|school)|what class|next class|week (a|b)|exam schedule)\b/i, /^(set|show|view|clear)\s+(my |the )?(schedule|timetable)/i], weight: 3 },
  { intent: 'code', patterns: [/\b(write|generate|create|build|make|code|script|program|function|class|animation|canvas|game|bot|gsc|zombies|mod menu)\b/i], weight: 0.8 },
  { intent: 'file', patterns: [/\b(create file|write file|save file|read file|delete file|list files|show files|new folder|make folder|download file|move file|copy file|rename file|search files)\b/i], weight: 1.5, flags: { isCommand: true } },
  { intent: 'project', patterns: [/\b(create project|add task|my projects|project status|complete task|new project)\b/i], weight: 2, flags: { isCommand: true } },
  { intent: 'github', patterns: [/\b(github|create repo|push (to )?github|list repos|git repo|set github)\b/i], weight: 1.5, flags: { isCommand: true } },
  { intent: 'build_exe', patterns: [/\b(build|make|create)\s+(an?\s+)?(\.exe|exe|executable|desktop app|electron app)\b/i], weight: 2, flags: { isCommand: true } },
];

export const MOODS = [
  'happy', 'sad', 'angry', 'excited', 'anxious', 'grateful', 'lonely', 'tired', 'curious', 'bored',
  'confused', 'stressed', 'hopeful', 'proud', 'guilty', 'jealous', 'shy', 'surprised', 'calm', 'scared',
  'nostalgic', 'loved', 'confident', 'insecure', 'overwhelmed', 'content', 'inspired', 'disappointed',
  'frustrated', 'sick', 'hopeless', 'grieving', 'hurt', 'amused', 'satisfied',
];

const FOLLOW_UP = /\b(and|but|so|then|also|anyway|actually|well|besides|what about|how about|wait|by the way)\b/i;
const QUESTION = /\b(what|why|how|when|where|who|which|is|are|can|could|would|should|do|does|did|will)\b/i;

export function detect(input: string): IntentResult {
  const text = input.trim();
  let best: { intent: string; score: number; flags?: IntentRule['flags'] } | null = null;

  for (const rule of RULES) {
    let score = 0;
    for (const pattern of rule.patterns) {
      const m = text.match(pattern);
      if (m) {
        score += (rule.weight ?? 1) * (m[0].length / Math.max(text.length, 1) > 0.35 ? 1.3 : 1);
        break;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { intent: rule.intent, score, flags: rule.flags };
    }
  }

  const mood = detectMood(text);
  const isQuestion = QUESTION.test(text) || text.endsWith('?');
  const isFollowUp = FOLLOW_UP.test(text) && !/^(what|why|how)\b/i.test(text);
  const intent = best?.intent ?? 'unknown';
  const score = best?.score ?? 0;

  return {
    intent,
    score,
    needsSearch: (best?.flags?.needsSearch ?? false) || (intent === 'search' && isQuestion),
    needsScience: best?.flags?.needsScience ?? false,
    isQuestion,
    isFollowUp,
    isCommand: best?.flags?.isCommand ?? false,
    mood,
    params: extractParams(text, intent),
  };
}

function detectMood(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const m of MOODS) {
    if (new RegExp(`\\b${m}\\b`).test(lower)) return m;
  }
  if (/\b(haha|lol|hahaha)\b/.test(lower)) return 'amused';
  if (/\b(meh|eh)\b/.test(lower)) return 'indifferent';
  return undefined;
}

function extractParams(text: string, intent: string): Record<string, string> | undefined {
  const params: Record<string, string> = {};
  if (intent === 'open_app' || intent === 'list_apps') {
    const m = text.match(/\b(?:open|launch|start|run|play|go to|take me to|fire up)\s+(?:the\s+)?([a-z0-9 .]+?)(?:\s+for\s+me)?[?.!]?$/i);
    if (m) params.app = m[1].trim();
  }
  if (intent === 'weather') {
    const m = text.match(/in\s+([a-z\s]+?)(?:\?|$)/i);
    if (m) params.city = m[1].trim();
  }
  if (intent === 'save_note') {
    const m = text.match(/(?:remember|note this|write this down|note:|save a note)[:,\s]*(.*)$/i);
    if (m) params.note = m[1].trim();
  }
  if (intent === 'set_name') {
    const m = text.match(/(?:call me|my name is|i am called|you can call me)\s+([a-z0-9]+)/i);
    if (m) params.name = m[1];
  }
  if (intent === 'calculate') {
    const m = text.match(/([\d\s+\-*/().^%×÷−]+)/);
    if (m) params.expr = m[1].trim();
  }
  if (intent === 'random_number') {
    const nums = text.match(/\d+/g);
    if (nums && nums.length >= 2) { params.min = nums[nums.length - 2]; params.max = nums[nums.length - 1]; }
  }
  return Object.keys(params).length ? params : undefined;
}
