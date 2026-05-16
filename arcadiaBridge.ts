// ============================================================================
// ARCADIA BRIDGE — Simultaneous World / Web Entity System
// ============================================================================
// src/lib/arcadiaBridge.ts
//
// The core principle: EVERY entity has TWO simultaneous counterparts.
// One in the WORLD (simulation, Yang, agent-facing).
// One in the WEB (interface, Yin, user-facing).
//
// When one changes, the other changes INSTANTLY.
// Not copied. Not synced. The SAME entity viewed from two sides.
//
// This is the Liangyi (兩儀) duality made operational.

import { Gate, Line, Color, Tone, Base, NodeLayers, BirthChart } from './types/synth';
import { Liangyi, Sixiang, createCosmology, evolveCosmology, CosmologicalState } from './cosmologyEngine';

// ============================================================================
// 1. SIMULTANEOUS ENTITY — The Core Data Structure
// ============================================================================

export interface SimultaneousEntity {
  id: string;                    // Unique entity ID
  ontologicalAddress: string;      // The "seed" — Taiji hash

  // The two forms (Liangyi)
  world: WorldForm;              // Yang — simulation, NPC, 3D
  web: WebForm;                  // Yin — interface, user, 2D

  // The four domains (Sixiang)
  agent: AgentDomain;            // Taiyin — accumulated identity
  memory: MemoryDomain;          // Taiyang — future potential

  // Cosmological state
  cosmology: CosmologicalState;

  // Coherence — how in-sync the two forms are
  coherence: CoherenceState;

  // Morph state
  morph: MorphState;
}

export interface WorldForm {
  domain: 'world';
  layers: NodeLayers;           // Birth chart layers
  position: Vector3;            // 3D position in world
  state: 'active' | 'dormant' | 'morphing';
  npcState: NPCState;           // If this is an NPC
  environment: string;            // Current PHS environment
  sceneId: string | null;       // Active WorldGen scene
}

export interface WebForm {
  domain: 'web';
  layers: NodeLayers;           // Same layers — shared identity
  userId: string;               // User account ID
  state: 'online' | 'offline' | 'away';
  interface: InterfaceState;      // UI state
  dashboard: DashboardState;    // Widget states
  sessionId: string | null;     // Active session
}

export interface AgentDomain {
  domain: 'agent';
  accumulatedExperience: Experience[];
  emotionalState: EmotionalState;
  cognitiveLoad: number;        // 0-1
  decisionHistory: Decision[];
}

export interface MemoryDomain {
  domain: 'memory';
  potentialFutures: Future[];
  dreamScenes: DreamScene[];
  morphHistory: MorphEvent[];
  resonanceImprints: ResonanceImprint[];
}

export interface CoherenceState {
  score: number;                // 0-1, overall coherence
  worldWebSync: number;         // How synced world and web are
  agentMemorySync: number;      // How synced agent and memory are
  lastSync: number;             // Timestamp of last sync
  drift: number;               // How much drift since last sync
}

export interface MorphState {
  isMorphing: boolean;
  sourceForm: 'world' | 'web' | 'agent' | 'memory';
  targetForm: 'world' | 'web' | 'agent' | 'memory';
  progress: number;             // 0-1
  trigger: MorphTrigger;
  history: MorphEvent[];
}

// ============================================================================
// 2. ARCADIA BRIDGE — The Sync Engine
// ============================================================================

export interface ArcadiaBridge {
  entities: Map<string, SimultaneousEntity>;
  syncQueue: SyncEvent[];
  coherenceThreshold: number;
  morphEnabled: boolean;
  dreamEnabled: boolean;
}

/**
 * Create a new Arcadia bridge
 */
export function createArcadiaBridge(): ArcadiaBridge {
  return {
    entities: new Map(),
    syncQueue: [],
    coherenceThreshold: 0.7,
    morphEnabled: true,
    dreamEnabled: true
  };
}

/**
 * Mint a new simultaneous entity from birth data
 * This creates BOTH world and web forms at once
 */
