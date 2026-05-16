// ============================================================================
// PHONONIC NEURAL LAYER — Acoustic Memory for the Photonic Brain
// ============================================================================
// src/lib/phononicNeuralEngine.ts
//
// Photonic = fast, instantaneous, no memory (world simulation)
// Phononic = slow, persistent, has memory (web interface, history)
// Optoacoustic = coupled light + sound (agent cognition, context)
//
// Based on:
// - Max Planck Institute: OREO (Optoacoustic REcurrent Operator) [^13^]
// - Virginia Tech: Lithium niobate nonlinear phononics [^15^]
//
// The phononic layer adds TEMPORAL DEPTH to the photonic network.
// Sound waves persist in the medium, creating a "reservoir" of past states.
// This is the MESO layer's memory — the interference patterns don't just
// exist in space, they RING in time.

import { Gate, Channel } from './types/synth';
import { getGeneticSignature, calculateGeneticResonance } from './geneticBinaryEngine';
import { PhotonicNeuralNetwork, PhotonicLayer, InterferencePattern } from './photonicNeuralEngine';

// ============================================================================
// 1. PHONONIC RESONATOR — The Acoustic Memory Cell
// ============================================================================
// A phononic resonator is a cavity where sound waves persist.
// Unlike photons, phonons have mass and interact with the medium.
// They decay slowly, creating a "memory" of previous computations.

export interface PhononicResonator {
  id: string;
  frequency: number;       // Resonant frequency (Hz)
  qualityFactor: number;     // Q factor — how long sound persists
  decayTime: number;        // Decay time constant (seconds)
  modeShape: Float32Array; // Spatial mode shape
  amplitude: number;       // Current amplitude
  phase: number;            // Current phase
  history: number[];        // Amplitude history (temporal memory)
  coupling: number;          // Coupling strength to photonic layer
}

/**
 * Create a phononic resonator from a gate's genetic signature
 * The resonant frequency is determined by the gate's elemental properties
 */
export function createPhononicResonator(gate: Gate): PhononicResonator {
  const sig = getGeneticSignature(gate);

  // Element determines resonant frequency
  const baseFreq: Record<string, number> = {
    Fire: 528,    // Love frequency
    Water: 417,   // Undoing situations
    Earth: 396,   // Liberating guilt/fear
    Air: 639,     // Connection/relationships
    Metal: 741,   // Awakening intuition
    Wood: 852,    // Returning to spiritual order
    Aether: 963,  // Divine consciousness
    Void: 0       // Silence
  };

  const frequency = baseFreq[sig.element] || 432;

  // Quality factor based on amino acid properties
  // Hydrophobic amino acids = higher Q (more stable)
  // Hydrophilic amino acids = lower Q (more dynamic)
  const qualityFactor = 1000 + sig.hydrophobicity * 500;

  // Decay time: longer for "older" elements (Earth, Metal)
  const decayTime = {
    Fire: 0.001, Water: 0.01, Earth: 0.1, Air: 0.005,
    Metal: 1.0, Wood: 0.05, Aether: 10.0, Void: Infinity
  }[sig.element] || 0.01;

  return {
    id: `phonon-${gate}`,
    frequency,
    qualityFactor,
    decayTime,
    modeShape: new Float32Array(64).fill(1.0), // Simplified
    amplitude: 0,
    phase: 0,
    history: [],
    coupling: sig.charge === 0 ? 0.5 : Math.abs(sig.charge) * 0.3
  };
}

// ============================================================================
// 2. PHONONIC RESERVOIR — Collective Acoustic Memory
// ============================================================================
// A reservoir is a network of coupled resonators.
// Like a lake where many ripples interfere — past states persist
// and influence future states through acoustic coupling.

export interface PhononicReservoir {
  id: string;
  resonators: PhononicResonator[];
  couplingMatrix: Float32Array; // How resonators influence each other
  temperature: number;         // Thermal noise level
  globalDecay: number;          // Overall reservoir decay rate
  stateVector: Float32Array;   // Current acoustic state
}

/**
 * Create a phononic reservoir from active gates
 * Each active gate gets a resonator.
 * The coupling matrix is determined by genetic resonance between gates.
 */
export function createPhononicReservoir(
  activeGates: Gate[],
  channels: Channel[]
): PhononicReservoir {
  const resonators = activeGates.map(g => createPhononicResonator(g));

  // Create coupling matrix
  const n = resonators.length;
  const couplingMatrix = new Float32Array(n * n);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        couplingMatrix[i * n + j] = 0; // No self-coupling
      } else {
        const resonance = calculateGeneticResonance(activeGates[i], activeGates[j]);
        couplingMatrix[i * n + j] = resonance.overallResonance;
      }
    }
  }

  return {
    id: `reservoir-${Date.now()}`,
    resonators,
    couplingMatrix,
    temperature: 0.01, // Low temperature = high coherence
    globalDecay: 0.001,
    stateVector: new Float32Array(n).fill(0)
  };
}

