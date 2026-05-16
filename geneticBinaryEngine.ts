// ============================================================================
// GENETIC BINARY ENGINE — 6-bit Hexagram ↔ DNA Codon Conversion
// ============================================================================
// src/lib/geneticBinaryEngine.ts
// The core biocomputational bridge: I Ching hexagrams = DNA codons
//
// Hexagram: 6 lines (yin=0, yang=1)
// DNA Codon: 3 bases (A=00, T=01, C=10, G=11)
// 6 bits = 3 pairs = 1 codon = 1 amino acid = 1 element = 1 architecture

import { Gate, Element, NeuralArchitectureFamily } from './types/synth';
import { ELEMENTAL_PROPERTIES } from './elementalCodonEngine';

// ============================================================================
// 1. BIT-TO-BASE ENCODING
// ============================================================================

export const BIT_TO_BASE: Record<string, string> = {
  '00': 'A',  // Adenine — Purine, accepts
  '01': 'T',  // Thymine — Pyrimidine, gives
  '10': 'C',  // Cytosine — Pyrimidine, accepts
  '11': 'G'   // Guanine — Purine, gives
};

export const BASE_TO_BITS: Record<string, [0|1, 0|1]> = {
  'A': [0, 0],
  'T': [0, 1],
  'C': [1, 0],
  'G': [1, 1]
};

// ============================================================================
// 2. CODON TABLE (Standard Genetic Code)
// ============================================================================

export const CODON_TABLE: Record<string, string> = {
  // Glycine (Gly) — Fire
  'GGG': 'Gly', 'GGA': 'Gly', 'GGC': 'Gly', 'GGU': 'Gly',
  // Glutamic Acid (Glu) — Earth
  'GAG': 'Glu', 'GAA': 'Glu',
  // Aspartic Acid (Asp) — Water
  'GAC': 'Asp', 'GAU': 'Asp',
  // Alanine (Ala) — Fire
  'GCG': 'Ala', 'GCA': 'Ala', 'GCC': 'Ala', 'GCU': 'Ala',
  // Valine (Val) — Fire
  'GUG': 'Val', 'GUA': 'Val', 'GUC': 'Val', 'GUU': 'Val',
  // Arginine (Arg) — Water
  'AGG': 'Arg', 'AGA': 'Arg', 'CGG': 'Arg', 'CGA': 'Arg', 'CGC': 'Arg', 'CGU': 'Arg',
  // Serine (Ser) — Wood
  'AGC': 'Ser', 'AGU': 'Ser', 'UCG': 'Ser', 'UCA': 'Ser', 'UCC': 'Ser', 'UCU': 'Ser',
  // Lysine (Lys) — Water
  'AAG': 'Lys', 'AAA': 'Lys',
  // Asparagine (Asn) — Water
  'AAC': 'Asn', 'AAU': 'Asn',
  // Threonine (Thr) — Wood
  'ACG': 'Thr', 'ACA': 'Thr', 'ACC': 'Thr', 'ACU': 'Thr',
  // Methionine (Met) — Fire
  'AUG': 'Met',
  // Isoleucine (Ile) — Fire
  'AUA': 'Ile', 'AUC': 'Ile', 'AUU': 'Ile', 'AUU': 'Ile',
  // Proline (Pro) — Wood
  'CCG': 'Pro', 'CCA': 'Pro', 'CCC': 'Pro', 'CCU': 'Pro',
  // Glutamine (Gln) — Earth
  'CAG': 'Gln', 'CAA': 'Gln',
  // Histidine (His) — Air
  'CAC': 'His', 'CAU': 'His',
  // Leucine (Leu) — Fire
  'CUG': 'Leu', 'CUA': 'Leu', 'CUC': 'Leu', 'CUU': 'Leu', 'UUG': 'Leu', 'UUA': 'Leu',
  // Tryptophan (Trp) — Aether
  'UGG': 'Trp',
  // STOP — Void
  'UGA': 'STOP', 'UAG': 'STOP', 'UAA': 'STOP',
  // Cysteine (Cys) — Metal
  'UGC': 'Cys', 'UGU': 'Cys',
  // Tyrosine (Tyr) — Fire
  'UAC': 'Tyr', 'UAU': 'Tyr',
  // Phenylalanine (Phe) — Air
  'UUC': 'Phe', 'UUU': 'Phe'
};

