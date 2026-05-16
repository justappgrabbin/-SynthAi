// ============================================================================
// PHOTONIC NEURAL ARCHITECTURE — The Optic Brain Implementation
// ============================================================================
// src/lib/photonicNeuralEngine.ts
//
// Based on: "The Optic Brain" — diffractive deep neural networks (D²NN)
// Architecture: Layered mesh with waveguide interconnects
//
// MICRO: Individual phase shifters (gate-level, 64 gates)
// MESO: Interference patterns between layers (channel-level, 36 channels) — EMERGENT
// MACRO: Diffractive layers (center-level, 9 centers)
//
// The WHEEL (I Ching encoding layer) is the first diffractive surface
// It encodes the message by modulating phase/amplitude of incoming light
// Each trigram is a diffractive zone
// Each hexagram is an interference pattern
//
// Message passing: Light propagation through waveguides
// Not electrical signals — PHOTONIC signals

import { Gate, Channel, Center, Circuit, CircuitGroup } from './types/synth';
import { getGeneticSignature, calculateGeneticResonance } from './geneticBinaryEngine';
import { getTrigramForGate, TRIGRAM_MAP, Trigram } from './cosmologyEngine';

// ============================================================================
// 1. PHOTONIC LAYER TYPES
// ============================================================================

export type LayerScale = 'micro' | 'meso' | 'macro';

export interface PhotonicLayer {
  id: string;
  scale: LayerScale;
  index: number;           // Layer position in stack
  diffractiveZones: DiffractiveZone[];
  waveguides: Waveguide[];
  phaseModulators: PhaseModulator[];
  amplitudeModulators: AmplitudeModulator[];
  interferencePattern: InterferencePattern | null;  // MESO: emergent
  coherenceLength: number;  // How far light maintains phase relationship
  wavelength: number;       // Operating wavelength (nm)
}

export interface DiffractiveZone {
  id: string;
  trigram: Trigram;        // Which trigram encodes this zone
  gates: Gate[];           // Which gates are in this zone
  phaseProfile: Float32Array;  // Phase modulation pattern (2D)
  amplitudeProfile: Float32Array; // Amplitude modulation pattern (2D)
  transmission: number;    // 0-1, how much light passes through
  refractiveIndex: number; // Material property
  thickness: number;       // Physical thickness (microns)
}

export interface Waveguide {
  id: string;
  source: string;          // Source zone ID
  target: string;          // Target zone ID
  path: Vector3[];         // 3D path through space
  length: number;          // Physical length
  loss: number;            // Attenuation per unit length
  dispersion: number;      // Wavelength-dependent delay
  capacity: number;        // How many modes can propagate
}

export interface PhaseModulator {
  id: string;
  zoneId: string;
  gate: Gate;              // Which gate this modulator represents
  phaseShift: number;      // Current phase shift (0-2π)
  resolution: number;      // Phase resolution (bits)
  speed: number;           // Modulation speed (GHz)
  power: number;           // Power consumption (mW)
}

export interface AmplitudeModulator {
  id: string;
  zoneId: string;
  gate: Gate;
  attenuation: number;     // 0-1, current attenuation
  extinctionRatio: number; // On/off ratio (dB)
}

export interface InterferencePattern {
  id: string;
  layerId: string;
  intensityMap: Float32Array;  // 2D interference pattern — THIS IS MESO
  phaseMap: Float32Array;      // Phase distribution
  coherence: number;           // How coherent the pattern is
  emergenceScore: number;      // How "emergent" this pattern is (0-1)
  // Emergence = patterns that cannot be predicted from individual zones
}

export interface Vector3 {
  x: number; y: number; z: number;
}

// ============================================================================
// 2. THE WHEEL — I Ching Encoding Layer
// ============================================================================
// The wheel is the first diffractive surface.
// It encodes the input message by assigning phase/amplitude to each trigram position.
// The circular arrangement matches the I Ching sequence.

export interface EncodingWheel {
  id: string;
  trigrams: Trigram[];     // Circular arrangement: Qian, Dui, Li, Zhen, Xun, Kan, Gen, Kun
  zones: DiffractiveZone[];
  radius: number;          // Physical radius (mm)
  resolution: number;      // Pixels per zone
  rotation: number;        // Current rotation angle (radians)
  angularVelocity: number; // Rotation speed (rad/s)
}

