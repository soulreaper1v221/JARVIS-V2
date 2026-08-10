// ─── Conversation context engine ──────────────────────────────────────────

export interface ConversationTurn {
  role: 'user' | 'jarvis';
  content: string;
  timestamp: Date;
  topics: string[];
  entities: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  intent?: string;
  keyPoints: string[];
  questionsAsked: string[];
  emotionalTone?: string;
}

export interface JarvisMemory {
  recentStatements: string[];
  questionsAsked: string[];
  topicsCovered: string[];
  opinionsShared: string[];
  factsShared: string[];
  adviceGiven: string[];
  storiesTold: number;
  jokesTold: number;
  userFacts: Map<string, string>;
  userPreferences: Map<string, string>;
  userConcerns: string[];
  currentThread: string | null;
  threadDepth: number;
  awaitingResponse: boolean;
  lastQuestionContext: string | null;
}

export interface ConversationContext {
  turns: ConversationTurn[];
  currentTopic: string | null;
  topicHistory: string[];
  userName: string | null;
  userMood: string | null;
  conversationStyle: 'casual' | 'formal' | 'technical' | 'unknown';
  jarvisMemory: JarvisMemory;
}

export const context: ConversationContext = {
  turns: [],
  currentTopic: null,
  topicHistory: [],
  userName: null,
  userMood: null,
  conversationStyle: 'unknown',
  jarvisMemory: {
    recentStatements: [],
    questionsAsked: [],
    topicsCovered: [],
    opinionsShared: [],
    factsShared: [],
    adviceGiven: [],
    storiesTold: 0,
    jokesTold: 0,
    userFacts: new Map(),
    userPreferences: new Map(),
    userConcerns: [],
    currentThread: null,
    threadDepth: 0,
    awaitingResponse: false,
    lastQuestionContext: null,
  },
};

const POSITIVE_WORDS = ['love', 'like', 'great', 'awesome', 'amazing', 'good', 'happy', 'glad', 'nice', 'cool', 'excellent', 'fantastic', 'wonderful', 'beautiful', 'perfect', 'best', 'fun', 'enjoy', 'excited', 'thank', 'thanks', 'yes', 'sure', 'brilliant', 'super', 'yay', 'wow'];
const NEGATIVE_WORDS = ['hate', 'bad', 'awful', 'terrible', 'sad', 'angry', 'mad', 'upset', 'worried', 'anxious', 'scared', 'afraid', 'stress', 'tired', 'bored', 'annoyed', 'frustrated', 'disappointed', 'lonely', 'depressed', 'sick', 'pain', 'wrong', 'fail', 'failed', 'problem', 'problems', 'no', 'nope', 'sucks', 'cry', 'crying'];

const SENTENCE_SPLIT = /(?<=[.!?])\s+/;

export function extractKeyPoints(content: string): string[] {
  const sentences = content.split(SENTENCE_SPLIT).map((s) => s.trim()).filter((s) => s.length > 8);
  const points: string[] = [];
  for (const s of sentences) {
    if (/(should|need to|must|going to|will|plan|decided|learned|realized|want to|trying to|important|the point is|in short|basically)/i.test(s)) {
      points.push(s);
    }
  }
  if (points.length === 0 && sentences.length) points.push(sentences[sentences.length - 1]);
  return points.slice(0, 4);
}

export function extractQuestions(content: string): string[] {
  return content
    .split(SENTENCE_SPLIT)
    .map((s) => s.trim())
    .filter((s) => s.endsWith('?') && s.length > 3)
    .slice(0, 5);
}

const ENTITY_PATTERN = /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\b/g;

export function extractEntities(content: string): string[] {
  const found = new Set<string>();
  const m = content.match(ENTITY_PATTERN);
  if (m) for (const e of m) found.add(e);
  const numbers = content.match(/\b\d{1,4}(?:[,.]\d{1,3})?\b/g);
  if (numbers) for (const n of numbers.slice(0, 3)) found.add(n);
  return [...found].slice(0, 8);
}

const FOLLOW_UP_STARTS = /^(and|but|or|so|then|also|anyway|actually|well|besides|what about|how about|anyway|though|however|plus|yet|why|because|yeah|yes|no|ok|okay|right|wait|also|like)\b/i;

export function isFollowUp(content: string): boolean {
  return FOLLOW_UP_STARTS.test(content.trim()) || context.jarvisMemory.awaitingResponse;
}

export function detectSentiment(content: string): 'positive' | 'negative' | 'neutral' {
  const words = content.toLowerCase().split(/\W+/);
  let score = 0;
  for (const w of words) {
    if (POSITIVE_WORDS.includes(w)) score += 1;
    if (NEGATIVE_WORDS.includes(w)) score -= 1;
  }
  if (content.includes('!') && content.length > 20) score += 1;
  return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
}