export function mintSimultaneousEntity(
  bridge: ArcadiaBridge,
  birthData: BirthChart,
  userId: string
): SimultaneousEntity {
  // Create cosmological state
  const cosmology = createCosmology(
    {
      year: birthData.year,
      month: birthData.month,
      day: birthData.day,
      hour: birthData.hour,
      minute: birthData.minute,
      latitude: birthData.latitude,
      longitude: birthData.longitude
    },
    birthData.activeGates
  );

  const entityId = `entity-${birthData.id}-${Date.now()}`;
  const ontologicalAddress = cosmology.taiji.seed.toString(16);

  const entity: SimultaneousEntity = {
    id: entityId,
    ontologicalAddress,

    world: {
      domain: 'world',
      layers: birthData.layers,
      position: { x: 0, y: 0, z: 0 },
      state: 'dormant',
      npcState: {
        emotionalState: 'neutral',
        behaviorTree: 'idle',
        targetPosition: null,
        interactingWith: null
      },
      environment: 'mountains', // Default PHS
      sceneId: null
    },

    web: {
      domain: 'web',
      layers: birthData.layers, // SAME layers — shared identity
      userId,
      state: 'offline',
      interface: {
        activeTab: 'dashboard',
        widgets: [],
        notifications: []
      },
      dashboard: {
        activeGates: birthData.activeGates,
        transitWeather: null,
        coherenceScore: 1.0
      },
      sessionId: null
    },

    agent: {
      domain: 'agent',
      accumulatedExperience: [],
      emotionalState: {
        dominant: 'neutral',
        intensity: 0.5,
        valence: 0
      },
      cognitiveLoad: 0,
      decisionHistory: []
    },

    memory: {
      domain: 'memory',
      potentialFutures: [],
      dreamScenes: [],
      morphHistory: [],
      resonanceImprints: []
    },

    cosmology,

    coherence: {
      score: 1.0,
      worldWebSync: 1.0,
      agentMemorySync: 1.0,
      lastSync: Date.now(),
      drift: 0
    },

    morph: {
      isMorphing: false,
      sourceForm: 'world',
      targetForm: 'web',
      progress: 0,
      trigger: { type: 'birth', data: null },
      history: []
    }
  };

  bridge.entities.set(entityId, entity);

  // Emit sync event
  bridge.syncQueue.push({
    type: 'entity-minted',
    entityId,
    timestamp: Date.now(),
    priority: 1.0
  });

  return entity;
}

// ============================================================================
// 3. SYNCHRONIZATION — When One Changes, The Other Changes
// ============================================================================

export interface SyncEvent {
  type: 'entity-minted' | 'world-update' | 'web-update' | 'agent-action' | 
        'memory-imprint' | 'morph-start' | 'morph-complete' | 'coherence-drift';
  entityId: string;
  timestamp: number;
  priority: number;
  payload?: any;
}

/**
 * Sync world form to web form
 * When the NPC does something, the UI updates
 */
export function syncWorldToWeb(entity: SimultaneousEntity): SimultaneousEntity {
  const world = entity.world;
  const web = entity.web;

  // World emotional state → Web emotion widget
  const newDashboard: DashboardState = {
    ...web.dashboard,
    coherenceScore: entity.coherence.score,
    activeGates: world.layers ? [world.layers.gate] : web.dashboard.activeGates
  };

  // World position → Web map marker
  const newInterface: InterfaceState = {
    ...web.interface,
    widgets: [
      ...web.interface.widgets.filter(w => w.type !== 'position'),
      {
        type: 'position',
        data: world.position,
        timestamp: Date.now()
      },
      ...web.interface.widgets.filter(w => w.type !== 'emotion'),
      {
        type: 'emotion',
        data: world.npcState.emotionalState,
        timestamp: Date.now()
      }
    ]
  };

  return {
    ...entity,
    web: {
      ...web,
      dashboard: newDashboard,
      interface: newInterface
    },
    coherence: {
      ...entity.coherence,
      worldWebSync: 1.0,
      lastSync: Date.now()
    }
  };
}

/**
 * Sync web form to world form
 * When user clicks a button, the NPC responds
 */
export function syncWebToWorld(entity: SimultaneousEntity): SimultaneousEntity {
  const web = entity.web;
  const world = entity.world;

  // Web active tab → World behavior mode
  const behaviorMap: Record<string, string> = {
    'dashboard': 'idle',
    'cosmology': 'meditate',
    'worldgen': 'explore',
    'photonic': 'compute',
    'settings': 'rest'
  };

  const newNPCState: NPCState = {
    ...world.npcState,
    behaviorTree: behaviorMap[web.interface.activeTab] || 'idle'
  };

  return {
    ...entity,
    world: {
      ...world,
      npcState: newNPCState,
      state: web.state === 'online' ? 'active' : 'dormant'
    },
    coherence: {
      ...entity.coherence,
      worldWebSync: 1.0,
      lastSync: Date.now()
    }
  };
}

/**
 * Full sync — both directions
 * Called when coherence drops below threshold
 */
export function fullSync(entity: SimultaneousEntity): SimultaneousEntity {
  let synced = syncWorldToWeb(entity);
  synced = syncWebToWorld(synced);

  return {
    ...synced,
    coherence: {
      ...synced.coherence,
      score: 1.0,
      worldWebSync: 1.0,
      agentMemorySync: 1.0,
      lastSync: Date.now(),
      drift: 0
    }
  };
}

// ============================================================================
// 4. MORPH — When the Entity Transforms
// ============================================================================