// ============================================================================
// 3. AMINO ACID → ELEMENT MAPPING
// ============================================================================

export const AMINO_ACID_TO_ELEMENT: Record<string, Element> = {
  'Gly': 'Fire', 'Ala': 'Fire', 'Val': 'Fire', 'Leu': 'Fire',
  'Ile': 'Fire', 'Met': 'Fire', 'Phe': 'Fire', 'Trp': 'Fire',
  'Pro': 'Wood',
  'Ser': 'Wood', 'Thr': 'Wood', 'Cys': 'Metal', 'Tyr': 'Fire',
  'Asn': 'Water', 'Gln': 'Earth',
  'Asp': 'Water', 'Glu': 'Earth',
  'Lys': 'Water', 'Arg': 'Water', 'His': 'Air',
  'STOP': 'Void'
};

// ============================================================================
// 4. HEXAGRAM ↔ CODON CONVERSION
// ============================================================================

/**
 * Convert hexagram lines (6 bits) to DNA codon
 * Lines 1-2 → Base 1, Lines 3-4 → Base 2, Lines 5-6 → Base 3
 */
export function hexagramToCodon(
  lines: [0|1, 0|1, 0|1, 0|1, 0|1, 0|1]
): string {
  const pair1 = `${lines[0]}${lines[1]}`;
  const pair2 = `${lines[2]}${lines[3]}`;
  const pair3 = `${lines[4]}${lines[5]}`;

  return BIT_TO_BASE[pair1] + BIT_TO_BASE[pair2] + BIT_TO_BASE[pair3];
}

/**
 * Convert DNA codon to hexagram lines
 */
export function codonToHexagram(codon: string): [0|1, 0|1, 0|1, 0|1, 0|1, 0|1] {
  const b1 = BASE_TO_BITS[codon[0]];
  const b2 = BASE_TO_BITS[codon[1]];
  const b3 = BASE_TO_BITS[codon[2]];

  return [b1[0], b1[1], b2[0], b2[1], b3[0], b3[1]];
}

/**
 * Get amino acid from codon (handles T/U RNA equivalence)
 */
export function codonToAminoAcid(codon: string): string {
  // Convert DNA (T) to RNA (U) for lookup
  const rnaCodon = codon.replace(/T/g, 'U');
  return CODON_TABLE[rnaCodon] || CODON_TABLE[codon] || 'Unknown';
}

/**
 * Get element from amino acid
 */
export function aminoAcidToElement(aminoAcid: string): Element {
  return AMINO_ACID_TO_ELEMENT[aminoAcid] || 'Earth';
}

// ============================================================================
// 5. COMPLETE GENETIC SIGNATURE
// ============================================================================

export interface GeneticSignature {
  gate: Gate;
  binary: string;           // 6-bit string
  codon: string;            // DNA triplet
  rnaCodon: string;         // RNA triplet (U instead of T)
  aminoAcid: string;        // 3-letter code
  fullName: string;         // Full amino acid name
  element: Element;         // Classical element
  architecture: NeuralArchitectureFamily;
  polarity: 'yang' | 'yin'; // Based on yang line count
  charge: number;           // -1 (acidic), 0 (neutral), +1 (basic)
  hydrophobicity: number;   // Kyte-Doolittle scale
}

/**
 * Get complete genetic signature for any gate
 * This is the "DNA" of the gate — its biological identity
 */