export function addTurn(role: 'user' | 'jarvis', content: string, intent?: string): ConversationTurn {
  const topics = extractEntities(content).slice(0, 4);
  const keyPoints = role === 'jarvis' ? extractKeyPoints(content) : [];
  const questionsAsked = extractQuestions(content);
  const sentiment = detectSentiment(content);
  const emotionalTone = detectEmotionalTone(content);
  const turn: ConversationTurn = {
    role,
    content,
    timestamp: new Date(),
    topics,
    entities: extractEntities(content),
    sentiment,
    intent,
    keyPoints,
    questionsAsked,
    emotionalTone,
  };
  context.turns.push(turn);
  if (context.turns.length > 100) context.turns.shift();

  // topic tracking
  if (topics.length) {
    const t = topics[0];
    if (context.currentTopic && context.currentTopic !== t) context.topicHistory.push(context.currentTopic);
    context.currentTopic = t;
    if (!context.jarvisMemory.topicsCovered.includes(t)) {
      context.jarvisMemory.topicsCovered.push(t);
      if (context.jarvisMemory.topicsCovered.length > 50) context.jarvisMemory.topicsCovered.shift();
    }
  }

  const mem = context.jarvisMemory;
  if (role === 'jarvis') {
    // jarvis memory updates
    const statement = content.replace(/\n+/g, ' ').slice(0, 220);
    mem.recentStatements.unshift(statement);
    if (mem.recentStatements.length > 30) mem.recentStatements.pop();
    if (questionsAsked.length) {
      mem.questionsAsked.unshift(...questionsAsked);
      mem.questionsAsked = [...new Set(mem.questionsAsked)].slice(0, 30);
    }
    if (/(i think|in my opinion|i believe|my view|personally)/i.test(content)) {
      mem.opinionsShared.unshift(statement);
      if (mem.opinionsShared.length > 20) mem.opinionsShared.pop();
    }
    if (/(did you know|fun fact|interestingly|studies show|research shows)/i.test(content)) {
      mem.factsShared.unshift(statement);
      if (mem.factsShared.length > 20) mem.factsShared.pop();
    }
    if (/(try|try to|you should|a tip|advice|suggestion|start with|begin with)/i.test(content)) {
      mem.adviceGiven.unshift(statement);
      if (mem.adviceGiven.length > 20) mem.adviceGiven.pop();
    }
    if (/\bjoke\b/i.test(content)) mem.jokesTold++;
    if (/\bstory\b/i.test(content) || content.length > 600) mem.storiesTold++;
    // thread tracking
    if (questionsAsked.length) {
      mem.awaitingResponse = true;
      mem.lastQuestionContext = questionsAsked[0];
      mem.currentThread = questionsAsked[0].slice(0, 60);
      mem.threadDepth++;
    } else {
      mem.awaitingResponse = false;
      mem.lastQuestionContext = null;
    }
  } else {
    // user turn → extract user facts
    extractUserFacts(content);
    // thread depth resets when user answers
    if (mem.awaitingResponse && content.trim().length > 0) {
      mem.threadDepth = 0;
      mem.awaitingResponse = false;
    } else if (!mem.awaitingResponse) {
      mem.threadDepth = 0;
    }
    if (sentiment === 'negative') {
      mem.userConcerns.push(content.slice(0, 120));
      if (mem.userConcerns.length > 20) mem.userConcerns.shift();
    }
  }
  return turn;
}

