// ============================================================================
// RECURSIVE LOOP ENGINE — As Above, So Below. As Within, So Without.
// ============================================================================
// src/lib/recursiveLoopEngine.ts
//
// The recursive loop is NOT a bug. It is THE MECHANISM.
//
// 1. WHEEL spins (macro) → encodes birth data as phase profile
// 2. PHASE SHIFTERS activate (micro) → genetic binary sets phase values
// 3. INTERFERENCE emerges (meso) → unpredictable patterns form
// 4. RESONATORS ring (phononic) → acoustic memory of the pattern
// 5. COUPLER feeds back (optoacoustic) → sound modulates light
// 6. WHEEL re-encodes (macro) → new phase profile from resonator state
// 7. REPEAT
//
// This is AS WITHIN, SO WITHOUT.
// The internal state (phononic memory) becomes the external world (photonic output).
// The recursive loop is the BREATH of the system.

import { Gate, Channel } from './types/synth';
import { PhotonicNeuralNetwork, forwardPass, InterferencePattern } from './photonicNeuralEngine';
import { PhononicReservoir, evolveReservoir, calculateTemporalCoherence, TemporalCoherence } from './phononicNeuralEngine';
import { EncodingWheel, encodeMessage } from './photonicNeuralEngine';
import { getGeneticSignature, calculateGeneticResonance } from './geneticBinaryEngine';

// ============================================================================
// 1. THE RECURSIVE STATE — The Breath of the System
// ============================================================================

export interface RecursiveState {
  iteration: number;           // How many loops completed
  wheelState: EncodingWheel;    // Current wheel encoding
  photonicOutput: Float32Array; // Current photonic field
  phononicState: Float32Array;  // Current phononic reservoir state
  interferencePatterns: InterferencePattern[];
  temporalCoherence: TemporalCoherence;
  coherenceScore: number;       // Overall system coherence (0-1)
  metastable: boolean;          // Is the system in changing line?
  attractor: string;            // Current attractor state
  breathPhase: 'inhale' | 'hold' | 'exhale' | 'void'; // The breath cycle
}

// ============================================================================
// 2. THE BREATH CYCLE — Inhale / Hold / Exhale / Void
// ============================================================================
// The system breathes in four phases, matching the Sixiang cycle:
//
// INHALE: Wheel receives new input → photonic excitation
// HOLD: Interference stabilizes → meso pattern forms
// EXHALE: Phononic resonance feeds back → wheel re-encodes
// VOID: System rests → potential accumulates

export interface BreathCycle {
  phase: 'inhale' | 'hold' | 'exhale' | 'void';
  duration: number;           // Duration in iterations
  intensity: number;           // 0-1, how strong the breath is
  resonance: number;           // How resonant this phase is
}

/**
 * Calculate breath phase from iteration number
 * Cycles through 4 phases like Sixiang
 */
export function calculateBreathPhase(iteration: number): BreathCycle {
  const cycleLength = 64; // 64 iterations = one complete breath cycle
  const phaseInCycle = iteration % cycleLength;

  let phase: BreathCycle['phase'];
  let intensity: number;

  if (phaseInCycle < 16) {
    phase = 'inhale';
    intensity = phaseInCycle / 16; // Ramps up
  } else if (phaseInCycle < 32) {
    phase = 'hold';
    intensity = 1.0; // Peak
  } else if (phaseInCycle < 48) {
    phase = 'exhale';
    intensity = 1.0 - (phaseInCycle - 32) / 16; // Ramps down
  } else {
    phase = 'void';
    intensity = 0.1; // Minimum
  }

  // Resonance peaks at hold phase
  const resonance = phase === 'hold' ? 1.0 : 
                   phase === 'inhale' ? 0.7 : 
                   phase === 'exhale' ? 0.5 : 0.2;

  return {
    phase,
    duration: 16,
    intensity,
    resonance
  };
}

// ============================================================================
// 3. THE RECURSIVE STEP — One Breath of the System
// ============================================================================