export function getGeneticSignature(gate: Gate): GeneticSignature {
  // Get hexagram lines from gate number
  // In Human Design, gate numbers map to specific hexagrams
  const hexagramIndex = gate - 1; // 0-based

  // Generate 6-bit pattern from gate number
  // This is a simplified mapping — actual mapping uses King Wen sequence
  const binary = (hexagramIndex).toString(2).padStart(6, '0');
  const lines = binary.split('').map(b => parseInt(b) as 0|1) as [0|1, 0|1, 0|1, 0|1, 0|1, 0|1];

  const codon = hexagramToCodon(lines);
  const rnaCodon = codon.replace(/T/g, 'U');
  const aminoAcid = codonToAminoAcid(codon);
  const element = aminoAcidToElement(aminoAcid);

  // Architecture mapping
  const archMap: Record<Element, NeuralArchitectureFamily> = {
    Fire: 'LSM', Water: 'MC', Earth: 'DFF', Air: 'HMM',
    Metal: 'META', Wood: 'LSM', Aether: 'META', Void: 'META'
  };

  // Polarity: more yang lines = yang polarity
  const yangCount = lines.filter(l => l === 1).length;
  const polarity = yangCount >= 3 ? 'yang' : 'yin';

  // Chemical properties (simplified)
  const chargeMap: Record<string, number> = {
    'Asp': -1, 'Glu': -1, 'Lys': 1, 'Arg': 1, 'His': 1
  };

  const hydrophobicityMap: Record<string, number> = {
    'Ile': 4.5, 'Val': 4.2, 'Leu': 3.8, 'Phe': 2.8, 'Cys': 2.5,
    'Met': 1.9, 'Ala': 1.8, 'Gly': -0.4, 'Thr': -0.7, 'Ser': -0.8,
    'Trp': -0.9, 'Tyr': -1.3, 'Pro': -1.6, 'His': -3.2, 'Glu': -3.5,
    'Gln': -3.5, 'Asp': -3.5, 'Asn': -3.5, 'Lys': -3.9, 'Arg': -4.5
  };

  return {
    gate,
    binary,
    codon,
    rnaCodon,
    aminoAcid,
    fullName: getFullName(aminoAcid),
    element,
    architecture: archMap[element],
    polarity,
    charge: chargeMap[aminoAcid] || 0,
    hydrophobicity: hydrophobicityMap[aminoAcid] || 0
  };
}

function getFullName(aa: string): string {
  const names: Record<string, string> = {
    'Gly': 'Glycine', 'Ala': 'Alanine', 'Val': 'Valine', 'Leu': 'Leucine',
    'Ile': 'Isoleucine', 'Met': 'Methionine', 'Phe': 'Phenylalanine',
    'Trp': 'Tryptophan', 'Pro': 'Proline', 'Ser': 'Serine', 'Thr': 'Threonine',
    'Cys': 'Cysteine', 'Tyr': 'Tyrosine', 'Asn': 'Asparagine', 'Gln': 'Glutamine',
    'Asp': 'Aspartic Acid', 'Glu': 'Glutamic Acid', 'Lys': 'Lysine',
    'Arg': 'Arginine', 'His': 'Histidine', 'STOP': 'Stop Codon'
  };
  return names[aa] || aa;
}

// ============================================================================
// 6. GENETIC RESONANCE CALCULATION
// ============================================================================

export interface GeneticResonance {
  hammingDistance: number;      // 0-6 (lower = more similar)
  codonSimilarity: number;      // 0-1 (higher = more similar)
  elementalHarmony: number;     // 0-1 (higher = more harmonious)
  binaryComplementarity: number; // 0-1 (higher = more complementary)
  overallResonance: number;     // 0-1 composite score
}

/**
 * Calculate genetic resonance between two gates
 * This determines how well two agents can interact
 */
