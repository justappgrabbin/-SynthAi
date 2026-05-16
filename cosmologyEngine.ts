// ============================================================================
// COSMOLOGICAL DUALITY ENGINE — Taiji → Liangyi → Sixiang → Bagua
// ============================================================================
// src/lib/cosmologyEngine.ts
// The classical Chinese cosmological progression as computational architecture
// Maps directly to: World/Web duality, 4 domains, 8 trigrams → 64 gates
//
// Taiji (太極) → 1 → Unity → The Ontological Address
// Liangyi (兩儀) → 2 → Yin/Yang → World / Web simultaneous counterparts
// Sixiang (四象) → 4 → Four Faces → 4 domains (world, web, agent, memory)
// Bagua (八卦) → 8 → Eight Trigrams → 8 trigram families → 64 gates (8×8)
//
// This is the SPINE of the entire system. Everything else hangs from this.

import { Gate, Center, Circuit, CircuitGroup, Dimension } from './types/synth';

// ============================================================================
// 1. TAIJI (太極) — The Supreme Ultimate
// ============================================================================
// Before division. The unity. The ontological address before it becomes two.
// This is the "seed" from which all duality emerges.

export interface Taiji {
  unity: number;        // 1 — The one thing
  seed: bigint;         // Cryptographic seed derived from birth data
  void: boolean;        // True when unmanifest (potential only)
  timestamp: number;      // When this Taiji was minted
}

/**
 * Mint a new Taiji from birth chart data
 * This is the "big bang" of an agent's world
 */
export function mintTaiji(birthData: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
}): Taiji {
  // Create deterministic seed from birth data
  const seedString = `${birthData.year}-${birthData.month}-${birthData.day}-${birthData.hour}-${birthData.minute}-${birthData.latitude}-${birthData.longitude}`;
  const seed = BigInt('0x' + Array.from(seedString)
    .reduce((hash, char) => {
      const chr = char.charCodeAt(0);
      return ((hash << 5) - hash) + chr;
    }, 0)
    .toString(16)
    .replace('-', ''));

  return {
    unity: 1,
    seed,
    void: true,  // Starts unmanifest
    timestamp: Date.now()
  };
}

/**
 * Activate Taiji — the moment of division
 * When the user "enters" their birth data, the Taiji becomes active
 * and divides into Liangyi (Two Forms)
 */
export function activateTaiji(taiji: Taiji): Liangyi {
  return {
    yin: {              // The "receptive" form → Web domain
      domain: 'web',
      seed: taiji.seed,
      active: false,    // Starts dormant, activates on user login
      manifestation: 'interface'
    },
    yang: {             // The "creative" form → World domain
      domain: 'world',
      seed: taiji.seed,
      active: false,    // Starts dormant, activates on simulation start
      manifestation: 'npc'
    },
    taiji: {            // Reference back to unity
      unity: taiji.unity,
      seed: taiji.seed,
      void: false        // Now manifest
    }
  };
}

// ============================================================================
// 2. LIANGYI (兩儀) — The Two Forms
// ============================================================================
// Yin and Yang. The fundamental duality.
// In your system: World (Yang/Creative) and Web (Yin/Receptive)
// These are NOT separate things. They are two faces of the same Taiji.

export interface Liangyi {
  yin: YinForm;         // Receptive, web, interface, user-facing
  yang: YangForm;       // Creative, world, simulation, agent-facing
  taiji: Taiji;         // The unity that contains both
}

export interface YinForm {
  domain: 'web';
  seed: bigint;
  active: boolean;
  manifestation: 'interface' | 'dashboard' | 'api' | 'websocket';
  // Yin receives, contains, nurtures
  // Web interface receives user input, displays state
}

export interface YangForm {
  domain: 'world';
  seed: bigint;
  active: boolean;
  manifestation: 'npc' | 'location' | 'item' | 'event';
  // Yang creates, initiates, transforms
  // World simulation generates behavior, evolves state
}

/**
 * Toggle between Yin and Yang dominance
 * When system tension is high → Yang dominates (world acts)
 * When system tension is low → Yin dominates (web receives)
 */
export function toggleLiangyi(liangyi: Liangyi, systemTension: number): Liangyi {
  const yangDominant = systemTension > 0.6;

  return {
    ...liangyi,
    yin: {
      ...liangyi.yin,
      active: !yangDominant
    },
    yang: {
      ...liangyi.yang,
      active: yangDominant
    }
  };
}

