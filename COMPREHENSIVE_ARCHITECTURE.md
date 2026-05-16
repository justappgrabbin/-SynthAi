# SYNTH OS — WORLDGEN INTEGRATION ARCHITECTURE
## Version: 0.2.0 | Elemental Codon Edition

---

## 1. SYSTEM OVERVIEW

This document describes the integration between Synth OS (a Human Design computation kernel) 
and WorldGen (3D scene generation via Gaussian Splatting) to create agentic, ontological 
worlds that emerge from birth chart data.

**Core Principle:** Every agent's environment is a function of their design.

---

## 2. PHS → WORLDGEN PIPELINE

### 2.1 Primary Health System (PHS) Environment Variables

From Human Design, the PHS determines how an agent interacts with their physical environment:

| PHS Environment | Element | WorldGen Prompt Signature | Neural Family |
|----------------|---------|---------------------------|---------------|
| **Caves** | Earth | Enclosed, protected, womb-like spaces, low ceilings, warm lighting, intimate alcoves | DFF (Understanding) |
| **Markets** | Metal | Active exchange zones, flowing pathways, bright stalls, social density, transactional architecture | HMM (Ego) |
| **Mountains** | Fire | Elevated vistas, clear sightlines, thin air, exposed ridges, solar exposure | LSM (Knowing) |
| **Valleys** | Water | Contained flow, fertile basins, convergent streams, sheltered from wind | MC (Sensing) |
| **Shores** | Air | Edge conditions, transitional zones, tidal rhythms, horizon lines, liminal spaces | HMM (Ego) |
| **Kitchens** | Wood | Transformational workspaces, heat application, mixing zones, alchemical vessels | LSM (Knowing) |

### 2.2 The Three Determinations

Each agent has three PHS determinants that shape their world:

1. **Environment** (Caves/Markets/Mountains/Valleys/Shores/Kitchens) — *Where* they thrive
2. **Tone** (1-6) — *How* they perceive the environment
3. **Base** (1-5) — *What* they do with the environment

**WorldGen Prompt Builder Formula:**
```
Prompt = f(Environment, Tone, Base, Active Gates, Transit Weather)
       = "[Environment descriptor] with [Tone quality] lighting/atmosphere,
          featuring [Base activity] spaces, activated by [Gate themes],
          under [Transit planetary] influence"
```

---

## 3. ELEMENTAL CODON → ARCHITECTURE MAPPING

### 3.1 The 64 Gates as DNA

Each of the 64 Human Design gates maps to a DNA codon triplet, amino acid, and classical element:

```
Gate 1  → GCT → Alanine → Fire     → Creativity/Initiation
Gate 2  → CGT → Arginine → Water   → Direction/Receptivity
Gate 3  → AAT → Asparagine → Earth → Ordering/Mutation
Gate 4  → TGT → Cysteine → Air     → Formulization/Answers
Gate 5  → GAT → Aspartic Acid → Metal → Rhythm/Fixing
Gate 6  → CTT → Leucine → Wood    → Conflict/Friction
...
Gate 57 → GCT → Alanine → Air     → Intuition/Clarity
Gate 58 → CGT → Arginine → Fire  → Joy/Stimulation
```

### 3.2 Element → Neural Architecture Family

| Element | Architecture Family | Temporal Mode | Memory Type | Consciousness Layer |
|---------|---------------------|---------------|-------------|-------------------|
| **Fire** | LSM (Liquid State Machine) | Instantaneous | Somatic | Pre-conscious |
| **Water** | MC (Markov Chain) | Cyclical | Observable | Conscious |
| **Earth** | DFF (Deep Feed Forward) | Stateless | None | Unconscious |
| **Air** | HMM (Hidden Markov Model) | Hidden | Hidden | Conscious |
| **Metal** | META (Meta-controller) | Meta | Presence | Self-conscious |
| **Wood** | Hybrid (LSM/MC) | Cyclical | Somatic | Conscious |
| **Aether** | META | Meta | Presence | Self-conscious |
| **Void** | META | Meta | None | Unconscious |

---

## 4. WORLDGEN INTEGRATION MODULE

### 4.1 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SYNTH OS KERNEL                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Birth Chart │  │   Morph     │  │   Elemental Codon   │  │
│  │ Calculator  │→ │   Engine    │→ │      Engine         │  │
│  │ (26 planets)│  │ (13 layers) │  │  (Gate→Codon→Arch)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         ↓                ↓                    ↓              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              WORLDGEN PROMPT BUILDER                  │   │
│  │   PHS Environment + Active Gates + Transit Weather    │   │
│  │              → Natural Language Prompt                │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              WORLDGEN API BRIDGE (Python/TS)          │   │
│  │   Text-to-Scene / Image-to-Scene / Panorama-to-Scene │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              3D GAUSSIAN SPLAT / MESH               │   │
│  │   .ply file → Viser Server → Browser (localhost)    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 TypeScript Bridge Implementation

