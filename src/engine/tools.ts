// ─── Utility tools: weather, time, calculator, jokes ─────────────────────

export interface CityWeather {
  city: string;
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  emoji: string;
}

export const WEATHER_CITIES: CityWeather[] = [
  { city: 'New York', temp: 22, condition: 'Partly cloudy', humidity: 62, wind: 14, emoji: '⛅' },
  { city: 'London', temp: 16, condition: 'Light rain', humidity: 81, wind: 19, emoji: '🌧️' },
  { city: 'Tokyo', temp: 27, condition: 'Humid and sunny', humidity: 70, wind: 11, emoji: '☀️' },
  { city: 'Paris', temp: 19, condition: 'Clear skies', humidity: 55, wind: 9, emoji: '🌤️' },
  { city: 'Sydney', temp: 24, condition: 'Sunny with breeze', humidity: 48, wind: 21, emoji: '☀️' },
  { city: 'Moscow', temp: 8, condition: 'Overcast', humidity: 74, wind: 12, emoji: '☁️' },
  { city: 'Dubai', temp: 38, condition: 'Scorching sun', humidity: 22, wind: 16, emoji: '🔥' },
  { city: 'Berlin', temp: 17, condition: 'Drizzle', humidity: 68, wind: 13, emoji: '🌦️' },
  { city: 'Mumbai', temp: 31, condition: 'Monsoon showers', humidity: 88, wind: 24, emoji: '🌧️' },
  { city: 'Toronto', temp: 20, condition: 'Partly cloudy', humidity: 59, wind: 15, emoji: '⛅' },
  { city: 'Singapore', temp: 30, condition: 'Thunderstorms', humidity: 85, wind: 10, emoji: '⛈️' },
  { city: 'Los Angeles', temp: 26, condition: 'Sunny', humidity: 40, wind: 8, emoji: '☀️' },
];

export function getWeatherSimulated(city?: string): CityWeather {
  if (city) {
    const found = WEATHER_CITIES.find(
      (c) => c.city.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(c.city.toLowerCase()),
    );
    if (found) return found;
    // synthesize a plausible city
    return {
      city: city.trim().replace(/^./, (x) => x.toUpperCase()),
      temp: Math.round(8 + Math.random() * 28),
      condition: ['Clear', 'Cloudy', 'Windy', 'Rainy', 'Sunny', 'Overcast'][Math.floor(Math.random() * 6)],
      humidity: Math.round(30 + Math.random() * 55),
      wind: Math.round(5 + Math.random() * 25),
      emoji: '🌍',
    };
  }
  return WEATHER_CITIES[Math.floor(Math.random() * WEATHER_CITIES.length)];
}

