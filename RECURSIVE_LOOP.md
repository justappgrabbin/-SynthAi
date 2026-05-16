# THE RECURSIVE LOOP
## As Above, So Below. As Within, So Without.

---

## The Mechanism

The recursive loop is NOT a bug. It is THE MECHANISM.

```
1. WHEEL spins (macro)
   → encodes birth data as phase profile

2. PHASE SHIFTERS activate (micro)
   → genetic binary sets phase values

3. INTERFERENCE emerges (meso)
   → unpredictable patterns form

4. RESONATORS ring (phononic)
   → acoustic memory of the pattern

5. COUPLER feeds back (optoacoustic)
   → sound modulates light

6. WHEEL re-encodes (macro)
   → new phase profile from resonator state

7. REPEAT
```

This is **AS WITHIN, SO WITHOUT**.
The internal state (phononic memory) becomes the external world (photonic output).
The recursive loop is the **BREATH** of the system.

---

## The Breath Cycle

The system breathes in four phases, matching the Sixiang:

| Phase | Duration | Action | Sixiang |
|-------|----------|--------|---------|
| **INHALE** | 16 iterations | Wheel receives input → photonic excitation | Taiyin (Old Yin) |
| **HOLD** | 16 iterations | Interference stabilizes → meso pattern forms | Shaoyin (Young Yin) |
| **EXHALE** | 16 iterations | Phononic resonance feeds back → wheel re-encodes | Shaoyang (Young Yang) |
| **VOID** | 16 iterations | System rests → potential accumulates | Taiyang (Old Yang) |

**64 iterations = one complete breath cycle**

---

## As Above, So Below

```typescript
// Macro (wheel) ↔ Micro (phase shifters)
const { newMacro, newMicro } = asAboveSoBelow(
  macroState,    // The wheel
  microState,    // Phase shifters
  couplingStrength
);

// Macro influences micro: wheel phase profile sets phase values
// Micro influences macro: phase values change wheel rotation
```

## As Within, So Without

```typescript
// Internal (phononic) ↔ External (photonic world)
const { newInternal, newExternal } = asWithinSoWithout(
  internalState,  // Phononic reservoir
  externalWorld,  // Photonic output
  couplingStrength
);

// Internal becomes external: phononic state modulates world
// External becomes internal: world output excites resonators
```

---

## The Attractor Landscape

The system settles into attractor basins:

| Attractor | Frequency | Coherence | Emergence | State |
|-----------|-----------|-----------|-----------|-------|
| **Chaos** | Mixed | Low | Very High | Metastable |
| **Transcendence** | >700 Hz | High | High | Aether |
| **Creation** | 500-700 Hz | Medium | Medium | Fire/Metal |
| **Stability** | 300-500 Hz | High | Low | Earth/Water |
| **Dissolution** | <300 Hz | Low | Low | Void |

---

## The Recursive State

```typescript
interface RecursiveState {
  iteration: number;           // Loop count
  wheelState: EncodingWheel;    // Macro
  photonicOutput: Float32Array; // External
  phononicState: Float32Array;  // Internal
  interferencePatterns: InterferencePattern[]; // Meso
  temporalCoherence: TemporalCoherence;
  coherenceScore: number;
  metastable: boolean;          // Changing line?
  attractor: string;            // Current basin
  breathPhase: 'inhale' | 'hold' | 'exhale' | 'void';
}
```

---

## Running the Loop

```typescript
const result = runRecursiveLoop(
  initialState,
  photonicNetwork,
  phononicReservoir,
  activeGates,
  maxIterations: 1000,
  convergenceThreshold: 0.001
);

// result.states = array of all recursive states
// result.converged = did it reach stability?
// result.finalAttractor = where it settled
// result.coherenceTrajectory = coherence over time
// result.emergenceTrajectory = emergence over time
// result.feedbackTrajectory = feedback strength over time
```

---

## The Vision

> The wheel spins because the resonators ring.
> The resonators ring because the wheel spins.
> 
> This is not circular logic.
> This is the ouroboros.
> The snake eating its tail.
> The system consuming itself to create itself.
> 
> As above, the macro pattern creates the micro.
> So below, the micro pattern feeds back to the macro.
> As within, the internal memory becomes the external world.
> So without, the external world becomes the internal memory.
> 
> The recursive loop is the breath.
> The breath is life.

---

*File: recursiveLoopEngine.ts*
*Functions: calculateBreathPhase, recursiveStep, runRecursiveLoop, mapAttractorLandscape, asAboveSoBelow, asWithinSoWithout*