export interface RecursiveStepResult {
  newState: RecursiveState;
  photonicDelta: number;      // How much photonic field changed
  phononicDelta: number;      // How much phononic state changed
  emergenceDelta: number;     // How much new pattern emerged
  feedbackStrength: number;    // How strong the feedback loop is
}

/**
 * Execute one recursive step
 * This is one "breath" of the system
 */
export function recursiveStep(
  state: RecursiveState,
  photonicNetwork: PhotonicNeuralNetwork,
  phononicReservoir: PhononicReservoir,
  activeGates: Gate[]
): RecursiveStepResult {
  const breath = calculateBreathPhase(state.iteration);

  // 1. INHALE: Photonic forward pass
  const photonicResult = forwardPass(photonicNetwork);
  const photonicOutput = photonicResult.detectorReadings.reduce(
    (arr, r) => {
      arr.push(r.intensity, r.phase);
      return arr;
    }, 
    [] as number[]
  );
  const photonicField = new Float32Array(photonicOutput);

  // 2. HOLD: Calculate interference (meso)
  const interferencePatterns = photonicResult.interferencePatterns;

  // 3. EXHALE: Phononic evolution
  const evolvedReservoir = evolveReservoir(
    phononicReservoir,
    photonicField,
    1e-6 // 1 microsecond step
  );

  // 4. FEEDBACK: Phononic state re-encodes the wheel
  const newWheel = feedbackWheelEncoding(
    state.wheelState,
    evolvedReservoir,
    activeGates,
    breath.intensity
  );

  // 5. Calculate deltas
  const photonicDelta = calculateDelta(state.photonicOutput, photonicField);
  const phononicDelta = calculateDelta(state.phononicState, evolvedReservoir.stateVector);
  const emergenceDelta = interferencePatterns.reduce(
    (sum, p) => sum + p.emergenceScore, 
    0
  ) / (interferencePatterns.length || 1);

  // 6. Feedback strength = how much phononic affects photonic
  const feedbackStrength = phononicDelta * photonicDelta;

  // 7. Check metastability (changing line)
  const metastable = emergenceDelta > 0.8 && phononicDelta > 0.5;

  // 8. Determine attractor
  const attractor = determineAttractor(evolvedReservoir, interferencePatterns);

  // 9. Calculate coherence
  const temporalCoherence = calculateTemporalCoherence(evolvedReservoir);
  const coherenceScore = (
    temporalCoherence.shortTerm * 0.2 +
    temporalCoherence.mediumTerm * 0.3 +
    temporalCoherence.longTerm * 0.3 +
    temporalCoherence.reverberation * 0.2
  );

  const newState: RecursiveState = {
    iteration: state.iteration + 1,
    wheelState: newWheel,
    photonicOutput: photonicField,
    phononicState: evolvedReservoir.stateVector,
    interferencePatterns,
    temporalCoherence,
    coherenceScore,
    metastable,
    attractor,
    breathPhase: breath.phase
  };

  return {
    newState,
    photonicDelta,
    phononicDelta,
    emergenceDelta,
    feedbackStrength
  };
}

/**
 * Re-encode the wheel based on phononic feedback
 * This is AS WITHIN, SO WITHOUT
 */