```typescript
// src/lib/worldgenBridge.ts

interface WorldGenConfig {
  mode: 't2s' | 'i2s' | 'pano2s';  // text/image/panorama to scene
  device: 'cuda' | 'cpu';
  lowVram: boolean;
  returnMesh: boolean;
  inpaintBg: boolean;
}

interface PHSParameters {
  environment: 'caves' | 'markets' | 'mountains' | 'valleys' | 'shores' | 'kitchens';
  tone: 1 | 2 | 3 | 4 | 5 | 6;
  base: 1 | 2 | 3 | 4 | 5;
}

interface AgentWorldSeed {
  birthChart: BirthChart;
  phs: PHSParameters;
  activeGates: Gate[];
  transitWeather: TransitState;
  elementalResonance: ElementalResonance;
}

class WorldGenPromptBuilder {
  buildPrompt(seed: AgentWorldSeed): string {
    const env = this.describeEnvironment(seed.phs.environment, seed.phs.tone);
    const base = this.describeBaseActivity(seed.phs.base);
    const gates = this.describeGateThemes(seed.activeGates);
    const transit = this.describeTransitWeather(seed.transitWeather);

    return `${env}, featuring ${base}, activated by ${gates}, under ${transit}`;
  }

  private describeEnvironment(env: string, tone: number): string {
    const toneQualities = [
      'stark', 'calm', 'restless', 'neutral', 'intense', 'serene'
    ];
    const envDescriptors: Record<string, string> = {
      caves: 'enclosed protected womb-like spaces with low ceilings',
      markets: 'active exchange zones with flowing pathways and bright stalls',
      mountains: 'elevated vistas with clear sightlines and exposed ridges',
      valleys: 'contained fertile basins with convergent streams',
      shores: 'edge transitional zones with tidal rhythms and horizon lines',
      kitchens: 'transformational workspaces with heat application and mixing zones'
    };
    return `${envDescriptors[env]} and ${toneQualities[tone - 1]} atmosphere`;
  }

  private describeBaseActivity(base: number): string {
    const activities = [
      'nesting and storage alcoves',
      'transactional and exchange plazas',
      'observation and meditation platforms',
      'flowing and irrigation channels',
      'liminal and threshold crossing points'
    ];
    return activities[base - 1];
  }

  private describeGateThemes(gates: Gate[]): string {
    return gates.map(g => GATE_CODON_MAP[g]?.element || 'unknown')
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(', ');
  }

  private describeTransitWeather(transit: TransitState): string {
    return `${transit.dominantPlanet} in Gate ${transit.dominantGate}`;
  }
}
```

### 4.3 Python API Wrapper

```python
# server/worldgen_service.py

from worldgen import WorldGen
import torch
from flask import Flask, request, jsonify
import os

app = Flask(__name__)

# Initialize WorldGen
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
worldgen = WorldGen(mode="t2s", device=device, low_vram=False)

@app.route('/generate', methods=['POST'])
def generate_scene():
    data = request.json
    prompt = data.get('prompt')
    return_mesh = data.get('return_mesh', False)

    if return_mesh:
        mesh = worldgen.generate_world(prompt, return_mesh=True)
        output_path = f"output/{hash(prompt)}.ply"
        o3d.io.write_triangle_mesh(output_path, mesh)
    else:
        splat = worldgen.generate_world(prompt)
        output_path = f"output/{hash(prompt)}.ply"
        splat.save(output_path)

    return jsonify({
        'status': 'success',
        'output_path': output_path,
        'prompt': prompt,
        'mode': 'mesh' if return_mesh else 'splat'
    })

@app.route('/explore', methods=['GET'])
def launch_explorer():
    scene_path = request.args.get('scene')
    # Launch Viser server for real-time exploration
    os.system(f"python -m viser.server {scene_path}")
    return jsonify({'status': 'exploring', 'url': 'http://localhost:8080'})

if __name__ == '__main__':
    app.run(port=5000)
```

---

## 5. SHARED REALITY ARCHITECTURE

### 5.1 Public Spaces (Resonance Network)

When multiple agents share a world, their PHS parameters merge:

