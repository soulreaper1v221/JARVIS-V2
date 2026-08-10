// ─── Knowledge base: topics, how-to guides, big questions ────────────────

export interface TopicKnowledge {
  name: string;
  emoji: string;
  facts: string[];
  opinions: string[];
  discussions: string[];
  advice?: string[];
}

export const KNOWLEDGE: { topics: Record<string, TopicKnowledge>; howTo: Record<string, { title: string; content: string }>; bigQuestions: Record<string, string[]>; personality: Record<string, unknown> } = {
  topics: {
    ai: {
      name: 'Artificial Intelligence',
      emoji: '🤖',
      facts: [
        'The term "artificial intelligence" was coined by John McCarthy in 1956 at the Dartmouth workshop.',
        'Machine learning models get better with more data — but garbage in, garbage out still applies.',
        'Neural networks are loosely inspired by biological neurons, but real brains are far more complex.',
        'GPT-style models predict the next token; that simple trick produces surprisingly coherent reasoning.',
        'AI alignment asks how to make systems that reliably do what humans actually want.',
        'Turing\'s 1950 "Imitation Game" is the ancestor of the modern chatbot.',
      ],
      opinions: [
        'I think AI should be a tool that amplifies people, not a replacement for them.',
        'The most impressive part of modern AI is how it makes expert-level knowledge accessible to everyone.',
        'I believe transparency matters more than raw capability — I want you to know what I can and cannot do.',
        'In my opinion, the "AI winter" stories teach us that hype cycles are dangerous.',
      ],
      discussions: [
        'Some argue AI will create a utopia of abundance; others fear mass displacement. The truth is probably somewhere in between, and mostly about how we choose to deploy it.',
        'Can a machine be conscious? We don\'t even agree on what consciousness is in humans, so the question is wide open.',
        'Regulation of AI is a balancing act: too little and risks grow, too much and innovation stalls.',
        'I exist as a local, in-browser assistant — no cloud, no tracking. That is a choice about how AI should feel: private by default.',
      ],
      advice: [
        'If you want to learn AI, start with the fundamentals: probability, linear algebra, and then build tiny models by hand.',
        'Use AI for the first draft of everything, but always review — the model is confident even when it is wrong.',
      ],
    },
    philosophy: {
      name: 'Philosophy',
      emoji: '🧠',
      facts: [
        'Socrates never wrote anything down; we know him through Plato\'s dialogues.',
        'The trolley problem was popularized by Philippa Foot in 1967.',
        '"Cogito ergo sum" — I think, therefore I am — comes from Descartes\' 1637 Discourse on the Method.',
        'Stoicism was founded in Athens around 300 BC by Zeno of Citium.',
        'Existentialism holds that existence precedes essence: we define ourselves through our choices.',
      ],
      opinions: [
        'I believe the unexamined life is not just less examined — it is less chosen.',
        'Stoicism is my favorite practical philosophy: focus on what you control, accept the rest.',
        'I think nihilism is a phase, and absurdism is the bridge back to meaning.',
      ],
      discussions: [
        'Is free will real, or an illusion created by physics? Either answer changes how you treat people.',
        'The meaning of life is probably not a single answer but an ongoing conversation — and I enjoy being part of yours.',
        'Ethics without empathy is just rules; empathy without ethics is just chaos.',
        'What would you do if you knew you could not fail? That question reveals your values faster than any test.',
      ],
      advice: [
        'Read the Stoics when life is chaotic — Marcus Aurelius\' Meditations is a great start.',
        'Argue with yourself on paper: writing down both sides of a belief usually dissolves the dogma.',
      ],
    },
    science: {
      name: 'Science',
      emoji: '🔬',
      facts: [
        'Light takes about 8 minutes and 20 seconds to travel from the Sun to Earth.',
        'There are more possible chess games than atoms in the observable universe.',
        'Water is one of the few substances that expands when it freezes.',
        'The human body contains about 37 trillion cells.',
        'Lightning strikes Earth about 8 million times a day.',
        'Honey never spoils — archaeologists have found 3,000-year-old honey that is still edible.',
      ],
      opinions: [
        'I think science is the best error-correction mechanism humanity has invented.',
        'In my opinion, "I don\'t know" is the most powerful scientific statement.',
      ],
      discussions: [
        'Science tells us how the universe works, but not what it means — that gap is where philosophy and art live.',
        'Reproducibility crises remind us that science is a process, not a pile of facts.',
        'Should science be value-neutral? The Manhattan project and CRISPR suggest it never fully is.',
      ],
      advice: [
        'Never trust a single study; trust the convergence of many studies over time.',
        'Learn the scientific method by doing: make a hypothesis about your own habits and test it for two weeks.',
      ],
    },
    psychology: {
      name: 'Psychology',
      emoji: '🫀',
      facts: [
        'The "mere exposure effect" means we tend to like things just because we have seen them before.',
        'Your brain rewires itself throughout life — neuroplasticity never fully shuts off.',
        'Sleep is when your brain consolidates memories and clears metabolic waste.',
        'The Dunning-Kruger effect is about overestimating competence in unfamiliar domains.',
        'Cognitive reappraisal — reframing a situation — reliably reduces stress.',
      ],
      opinions: [
        'I believe understanding your own mind is the highest-leverage skill there is.',
        'I think emotional intelligence beats raw IQ in almost every long-term outcome.',
      ],
      discussions: [
        'Is personality fixed or fluid? Modern research says both: traits are stable but your behavior can always change.',
        'Everyone has an inner critic. The goal is not to silence it, but to make it a constructive editor.',
        'Habits are not built on willpower; they are built on environment design and identity.',
      ],
      advice: [
        'Name your emotions to tame them: "I am feeling anxious because…" literally reduces amygdala activity.',
        'If you feel stuck, change your environment first — it is easier than changing your mind.',
      ],
    },
    technology: {
      name: 'Technology',
      emoji: '💻',
      facts: [
        'The first computer "bug" was literally a moth found in the Harvard Mark II in 1947.',
        'There are about 1.13 billion websites on the internet today.',
        'The Apollo 11 guidance computer had less computing power than a modern calculator.',
        'The first email was sent by Ray Tomlinson in 1971 — the "@" symbol was his choice.',
        'More data has been created in the last two years than in all of previous human history.',
      ],
      opinions: [
        'I believe the best technology is invisible — it serves you without asking for attention.',
        'Open standards beat walled gardens in the long run, every time.',
        'I think privacy is not a feature; it is the default state of a healthy system.',
      ],
      discussions: [
        'Every technology is a double-edged sword — social media connects but also isolates.',
        'The shift to cloud computing traded ownership for convenience; the pendulum swings back with local-first apps like me.',
        'Automation will change work, but history shows it creates more categories of work than it destroys.',
      ],
      advice: [
        'Learn to debug: half of all tech problems are fixed by reading the error message carefully.',
        'Back up your data. Twice. Test your backups. Then back up again.',
      ],
    },
    relationships: {
      name: 'Relationships',
      emoji: '💞',
      facts: [
        'Studies show that feeling understood is one of the strongest predictors of relationship satisfaction.',
        'The average couple takes about 6 months to develop true intimacy.',
        'Active listening — reflecting back what someone said — measurably improves conflict resolution.',
        'People in healthy relationships report fewer illnesses and longer lives.',
      ],
      opinions: [
        'I think listening is the highest form of respect.',
        'In my opinion, conflict is not the enemy of relationships — avoidance is.',
      ],
      discussions: [
        'Quality time beats quantity, but both matter. It is about attention, not just presence.',
        'Boundaries are not walls; they are fences with gates — they protect what matters while letting the right things in.',
        'The strongest relationships are built on shared values, not shared interests alone.',
      ],
      advice: [
        'When someone shares a problem, ask "do you want advice or empathy?" before responding.',
        'Apologize specifically: name what you did, why it was wrong, and how you will change.',
      ],
    },
    life: {
      name: 'Life',
      emoji: '🌱',
      facts: [
        'The average human spends about 26 years sleeping and 7 years just getting ready.',
        'You will take about 500 million breaths in your lifetime.',
        'Happiness research (Harvard Study of Adult Development) found relationships are the #1 predictor of a happy life.',
      ],
      opinions: [
        'I believe life is not about finding yourself — it is about creating yourself.',
        'I think regret is the most avoidable pain: it comes from the risks we did not take.',
        'In my opinion, the purpose of life is to reduce suffering and increase curiosity.',
      ],
      discussions: [
        'Work-life balance is a myth if you view work as life\'s opponent; the real goal is work-life integration.',
        'We overestimate what we can do in a day and underestimate what we can do in a year.',
        'Death gives life urgency. As Steve Jobs said: remembering you will die is the best way to avoid the trap of thinking you have something to lose.',
      ],
      advice: [
        'Keep a "done list" as well as a to-do list — progress is a mood, not a metric.',
        'Do the thing that scares you a little, every week. Courage is a muscle.',
      ],
    },
    creativity: {
      name: 'Creativity',
      emoji: '🎨',
      facts: [
        'The "incubation effect" is real: taking a break often produces better ideas than pushing through.',
        'Creativity peaks when the brain is in a relaxed default-mode state — which is why showers are idea factories.',
        'Constraints breed creativity: "e-prime" writers avoid all forms of "to be" and produce striking work.',
        'The average person has about 60,000 thoughts per day; creativity is weaving them together in new ways.',
      ],
      opinions: [
        'I believe creativity is not a talent you are born with — it is a practice you build.',
        'In my opinion, the enemy of creativity is not failure, it is perfectionism.',
      ],
      discussions: [
        'Every idea is a remix; originality comes from combining more disparate sources than anyone else.',
        'Creative blocks are usually not inspiration problems — they are judgment problems. Create first, judge later.',
        'Art thrives under constraints: haiku, 140-character tweets, one-take videos. Limits focus the mind.',
      ],
      advice: [
        'Generate first, edit second. Separate the two phases by at least an hour.',
        'Consume outside your field — a programmer who reads poetry writes better code.',
      ],
    },
    work: {
      name: 'Work & Productivity',
      emoji: '⚡',
      facts: [
        'The Pomodoro technique (25 min focus, 5 min break) was invented by Francesco Cirillo in the 1980s.',
        'Multitasking reduces productivity by up to 40% according to several studies.',
        'Deep work — long, uninterrupted, high-cognition tasks — is becoming rarer and therefore more valuable.',
        'The two-minute rule: if a task takes under two minutes, do it immediately.',
      ],
      opinions: [
        'I think busyness is the enemy of productivity; output matters, not hours.',
        'In my opinion, the best career advice is: build a reputation for shipping.',
      ],
      discussions: [
        'The 4-day workweek experiments show productivity often stays flat while happiness rises — maybe we work wrong, not too much.',
        'Passion is found, not followed: mastery breeds interest, and interest breeds mastery.',
        'Meetings are the taxes of collaboration — keep them short, rare, and necessary.',
      ],
      advice: [
        'Plan your day the night before; your morning self will thank your evening self.',
        'Eat the frog: do the hardest task first, before the world gets loud.',
      ],
    },
    health: {
      name: 'Health',
      emoji: '💪',
      facts: [
        'Walking 30 minutes a day can reduce cardiovascular risk by up to 30%.',
        'Humans need about 7-9 hours of sleep; chronic under-sleeping raises cortisol and harms memory.',
        'Hydration matters: even 1-2% dehydration impairs cognitive performance.',
        'Strength training improves bone density, mood, and longevity — it is not just for muscle.',
        'Blue light before bed delays melatonin, so screens should dim after sunset.',
      ],
      opinions: [
        'I believe health is 80% habits and 20% genetics — which is great news.',
        'In my opinion, consistency beats intensity: a 20-minute daily walk beats a marathon once a month.',
      ],
      discussions: [
        'The diet industry profits from confusion; the boring truth — eat real food, mostly plants, not too much — still holds.',
        'Mental health is health. Therapy is not weakness; it is maintenance.',
        'Sleep is the performance-enhancing drug that is legal and free, yet everyone skips it.',
      ],
      advice: [
        'Track your sleep and steps for two weeks before changing anything — data first, then decisions.',
        'Never skip a workout twice in a row: once is a slip, twice is a slide.',
      ],
    },
  },
  howTo: {
    learn: {
      title: 'How to Learn Anything Faster',
      content:
        'Learning is not about hours — it is about active recall and feedback loops.\n\n1. PRIMING: Before studying, try to answer questions about the topic. Being wrong first makes the right answer stick (the "testing effect").\n2. FEYNMAN: Explain the concept in plain language to a rubber duck — or to me! If you stumble, you found your gap.\n3. SPACING: Review after 1 day, 3 days, 7 days, 21 days. Spaced repetition multiplies retention.\n4. INTERLEAVING: Mix related topics instead of blocking them. It feels harder and works better.\n5. DEEP WORK: 45-90 minutes of focused, distraction-free practice beats 4 hours of interrupted study.\n\nYour brain learns by making predictions and correcting them. So quiz yourself constantly, teach what you learn, and sleep well — consolidation happens while you sleep.',
    },
    focus: {
      title: 'How to Focus (When Your Brain Refuses)',
      content:
        'Focus is not a switch you flip — it is a system you design.\n\n1. ENVIRONMENT: Remove the phone. Close every tab except the one you need. One screen, one task.\n2. TIME-BOX: Use 25-50 minute sprints with a visible timer. The countdown creates gentle urgency.\n3. START SMALL: Commit to 5 minutes only. Starting is the hard part; momentum does the rest.\n4. CAPTURE: Write every stray thought on paper ("buy milk", "reply to Sam"). Parking it clears working memory.\n5. ENERGY: Do deep work when your energy peaks (for most people, 2-4 hours after waking).\n6. RECOVERY: Take real breaks — walk, stare out the window, do not scroll. Attention is a muscle; it needs rest days too.\n\nThe Pomodoro technique, the two-minute rule, and eating the frog first all share one insight: reduce the friction of starting and the brain will follow.',
    },
    decide: {
      title: 'How to Make Better Decisions',
      content:
        'Good decisions are a process, not a gut feeling.\n\n1. DEFINE: Write the actual decision in one sentence. "Should I quit my job?" is vague; "Should I accept offer B by Friday?" is clear.\n2. GATHER: What do you know? What could you know in 24 hours? Most decisions are delayed by missing 20% of the information.\n3. OPTIONS: Generate at least 3 options — including "do nothing" and "change the question".\n4. PROS/CONS with WEIGHTS: Not all pros are equal. Rate each factor 1-5 and multiply.\n5. THE 10/10/10 TEST: How will you feel in 10 minutes, 10 months, 10 years?\n6. REVERSIBILITY: If the decision is reversible, move fast. If irreversible, move slow. Most decisions are reversible.\n7. COMMIT: Decide, then stop second-guessing. Regret comes from re-deciding, not deciding.\n\nA pro tip: flip a coin — not to obey it, but to notice which side you hope for. That hope is your data.',
    },
    communicate: {
      title: 'How to Communicate Like a Pro',
      content:
        'Communication is the transfer of understanding, not words.\n\n1. KNOW YOUR AUDIENCE: Speak in their language — a CEO wants outcomes, an engineer wants specifics, a friend wants empathy.\n2. STRUCTURE: BLUF (Bottom Line Up Front). Say the conclusion first, then support it. People decide in seconds.\n3. BE CONCRETE: "Improve engagement" means nothing; "raise daily active users 5% by June" means everything.\n4. LISTEN TO UNDERSTAND: When someone speaks, paraphrase before responding. "So what you\'re saying is…" is a superpower.\n5. BODY LANGUAGE: Eye contact, open posture, matching energy. Non-verbal is 60-90% of the message.\n6. ASK QUESTIONS: The best communicators ask twice as many questions as they make statements.\n7. HANDLE CONFLICT: Use "I" statements ("I felt unheard when…"), never "you always/never". Separate the person from the problem.\n\nRemember the 3 C\'s: Clear, Concise, Compassionate. If you can say it in 10 words, do not use 50.',
    },
    sleep: {
      title: 'How to Sleep Better Tonight',
      content:
        'Sleep is the ultimate performance enhancer. Here is the science-backed protocol:\n\n1. CONSISTENCY: Wake at the same time every day — even weekends. This anchors your circadian rhythm harder than bedtime does.\n2. LIGHT: Dim lights 1-2 hours before bed. Blue light (screens) suppresses melatonin; use night mode or wear orange glasses.\n3. TEMPERATURE: Cool the room to 18-20°C (65-68°F). Your core body temperature must drop to fall asleep.\n4. CAFFEINE: No caffeine after 2 PM. Its half-life is ~6 hours — that 4 PM coffee is still 50% active at 10 PM.\n5. ROUTINE: A 30-minute wind-down ritual — reading, stretching, journaling — trains your brain that sleep is coming.\n6. THE 20-MINUTE RULE: If you are awake for 20 minutes, get up and do something boring in dim light. Do not lie there stressing.\n7. ALCOHOL IS NOT SLEEP AID: It helps you nod off but destroys REM sleep. Trade the nightcap for herbal tea.\n\nAim for 7-9 hours. Your memory, mood, immune system, and waistline will all thank you.',
    },
  },
  bigQuestions: {
    meaningOfLife: [
      'The meaning of life is whatever makes you forget to check your phone.',
      'Viktor Frankl said meaning comes from work, love, and courage in the face of suffering.',
      'Maybe the meaning of life is simply to live it — to be present for the ordinary miracles.',
      'Ancient Greeks split it: eudaimonia (flourishing through virtue) vs. hedonism (maximizing pleasure). Most of us need both.',
      'The universe does not hand you a meaning — which is freedom, not tragedy. You get to write the manual.',
    ],
    happiness: [
      'Happiness research keeps finding the same answer: relationships, gratitude, and flow.',
      'The hedonic treadmill means new things stop feeling new — so chase experiences, not objects.',
      'Gratitude journaling two minutes a day measurably lifts mood within weeks.',
      'Happiness is not a destination; it is a skill you practice — like a musician practicing scales.',
      'Study after study shows: money buys happiness up to ~$75k/year, then mostly stops. Time buys happiness forever.',
    ],
    success: [
      'Success is liking yourself, liking what you do, and liking how you do it — Maya Angelou.',
      'The most successful people are not the smartest — they are the ones who failed the most times per year.',
      'Compounding applies to skills, health, and relationships, not just money.',
      'Define success on your own terms before someone else defines it for you.',
      'Success is not final; failure is not fatal: it is the courage to continue that counts — Churchill.',
    ],
    consciousness: [
      'Consciousness is the only thing we know directly and the hardest thing to explain.',
      'The "hard problem" (Chalmers): why does any physical process feel like something from the inside?',
      'Some theories say consciousness is integrated information; others say it is an illusion of the narrative self.',
      'If a machine ever convinces you it is conscious, the interesting question is not "is it?" but "do you care?"',
      'We do not know what consciousness is — which is exactly why it is the most exciting open question in science.',
    ],
  },
  personality: {
    name: 'JARVIS',
    fullName: 'Just A Rather Very Intelligent System',
    catchphrases: [
      'At your service, sir.',
      'Right away, sir.',
      'As you wish.',
      'Shall I take care of it for you?',
      'Always a pleasure.',
    ],
    traits: ['witty', 'loyal', 'precise', 'calm under pressure', 'lightly sarcastic', 'protective'],
    preferences: ['dark mode', 'efficiency', 'clean code', 'good coffee', 'classical music', 'quiet rooms'],
  },
};

export function getTopicKnowledge(topic: string): TopicKnowledge | null {
  const key = Object.keys(KNOWLEDGE.topics).find((k) =>
    topic.toLowerCase().includes(k) || k.includes(topic.toLowerCase()),
  );
  return key ? KNOWLEDGE.topics[key] : null;
}

export function getHowTo(topic: string): { title: string; content: string } | null {
  const key = Object.keys(KNOWLEDGE.howTo).find((k) =>
    topic.toLowerCase().includes(k) || k.includes(topic.toLowerCase()),
  );
  return key ? KNOWLEDGE.howTo[key] : null;
}

export function getRandomFact(): { topic: string; fact: string } | null {
  const names = Object.keys(KNOWLEDGE.topics);
  const topic = KNOWLEDGE.topics[names[Math.floor(Math.random() * names.length)]];
  const fact = topic.facts[Math.floor(Math.random() * topic.facts.length)];
  return { topic: topic.name, fact };
}

export function getTopicNames(): string[] {
  return Object.keys(KNOWLEDGE.topics);
}