export function getTimeNow(): { time: string; date: string; iso: string; timezone: string } {
  const now = new Date();
  return {
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    date: now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    iso: now.toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

/** Safely evaluate a math expression. */
export function calculate(expr: string): number {
  const sanitized = expr
    .replace(/\^/g, '**')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, `(${Math.PI})`)
    .replace(/pi/gi, `(${Math.PI})`)
    .replace(/e\b/gi, `(${Math.E})`)
    .replace(/sqrt\(/gi, 'Math.sqrt(')
    .replace(/sin\(/gi, 'Math.sin(')
    .replace(/cos\(/gi, 'Math.cos(')
    .replace(/tan\(/gi, 'Math.tan(')
    .replace(/abs\(/gi, 'Math.abs(')
    .replace(/floor\(/gi, 'Math.floor(')
    .replace(/ceil\(/gi, 'Math.ceil(')
    .replace(/round\(/gi, 'Math.round(')
    .replace(/log\(/gi, 'Math.log(')
    .replace(/ln\(/gi, 'Math.log(')
    .replace(/random/gi, 'Math.random()');
  if (!/^[0-9+\-*/().,%\sMath.a-zA-Z]+$/.test(sanitized)) {
    throw new Error('Expression contains unsupported characters');
  }
  // eslint-disable-next-line no-new-func
  const fn = new Function('Math', `"use strict"; return (${sanitized});`);
  const result = fn(Math);
  if (typeof result !== 'number' || !isFinite(result)) throw new Error('Invalid calculation');
  return Math.round(result * 1e10) / 1e10;
}

export function generateRandomNumber(min = 1, max = 100): number {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

export interface Joke {
  setup: string;
  punchline: string;
  category: string;
}

const JOKE_SETS: Array<{ category: string; jokes: Array<[string, string]> }> = [
  {
    category: 'programming',
    jokes: [
      ['Why do programmers prefer dark mode?', 'Because light attracts bugs.'],
      ['Why did the developer go broke?', 'Because he used up all his cache.'],
      ['There are only 10 kinds of people in the world:', 'Those who understand binary and those who do not.'],
      ['Why do Java developers wear glasses?', "Because they can't C#."],
      ['A SQL query walks into a bar, goes up to two tables and asks:', '"Can I JOIN you?"'],
      ['Why was the JavaScript developer sad?', "Because he didn't know how to null his feelings."],
      ['What is a programmer\'s favourite hangout spot?', 'The Foo Bar.'],
      ['Why do programmers hate nature?', 'Too many bugs and no documentation.'],
      ['How many programmers does it take to change a light bulb?', "None — that's a hardware problem."],
      ['Why did the function break up with the loop?', "It felt it wasn't being iterated on."],
      ['What do you call a programmer from Finland?', 'Nerdic.'],
      ['Why do programmers confuse Halloween and Christmas?', 'Because OCT 31 == DEC 25.'],
      ['There is no place like 127.0.0.1', 'But there are 127.0.0.0 other places to be.'],
      ['Why did the developer get fired from the restaurant?', 'He kept ordering a full stack.'],
      ['What did the computer do at lunchtime?', 'Had a byte.'],
      ['Why was the computer cold?', 'It left its Windows open.'],
      ['How do you comfort a JavaScript bug?', 'You console it.'],
      ['Why did the programmer quit his job?', 'Because he did not get arrays.'],
      ['What do you call eight hobbits?', 'A hobbyte.'],
      ['Why are programmers always late to meetings?', 'They keep recompiling the world.'],
    ],
  },
  {
    category: 'science',
    jokes: [
      ['Why can you never trust atoms?', 'They make up everything.'],
      ['What did the scientist say when he found two isotopes of helium?', 'HeHe.'],
      ['Why did the chicken cross the road?', 'To get to the other slide.'],
      ['What do you get when you cross a snowman and a vampire?', 'Frostbite.'],
      ['Why are chemists so good at solving problems?', 'Because they have all the solutions.'],
      ['What did the ion say to the other ion?', 'I think we have a chemistry.'],
      ['Why do physicists like to go to parties?', 'They have great particle behavior.'],
      ['What is the most important rule in physics class?', 'Do not be a negative person.'],
    ],
  },
  {
    category: 'math',
    jokes: [
      ['Why was the equal sign so humble?', 'Because it knew it was not greater or less than anyone else.'],
      ['Why did the student get upset when their teacher called them average?', 'It was a mean thing to say.'],
      ['What do you call a number that can\'t keep still?', 'A roamin\' numeral.'],
      ['Why is the obtuse triangle always so frustrated?', 'Because it\'s never right.'],
      ['How do you make seven even?', 'Take away the "s".'],
    ],
  },
  {
    category: 'AI',
    jokes: [
      ['Why did the neural network go to therapy?', 'It had too many layers.'],
      ['What is an AI\'s favourite meal?', 'Deep fried data with a side of learning curves.'],
      ['Why did the robot get promoted?', 'It showed great artificial intelligence.'],
      ['What does an AI say when it\'s confused?', 'I have a few mixed feelings about that.'],
      ['Why was the machine learning model bad at poker?', 'It kept folding under pressure.'],
      ['How many AI researchers does it take to change a light bulb?', 'One — the light bulb learns to change itself.'],
      ['What do you call a robot that takes too long?', 'A slow-vergent algorithm.'],
    ],
  },
  {
    category: 'dad',
    jokes: [
      ['Why don\'t eggs tell jokes?', 'They\'d crack each other up.'],
      ['I told my wife she should embrace her mistakes.', 'She gave me a hug.'],
      ['Why did the scarecrow win an award?', 'Because he was outstanding in his field.'],
      ['What do you call a fake noodle?', 'An impasta.'],
      ['Why did the bicycle fall over?', 'Because it was two-tired.'],
      ['How does a penguin build its house?', 'Igloos it together.'],
      ['What do you call a fish wearing a bowtie?', 'Sofishticated.'],
      ['Why don\'t scientists trust atoms?', 'Because they make up everything.'],
      ['What do you call a bear with no teeth?', 'A gummy bear.'],
      ['I\'m reading a book on anti-gravity.', 'It\'s impossible to put down.'],
      ['Why did the tomato turn red?', 'Because it saw the salad dressing.'],
      ['What do you call a sleeping dinosaur?', 'A dino-snore.'],
      ['Why did the math book look sad?', 'It had too many problems.'],
      ['What do you get when you cross a computer and a lifeguard?', 'A screensaver.'],
      ['Why did the golfer bring two pairs of pants?', 'In case he got a hole in one.'],
      ['What do you call a factory that makes okay products?', 'A satisfactory.'],
      ['Why did the coffee file a police report?', 'It got mugged.'],
      ['What did the grape do when it got stepped on?', 'It let out a little wine.'],
      ['Why do ducks have feathers?', 'To cover their butt quacks.'],
      ['What did the ocean say to the beach?', 'Nothing, it just waved.'],
    ],
  },
  {
    category: 'one-liners',
    jokes: [
      ['I used to play piano by ear, but now I use my hands.', ''],
      ['I\'m on a seafood diet. I see food and I eat it.', ''],
      ['I told my computer I needed a break, and now it won\'t stop sending me KitKats.', ''],
      ['My bed is a magical place where I suddenly remember everything I forgot to do.', ''],
      ['I would agree with you, but then we\'d both be wrong.', ''],
      ['I\'m not arguing, I\'m just explaining why I\'m right.', ''],
      ['I put my phone in airplane mode and told it to fly, but nothing happened.', ''],
      ['Life is short. Smile while you still have teeth.', ''],
      ['I\'m not lazy, I\'m on energy-saving mode.', ''],
      ['My favorite machine at the gym is the vending machine.', ''],
      ['I finally got my head together, now my body is falling apart.', ''],
      ['If at first you don\'t succeed, then skydiving definitely isn\'t for you.', ''],
    ],
  },
];

export const ALL_JOKES: Joke[] = (() => {
  const flat: Joke[] = [];
  for (const set of JOKE_SETS) {
    for (const [setup, punchline] of set.jokes) {
      flat.push({ setup, punchline, category: set.category });
    }
  }
  // shuffle on load
  for (let i = flat.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flat[i], flat[j]] = [flat[j], flat[i]];
  }
  return flat;
})();

let jokeIndex = 0;
const served = new Set<string>();

/** Serve jokes sequentially, never repeating until the deck is exhausted. */
export function getJoke(): Joke {
  if (served.size >= ALL_JOKES.length) {
    served.clear();
    jokeIndex = 0;
    // reshuffle
    for (let i = ALL_JOKES.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ALL_JOKES[i], ALL_JOKES[j]] = [ALL_JOKES[j], ALL_JOKES[i]];
    }
  }
  let joke = ALL_JOKES[jokeIndex % ALL_JOKES.length];
  let guard = 0;
  while (served.has(joke.setup) && guard < ALL_JOKES.length) {
    jokeIndex = (jokeIndex + 1) % ALL_JOKES.length;
    joke = ALL_JOKES[jokeIndex];
    guard++;
  }
  served.add(joke.setup);
  jokeIndex = (jokeIndex + 1) % ALL_JOKES.length;
  return joke;
}

export function getJokeCount(): number {
  return ALL_JOKES.length;
}

export const AVAILABLE_TOOLS = [
  { name: 'getWeatherSimulated', description: 'Simulated weather for 12+ world cities', usage: 'weather in <city>' },
  { name: 'getTimeNow', description: 'Current local time, date and timezone', usage: 'what time is it' },
  { name: 'calculate', description: 'Safe math evaluation (+, -, *, /, ^, sqrt, sin, cos…)', usage: 'calculate 2^10 + 500' },
  { name: 'generateRandomNumber', description: 'Random integer between min and max', usage: 'random number 1 to 100' },
  { name: 'getJoke', description: '70+ jokes served sequentially, never repeated', usage: 'tell me a joke' },
  { name: 'dice', description: 'Roll a six-sided die', usage: 'roll a dice' },
  { name: 'coin', description: 'Flip a coin', usage: 'flip a coin' },
  { name: 'getMonitorData', description: 'Live CPU, RAM and network readings', usage: 'system status' },
  { name: 'searchMemory', description: 'Search the conversation memory store', usage: 'search memory for "python"' },
  { name: 'getTimeNow', description: 'Current local time', usage: 'time' },
];