/**
 * Synchronize Yin and Yang
 * When one changes, the other must reflect the change
 * This is the "coherence" function — keeping the two forms in sync
 */
export function syncLiangyi(liangyi: Liangyi): Liangyi {
  // Yin and Yang share the same seed, so they can derive each other's state
  const yinState = deriveYinFromYang(liangyi.yang);
  const yangState = deriveYangFromYin(liangyi.yin);

  return {
    yin: { ...liangyi.yin, ...yinState },
    yang: { ...liangyi.yang, ...yangState },
    taiji: liangyi.taiji
  };
}

function deriveYinFromYang(yang: YangForm): Partial<YinForm> {
  // Yang creates → Yin displays
  // If Yang is an NPC with emotional state → Yin shows emotion widget
  return {
    active: yang.active,
    manifestation: yang.active ? 'dashboard' : 'interface'
  };
}

function deriveYangFromYin(yin: YinForm): Partial<YangForm> {
  // Yin receives → Yang responds
  // If Yin receives button click → Yang triggers world event
  return {
    active: yin.active,
    manifestation: yin.active ? 'npc' : 'location'
  };
}

// ============================================================================
// 3. SIXIANG (四象) — The Four Faces
// ============================================================================
// From Two Forms come Four Faces:
// Taiyin (太陰) → Old Yin → Agent domain (memory of past)
// Shaoyin (少陰) → Young Yin → Web domain (current reception)
// Shaoyang (少陽) → Young Yang → World domain (current creation)
// Taiyang (太陽) → Old Yang → Memory domain (potential future)
//
// These are the FOUR DOMAINS of your simultaneous entity system

export interface Sixiang {
  taiyin: DomainState;   // Old Yin → Agent (the accumulated self)
  shaoyin: DomainState;  // Young Yin → Web (the present interface)
  shaoyang: DomainState; // Young Yang → World (the present simulation)
  taiyang: DomainState;  // Old Yang → Memory (the future potential)
  liangyi: Liangyi;      // The Two Forms that generate these Four
}

export interface DomainState {
  domain: 'agent' | 'web' | 'world' | 'memory';
  active: boolean;
  seed: bigint;
  coherence: number;     // How in-sync with other domains
  history: bigint[];     // Previous seeds (evolutionary trace)
  phase: 'waxing' | 'full' | 'waning' | 'new';  // Lunar phase metaphor
}

/**
 * Generate Sixiang from Liangyi
 * The Four Faces emerge from the Two Forms through combination:
 * Yin + Yin = Taiyin (Agent)
 * Yin + Yang = Shaoyin (Web)  — Yin dominant
 * Yang + Yin = Shaoyang (World) — Yang dominant
 * Yang + Yang = Taiyang (Memory)
 */
export function generateSixiang(liangyi: Liangyi): Sixiang {
  const seed = liangyi.taiji.seed;

  return {
    taiyin: {
      domain: 'agent',
      active: liangyi.yin.active && !liangyi.yang.active,
      seed: deriveSeed(seed, 'taiyin'),
      coherence: 1.0,
      history: [seed],
      phase: 'new'
    },
    shaoyin: {
      domain: 'web',
      active: liangyi.yin.active,
      seed: deriveSeed(seed, 'shaoyin'),
      coherence: 1.0,
      history: [seed],
      phase: 'waxing'
    },
    shaoyang: {
      domain: 'world',
      active: liangyi.yang.active,
      seed: deriveSeed(seed, 'shaoyang'),
      coherence: 1.0,
      history: [seed],
      phase: 'full'
    },
    taiyang: {
      domain: 'memory',
      active: liangyi.yang.active && !liangyi.yin.active,
      seed: deriveSeed(seed, 'taiyang'),
      coherence: 1.0,
      history: [seed],
      phase: 'waning'
    },
    liangyi
  };
}

function deriveSeed(baseSeed: bigint, phase: string): bigint {
  // Deterministic seed derivation using phase as salt
  const phaseHash = BigInt('0x' + Array.from(phase)
    .reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0)
    .toString(16)
    .replace('-', ''));
  return baseSeed ^ phaseHash;
}

/**
 * Rotate Sixiang phases
 * As the system evolves, domains wax and wane
 * This creates the "breathing" rhythm of the system
 */