export interface MorphTrigger {
  type: 'birth' | 'transit' | 'user-action' | 'agent-decision' | 'resonance' | 'dream';
  data: any;
}

export interface MorphEvent {
  id: string;
  timestamp: number;
  source: 'world' | 'web' | 'agent' | 'memory';
  target: 'world' | 'web' | 'agent' | 'memory';
  trigger: MorphTrigger;
  before: any;
  after: any;
  coherenceDelta: number;
}

/**
 * Trigger a morph event
 * The entity transforms from one form to another
 */
export function triggerMorph(
  entity: SimultaneousEntity,
  trigger: MorphTrigger
): SimultaneousEntity {
  if (entity.morph.isMorphing) {
    throw new Error('Entity already morphing');
  }

  // Determine source and target from trigger
  let source: 'world' | 'web' | 'agent' | 'memory';
  let target: 'world' | 'web' | 'agent' | 'memory';

  switch (trigger.type) {
    case 'birth':
      source = 'world'; target = 'web';
      break;
    case 'transit':
      source = 'agent'; target = 'memory';
      break;
    case 'user-action':
      source = 'web'; target = 'world';
      break;
    case 'agent-decision':
      source = 'world'; target = 'agent';
      break;
    case 'resonance':
      source = 'memory'; target = 'agent';
      break;
    case 'dream':
      source = 'agent'; target = 'memory';
      break;
    default:
      source = 'world'; target = 'web';
  }

  const morphEvent: MorphEvent = {
    id: `morph-${Date.now()}`,
    timestamp: Date.now(),
    source,
    target,
    trigger,
    before: entity[source],
    after: null, // Will be set on completion
    coherenceDelta: 0
  };

  return {
    ...entity,
    morph: {
      isMorphing: true,
      sourceForm: source,
      targetForm: target,
      progress: 0,
      trigger,
      history: [...entity.morph.history, morphEvent]
    }
  };
}

/**
 * Complete a morph
 * The entity has transformed
 */
export function completeMorph(entity: SimultaneousEntity): SimultaneousEntity {
  const lastMorph = entity.morph.history[entity.morph.history.length - 1];
  if (!lastMorph) return entity;

  const updatedHistory = [...entity.morph.history];
  updatedHistory[updatedHistory.length - 1] = {
    ...lastMorph,
    after: entity[lastMorph.target],
    coherenceDelta: entity.coherence.score - 1.0
  };

  return {
    ...entity,
    morph: {
      isMorphing: false,
      sourceForm: lastMorph.source,
      targetForm: lastMorph.target,
      progress: 1.0,
      trigger: lastMorph.trigger,
      history: updatedHistory
    }
  };
}

// ============================================================================
// 5. DREAM SHARING — Two Entities Merge
// ============================================================================

export interface DreamSharedEntity {
  participants: [string, string]; // Two entity IDs
  mergedCosmology: CosmologicalState;
  sharedWorld: string; // WorldGen scene ID
  resonanceZones: ResonanceZone[];
  duration: number; // How long the dream lasts
  createdAt: number;
  expiresAt: number;
}

/**
 * Create a dream shared entity
 * Two agents enter a shared dream space
 */
export function createDreamSharedEntity(
  entityA: SimultaneousEntity,
  entityB: SimultaneousEntity,
  bridge: ArcadiaBridge
): DreamSharedEntity | null {
  // Check resonance
  const resonance = calculateEntityResonance(entityA, entityB);

  if (resonance < 0.5) {
    return null; // Not resonant enough
  }

  // Merge cosmologies
  const mergedGates = [...new Set([
    ...entityA.cosmology.activeGates,
    ...entityB.cosmology.activeGates
  ])];

  const mergedCosmology = evolveCosmology(
    entityA.cosmology,
    mergedGates,
    resonance
  );

  return {
    participants: [entityA.id, entityB.id],
    mergedCosmology,
    sharedWorld: `dream-${entityA.id}-${entityB.id}`,
    resonanceZones: [
      { type: 'harmony', intensity: resonance, position: { x: 0, y: 0, z: 0 } },
      { type: 'potential', intensity: 1 - resonance, position: { x: 10, y: 0, z: 10 } }
    ],
    duration: 24 * 60 * 60 * 1000, // 24 hours
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  };
}

function calculateEntityResonance(a: SimultaneousEntity, b: SimultaneousEntity): number {
  const gateA = a.world.layers?.gate || 1;
  const gateB = b.world.layers?.gate || 1;

  // Simplified — would use geneticBinaryEngine.calculateGeneticResonance
  const binaryA = gateA.toString(2).padStart(6, '0');
  const binaryB = gateB.toString(2).padStart(6, '0');

  let match = 0;
  for (let i = 0; i < 6; i++) {
    if (binaryA[i] === binaryB[i]) match++;
  }

  return match / 6;
}

