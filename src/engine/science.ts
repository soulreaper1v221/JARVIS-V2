// ─── Science knowledge base: 8 domains ────────────────────────────────────

export interface ScienceConcept {
  name: string;
  definition: string;
}

export interface ScienceDomain {
  name: string;
  emoji: string;
  description: string;
  facts: string[];
  concepts: ScienceConcept[];
  formulas?: Array<{ name: string; formula: string; meaning: string }>;
}

export const SCIENCE_DB: ScienceDomain[] = [
  {
    name: 'physics',
    emoji: '⚛️',
    description: 'The study of matter, energy and their interactions.',
    facts: [
      'Light travels at 299,792,458 m/s in a vacuum — nothing with mass can beat it.',
      'Quantum entanglement links particles so that measuring one instantly determines the state of the other, regardless of distance.',
      'Gravity is the weakest of the four fundamental forces, yet it shapes the entire cosmos.',
      'Time dilates near massive objects and at high speeds (general & special relativity).',
      'The observable universe is about 93 billion light-years across.',
      'Sound cannot travel through a vacuum — there is literally no sound in space.',
      'An atom is 99.999999999999% empty space; if the nucleus were a marble, the atom would be a stadium.',
      'Ice floats because water expands and becomes less dense when it freezes.',
      'Black holes warp spacetime so much that even light cannot escape their event horizon.',
      'The double-slit experiment shows particles behaving as waves until observed.',
    ],
    concepts: [
      { name: 'Newton\'s laws', definition: 'Three laws of motion: inertia, F=ma, and action-reaction.' },
      { name: 'Gravity', definition: 'Attraction between masses; on Earth ≈ 9.8 m/s².' },
      { name: 'Electromagnetism', definition: 'Unified force of electricity and magnetism, mediated by photons.' },
      { name: 'Thermodynamics', definition: 'Laws governing heat, energy transfer and entropy.' },
      { name: 'Quantum mechanics', definition: 'Physics at atomic scale where states are probabilistic.' },
      { name: 'Relativity', definition: 'Einstein\'s framework: space-time is curved; the speed of light is constant.' },
      { name: 'Waves', definition: 'Oscillations that transfer energy without transferring matter.' },
      { name: 'Optics', definition: 'Study of light: reflection, refraction, diffraction, polarization.' },
      { name: 'Nuclear physics', definition: 'Study of atomic nuclei, fission, fusion and radioactivity.' },
      { name: 'Fluid dynamics', definition: 'Behavior of liquids and gases, described by the Navier-Stokes equations.' },
    ],
    formulas: [
      { name: 'Newton\'s second law', formula: 'F = m·a', meaning: 'Force equals mass times acceleration.' },
      { name: 'Kinetic energy', formula: 'KE = ½·m·v²', meaning: 'Energy of motion grows with the square of velocity.' },
      { name: 'Einstein mass-energy', formula: 'E = m·c²', meaning: 'Mass and energy are interchangeable.' },
      { name: 'Gravitational force', formula: 'F = G·m₁·m₂ / r²', meaning: 'Gravity weakens with the square of distance.' },
      { name: 'Ohm\'s law', formula: 'V = I·R', meaning: 'Voltage equals current times resistance.' },
      { name: 'Momentum', formula: 'p = m·v', meaning: 'Momentum is mass in motion.' },
      { name: 'Work', formula: 'W = F·d·cos(θ)', meaning: 'Work is force applied over distance.' },
      { name: 'Wave speed', formula: 'v = f·λ', meaning: 'Wave speed equals frequency times wavelength.' },
    ],
  },
  {
    name: 'chemistry',
    emoji: '🧪',
    description: 'The study of matter, its composition and its reactions.',
    facts: [
      'Water is the universal solvent — it dissolves more substances than any other liquid.',
      'The periodic table contains 118 confirmed elements, 94 of which occur naturally.',
      'Gold is so unreactive it never rusts or tarnishes.',
      'A mole of anything contains 6.022 × 10²³ particles (Avogadro\'s number).',
      'The only elements liquid at room temperature are mercury and bromine.',
      'Oxygen makes up about 21% of the atmosphere but 65% of your body mass.',
      'Diamonds and graphite are both made of pure carbon.',
      'Baking soda + vinegar is an acid-base reaction producing carbon dioxide gas.',
      'Every atom in your body was forged in a star billions of years ago.',
      'DNA is a chemical: a long polymer of nucleotides encoding genetic information.',
    ],
    concepts: [
      { name: 'Atom', definition: 'The smallest unit of an element, with protons, neutrons and electrons.' },
      { name: 'Molecule', definition: 'Two or more atoms bonded together.' },
      { name: 'Chemical bond', definition: 'The force holding atoms together: ionic, covalent or metallic.' },
      { name: 'pH', definition: 'Scale of acidity (0-14); 7 is neutral, below is acid, above is base.' },
      { name: 'Oxidation', definition: 'Loss of electrons; often combines with oxygen (rusting, burning).' },
      { name: 'Catalyst', definition: 'A substance that speeds a reaction without being consumed.' },
      { name: 'Stoichiometry', definition: 'Calculating quantities in chemical reactions via mole ratios.' },
      { name: 'Periodic table', definition: 'Elements arranged by atomic number, showing repeating trends.' },
    ],
    formulas: [
      { name: 'Moles', formula: 'n = m / M', meaning: 'Amount = mass ÷ molar mass.' },
      { name: 'Ideal gas law', formula: 'PV = nRT', meaning: 'Pressure × volume = moles × gas constant × temperature.' },
      { name: 'Concentration', formula: 'C = n / V', meaning: 'Concentration = moles ÷ volume in litres.' },
      { name: 'pH', formula: 'pH = -log₁₀[H⁺]', meaning: 'pH is the negative log of hydrogen ion concentration.' },
      { name: 'Density', formula: 'ρ = m / V', meaning: 'Density = mass ÷ volume.' },
    ],
  },
  {
    name: 'biology',
    emoji: '🧬',
    description: 'The study of life and living organisms.',
    facts: [
      'Your body replaces about 330 billion cells every day.',
      'The human genome contains roughly 20,000-25,000 genes.',
      'DNA would stretch about 2 meters long if uncoiled from a single cell.',
      'A single human can trace ancestry through mitochondrial DNA (passed maternally).',
      'The brain has about 86 billion neurons connected by 100 trillion synapses.',
      'Bacteria outnumber human cells in your body roughly 1.3 to 1.',
      'Octopuses have nine brains — one central and eight in their arms.',
      'The immortal jellyfish (Turritopsis dohrnii) can revert to its juvenile form.',
      'Photosynthesis converts sunlight into chemical energy, producing oxygen as a byproduct.',
      'Sharks existed before trees — about 450 million years.',
    ],
    concepts: [
      { name: 'DNA', definition: 'The molecule of heredity: a double helix of nucleotides (A, T, G, C).' },
      { name: 'Evolution', definition: 'Change in gene frequency over generations via natural selection.' },
      { name: 'Cell', definition: 'The basic unit of life; either prokaryotic or eukaryotic.' },
      { name: 'Homeostasis', definition: 'Maintaining stable internal conditions (temperature, pH, glucose).' },
      { name: 'Photosynthesis', definition: '6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂.' },
      { name: 'Respiration', definition: 'Releasing energy from glucose: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP.' },
      { name: 'Immune system', definition: 'Defense network: barriers, white blood cells, antibodies, memory.' },
      { name: 'Neuron', definition: 'A nerve cell that transmits electrical and chemical signals.' },
      { name: 'Gene', definition: 'A segment of DNA encoding a protein or function.' },
      { name: 'Symbiosis', definition: 'Close long-term interaction between species (mutualism, parasitism, commensalism).' },
    ],
  },
  {
    name: 'astronomy',
    emoji: '🔭',
    description: 'The study of celestial objects and the universe.',
    facts: [
      'The Sun is about 4.6 billion years old — halfway through its life.',
      'A day on Venus is longer than a year on Venus.',
      'Neutron stars are so dense that a teaspoon would weigh a billion tons.',
      'There are more stars in the universe than grains of sand on all Earth\'s beaches.',
      'The Milky Way contains 100-400 billion stars.',
      'Saturn\'s density is less than water — it would float in a big enough bathtub.',
      'The Hubble Space Telescope has observed galaxies over 13 billion light-years away.',
      'Jupiter\'s Great Red Spot is a storm larger than Earth that has raged for centuries.',
      'The universe is expanding, and distant galaxies are moving away faster.',
      'A light-year is about 9.46 trillion kilometers — the distance light travels in a year.',
    ],
    concepts: [
      { name: 'Star', definition: 'A glowing sphere of plasma powered by nuclear fusion.' },
      { name: 'Planet', definition: 'A body orbiting a star, massive enough to be round and clear its orbit.' },
      { name: 'Black hole', definition: 'A region where gravity is so strong nothing escapes.' },
      { name: 'Galaxy', definition: 'A gravitationally bound system of stars, gas and dark matter.' },
      { name: 'Nebula', definition: 'A cloud of gas and dust — often a stellar nursery.' },
      { name: 'Supernova', definition: 'The explosive death of a massive star, briefly outshining its galaxy.' },
      { name: 'Exoplanet', definition: 'A planet orbiting a star other than the Sun.' },
    ],
    formulas: [
      { name: 'Light-year', formula: '1 ly = c × 1 year ≈ 9.46 × 10¹² km', meaning: 'Distance light travels in one year.' },
      { name: 'Escape velocity', formula: 'vₑ = √(2GM/r)', meaning: 'Speed needed to escape a body\'s gravity.' },
      { name: 'Kepler\'s third law', formula: 'T² = (4π²/GM)·a³', meaning: 'Orbital period squared scales with orbit size cubed.' },
      { name: 'Doppler redshift', formula: 'z = Δλ/λ₀', meaning: 'Redshift measures how fast objects recede.' },
      { name: 'Stefan-Boltzmann law', formula: 'L = 4πR²σT⁴', meaning: 'A star\'s luminosity scales with T⁴.' },
    ],
  },
  {
    name: 'mathematics',
    emoji: '📐',
    description: 'The study of patterns, structure, quantity and change.',
    facts: [
      'π (pi) is irrational — its decimal expansion never repeats and never ends.',
      'The number zero was invented independently in India and Mesoamerica.',
      'There are infinitely many prime numbers (proved by Euclid ~300 BC).',
      'The golden ratio (φ ≈ 1.618) appears in art, architecture and nature.',
      'Googol is 10¹⁰⁰; a googolplex is 10^googol — larger than the atoms in the universe.',
      'The Monty Hall problem famously confuses even mathematicians: switching wins 2/3 of the time.',
      'Four colors are enough to color any map so no adjacent regions share a color (proved 1976).',
      'Euler\'s identity, e^(iπ) + 1 = 0, links five fundamental constants.',
      'There are infinite sizes of infinity — Georg Cantor\'s diagonal argument.',
      'Ramanujan, with almost no formal training, produced thousands of theorems.',
    ],
    concepts: [
      { name: 'Algebra', definition: 'Solving for unknowns using symbols and operations.' },
      { name: 'Calculus', definition: 'The mathematics of change: derivatives and integrals.' },
      { name: 'Probability', definition: 'Quantifying uncertainty: P(event) = favorable / total.' },
      { name: 'Statistics', definition: 'Collecting, analyzing and drawing conclusions from data.' },
      { name: 'Geometry', definition: 'Shapes, sizes, angles and spatial properties.' },
      { name: 'Number theory', definition: 'The study of integers and primes.' },
      { name: 'Linear algebra', definition: 'Vectors, matrices and transformations — the backbone of AI.' },
    ],
    formulas: [
      { name: 'Quadratic formula', formula: 'x = (-b ± √(b²-4ac)) / 2a', meaning: 'Solves ax² + bx + c = 0.' },
      { name: 'Pythagorean theorem', formula: 'a² + b² = c²', meaning: 'Relates the sides of a right triangle.' },
      { name: 'Area of a circle', formula: 'A = πr²', meaning: 'Area equals pi times radius squared.' },
      { name: 'Derivative of xⁿ', formula: 'd/dx xⁿ = n·xⁿ⁻¹', meaning: 'The power rule of differentiation.' },
      { name: 'Compound interest', formula: 'A = P(1 + r/n)^(nt)', meaning: 'Money grows exponentially over time.' },
    ],
  },
  {
    name: 'medicine',
    emoji: '🩺',
    description: 'The science of health, disease and treatment.',
    facts: [
      'The human heart beats about 100,000 times per day — 2.5 billion times in a lifetime.',
      'Vaccines have eradicated smallpox and are erasing polio.',
      'The placebo effect is real and measurable — expectation changes physiology.',
      'Antibiotics only work on bacteria, not viruses.',
      'The liver can regenerate itself even after 70% removal.',
      'Pain is processed in the brain — which is why phantom limb pain exists.',
      'Your skin sheds about 30,000-40,000 dead cells every minute.',
      'The immune system remembers pathogens for decades via memory cells.',
      'Laughter lowers cortisol and boosts endorphins and immune cells.',
      'The gut microbiome (~100 trillion microbes) influences mood, immunity and weight.',
    ],
    concepts: [
      { name: 'Vaccination', definition: 'Training the immune system with a harmless version of a pathogen.' },
      { name: 'Antibiotics', definition: 'Drugs that kill or inhibit bacteria (penicillin was the first).' },
      { name: 'MRI', definition: 'Magnetic resonance imaging — detailed soft-tissue scans without radiation.' },
      { name: 'Cardiovascular system', definition: 'Heart, blood and vessels delivering oxygen and nutrients.' },
      { name: 'Neuroplasticity', definition: 'The brain\'s ability to rewire itself after injury or learning.' },
      { name: 'Inflammation', definition: 'The immune response: redness, heat, swelling — healing in action.' },
      { name: 'Homeostasis', definition: 'The body\'s balancing act: temperature, blood sugar, pH, fluids.' },
    ],
  },
  {
    name: 'computer science',
    emoji: '💾',
    description: 'The study of computation, algorithms and information.',
    facts: [
      'The first programmable computer, the Z3, was built in 1941 by Konrad Zuse.',
      'Grace Hopper coined "debugging" after removing a moth from a relay in 1947.',
      'There are over 700 programming languages in active use.',
      'The internet weighs about 50 grams — the mass of electrons in motion.',
      'A single modern GPU can do trillions of operations per second.',
      'The "Turing test" (1950) asks whether a machine can pass as human in conversation.',
      'Alan Turing broke the Enigma code, shortening WWII by an estimated 2 years.',
      'The first computer virus was "Creeper" (1971), and the first antivirus "Reaper" was made to delete it.',
      'Bitcoin\'s hash rate exceeds the combined computing power of the top 500 supercomputers.',
      'The Y2K bug cost ~$300 billion to fix — a lesson in date handling.',
    ],
    concepts: [
      { name: 'Algorithm', definition: 'A finite sequence of steps solving a problem.' },
      { name: 'Data structure', definition: 'How data is organized: arrays, trees, hash maps, graphs.' },
      { name: 'Big-O notation', definition: 'How runtime grows with input: O(1), O(log n), O(n), O(n²)…' },
      { name: 'Recursion', definition: 'A function that calls itself, breaking a problem into smaller versions.' },
      { name: 'Machine learning', definition: 'Programs that improve from data instead of explicit rules.' },
      { name: 'Operating system', definition: 'Software managing hardware and running other programs.' },
      { name: 'Cryptography', definition: 'Securing information with encryption and hashing.' },
      { name: 'Compiler', definition: 'Translates high-level code into machine code.' },
    ],
    formulas: [
      { name: 'Binary', formula: '1011₂ = 1·2³+0·2²+1·2¹+1·2⁰ = 11₁₀', meaning: 'Base-2 number representation.' },
      { name: 'Shannon entropy', formula: 'H = -Σ pᵢ log₂(pᵢ)', meaning: 'Measures information content in bits.' },
      { name: 'Master theorem', formula: 'T(n) = aT(n/b) + f(n)', meaning: 'Analyzes divide-and-conquer recursion.' },
      { name: 'Hash collision', formula: 'P ≈ n²/(2m)', meaning: 'Birthday bound for hash collisions.' },
      { name: 'Bitrate', formula: 'B = N · log₂(M)', meaning: 'Bits per second given symbols per second.' },
    ],
  },
  {
    name: 'earth science',
    emoji: '🌍',
    description: 'The study of the Earth, its oceans, atmosphere and geology.',
    facts: [
      'Earth\'s core is about as hot as the Sun\'s surface (5,400°C).',
      'The crust is only about 1% of Earth\'s volume — like the skin of an apple.',
      'Tectonic plates move 2-5 cm per year — about fingernail growth speed.',
      'The atmosphere is 78% nitrogen and 21% oxygen.',
      'Earth is the only known planet with liquid surface water.',
      'The deepest ocean point, Challenger Deep, is ~11 km down.',
      'Antarctica holds about 60% of Earth\'s fresh water as ice.',
      'Volcanic eruptions can cool the planet by injecting sulfur aerosols into the stratosphere.',
    ],
    concepts: [
      { name: 'Plate tectonics', definition: 'The moving mosaic of Earth\'s crust driving earthquakes and mountains.' },
      { name: 'Rock cycle', definition: 'Igneous → sedimentary → metamorphic, driven by heat and pressure.' },
      { name: 'Atmosphere', definition: 'Layers of gas: troposphere, stratosphere, mesosphere, thermosphere.' },
      { name: 'Climate vs weather', definition: 'Weather is days; climate is 30-year averages.' },
      { name: 'Greenhouse effect', definition: 'Gases trapping heat; essential for life, dangerous in excess.' },
      { name: 'Water cycle', definition: 'Evaporation, condensation, precipitation, collection — Earth\'s recycling system.' },
    ],
  },
];