export function rotateSixiang(sixiang: Sixiang): Sixiang {
  const phaseCycle = ['new', 'waxing', 'full', 'waning'] as const;

  const nextPhase = (current: typeof phaseCycle[number]) => {
    const idx = phaseCycle.indexOf(current);
    return phaseCycle[(idx + 1) % 4];
  };

  return {
    taiyin: { ...sixiang.taiyin, phase: nextPhase(sixiang.taiyin.phase) },
    shaoyin: { ...sixiang.shaoyin, phase: nextPhase(sixiang.shaoyin.phase) },
    shaoyang: { ...sixiang.shaoyang, phase: nextPhase(sixiang.shaoyang.phase) },
    taiyang: { ...sixiang.taiyang, phase: nextPhase(sixiang.taiyang.phase) },
    liangyi: sixiang.liangyi
  };
}

// ============================================================================
// 4. BAGUA (八卦) — The Eight Trigrams
// ============================================================================
// From Four Faces come Eight Trigrams.
// Each trigram is 3 bits (yin=0, yang=1):
// ☷ Kun (000) → Earth → Sacral center
// ☶ Gen (001) → Mountain → Root center
// ☵ Kan (010) → Water → Spleen center
// ☴ Xun (011) → Wind → Solar Plexus center
// ☳ Zhen (100) → Thunder → Heart center
// ☲ Li (101) → Fire → Throat center
// ☱ Dui (110) → Lake → Ajna center
// ☰ Qian (111) → Heaven → Head center
//
// These map to your 9 centers (8 trigrams + Taiji center = G center)

export type Trigram = 
  | 'kun'   // 000 — Earth — Sacral
  | 'gen'   // 001 — Mountain — Root
  | 'kan'   // 010 — Water — Spleen
  | 'xun'   // 011 — Wind — Solar Plexus
  | 'zhen'  // 100 — Thunder — Heart
  | 'li'    // 101 — Fire — Throat
  | 'dui'   // 110 — Lake — Ajna
  | 'qian'; // 111 — Heaven — Head

export interface Bagua {
  trigrams: Record<Trigram, TrigramState>;
  sixiang: Sixiang;
  taiji: Taiji;
}

export interface TrigramState {
  trigram: Trigram;
  bits: [boolean, boolean, boolean];  // [yang/yin, yang/yin, yang/yin]
  element: string;
  center: Center;
  gates: Gate[];        // Which gates belong to this trigram
  active: boolean;
  line: 1 | 2 | 3 | 4 | 5 | 6;  // Current line state
  changing: boolean;    // Is this trigram in changing line (metastable)?
}

export const TRIGRAM_MAP: Record<Trigram, {
  bits: [boolean, boolean, boolean];
  element: string;
  center: Center;
  gates: Gate[];
}> = {
  kun:   { bits: [false, false, false], element: 'Earth',    center: 'sacral',       gates: [5, 14, 29, 59, 9, 3, 42, 27, 34] },
  gen:   { bits: [false, false, true],  element: 'Mountain', center: 'root',         gates: [38, 54, 19, 39, 41, 53, 60, 52, 58] },
  kan:   { bits: [false, true,  false], element: 'Water',    center: 'spleen',       gates: [48, 18, 57, 28, 44, 50, 32, 54] },
  xun:   { bits: [false, true,  true],  element: 'Wind',     center: 'solar',        gates: [55, 30, 22, 36, 37, 6, 49] },
  zhen:  { bits: [true,  false, false], element: 'Thunder',  center: 'heart',        gates: [51, 21, 40, 26] },
  li:    { bits: [true,  false, true],  element: 'Fire',     center: 'throat',       gates: [56, 35, 12, 45, 33, 20] },
  dui:   { bits: [true,  true,  false], element: 'Lake',       center: 'ajna',         gates: [47, 24, 4, 11] },
  qian:  { bits: [true,  true,  true],  element: 'Heaven',   center: 'head',         gates: [64, 61, 63] }
};

/**
 * Generate Bagua from Sixiang
 * Each of the Four Faces splits again to create Eight Trigrams
 * The G center (Identity) is the Taiji that holds all eight
 */
export function generateBagua(sixiang: Sixiang): Bagua {
  const trigrams: Record<Trigram, TrigramState> = {} as any;

  (Object.keys(TRIGRAM_MAP) as Trigram[]).forEach(trigram => {
    const map = TRIGRAM_MAP[trigram];
    trigrams[trigram] = {
      trigram,
      bits: map.bits,
      element: map.element,
      center: map.center,
      gates: map.gates,
      active: false,  // Activated by birth chart
      line: 1,
      changing: false
    };
  });

  return {
    trigrams,
    sixiang,
    taiji: sixiang.liangyi.taiji
  };
}