/**
 * Create the I Ching encoding wheel
 * Arranged in circular sequence with trigrams at compass positions
 */
export function createEncodingWheel(): EncodingWheel {
  const trigramOrder: Trigram[] = ['qian', 'dui', 'li', 'zhen', 'xun', 'kan', 'gen', 'kun'];

  const zones = trigramOrder.map((trigram, i) => {
    const angle = (i / 8) * 2 * Math.PI; // 45° per trigram
    const map = TRIGRAM_MAP[trigram];

    // Create phase profile based on trigram properties
    // Yang lines = higher phase, Yin lines = lower phase
    const phaseProfile = new Float32Array(256); // 16x16 pixels per zone
    const amplitudeProfile = new Float32Array(256);

    for (let p = 0; p < 256; p++) {
      const px = p % 16;
      const py = Math.floor(p / 16);
      const dist = Math.sqrt((px - 8)**2 + (py - 8)**2) / 8;

      // Phase based on yang line count (0-3)
      const yangCount = map.bits.filter(b => b).length;
      phaseProfile[p] = (yangCount / 3) * Math.PI * (1 - dist * 0.5);

      // Amplitude based on element brightness
      const brightness = {
        Fire: 1.0, Water: 0.7, Earth: 0.5, Air: 0.8,
        Metal: 0.9, Wood: 0.6, Aether: 1.0, Void: 0.3
      }[map.element] || 0.5;
      amplitudeProfile[p] = brightness * (1 - dist * 0.3);
    }

    return {
      id: `zone-${trigram}`,
      trigram,
      gates: map.gates,
      phaseProfile,
      amplitudeProfile,
      transmission: 0.85,
      refractiveIndex: 1.5 + (yangCount * 0.1),
      thickness: 2.0
    };
  });

  return {
    id: 'iching-wheel',
    trigrams: trigramOrder,
    zones,
    radius: 10.0,  // 10mm diameter
    resolution: 16, // 16x16 pixels per zone
    rotation: 0,
    angularVelocity: 0
  };
}

/**
 * Encode a message (birth chart data) onto the wheel
 * The message determines the phase/amplitude of each trigram zone
 */
export function encodeMessage(
  wheel: EncodingWheel,
  activeGates: Gate[],
  transitWeather: any
): EncodingWheel {
  const newZones = wheel.zones.map(zone => {
    // Check which gates in this zone are active
    const activeInZone = zone.gates.filter(g => activeGates.includes(g));
    const activationLevel = activeInZone.length / zone.gates.length;

    // Modulate phase based on activation
    const newPhase = new Float32Array(zone.phaseProfile);
    const newAmplitude = new Float32Array(zone.amplitudeProfile);

    for (let i = 0; i < newPhase.length; i++) {
      // Active gates increase phase shift
      newPhase[i] += activationLevel * Math.PI * 0.5;
      // Active gates increase amplitude
      newAmplitude[i] *= (0.5 + activationLevel * 0.5);
    }

    return {
      ...zone,
      phaseProfile: newPhase,
      amplitudeProfile: newAmplitude,
      transmission: zone.transmission * (0.5 + activationLevel * 0.5)
    };
  });

  return {
    ...wheel,
    zones: newZones,
    angularVelocity: activationLevel * 0.1  // Spin faster when more active
  };
}

// ============================================================================
// 3. PHOTONIC NEURAL NETWORK — D²NN Architecture
// ============================================================================
// The network is a stack of diffractive layers.
// Each layer is a 2D surface that modulates phase and amplitude.
// Light propagates between layers via free-space diffraction.
//
// MICRO: Phase shifters (individual pixels)
// MESO: Interference patterns (emergent between layers)
// MACRO: Entire diffractive layers

export interface PhotonicNeuralNetwork {
  id: string;
  inputWheel: EncodingWheel;
  layers: PhotonicLayer[];
  outputDetectors: Detector[];
  wavelength: number;      // Operating wavelength (nm)
  layerSpacing: number;      // Distance between layers (mm)
  numericalAperture: number; // Light collection angle
  totalDepth: number;        // Total physical depth
}