const USER_FACT_PATTERNS: Array<{ re: RegExp; key: (m: RegExpMatchArray) => string; val: (m: RegExpMatchArray) => string }> = [
  { re: /\bmy name is ([a-z][a-z\s]+?)(?:\.|,| and| but|$)/i, key: () => 'name', val: (m) => m[1].trim() },
  { re: /\bi(?:'m| am) (?:called )?([a-z][a-z\s]+?)(?:\.|,| and| but|$)/i, key: () => 'name', val: (m) => m[1].trim() },
  { re: /\bi (?:am|'m) (\d+) (?:years old|yrs old|yo)\b/i, key: () => 'age', val: (m) => m[1] },
  { re: /\bi (?:live|stay|reside) in ([a-z\s]+?)(?:\.|,| and| but|$)/i, key: () => 'city', val: (m) => m[1].trim() },
  { re: /\bi (?:work|work as|am a) (?:at |for |as )?([a-z\s]+?)(?:\.|,| and| but|$)/i, key: () => 'job', val: (m) => m[1].trim() },
  { re: /\bi (?:study|go to|attend) ([a-z\s]+?)(?:\.|,| and| but|$)/i, key: () => 'school', val: (m) => m[1].trim() },
  { re: /\bi (?:like|love) ([a-z\s]+?)(?:\.|,| and| but|$)/i, key: () => 'likes', val: (m) => m[1].trim() },
  { re: /\bi (?:dislike|hate) ([a-z\s]+?)(?:\.|,| and| but|$)/i, key: () => 'dislikes', val: (m) => m[1].trim() },
  { re: /\bmy favorite (?:color|colour) is ([a-z]+)/i, key: () => 'favorite color', val: (m) => m[1] },
  { re: /\bmy favorite (?:food|meal|dish) is ([a-z\s]+?)(?:\.|,| and| but|$)/i, key: () => 'favorite food', val: (m) => m[1].trim() },
  { re: /\bmy birthday is ([a-z0-9\s]+?)(?:\.|,| and| but|$)/i, key: () => 'birthday', val: (m) => m[1].trim() },
  { re: /\bi (?:have|own) (?:a|an) ([a-z\s]+?)(?:\.|,| and| but|$)/i, key: () => 'possessions', val: (m) => m[1].trim() },
  { re: /\bi (?:prefer|would rather|rather) ([a-z\s]+?)(?:\.|,| and| but|$)/i, key: () => 'preference', val: (m) => m[1].trim() },
];

function extractUserFacts(content: string): void {
  const lower = content.toLowerCase();
  for (const p of USER_FACT_PATTERNS) {
    const m = lower.match(p.re);
    if (m) {
      const key = p.key(m);
      const val = p.val(m).replace(/[.,;!?]+$/g, '');
      if (val && val.length > 1) {
        if (key === 'name') {
          context.userName = val;
          context.jarvisMemory.userFacts.set('name', val);
        } else if (key === 'likes' || key === 'dislikes' || key === 'preference') {
          context.jarvisMemory.userPreferences.set(key, val);
        } else {
          context.jarvisMemory.userFacts.set(key, val);
        }
      }
    }
  }
}

const EMOTION_LEXICON: Array<[string, RegExp[]]> = [
  ['happy', [/happy|joyful|cheerful|delighted|thrilled|glad|ecstatic|elated/]],
  ['sad', [/sad|unhappy|down|depressed|gloomy|heartbroken|miserable|blue/]],
  ['angry', [/angry|mad|furious|annoyed|irritated|rage|frustrated|pissed/]],
  ['anxious', [/anxious|nervous|worried|uneasy|on edge|panic|panicking/]],
  ['excited', [/excited|pumped|hyped|thrilled|can't wait|cannot wait|looking forward/]],
  ['grateful', [/grateful|thankful|appreciate|blessed|indebted/]],
  ['lonely', [/lonely|alone|isolated|left out|abandoned/]],
  ['tired', [/tired|exhausted|drained|sleepy|worn out|burned out|burnt out/]],
  ['curious', [/curious|wondering|interested|intrigued|fascinated/]],
  ['bored', [/bored|boring|nothing to do|uninterested|dull/]],
  ['confused', [/confused|confusing|lost|puzzled|perplexed|don't understand|dont understand/]],
  ['stressed', [/stressed|stress|overwhelmed|pressure|burning out/]],
  ['hopeful', [/hopeful|optimistic|positive about|looking up|bright future/]],
  ['proud', [/proud|accomplished|achieved|achievement|milestone/]],
  ['guilty', [/guilty|ashamed|regret|regretful/]],
  ['jealous', [/jealous|envious|green with envy/]],
  ['shy', [/shy|embarrassed|awkward|self-conscious/]],
  ['surprised', [/surprised|shocked|amazed|astonished|stunned|unexpected/]],
  ['calm', [/calm|relaxed|peaceful|chill|serene|content/]],
  ['scared', [/scared|afraid|fearful|terrified|frightened|horrified/]],
  ['nostalgic', [/nostalgic|remember when|good old days|miss the|memories/]],
  ['loved', [/loved|cherished|appreciated|wanted|cared for/]],
  ['confident', [/confident|sure of myself|can do it|ready for/]],
  ['insecure', [/insecure|not good enough|worthless|imposter|inferior/]],
  ['overwhelmed', [/overwhelmed|too much|can't handle|cannot handle|swamped/]],
  ['content', [/content|satisfied|at peace|grateful for/]],
  ['inspired', [/inspired|motivated|fired up|driven|energized/]],
  ['disappointed', [/disappointed|let down|failed me|disappointing/]],
  ['frustrated', [/frustrated|frustrating|stuck|no matter what/]],
  ['sick', [/sick|ill|unwell|fever|flu|cold/]],
  ['love', [/love you|in love|crush|feelings for/]],
  ['hurt', [/hurt|betrayed|broken heart|let down/]],
  ['hopeless', [/hopeless|pointless|giving up|no point/]],
  ['grieving', [/died|death|passed away|lost my|funeral/]],
];

export function detectEmotionalTone(content: string): string | undefined {
  const lower = content.toLowerCase();
  for (const [emotion, patterns] of EMOTION_LEXICON) {
    if (patterns.some((re) => re.test(lower))) return emotion;
  }
  return undefined;
}

export function setAskedQuestion(question: string): void {
  const mem = context.jarvisMemory;
  mem.awaitingResponse = true;
  mem.lastQuestionContext = question;
  mem.questionsAsked.unshift(question);
  mem.questionsAsked = [...new Set(mem.questionsAsked)].slice(0, 30);
}

export function isAwaitingResponse(): boolean {
  return context.jarvisMemory.awaitingResponse;
}

/** Is the user's message answering the question JARVIS last asked? */
export function isAnsweringQuestion(content: string): boolean {
  const q = context.jarvisMemory.lastQuestionContext;
  if (!q) return false;
  const qWords = new Set(q.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
  const cWords = content.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  if (/^(yes|yeah|no|nope|maybe|i think|probably|sure|ok|okay|not really|i don't know|idk)\b/i.test(content)) return true;
  return cWords.some((w) => qWords.has(w));
}

export function getLastUserMessages(n = 3): ConversationTurn[] {
  return context.turns.filter((t) => t.role === 'user').slice(-n);
}

export function getLastJarvisResponse(): ConversationTurn | null {
  return [...context.turns].reverse().find((t) => t.role === 'jarvis') ?? null;
}

export function getLastJarvisTurn(): ConversationTurn | null {
  return getLastJarvisResponse();
}

export function getUserProfile(): Record<string, string> {
  const facts: Record<string, string> = {};
  for (const [k, v] of context.jarvisMemory.userFacts) facts[k] = v;
  for (const [k, v] of context.jarvisMemory.userPreferences) facts[`prefers: ${k}`] = v;
  if (context.userName) facts.name = context.userName;
  return facts;
}

export function hasDiscussedTopic(topic: string): boolean {
  return context.jarvisMemory.topicsCovered.some((t) => t.toLowerCase().includes(topic.toLowerCase()));
}

export function getTopicsCovered(): string[] {
  return [...context.jarvisMemory.topicsCovered];
}

export function getThreadDepth(): number {
  return context.jarvisMemory.threadDepth;
}

export function hasToIdStory(): boolean {
  return context.jarvisMemory.storiesTold > 0;
}

export function getJokeCount(): number {
  return context.jarvisMemory.jokesTold;
}

export function getRecentStatements(): string[] {
  return [...context.jarvisMemory.recentStatements];
}

export function getOpinionsShared(): string[] {
  return [...context.jarvisMemory.opinionsShared];
}

/** What has JARVIS said about a topic? */
export function getWhatISaidAbout(topic: string): string[] {
  const t = topic.toLowerCase();
  return context.jarvisMemory.recentStatements.filter((s) => s.toLowerCase().includes(t)).slice(0, 5);
}

export function detectConversationStyle(): 'casual' | 'formal' | 'technical' | 'unknown' {
  const turns = context.turns.slice(-20);
  if (!turns.length) return 'unknown';
  const text = turns.map((t) => t.content).join(' ');
  const words = text.split(/\s+/).filter(Boolean);
  const avgLen = words.length ? text.length / words.length : 0;
  if (/(function|class|variable|syntax|code|api|algorithm|array|database|server)/i.test(text)) return 'technical';
  if (/(lol|haha|omg|tbh|idk|fr|ngl|bro|dude|gonna|wanna)/i.test(text) || avgLen < 20) return 'casual';
  if (/(however|therefore|furthermore|additionally|regarding|nevertheless)/i.test(text) || avgLen > 28) return 'formal';
  return 'unknown';
}

export function resetConversation(): void {
  context.turns = [];
  context.currentTopic = null;
  context.topicHistory = [];
  context.userMood = null;
  context.conversationStyle = 'unknown';
  const mem = context.jarvisMemory;
  mem.recentStatements = [];
  mem.questionsAsked = [];
  mem.topicsCovered = [];
  mem.opinionsShared = [];
  mem.factsShared = [];
  mem.adviceGiven = [];
  mem.storiesTold = 0;
  mem.jokesTold = 0;
  mem.userFacts = new Map();
  mem.userPreferences = new Map();
  mem.userConcerns = [];
  mem.currentThread = null;
  mem.threadDepth = 0;
  mem.awaitingResponse = false;
  mem.lastQuestionContext = null;
  // note: userName is kept so JARVIS remembers who you are
}
