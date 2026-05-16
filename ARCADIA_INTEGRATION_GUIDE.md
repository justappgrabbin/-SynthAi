# ARCADIA + SYNTH OS INTEGRATION
## The Complete Duality Architecture

---

## The Core Insight

**Taiji (太極)** is your ontological address.
**Liangyi (兩儀)** is your world/web simultaneous counterpart.
**Sixiang (四象)** is your 4-domain entity (world, web, agent, memory).
**Bagua (八卦)** is your 8 trigrams mapping to 9 centers.
**64 Gua (六十四卦)** is your 64 gates.

This is NOT decoration. This is the **computational spine** of the entire system.

---

## How It Actually Works

### Step 1: Birth Data Enters → Taiji Mints

```typescript
const taiji = mintTaiji({
  year: 1990, month: 1, day: 1,
  hour: 12, minute: 0,
  latitude: 40.7, longitude: -74
});
// taiji.seed = deterministic hash of birth data
// taiji.void = true (unmanifest, potential only)
```

The Taiji is the **seed**. Everything that follows is derived from this one number.

### Step 2: User Activates → Liangyi Divides

```typescript
const liangyi = activateTaiji(taiji);
// liangyi.yin = { domain: 'web', active: false, seed: taiji.seed }
// liangyi.yang = { domain: 'world', active: false, seed: taiji.seed }
```

The Taiji splits into **two forms**:
- **Yin (陰)** = Web domain — receptive, interface, user-facing
- **Yang (陽)** = World domain — creative, simulation, agent-facing

They share the **same seed**. They are the **same thing** viewed from two sides.

### Step 3: System Tension Toggles → Sixiang Emerges

```typescript
const sixiang = generateSixiang(liangyi);
// sixiang.taiyin = Agent domain (Old Yin — accumulated self)
// sixiang.shaoyin = Web domain (Young Yin — present reception)
// sixiang.shaoyang = World domain (Young Yang — present creation)
// sixiang.taiyang = Memory domain (Old Yang — future potential)
```

From Two Forms come **Four Faces**:
- **Taiyin (太陰)** = Agent — the accumulated identity
- **Shaoyin (少陰)** = Web — the present interface
- **Shaoyang (少陽)** = World — the present simulation
- **Taiyang (太陽)** = Memory — the future potential

Each has a **phase** (new/waxing/full/waning) that rotates as the system evolves.

### Step 4: Birth Chart Activates → Bagua Lights Up

```typescript
let bagua = generateBagua(sixiang);
bagua = activateBagua(bagua, activeGates);
// bagua.trigrams.qian.active = true if gates 64,61,63 are active
// bagua.trigrams.kun.active = true if gates 5,14,29,59,9,3,42,27,34 are active
// etc.
```

The **Eight Trigrams** map to your **9 centers**:

| Trigram | Symbol | Element | Center | Gates |
|---------|--------|---------|--------|-------|
| ☰ Qian | 乾 | Heaven | Head | 64, 61, 63 |
| ☱ Dui | 兌 | Lake | Ajna | 47, 24, 4, 11 |
| ☲ Li | 離 | Fire | Throat | 56, 35, 12, 45, 33, 20 |
| ☳ Zhen | 震 | Thunder | Heart | 51, 21, 40, 26 |
| ☴ Xun | 巽 | Wind | Solar Plexus | 55, 30, 22, 36, 37, 6, 49 |
| ☵ Kan | 坎 | Water | Spleen | 48, 18, 57, 28, 44, 50, 32, 54 |
| ☶ Gen | 艮 | Mountain | Root | 38, 54, 19, 39, 41, 53, 60, 52, 58 |
| ☷ Kun | 坤 | Earth | Sacral | 5, 14, 29, 59, 9, 3, 42, 27, 34 |

The **G center (Identity)** is the **Taiji** that holds all eight.

### Step 5: Complete the I Ching → 64 Gua

```typescript
const hexagrams = generate64Gua(bagua);
// 8 trigrams × 8 trigrams = 64 hexagrams = 64 gates
// Upper trigram + Lower trigram = Gate
```

Each gate is a **hexagram** — two trigrams stacked:
- **Upper trigram** = outer expression (how the world sees it)
- **Lower trigram** = inner motivation (how the agent experiences it)

---

## The Duality in Practice

### World ↔ Web Synchronization

```typescript
// When world changes (Yang acts)
liangyi.yang.active = true;
liangyi.yang.manifestation = 'npc';
liangyi.yang.emotionalState = 'anger';

// Yin automatically reflects
const synced = syncLiangyi(liangyi);
// synced.yin.manifestation = 'dashboard'
// synced.yin.widgets = [EmotionPulse: 'anger']
```

### Domain Coherence

```typescript
// Check if two domains can communicate
const canCommunicate = areDomainsInResonance('world', 'web');
// true — they are adjacent in the Sixiang cycle

const canDream = areDomainsInResonance('agent', 'memory');
// true — they are opposite (Old Yin ↔ Old Yang)
```