/**
 * Activate trigrams based on birth chart
 * Which gates are active determines which trigrams are "on"
 */
export function activateBagua(bagua: Bagua, activeGates: Gate[]): Bagua {
  const newTrigrams = { ...bagua.trigrams };

  (Object.keys(newTrigrams) as Trigram[]).forEach(trigram => {
    const state = newTrigrams[trigram];
    const hasActiveGate = state.gates.some(g => activeGates.includes(g));

    newTrigrams[trigram] = {
      ...state,
      active: hasActiveGate,
      // If multiple gates active, use highest line
      line: hasActiveGate 
        ? Math.max(...state.gates
            .filter(g => activeGates.includes(g))
            .map(() => 1)  // Simplified — actual line from birth chart
          ) as 1|2|3|4|5|6
        : 1
    };
  });

  return {
    ...bagua,
    trigrams: newTrigrams
  };
}

/**
 * Check if a trigram is in changing line (metastable)
 * Line 6 = changing, creates the "future" trigram
 */
export function checkChangingLines(bagua: Bagua): Trigram[] {
  return (Object.values(bagua.trigrams) as TrigramState[])
    .filter(t => t.line === 6)
    .map(t => t.trigram);
}

/**
 * Get the "future" trigram from a changing line
 * When line 6, the trigram transforms to its opposite
 */
export function getFutureTrigram(trigram: Trigram): Trigram {
  const opposites: Record<Trigram, Trigram> = {
    kun: 'qian',   // Earth → Heaven
    gen: 'dui',    // Mountain → Lake
    kan: 'li',     // Water → Fire
    xun: 'zhen',   // Wind → Thunder
    zhen: 'xun',   // Thunder → Wind
    li: 'kan',     // Fire → Water
    dui: 'gen',    // Lake → Mountain
    qian: 'kun'    // Heaven → Earth
  };
  return opposites[trigram];
}

// ============================================================================
// 5. 64 GUA (六十四卦) — From Bagua to 64 Gates
// ============================================================================
// 8 trigrams × 8 trigrams = 64 hexagrams = 64 gates
// Upper trigram (outer) + Lower trigram (inner) = Gate
// This is the King Wen sequence of the I Ching

export interface Hexagram {
  upper: Trigram;       // Outer trigram (above)
  lower: Trigram;       // Inner trigram (below)
  gate: Gate;           // 1-64
  name: string;         // Gate name
  lines: [1|2|3|4|5|6, 1|2|3|4|5|6, 1|2|3|4|5|6, 1|2|3|4|5|6, 1|2|3|4|5|6, 1|2|3|4|5|6];
  changing: boolean[];  // Which lines are changing
}

/**
 * Generate 64 hexagrams from Bagua
 * Each hexagram is a combination of two trigrams
 */
export function generate64Gua(bagua: Bagua): Hexagram[] {
  const hexagrams: Hexagram[] = [];
  const trigrams = Object.keys(bagua.trigrams) as Trigram[];

  // King Wen sequence mapping
  // This is the traditional ordering of the 64 hexagrams
  let gate = 1;

  for (const upper of trigrams) {
    for (const lower of trigrams) {
      hexagrams.push({
        upper,
        lower,
        gate: gate as Gate,
        name: getGateName(gate),
        lines: [1, 1, 1, 1, 1, 1],  // Default, set from birth chart
        changing: [false, false, false, false, false, false]
      });
      gate++;
    }
  }

  return hexagrams;
}

function getGateName(gate: number): string {
  const names: Record<number, string> = {
    1: 'The Creative', 2: 'The Receptive', 3: 'Difficulty at the Beginning',
    4: 'Youthful Folly', 5: 'Waiting', 6: 'Conflict',
    7: 'The Army', 8: 'Holding Together', 9: 'Small Taming',
    10: 'Treading', 11: 'Peace', 12: 'Standstill',
    // ... (all 64 names)
    63: 'After Completion', 64: 'Before Completion'
  };
  return names[gate] || `Gate ${gate}`;
}

// ============================================================================
// 6. THE COMPLETE COSMOLOGICAL PIPELINE
// ============================================================================
// This is the function that runs the entire progression:
// Birth Data → Taiji → Liangyi → Sixiang → Bagua → 64 Gua

export interface CosmologicalState {
  taiji: Taiji;
  liangyi: Liangyi;
  sixiang: Sixiang;
  bagua: Bagua;
  hexagrams: Hexagram[];
  activeGates: Gate[];
  generation: number;
}