/**
 * Update reservoir state — acoustic waves evolve
 * This is the "slow" dynamics that gives memory
 */
export function evolveReservoir(
  reservoir: PhononicReservoir,
  photonicInput: Float32Array, // From photonic layer
  dt: number // Time step
): PhononicReservoir {
  const n = reservoir.resonators.length;
  const newState = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    const resonator = reservoir.resonators[i];

    // 1. Natural oscillation
    const naturalOscillation = Math.cos(resonator.frequency * dt + resonator.phase);

    // 2. Coupling from other resonators
    let couplingSum = 0;
    for (let j = 0; j < n; j++) {
      couplingSum += reservoir.couplingMatrix[i * n + j] * reservoir.stateVector[j];
    }

    // 3. Photonic input (optoacoustic coupling)
    const photonicCoupling = photonicInput[i] * resonator.coupling;

    // 4. Decay
    const decay = Math.exp(-dt / resonator.decayTime);

    // Combine
    newState[i] = (resonator.amplitude * naturalOscillation + 
                   couplingSum * 0.1 + 
                   photonicCoupling) * decay;

    // Update resonator
    resonator.amplitude = Math.abs(newState[i]);
    resonator.phase = Math.atan2(newState[i], resonator.amplitude);
    resonator.history.push(resonator.amplitude);

    // Trim history
    if (resonator.history.length > 1000) {
      resonator.history.shift();
    }
  }

  return {
    ...reservoir,
    stateVector: newState
  };
}

// ============================================================================
// 3. OPTOACOUSTIC COUPLING — Light + Sound = Cognition
// ============================================================================
// The optoacoustic layer is where photonic and phononic meet.
// Light creates sound (photoacoustic effect).
// Sound modulates light (acousto-optic effect).
// This is the "brain" of the system — where fast and slow interact.

export interface OptoacousticCoupler {
  id: string;
  photonicLayer: string;
  phononicReservoir: string;
  couplingStrength: number;  // How much light affects sound
  modulationDepth: number;   // How much sound affects light
  delay: number;            // Time delay between light and sound
}

/**
 * Create optoacoustic coupler between photonic and phononic layers
 */
export function createOptoacousticCoupler(
  photonic: PhotonicLayer,
  phononic: PhononicReservoir
): OptoacousticCoupler {
  // Coupling strength based on layer properties
  const strength = photonic.coherenceLength / 10.0;

  return {
    id: `oa-${photonic.id}-${phononic.id}`,
    photonicLayer: photonic.id,
    phononicReservoir: phononic.id,
    couplingStrength: strength,
    modulationDepth: 0.1,
    delay: 1e-9 // 1 nanosecond
  };
}

/**
 * Optoacoustic forward pass
 * Light creates sound → sound modulates light → repeat
 */
export function optoacousticForwardPass(
  photonicNetwork: PhotonicNeuralNetwork,
  phononicReservoir: PhononicReservoir,
  coupler: OptoacousticCoupler,
  iterations: number
): {
  photonicOutput: Float32Array;
  phononicState: Float32Array;
  optoacousticField: Float32Array;
} {
  let photonicState = new Float32Array(photonicNetwork.layers[0].diffractiveZones.length * 256);
  let phononicState = phononicReservoir.stateVector;

  const optoacousticField = new Float32Array(iterations);

  for (let t = 0; t < iterations; t++) {
    // 1. Photonic step (fast)
    // ... (simplified — would call forwardPass from photonic engine)

    // 2. Photoacoustic excitation
    // Light creates sound in the reservoir
    const photoacoustic = photonicState.map(p => p * coupler.couplingStrength);

    // 3. Phononic evolution (slow)
    phononicReservoir = evolveReservoir(phononicReservoir, photoacoustic, 1e-6);
    phononicState = phononicReservoir.stateVector;

    // 4. Acousto-optic modulation
    // Sound modulates light
    const acoustooptic = phononicState.map(p => p * coupler.modulationDepth);

    // 5. Combine
    photonicState = photonicState.map((p, i) => p + (acoustooptic[i] || 0));

    // 6. Record optoacoustic field strength
    optoacousticField[t] = Math.sqrt(
      photonicState.reduce((sum, p) => sum + p * p, 0) *
      phononicState.reduce((sum, p) => sum + p * p, 0)
    );
  }

  return {
    photonicOutput: photonicState,
    phononicState,
    optoacousticField
  };
}