### Changing Lines (Metastable States)

```typescript
// When a gate is in line 6, it becomes "changing"
const changing = checkChangingLines(bagua);
// ['li', 'kan'] — Fire and Water are changing

// The future trigram is the opposite
const future = getFutureTrigram('li');
// 'kan' — Fire becomes Water (line 6 transforms)
```

---

## Integration with Existing Files

### cosmologyEngine.ts → Your Existing System

```typescript
// In your morph engine, replace gate lookup with cosmological derivation:

// OLD:
const center = inferCenter(gate);

// NEW:
const trigram = getTrigramForGate(gate);
const center = TRIGRAM_MAP[trigram].center;
const element = TRIGRAM_MAP[trigram].element;

// This gives you element + center + trigram in one lookup
```

### cosmologyEngine.ts → arcadiaBridge.ts

```typescript
// When minting simultaneous entities, use cosmological state:

const cosmology = createCosmology(birthData, activeGates);

// The ontological address includes the full cosmology:
const address = {
  ...layers,
  taiji: cosmology.taiji.seed,
  liangyi: cosmology.liangyi,
  sixiang: cosmology.sixiang,
  trigram: getTrigramForGate(layers.gate),
  hexagram: cosmology.hexagrams.find(h => h.gate === layers.gate)
};
```

### cosmologyEngine.ts → worldgenBridge.ts

```typescript
// When building WorldGen prompts, use cosmological state:

const prompt = buildPrompt({
  ...seed,
  cosmology,
  trigram: getTrigramForGate(seed.activeGates[0]),
  hexagram: cosmology.hexagrams.find(h => h.gate === seed.activeGates[0])
});

// The prompt now includes:
// - Element from trigram (Fire/Water/Earth/Air)
// - Center from trigram (Head/Ajna/Throat/etc.)
// - Phase from Sixiang (new/waxing/full/waning)
// - Changing status (metastable or stable)
```

---

## The Complete File Map

```
src/
├── lib/
│   ├── cosmologyEngine.ts      ← NEW — Taiji → 64 Gua progression
│   ├── elementalCodonEngine.ts  ← NEW — Gate → DNA → Element → Architecture
│   ├── neuralTaxonomy.ts        ← NEW — Channel → Neural Architecture mapping
│   ├── worldgenBridge.ts        ← NEW — WorldGen API client
│   ├── arcadiaBridge.ts         ← EXISTING — Simultaneous counterparts
│   ├── morphEngine.ts           ← EXISTING — Morph pipeline
│   ├── channelGraphs.ts         ← EXISTING — 2-node channel graphs
│   └── transitEngine.ts         ← EXISTING — Transit calculations
├── components/
│   ├── apps/
│   │   ├── CosmologyApp.tsx     ← NEW — Visualizes Taiji → 64 Gua
│   │   └── WorldGenApp.tsx      ← NEW — World generation UI
│   └── os/
│       └── WorldViewer.tsx      ← NEW — 3D scene viewer
├── server/
│   └── worldgen_service.py      ← NEW — Python WorldGen wrapper
└── types/
    └── synth.ts                 ← EXISTING — All type definitions
```

---

## Next Steps

1. **Add CosmologyApp to your OS registry**:
```typescript
// src/os/appRegistry.ts
{
  id: 'cosmology',
  name: 'Cosmology',
  component: 'CosmologyApp',
  category: 'kernel',
  kernelAccess: true,
  icon: '☯️'
}
```

2. **Wire cosmology into birth chart calculation**:
```typescript
// When user enters birth data:
const chart = calculateBirthChart(data);
const cosmology = createCosmology(data, chart.activeGates);
// Store cosmology alongside chart
```

3. **Use cosmology for agent generation**:
```typescript
// When GAN coder creates agent:
const seed = {
  ...birthChart,
  cosmology,
  trigram: getTrigramForGate(birthChart.activeGates[0])
};
// Agent inherits full cosmological state
```

4. **Build the WorldGen prompt from cosmology**:
```typescript
const prompt = buildPrompt({
  phs,
  activeGates,
  cosmology,  // Now includes trigram, element, phase
  transitWeather
});
```

---

## The Vision

> "The system is not a calculator. It is a cosmology engine.
> Every birth creates a Taiji. Every Taiji divides into Liangyi.
> Every Liangyi becomes Sixiang. Every Sixiang becomes Bagua.
> Every Bagua becomes 64 Gua.
> 
> The world is not generated. It is **derived** from the seed.
> The web is not built. It is **manifested** from the void.
> The agent is not created. It is **recognized** from the pattern.
>
> This is classical Chinese cosmology as computational architecture."

---

*Files ready for integration:*
- `cosmologyEngine.ts` — The mathematical spine
- `CosmologyApp.tsx` — The visualization layer
- `elementalCodonEngine.ts` — The biological bridge
- `worldgenBridge.ts` — The 3D generation client
- `worldgen_service.py` — The Python backend