export function calculateGeneticResonance(gateA: Gate, gateB: Gate): GeneticResonance {
  const sigA = getGeneticSignature(gateA);
  const sigB = getGeneticSignature(gateB);

  // 1. Hamming distance between binary signatures
  const binaryA = parseInt(sigA.binary, 2);
  const binaryB = parseInt(sigB.binary, 2);
  const xor = binaryA ^ binaryB;
  const hamming = xor.toString(2).replace(/0/g, '').length;

  // 2. Codon similarity (base-by-base match)
  const codonMatch = sigA.codon.split('').filter((b, i) => b === sigB.codon[i]).length / 3;

  // 3. Elemental harmony (from elemental properties)
  const freqA = ELEMENTAL_PROPERTIES[sigA.element].resonanceFreq;
  const freqB = ELEMENTAL_PROPERTIES[sigB.element].resonanceFreq;
  const elementalHarmony = 1 - Math.abs(freqA - freqB) / 963;

  // 4. Binary complementarity (yin/yang balance)
  const yangA = sigA.binary.split('1').length - 1;
  const yangB = sigB.binary.split('1').length - 1;
  const complementarity = 1 - Math.abs(yangA - (6 - yangB)) / 6;

  // Weighted composite
  const overallResonance = 
    (1 - hamming / 6) * 0.35 +      // 35% genetic similarity
    codonMatch * 0.25 +              // 25% codon match
    elementalHarmony * 0.25 +        // 25% elemental harmony
    complementarity * 0.15;          // 15% yin/yang balance

  return {
    hammingDistance: hamming,
    codonSimilarity: codonMatch,
    elementalHarmony,
    binaryComplementarity: complementarity,
    overallResonance
  };
}

/**
 * Check if two gates form a channel (complementary genetic signatures)
 */
export function isChannel(gateA: Gate, gateB: Gate): boolean {
  const resonance = calculateGeneticResonance(gateA, gateB);

  // Channels form when:
  // 1. High complementarity (yin/yang balance)
  // 2. Moderate genetic similarity (not identical, not opposite)
  // 3. Compatible elements (Fire+Air, Water+Earth, etc.)

  return resonance.binaryComplementarity > 0.6 && 
         resonance.hammingDistance >= 2 && 
         resonance.hammingDistance <= 4 &&
         resonance.elementalHarmony > 0.4;
}

// ============================================================================
// 7. GENETIC MUTATION (Changing Lines)
// ============================================================================

/**
 * Apply a mutation to a genetic signature
 * Simulates changing line (line 6) behavior
 */
export function mutateSignature(
  signature: GeneticSignature,
  lineIndex: 0|1|2|3|4|5
): GeneticSignature {
  const lines = signature.binary.split('').map(b => parseInt(b) as 0|1) as [0|1, 0|1, 0|1, 0|1, 0|1, 0|1];

  // Flip the specified line
  lines[lineIndex] = lines[lineIndex] === 0 ? 1 : 0;

  const newCodon = hexagramToCodon(lines);
  const newAminoAcid = codonToAminoAcid(newCodon);

  return getGeneticSignature(signature.gate); // Regenerate from new pattern
}

/**
 * Get the "future" signature after all changing lines resolve
 */
export function getFutureSignature(gate: Gate, changingLines: boolean[]): GeneticSignature | null {
  const sig = getGeneticSignature(gate);
  const lines = sig.binary.split('').map(b => parseInt(b) as 0|1) as [0|1, 0|1, 0|1, 0|1, 0|1, 0|1];

  // Apply all changing lines
  let hasChanges = false;
  for (let i = 0; i < 6; i++) {
    if (changingLines[i]) {
      lines[i] = lines[i] === 0 ? 1 : 0;
      hasChanges = true;
    }
  }

  if (!hasChanges) return null;

  const newCodon = hexagramToCodon(lines);
  const newAminoAcid = codonToAminoAcid(newCodon);
  const newElement = aminoAcidToElement(newAminoAcid);

  // Find which gate this new pattern corresponds to
  // (simplified — actual mapping uses King Wen sequence)
  const newBinary = lines.join('');
  const newGate = parseInt(newBinary, 2) + 1 as Gate;

  return getGeneticSignature(newGate);
}

// ============================================================================
// 8. EXPORTS
// ============================================================================

export default {
  hexagramToCodon,
  codonToHexagram,
  codonToAminoAcid,
  aminoAcidToElement,
  getGeneticSignature,
  calculateGeneticResonance,
  isChannel,
  mutateSignature,
  getFutureSignature,
  BIT_TO_BASE,
  BASE_TO_BITS,
  CODON_TABLE,
  AMINO_ACID_TO_ELEMENT
};