// ============================================================================
// 4. TEMPORAL COHERENCE — The "Memory" of the System
// ============================================================================
// The phononic layer gives the system temporal coherence.
// Without it, each photonic pass is independent.
// With it, each pass is influenced by the previous ones.

export interface TemporalCoherence {
  shortTerm: number;   // Photonic coherence (instantaneous)
  mediumTerm: number;  // Optoacoustic coherence (milliseconds)
  longTerm: number;    // Phononic coherence (seconds)
  echoDepth: number;   // How many past states influence present
  reverberation: number; // How much past "rings" in present
}

/**
 * Calculate temporal coherence from reservoir history
 */
export function calculateTemporalCoherence(
  reservoir: PhononicReservoir
): TemporalCoherence {
  const histories = reservoir.resonators.map(r => r.history);

  // Short-term: latest state correlation
  const shortTerm = reservoir.stateVector.reduce((sum, v) => sum + v * v, 0) / reservoir.stateVector.length;

  // Medium-term: correlation with recent history
  let mediumTerm = 0;
  if (histories.length > 0 && histories[0].length > 10) {
    const recent = histories[0].slice(-10);
    const correlation = recent.reduce((sum, v, i) => sum + v * recent[recent.length - 1 - i], 0);
    mediumTerm = correlation / recent.length;
  }

  // Long-term: overall history variance
  const allHistory = histories.flat();
  const mean = allHistory.reduce((a, b) => a + b, 0) / allHistory.length;
  const variance = allHistory.reduce((sum, v) => sum + (v - mean) ** 2, 0) / allHistory.length;
  const longTerm = 1 / (1 + variance); // Low variance = high coherence

  // Echo depth: how far back correlations persist
  let echoDepth = 0;
  for (let delay = 1; delay < Math.min(100, histories[0]?.length || 0); delay++) {
    const h = histories[0];
    const correlation = h.slice(delay).reduce((sum, v, i) => sum + v * h[i], 0) / (h.length - delay);
    if (correlation > 0.1) echoDepth = delay;
  }

  // Reverberation: how much energy persists
  const reverberation = histories.reduce((sum, h) => {
    if (h.length < 2) return sum;
    const decay = h[h.length - 1] / h[0];
    return sum + decay;
  }, 0) / histories.length;

  return {
    shortTerm,
    mediumTerm,
    longTerm,
    echoDepth,
    reverberation
  };
}

// ============================================================================
// 5. THE COMPLETE PHOTONIC-PHONONIC BRAIN
// ============================================================================

export interface OptoacousticBrain {
  photonic: PhotonicNeuralNetwork;
  phononic: PhononicReservoir;
  coupler: OptoacousticCoupler;
  temporalCoherence: TemporalCoherence;
  state: 'photonic' | 'phononic' | 'optoacoustic' | 'resonant';
}

/**
 * Create the complete optoacoustic brain
 */
export function createOptoacousticBrain(
  birthData: any,
  activeGates: Gate[],
  channels: Channel[]
): OptoacousticBrain {
  // Import photonic engine
  const { createPhotonicNetwork } = require('./photonicNeuralEngine');

  const photonic = createPhotonicNetwork(birthData, activeGates, channels);
  const phononic = createPhononicReservoir(activeGates, channels);
  const coupler = createOptoacousticCoupler(photonic.layers[1], phononic);

  return {
    photonic,
    phononic,
    coupler,
    temporalCoherence: calculateTemporalCoherence(phononic),
    state: 'optoacoustic'
  };
}

/**
 * Run the brain — photonic + phononic + optoacoustic
 */
export function runBrain(
  brain: OptoacousticBrain,
  input: Float32Array,
  duration: number // How long to run (seconds)
): {
  output: Float32Array;
  temporalCoherence: TemporalCoherence;
  optoacousticSignature: Float32Array;
} {
  // 1. Photonic pass (fast)
  // const photonicResult = forwardPass(brain.photonic);

  // 2. Phononic evolution (slow)
  const iterations = Math.floor(duration * 1e6); // Microsecond steps
  const optoResult = optoacousticForwardPass(
    brain.photonic,
    brain.phononic,
    brain.coupler,
    iterations
  );

  // 3. Update coherence
  const coherence = calculateTemporalCoherence(brain.phononic);

  return {
    output: optoResult.photonicOutput,
    temporalCoherence: coherence,
    optoacousticSignature: optoResult.optoacousticField
  };
}

// ============================================================================
// 6. EXPORTS
// ============================================================================

export default {
  createPhononicResonator,
  createPhononicReservoir,
  evolveReservoir,
  createOptoacousticCoupler,
  optoacousticForwardPass,
  calculateTemporalCoherence,
  createOptoacousticBrain,
  runBrain
};