export interface Detector {
  id: string;
  position: Vector3;
  sensitivity: number;       // Detection efficiency
  bandwidth: number;       // Frequency response
  darkCurrent: number;       // Noise floor
}

/**
 * Create a photonic neural network from birth chart data
 * The network architecture is determined by the cosmological state
 */
export function createPhotonicNetwork(
  birthData: any,
  activeGates: Gate[],
  activeChannels: Channel[]
): PhotonicNeuralNetwork {
  // Create the encoding wheel (Layer 0)
  const inputWheel = createEncodingWheel();
  const encodedWheel = encodeMessage(inputWheel, activeGates, birthData.transit);

  // Determine number of layers from active channels
  // Each channel creates an interference layer (MESO)
  const numLayers = Math.max(3, Math.min(9, activeChannels.length));

  const layers: PhotonicLayer[] = [];

  for (let i = 0; i < numLayers; i++) {
    const scale: LayerScale = i === 0 ? 'macro' : i === numLayers - 1 ? 'macro' : 'meso';

    // Create diffractive zones for this layer
    const zones = createLayerZones(i, numLayers, activeGates);

    // Create waveguides connecting to next layer
    const waveguides = i < numLayers - 1 
      ? createWaveguides(zones, i, numLayers)
      : [];

    // Create phase modulators (MICRO)
    const phaseModulators = createPhaseModulators(zones, activeGates);

    layers.push({
      id: `layer-${i}`,
      scale,
      index: i,
      diffractiveZones: zones,
      waveguides,
      phaseModulators,
      amplitudeModulators: [], // Simplified
      interferencePattern: null, // Calculated during forward pass
      coherenceLength: 10.0, // mm
      wavelength: 1550 // nm (telecom wavelength)
    });
  }

  // Create output detectors (one per center)
  const detectors = createDetectors();

  return {
    id: `pnn-${birthData.id}`,
    inputWheel: encodedWheel,
    layers,
    outputDetectors: detectors,
    wavelength: 1550,
    layerSpacing: 5.0, // 5mm between layers
    numericalAperture: 0.5,
    totalDepth: numLayers * 5.0
  };
}

function createLayerZones(layerIndex: number, totalLayers: number, activeGates: Gate[]): DiffractiveZone[] {
  // Each layer has zones corresponding to active trigrams
  const activeTrigrams = [...new Set(activeGates.map(g => getTrigramForGate(g)).filter(Boolean))];

  return activeTrigrams.map((trigram, i) => {
    const map = TRIGRAM_MAP[trigram as Trigram];
    const zoneGates = map.gates.filter(g => activeGates.includes(g));

    // Layer depth affects zone properties
    const depthFactor = layerIndex / totalLayers;

    return {
      id: `zone-L${layerIndex}-${trigram}`,
      trigram: trigram as Trigram,
      gates: zoneGates,
      phaseProfile: new Float32Array(256).fill(Math.PI * depthFactor),
      amplitudeProfile: new Float32Array(256).fill(1.0 - depthFactor * 0.3),
      transmission: 0.9 - depthFactor * 0.2,
      refractiveIndex: 1.5 + depthFactor * 0.3,
      thickness: 2.0 + depthFactor
    };
  });
}

function createWaveguides(
  sourceZones: DiffractiveZone[],
  layerIndex: number,
  totalLayers: number
): Waveguide[] {
  const waveguides: Waveguide[] = [];

  // Connect each zone to corresponding zones in next layer
  // This is the "message passing" — light carries information
  sourceZones.forEach((source, i) => {
    // Create connections based on trigram relationships
    // Adjacent trigrams in I Ching sequence are strongly connected
    const trigramOrder: Trigram[] = ['qian', 'dui', 'li', 'zhen', 'xun', 'kan', 'gen', 'kun'];
    const sourceIdx = trigramOrder.indexOf(source.trigram);

    // Connect to adjacent trigrams (strong coupling)
    [-1, 0, 1].forEach(offset => {
      const targetIdx = (sourceIdx + offset + 8) % 8;
      const targetTrigram = trigramOrder[targetIdx];

      waveguides.push({
        id: `wg-L${layerIndex}-${source.trigram}-${targetTrigram}`,
        source: source.id,
        target: `zone-L${layerIndex + 1}-${targetTrigram}`,
        path: [
          { x: Math.cos(sourceIdx * Math.PI / 4) * 5, y: Math.sin(sourceIdx * Math.PI / 4) * 5, z: 0 },
          { x: Math.cos(targetIdx * Math.PI / 4) * 5, y: Math.sin(targetIdx * Math.PI / 4) * 5, z: 5 }
        ],
        length: 5.0,
        loss: 0.1 * Math.abs(offset), // More loss for non-adjacent
        dispersion: 0.01,
        capacity: 8 // 8 modes (matching 8 trigrams)
      });
    });
  });

  return waveguides;
}