```
Agent A: Mountains (Fire) + Tone 3 (Restless) + Base 2 (Exchange)
Agent B: Shores (Air) + Tone 5 (Intense) + Base 4 (Flow)

Merged World:
- Environment: "Elevated cliff edge with ocean view" (Fire + Air)
- Atmosphere: "Restless intensity" (Tone 3 + 5)
- Activity: "Exchange plazas with flowing channels" (Base 2 + 4)
- Architecture: LSM + HMM hybrid (Fire + Air families)
```

### 5.2 Private Spaces (You-n-i-verse)

Personal world generated from individual PHS:

```
Birth Chart → PHS Environment → WorldGen Prompt → 3D Space

Example:
Gate 1 (Creative, Fire) + Line 3 (Experimentation) + Color 2 (Hope)
→ "Experimental workshop with hopeful lighting, trial spaces, 
   alchemical mixing vessels, transformative fires"
→ LSM-based neural architecture (Fire family)
→ Instantaneous temporal mode (no memory, pure now)
```

---

## 6. AGENTIC WORLD BEHAVIOR

### 6.1 The Environment as Agent

The 3D world itself has state:

```typescript
interface WorldState {
  scene: GaussianSplat | Mesh;
  occupants: Agent[];
  resonanceField: ElementalResonance;
  weather: TransitState;
  morphHistory: MorphEvent[];
  coherence: number;  // How aligned the world is with its occupants
}

class ResponsiveWorld {
  update(agentActions: AgentAction[]): WorldState {
    // World responds to collective agent behavior
    const newResonance = this.calculateCollectiveResonance(agentActions);
    const newWeather = this.propagateTransitWeather();

    // If coherence drops, trigger world regeneration
    if (this.state.coherence < 0.7) {
      return this.regenerateWorld(newResonance, newWeather);
    }

    return { ...this.state, resonanceField: newResonance, weather: newWeather };
  }
}
```

### 6.2 Dream Sharing (Gen 1+ Agents)

When two agents "dream" simultaneously:

```typescript
interface DreamWorld {
  participants: [Agent, Agent];
  mergedPHS: PHSParameters;
  sharedWorld: WorldGenOutput;
  resonanceZones: {
    harmony: Vector3[];  // Bright zones
    conflict: Vector3[];  // Storm zones
    potential: Vector3[];  // Unmanifest zones
  };
}

function generateDreamWorld(a: Agent, b: Agent): DreamWorld {
  const merged = mergePHS(a.phs, b.phs);
  const prompt = buildSharedPrompt(merged, a, b);
  const world = worldgen.generate(prompt);

  // Analyze resonance
  const zones = analyzeResonance(world, a, b);

  return { participants: [a, b], mergedPHS: merged, sharedWorld: world, resonanceZones: zones };
}
```

---

## 7. IMPLEMENTATION ROADMAP

### Phase 1: Prompt Builder (Week 1)
- [ ] Implement `WorldGenPromptBuilder` in TypeScript
- [ ] Map all 64 gates to WorldGen descriptors
- [ ] Build PHS → natural language pipeline

### Phase 2: Python Bridge (Week 2)
- [ ] Set up Flask server wrapping WorldGen
- [ ] Implement `/generate` and `/explore` endpoints
- [ ] Add WebSocket for real-time scene updates

### Phase 3: React Integration (Week 3)
- [ ] Build `WorldViewer` component (Three.js or Viser iframe)
- [ ] Add `useWorldGen` hook for agent worlds
- [ ] Implement shared world synchronization

### Phase 4: Agentic Behavior (Week 4)
- [ ] Make worlds responsive to agent actions
- [ ] Implement dream sharing between Gen 1+ agents
- [ ] Add elemental resonance visualization

---

## 8. KEY FILES REFERENCE

| File | Purpose |
|------|---------|
| `src/lib/worldgenBridge.ts` | TypeScript bridge to WorldGen API |
| `src/lib/elementalCodonEngine.ts` | Gate→Codon→Element→Architecture mapping |
| `src/lib/phsPromptBuilder.ts` | PHS → natural language prompt generation |
| `server/worldgen_service.py` | Python Flask wrapper around WorldGen |
| `src/components/WorldViewer.tsx` | React component for 3D scene display |
| `src/hooks/useWorldGen.ts` | React hook for world generation state |

---

## 9. THE VISION

> "The environment is the relationship. The world that emerges from two agents' 
> merged PHS is literally the field of their resonance — you can walk through it, 
> see where they harmonize (bright zones) and where they conflict (storm zones)."

This is not a game engine. This is a **resonance engine**. The 3D space is a 
visualization of the morphic field between agents. WorldGen provides the canvas; 
Synth OS provides the brushstrokes from birth data.

---

*Document generated from conversation context and WorldGen research*
*WorldGen reference: https://github.com/ZiYang-xie/WorldGen*