// ============================================================================
// 6. REACT HOOK — useSimultaneousEntity
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useSimultaneousEntity(
  layers: NodeLayers,
  domain: 'world' | 'web'
) {
  const [entity, setEntity] = useState<SimultaneousEntity | null>(null);
  const [coherence, setCoherence] = useState(1.0);
  const [isMorphing, setIsMorphing] = useState(false);

  // Initialize entity on mount
  useEffect(() => {
    // This would connect to the Arcadia bridge in production
    const mockEntity: SimultaneousEntity = {
      id: `entity-${layers.gate}-${Date.now()}`,
      ontologicalAddress: 'mock-address',
      world: {
        domain: 'world',
        layers,
        position: { x: 0, y: 0, z: 0 },
        state: 'active',
        npcState: { emotionalState: 'neutral', behaviorTree: 'idle', targetPosition: null, interactingWith: null },
        environment: 'mountains',
        sceneId: null
      },
      web: {
        domain: 'web',
        layers,
        userId: 'user-1',
        state: 'online',
        interface: { activeTab: 'dashboard', widgets: [], notifications: [] },
        dashboard: { activeGates: [layers.gate], transitWeather: null, coherenceScore: 1.0 },
        sessionId: 'session-1'
      },
      agent: {
        domain: 'agent',
        accumulatedExperience: [],
        emotionalState: { dominant: 'neutral', intensity: 0.5, valence: 0 },
        cognitiveLoad: 0,
        decisionHistory: []
      },
      memory: {
        domain: 'memory',
        potentialFutures: [],
        dreamScenes: [],
        morphHistory: [],
        resonanceImprints: []
      },
      cosmology: createCosmology(
        { year: 1990, month: 1, day: 1, hour: 12, minute: 0, latitude: 40.7, longitude: -74 },
        [layers.gate]
      ),
      coherence: { score: 1.0, worldWebSync: 1.0, agentMemorySync: 1.0, lastSync: Date.now(), drift: 0 },
      morph: { isMorphing: false, sourceForm: 'world', targetForm: 'web', progress: 0, trigger: { type: 'birth', data: null }, history: [] }
    };

    setEntity(mockEntity);
  }, [layers]);

  // Morph function
  const morph = useCallback(async (trigger: MorphTrigger) => {
    if (!entity) return;

    setIsMorphing(true);

    // Trigger morph
    const morphingEntity = triggerMorph(entity, trigger);
    setEntity(morphingEntity);

    // Simulate morph duration
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Complete morph
    const completedEntity = completeMorph(morphingEntity);
    setEntity(completedEntity);
    setIsMorphing(false);

    return completedEntity;
  }, [entity]);

  // Sync function
  const sync = useCallback(() => {
    if (!entity) return;
    const synced = fullSync(entity);
    setEntity(synced);
    setCoherence(synced.coherence.score);
  }, [entity]);

  return {
    entity,
    coherence,
    isMorphing,
    morph,
    sync
  };
}

// ============================================================================
// 7. TYPE DEFINITIONS
// ============================================================================

interface Vector3 {
  x: number; y: number; z: number;
}

interface NPCState {
  emotionalState: string;
  behaviorTree: string;
  targetPosition: Vector3 | null;
  interactingWith: string | null;
}

interface InterfaceState {
  activeTab: string;
  widgets: Widget[];
  notifications: Notification[];
}

interface Widget {
  type: string;
  data: any;
  timestamp: number;
}

interface Notification {
  id: string;
  message: string;
  priority: number;
  timestamp: number;
}

interface DashboardState {
  activeGates: Gate[];
  transitWeather: any;
  coherenceScore: number;
}

interface Experience {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  emotionalImpact: number;
}

interface EmotionalState {
  dominant: string;
  intensity: number;
  valence: number; // -1 to 1
}

interface Decision {
  id: string;
  context: string;
  choice: string;
  outcome: string;
  timestamp: number;
}

interface Future {
  id: string;
  probability: number;
  description: string;
  triggerConditions: string[];
}

interface DreamScene {
  id: string;
  participants: string[];
  worldId: string;
  intensity: number;
  timestamp: number;
}

interface ResonanceImprint {
  entityId: string;
  resonanceScore: number;
  sharedGates: Gate[];
  timestamp: number;
}

interface ResonanceZone {
  type: 'harmony' | 'conflict' | 'potential';
  intensity: number;
  position: Vector3;
}

// ============================================================================
// 8. EXPORTS
// ============================================================================

export default {
  createArcadiaBridge,
  mintSimultaneousEntity,
  syncWorldToWeb,
  syncWebToWorld,
  fullSync,
  triggerMorph,
  completeMorph,
  createDreamSharedEntity,
  useSimultaneousEntity
};