// ─── lookup helpers ────────────────────────────────────────────────────────

export function getScienceTopic(name: string): ScienceDomain | null {
  const n = name.toLowerCase();
  return (
    SCIENCE_DB.find((d) => d.name === n) ??
    SCIENCE_DB.find((d) => d.name.includes(n) || n.includes(d.name)) ??
    null
  );
}

export function getConceptExplanation(domain: string, concept: string): string | null {
  const d = getScienceTopic(domain);
  if (!d) return null;
  const c = d.concepts.find((x) => x.name.toLowerCase().includes(concept.toLowerCase()));
  return c ? c.definition : null;
}

export function getFormula(domain: string, formula: string): { name: string; formula: string; meaning: string } | null {
  const d = getScienceTopic(domain);
  if (!d || !d.formulas) return null;
  const f = d.formulas.find(
    (x) => x.name.toLowerCase().includes(formula.toLowerCase()) || x.formula.toLowerCase().includes(formula.toLowerCase()),
  );
  return f ?? null;
}

export function formatScienceResponse(domain: string, concept?: string): string {
  const d = getScienceTopic(domain);
  if (!d) return `I couldn't find a science domain matching "${domain}". Try physics, chemistry, biology, astronomy, mathematics, medicine, computer science, or earth science.`;
  let out = `${d.emoji} **${d.name[0].toUpperCase() + d.name.slice(1)}** — ${d.description}\n\n`;
  if (concept) {
    const c = getConceptExplanation(d.name, concept);
    if (c) {
      out += `**Concept: ${concept}**\n${c}\n\n`;
      const related = crossReference(concept, d.name);
      if (related.length) out += `_Related:_ ${related.join(' · ')}\n\n`;
    }
  } else {
    out += `**Key facts:**\n${d.facts.slice(0, 5).map((f) => `• ${f}`).join('\n')}\n\n`;
    out += `**Concepts:**\n${d.concepts.slice(0, 5).map((c) => `• **${c.name}** — ${c.definition}`).join('\n')}`;
    if (d.formulas) {
      out += `\n\n**Formulas:**\n${d.formulas.slice(0, 4).map((f) => `• ${f.name}: \`${f.formula}\` — ${f.meaning}`).join('\n')}`;
    }
  }
  return out;
}

export function getAllTopicNames(): string[] {
  return SCIENCE_DB.map((d) => d.name);
}

/** Find related concepts in other domains (cross-referencing). */
export function crossReference(query: string, fromDomain?: string): string[] {
  const q = query.toLowerCase();
  const hits: string[] = [];
  for (const d of SCIENCE_DB) {
    if (fromDomain && d.name === fromDomain) continue;
    const c = d.concepts.find(
      (x) => x.name.toLowerCase().includes(q) || q.includes(x.name.toLowerCase()),
    );
    if (c) hits.push(`${d.emoji} ${d.name}: ${c.name}`);
  }
  // also match on keyword overlap in facts
  for (const d of SCIENCE_DB) {
    if (hits.length > 6) break;
    if (fromDomain && d.name === fromDomain) continue;
    const fact = d.facts.find((f) => f.toLowerCase().includes(q));
    if (fact && !hits.some((h) => h.startsWith(d.emoji))) hits.push(`${d.emoji} ${d.name}: ${fact.slice(0, 60)}…`);
  }
  return hits.slice(0, 6);
}

/**
 * Deep research: combines the local science DB with web search and
 * cross-referencing into a synthesized multi-source report.
 */
export async function deepResearch(query: string): Promise<string> {
  const { multiSearch } = await import('./search');
  const topic = SCIENCE_DB.find((d) => query.toLowerCase().includes(d.name));
  const parts: string[] = [];
  if (topic) {
    parts.push(`### Local knowledge base (${topic.name})\n${topic.facts.slice(0, 3).map((f) => `• ${f}`).join('\n')}`);
  }
  try {
    const web = await multiSearch(query, { engines: ['wiki', 'ddg', 'arxiv'] });
    if (web.results.length) {
      parts.push(`### Web research (${web.results.length} sources)\n${web.results.slice(0, 4).map((r) => `• **${r.title}** — ${r.snippet} (_${r.source}_)`).join('\n')}`);
    }
  } catch {
    parts.push('### Web research\n_(web search unavailable — local database only)_');
  }
  const related = crossReference(query, topic?.name);
  if (related.length) parts.push(`### Cross-domain connections\n${related.map((r) => `• ${r}`).join('\n')}`);
  return parts.join('\n\n');
}