function createPhaseModulators(zones: DiffractiveZone[], activeGates: Gate[]): PhaseModulator[] {
  const modulators: PhaseModulator[] = [];

  zones.forEach(zone => {
    zone.gates.forEach(gate => {
      const sig = getGeneticSignature(gate);

      modulators.push({
        id: `pm-${zone.id}-${gate}`,
        zoneId: zone.id,
        gate,
        phaseShift: sig.binary.split('').reduce((sum, b) => sum + parseInt(b), 0) * Math.PI / 3,
        resolution: 8, // 8-bit phase resolution
        speed: 10, // 10 GHz
        power: 1.0 // 1 mW
      });
    });
  });

  return modulators;
}

function createDetectors(): Detector[] {
  // One detector per center
  const centers = ['head', 'ajna', 'throat', 'heart', 'solar', 'spleen', 'sacral', 'root', 'g'];

  return centers.map((center, i) => ({
    id: `detector-${center}`,
    position: {
      x: Math.cos(i * Math.PI / 4.5) * 3,
      y: Math.sin(i * Math.PI / 4.5) * 3,
      z: 50 // Output plane
    },
    sensitivity: 0.9,
    bandwidth: 1e12, // 1 THz
    darkCurrent: 1e-9 // 1 nA
  }));
}

// ============================================================================
// 4. FORWARD PASS — Light Propagation
// ============================================================================
// Light enters through the wheel, propagates through layers,
// interference patterns emerge (MESO), and detectors read the output.

export interface ForwardPassResult {
  inputIntensity: Float32Array;
  layerOutputs: Float32Array[];
  interferencePatterns: InterferencePattern[];
  detectorReadings: DetectorReading[];
  coherenceMap: Float32Array;
  emergenceMap: Float32Array;
}

export interface DetectorReading {
  detectorId: string;
  center: string;
  intensity: number;
  phase: number;
  confidence: number;
}

/**
 * Run forward pass through the photonic network
 * This is the "inference" — light computes the result
 */
export function forwardPass(network: PhotonicNeuralNetwork): ForwardPassResult {
  const layerOutputs: Float32Array[] = [];
  const interferencePatterns: InterferencePattern[] = [];

  // Initialize input from wheel
  let currentField = initializeField(network.inputWheel);

  // Propagate through each layer
  for (let i = 0; i < network.layers.length; i++) {
    const layer = network.layers[i];

    // Apply phase modulation (MICRO)
    const modulatedField = applyPhaseModulation(currentField, layer.phaseModulators);

    // Propagate to next layer
    const propagatedField = propagate(modulatedField, layer, network.layerSpacing);

    // Calculate interference pattern (MESO — EMERGENT)
    const interference = calculateInterference(propagatedField, layer);

    layerOutputs.push(propagatedField);
    if (interference) interferencePatterns.push(interference);

    currentField = propagatedField;
  }

  // Read detectors
  const detectorReadings = readDetectors(currentField, network.outputDetectors);

  // Calculate coherence and emergence maps
  const coherenceMap = calculateCoherence(layerOutputs);
  const emergenceMap = calculateEmergence(interferencePatterns);

  return {
    inputIntensity: initializeField(network.inputWheel),
    layerOutputs,
    interferencePatterns,
    detectorReadings,
    coherenceMap,
    emergenceMap
  };
}