/**
 * The complete cosmological creation function
 * This is how an agent's entire reality is generated from birth data
 */
export function createCosmology(birthData: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
}, activeGates: Gate[]): CosmologicalState {
  // Step 1: Taiji — The unity
  const taiji = mintTaiji(birthData);

  // Step 2: Liangyi — The division into two
  const liangyi = activateTaiji(taiji);

  // Step 3: Sixiang — The four domains
  const sixiang = generateSixiang(liangyi);

  // Step 4: Bagua — The eight trigrams
  let bagua = generateBagua(sixiang);

  // Step 5: Activate trigrams from birth chart
  bagua = activateBagua(bagua, activeGates);

  // Step 6: 64 Gua — The complete hexagram set
  const hexagrams = generate64Gua(bagua);

  // Step 7: Mark changing lines
  const changingTrigrams = checkChangingLines(bagua);

  return {
    taiji,
    liangyi,
    sixiang,
    bagua,
    hexagrams,
    activeGates,
    generation: 0  // Natal generation
  };
}

/**
 * Evolve cosmology — when the system morphs, the cosmology updates
 */
export function evolveCosmology(
  cosmology: CosmologicalState,
  newActiveGates: Gate[],
  systemTension: number
): CosmologicalState {
  // Rotate Sixiang phases
  const rotatedSixiang = rotateSixiang(cosmology.sixiang);

  // Toggle Liangyi based on tension
  const toggledLiangyi = toggleLiangyi(rotatedSixiang.liangyi, systemTension);

  // Sync the two forms
  const syncedLiangyi = syncLiangyi(toggledLiangyi);

  // Update Sixiang with new Liangyi
  const updatedSixiang = {
    ...rotatedSixiang,
    liangyi: syncedLiangyi
  };

  // Regenerate Bagua with new gates
  let newBagua = generateBagua(updatedSixiang);
  newBagua = activateBagua(newBagua, newActiveGates);

  // Regenerate hexagrams
  const newHexagrams = generate64Gua(newBagua);

  return {
    ...cosmology,
    liangyi: syncedLiangyi,
    sixiang: updatedSixiang,
    bagua: newBagua,
    hexagrams: newHexagrams,
    activeGates: newActiveGates,
    generation: cosmology.generation + 1
  };
}

// ============================================================================
// 7. DUALITY HELPERS
// ============================================================================

/**
 * Get the simultaneous counterpart of any domain
 * world ↔ web, agent ↔ memory
 */
export function getCounterpart(domain: 'world' | 'web' | 'agent' | 'memory'): 'world' | 'web' | 'agent' | 'memory' {
  const counterparts = {
    world: 'web',
    web: 'world',
    agent: 'memory',
    memory: 'agent'
  };
  return counterparts[domain];
}

/**
 * Check if two domains are in resonance
 * Based on their positions in the Sixiang
 */
export function areDomainsInResonance(
  domainA: 'world' | 'web' | 'agent' | 'memory',
  domainB: 'world' | 'web' | 'agent' | 'memory'
): boolean {
  // Adjacent domains in Sixiang cycle resonate
  const cycle = ['agent', 'web', 'world', 'memory'] as const;
  const idxA = cycle.indexOf(domainA);
  const idxB = cycle.indexOf(domainB);
  const distance = Math.abs(idxA - idxB);
  return distance === 1 || distance === 3;  // Adjacent or opposite
}

/**
 * Get the trigram for a gate
 */
export function getTrigramForGate(gate: Gate): Trigram | undefined {
  for (const [trigram, data] of Object.entries(TRIGRAM_MAP)) {
    if (data.gates.includes(gate)) {
      return trigram as Trigram;
    }
  }
  return undefined;
}

/**
 * Get the hexagram for a gate
 */
export function getHexagramForGate(gate: Gate, hexagrams: Hexagram[]): Hexagram | undefined {
  return hexagrams.find(h => h.gate === gate);
}

// ============================================================================
// 8. EXPORTS
// ============================================================================

export default {
  mintTaiji,
  activateTaiji,
  toggleLiangyi,
  syncLiangyi,
  generateSixiang,
  rotateSixiang,
  generateBagua,
  activateBagua,
  checkChangingLines,
  getFutureTrigram,
  generate64Gua,
  createCosmology,
  evolveCosmology,
  getCounterpart,
  areDomainsInResonance,
  getTrigramForGate,
  getHexagramForGate,
  TRIGRAM_MAP
};