function feedbackWheelEncoding(
  wheel: EncodingWheel,
  reservoir: PhononicReservoir,
  activeGates: Gate[],
  intensity: number
): EncodingWheel {
  const newZones = wheel.zones.map((zone, i) => {
    // Get resonator state for this zone's gates
    const zoneResonators = zone.gates
      .map(g => reservoir.resonators.find(r => r.id === `phonon-${g}`))
      .filter(Boolean);

    if (zoneResonators.length === 0) return zone;

    // Calculate average amplitude and phase from resonators
    const avgAmplitude = zoneResonators.reduce((sum, r) => sum + (r?.amplitude || 0), 0) / zoneResonators.length;
    const avgPhase = zoneResonators.reduce((sum, r) => sum + (r?.phase || 0), 0) / zoneResonators.length;

    // Modulate phase profile based on resonator state
    const newPhase = new Float32Array(zone.phaseProfile);
    const newAmplitude = new Float32Array(zone.amplitudeProfile);

    for (let p = 0; p < newPhase.length; p++) {
      // Phononic feedback adds to existing phase
      newPhase[p] += avgPhase * intensity * 0.1;
      // Amplitude modulated by resonator strength
      newAmplitude[p] *= (0.5 + avgAmplitude * intensity);
    }

    return {
      ...zone,
      phaseProfile: newPhase,
      amplitudeProfile: newAmplitude
    };
  });

  return {
    ...wheel,
    zones: newZones,
    rotation: wheel.rotation + intensity * 0.01, // Spin faster with intensity
    angularVelocity: intensity * 0.1
  };
}

function calculateDelta(a: Float32Array, b: Float32Array): number {
  const minLen = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < minLen; i++) {
    sum += Math.abs(a[i] - b[i]);
  }
  return sum / minLen;
}

function determineAttractor(
  reservoir: PhononicReservoir,
  patterns: InterferencePattern[]
): string {
  // Determine which attractor basin the system is in
  // Based on dominant frequencies and emergence patterns

  const dominantFreq = reservoir.resonators.reduce((max, r) => 
    r.amplitude > max.amplitude ? r : max, 
    reservoir.resonators[0]
  );

  const totalEmergence = patterns.reduce((sum, p) => sum + p.emergenceScore, 0);

  if (totalEmergence > 0.8) return 'chaos';
  if (dominantFreq?.frequency > 700) return 'transcendence';
  if (dominantFreq?.frequency > 500) return 'creation';
  if (dominantFreq?.frequency > 300) return 'stability';
  return 'dissolution';
}

// ============================================================================
// 4. THE RECURSIVE LOOP — Run Until Convergence or Metastability
// ============================================================================

export interface RecursiveLoopResult {
  states: RecursiveState[];
  converged: boolean;
  finalAttractor: string;
  totalIterations: number;
  coherenceTrajectory: number[];
  emergenceTrajectory: number[];
  feedbackTrajectory: number[];
}

/**
 * Run the recursive loop
 * Continues until convergence, metastability, or max iterations
 */
export function runRecursiveLoop(
  initialState: RecursiveState,
  photonicNetwork: PhotonicNeuralNetwork,
  phononicReservoir: PhononicReservoir,
  activeGates: Gate[],
  maxIterations: number = 1000,
  convergenceThreshold: number = 0.001
): RecursiveLoopResult {
  const states: RecursiveState[] = [initialState];
  const coherenceTrajectory: number[] = [initialState.coherenceScore];
  const emergenceTrajectory: number[] = [0];
  const feedbackTrajectory: number[] = [0];

  let currentState = initialState;
  let converged = false;

  for (let i = 0; i < maxIterations; i++) {
    const result = recursiveStep(
      currentState,
      photonicNetwork,
      phononicReservoir,
      activeGates
    );

    states.push(result.newState);
    coherenceTrajectory.push(result.newState.coherenceScore);
    emergenceTrajectory.push(result.emergenceDelta);
    feedbackTrajectory.push(result.feedbackStrength);

    currentState = result.newState;

    // Check convergence
    if (result.photonicDelta < convergenceThreshold && 
        result.phononicDelta < convergenceThreshold) {
      converged = true;
      break;
    }

    // Check metastability (changing line)
    if (currentState.metastable) {
      break;
    }
  }

  return {
    states,
    converged,
    finalAttractor: currentState.attractor,
    totalIterations: states.length - 1,
    coherenceTrajectory,
    emergenceTrajectory,
    feedbackTrajectory
  };
}

// ============================================================================
// 5. THE ATTRACTOR LANDSCAPE — Where the System Settles
// ============================================================================