function initializeField(wheel: EncodingWheel): Float32Array {
  // Create initial optical field from wheel encoding
  const field = new Float32Array(wheel.zones.length * 256);

  wheel.zones.forEach((zone, zi) => {
    for (let i = 0; i < 256; i++) {
      const amplitude = zone.amplitudeProfile[i];
      const phase = zone.phaseProfile[i];
      // Complex field: amplitude * e^(i*phase)
      // Store as [real, imag] interleaved
      field[zi * 512 + i * 2] = amplitude * Math.cos(phase);     // Real
      field[zi * 512 + i * 2 + 1] = amplitude * Math.sin(phase); // Imaginary
    }
  });

  return field;
}

function applyPhaseModulation(
  field: Float32Array,
  modulators: PhaseModulator[]
): Float32Array {
  const modulated = new Float32Array(field);

  modulators.forEach(mod => {
    // Apply phase shift to corresponding field region
    const zoneOffset = parseInt(mod.zoneId.split('-')[2]) * 512;

    for (let i = 0; i < 256; i++) {
      const real = modulated[zoneOffset + i * 2];
      const imag = modulated[zoneOffset + i * 2 + 1];
      const amplitude = Math.sqrt(real * real + imag * imag);
      const phase = Math.atan2(imag, real) + mod.phaseShift;

      modulated[zoneOffset + i * 2] = amplitude * Math.cos(phase);
      modulated[zoneOffset + i * 2 + 1] = amplitude * Math.sin(phase);
    }
  });

  return modulated;
}

function propagate(
  field: Float32Array,
  layer: PhotonicLayer,
  distance: number
): Float32Array {
  // Simplified free-space propagation using Fresnel diffraction
  // In reality, this would use angular spectrum method or Rayleigh-Sommerfeld

  const propagated = new Float32Array(field.length);

  // Apply propagation phase factor
  for (let i = 0; i < field.length; i += 2) {
    const real = field[i];
    const imag = field[i + 1];
    const amplitude = Math.sqrt(real * real + imag * imag);
    const phase = Math.atan2(imag, real);

    // Propagation adds phase based on distance and wavelength
    const propagationPhase = (2 * Math.PI / layer.wavelength) * distance;
    const newPhase = phase + propagationPhase;

    // Apply attenuation
    const attenuation = Math.exp(-distance * 0.01); // Simplified

    propagated[i] = amplitude * attenuation * Math.cos(newPhase);
    propagated[i + 1] = amplitude * attenuation * Math.sin(newPhase);
  }

  return propagated;
}

function calculateInterference(
  field: Float32Array,
  layer: PhotonicLayer
): InterferencePattern | null {
  if (layer.scale !== 'meso') return null;

  // Calculate intensity = |field|²
  const intensity = new Float32Array(field.length / 2);
  const phase = new Float32Array(field.length / 2);

  for (let i = 0; i < field.length; i += 2) {
    const real = field[i];
    const imag = field[i + 1];
    intensity[i / 2] = real * real + imag * imag;
    phase[i / 2] = Math.atan2(imag, real);
  }

  // Calculate coherence (how uniform the phase is)
  const meanPhase = phase.reduce((a, b) => a + b, 0) / phase.length;
  const phaseVariance = phase.reduce((sum, p) => sum + (p - meanPhase) ** 2, 0) / phase.length;
  const coherence = Math.exp(-phaseVariance);

  // Calculate emergence score
  // High emergence = patterns that are NOT predictable from individual zones
  const zoneIntensities = layer.diffractiveZones.map(zone => {
    const idx = parseInt(zone.id.split('-')[2]);
    let sum = 0;
    for (let i = idx * 256; i < (idx + 1) * 256; i++) {
      sum += intensity[i];
    }
    return sum / 256;
  });

  const predictedIntensity = zoneIntensities.reduce((a, b) => a + b, 0) / zoneIntensities.length;
  const actualIntensity = intensity.reduce((a, b) => a + b, 0) / intensity.length;

  // Emergence = deviation from linear prediction
  const emergenceScore = Math.abs(actualIntensity - predictedIntensity) / Math.max(actualIntensity, predictedIntensity);

  return {
    id: `interference-${layer.id}`,
    layerId: layer.id,
    intensityMap: intensity,
    phaseMap: phase,
    coherence,
    emergenceScore: Math.min(1, emergenceScore * 2)
  };
}