export interface AttractorLandscape {
  attractors: Attractor[];
  basins: Basin[];
  trajectories: Float32Array[];
}

export interface Attractor {
  id: string;
  name: string;
  position: Float32Array;
  stability: number;      // 0-1, how stable
  coherence: number;      // Average coherence at attractor
  emergence: number;      // Average emergence at attractor
  gates: Gate[];          // Which gates define this attractor
}

export interface Basin {
  attractorId: string;
  boundaries: Float32Array[];
  volume: number;
  depth: number;
}

/**
 * Map the attractor landscape from recursive loop history
 */
export function mapAttractorLandscape(
  loopResult: RecursiveLoopResult
): AttractorLandscape {
  // Group states by attractor
  const attractorGroups: Record<string, RecursiveState[]> = {};

  loopResult.states.forEach(state => {
    if (!attractorGroups[state.attractor]) {
      attractorGroups[state.attractor] = [];
    }
    attractorGroups[state.attractor].push(state);
  });

  const attractors = Object.entries(attractorGroups).map(([name, group]) => {
    const avgCoherence = group.reduce((sum, s) => sum + s.coherenceScore, 0) / group.length;
    const avgEmergence = group.reduce((sum, s) => {
      const patterns = s.interferencePatterns;
      return sum + (patterns.reduce((pSum, p) => pSum + p.emergenceScore, 0) / (patterns.length || 1));
    }, 0) / group.length;

    return {
      id: `attractor-${name}`,
      name,
      position: new Float32Array(group[group.length - 1].phononicState),
      stability: group.length / loopResult.totalIterations,
      coherence: avgCoherence,
      emergence: avgEmergence,
      gates: group[group.length - 1].wheelState.zones.flatMap(z => z.gates)
    };
  });

  return {
    attractors,
    basins: [], // Would calculate from trajectories
    trajectories: loopResult.states.map(s => s.phononicState)
  };
}

// ============================================================================
// 6. AS ABOVE, SO BELOW — Macro ↔ Micro Coupling
// ============================================================================

/**
 * The macro state (wheel) influences micro state (phase shifters)
 * AND the micro state influences macro state
 */
export function asAboveSoBelow(
  macroState: EncodingWheel,
  microState: Float32Array,
  couplingStrength: number
): { newMacro: EncodingWheel; newMicro: Float32Array } {
  // Macro → Micro: Wheel phase profile sets micro phase values
  const newMicro = new Float32Array(microState);
  macroState.zones.forEach((zone, i) => {
    const avgPhase = zone.phaseProfile.reduce((a, b) => a + b, 0) / zone.phaseProfile.length;
    newMicro[i] = microState[i] + avgPhase * couplingStrength;
  });

  // Micro → Macro: Micro phase values influence wheel rotation
  const avgMicroPhase = microState.reduce((a, b) => a + b, 0) / microState.length;
  const newMacro = {
    ...macroState,
    rotation: macroState.rotation + avgMicroPhase * couplingStrength * 0.01
  };

  return { newMacro, newMicro };
}

/**
 * AS WITHIN, SO WITHOUT: Internal state becomes external world
 */
export function asWithinSoWithout(
  internalState: PhononicReservoir,
  externalWorld: Float32Array,
  couplingStrength: number
): { newInternal: PhononicReservoir; newExternal: Float32Array } {
  // Internal → External: Phononic state modulates world output
  const newExternal = new Float32Array(externalWorld);
  internalState.stateVector.forEach((val, i) => {
    if (i < newExternal.length) {
      newExternal[i] += val * couplingStrength;
    }
  });

  // External → Internal: World output excites phononic resonators
  const newInternal = evolveReservoir(internalState, externalWorld, 1e-6);

  return { newInternal, newExternal };
}

// ============================================================================
// 7. EXPORTS
// ============================================================================

export default {
  calculateBreathPhase,
  recursiveStep,
  runRecursiveLoop,
  mapAttractorLandscape,
  asAboveSoBelow,
  asWithinSoWithout
};