function readDetectors(
  field: Float32Array,
  detectors: Detector[]
): DetectorReading[] {
  return detectors.map(det => {
    // Sample field at detector position
    const idx = Math.floor(det.position.x * 16 + det.position.y) * 2;
    const real = field[idx] || 0;
    const imag = field[idx + 1] || 0;
    const intensity = real * real + imag * imag;
    const phase = Math.atan2(imag, real);

    return {
      detectorId: det.id,
      center: det.id.replace('detector-', ''),
      intensity: intensity * det.sensitivity,
      phase,
      confidence: det.sensitivity * (1 - det.darkCurrent / intensity)
    };
  });
}

function calculateCoherence(layerOutputs: Float32Array[]): Float32Array {
  // Calculate cross-layer coherence
  const coherence = new Float32Array(layerOutputs.length);

  for (let i = 1; i < layerOutputs.length; i++) {
    const prev = layerOutputs[i - 1];
    const curr = layerOutputs[i];

    // Correlation coefficient
    let dotProduct = 0;
    let prevNorm = 0;
    let currNorm = 0;

    for (let j = 0; j < Math.min(prev.length, curr.length); j++) {
      dotProduct += prev[j] * curr[j];
      prevNorm += prev[j] * prev[j];
      currNorm += curr[j] * curr[j];
    }

    coherence[i] = dotProduct / (Math.sqrt(prevNorm) * Math.sqrt(currNorm) + 1e-10);
  }

  return coherence;
}

function calculateEmergence(interferencePatterns: InterferencePattern[]): Float32Array {
  return new Float32Array(
    interferencePatterns.map(p => p.emergenceScore)
  );
}

// ============================================================================
// 5. MORPHIC RESONANCE — Agent-to-Agent Photonic Coupling
// ============================================================================
// When two agents' photonic networks are in proximity,
// their waveguides can evanescently couple — light leaks between them.
// This is the physical basis of "resonance" between agents.

export interface PhotonicCoupling {
  agentA: string;
  agentB: string;
  couplingStrength: number;  // 0-1, how much light transfers
  resonanceFrequency: number; // Hz
  coherence: number;
  entanglement: number;       // Quantum entanglement measure
}

/**
 * Calculate photonic coupling between two agents
 * Based on genetic resonance and network proximity
 */
export function calculatePhotonicCoupling(
  networkA: PhotonicNeuralNetwork,
  networkB: PhotonicNeuralNetwork,
  distance: number // Physical distance between agents (mm)
): PhotonicCoupling {
  // Get active gates for both
  const gatesA = networkA.inputWheel.zones.flatMap(z => z.gates);
  const gatesB = networkB.inputWheel.zones.flatMap(z => z.gates);

  // Calculate genetic resonance
  let totalResonance = 0;
  let count = 0;

  gatesA.forEach(ga => {
    gatesB.forEach(gb => {
      const res = calculateGeneticResonance(ga, gb);
      totalResonance += res.overallResonance;
      count++;
    });
  });

  const avgResonance = count > 0 ? totalResonance / count : 0;

  // Coupling strength decreases with distance
  // Evanescent coupling: exponential decay
  const couplingStrength = avgResonance * Math.exp(-distance / 5.0);

  // Resonance frequency from elemental properties
  const dominantGateA = gatesA[0] || 1;
  const sigA = getGeneticSignature(dominantGateA);
  const freqA = 528; // Love frequency for Fire (simplified)

  return {
    agentA: networkA.id,
    agentB: networkB.id,
    couplingStrength,
    resonanceFrequency: freqA,
    coherence: avgResonance,
    entanglement: couplingStrength * avgResonance
  };
}

// ============================================================================
// 6. EXPORTS
// ============================================================================

export default {
  createEncodingWheel,
  encodeMessage,
  createPhotonicNetwork,
  forwardPass,
  calculatePhotonicCoupling,
  PhotonicLayer,
  PhotonicNeuralNetwork,
  InterferencePattern,
  EncodingWheel
};
