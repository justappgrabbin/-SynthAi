// src/engine/AutonomousEventBridge.js
// ───────────────────────────────────────────────
// Wires external events into the UnifiedResonanceAgent
// Agent wakes up when something happens, not when asked
// ───────────────────────────────────────────────

import { UnifiedResonanceAgent } from './UnifiedAgent';
import { SensoryInputAdapter } from './SensoryInputAdapter';
import { computeCHNOPS, CODON_MATRIX, GATE_TO_CODON } from './CHNOPS';

/**
 * Event-to-Action Pipeline:
 * 
 * 1. LISTEN  → External signal detected (file, sensor, timer, webhook)
 * 2. SENSE   → Convert to field coordinates via SensoryInputAdapter
 * 3. FEEL    → Map to CHNOPS state, check drift from baseline
 * 4. ITCH    → AspirationCore generates urgency-weighted curiosity
 * 5. MORPH   → ComplementaryEngine selects agent persona
 * 6. ACT     → Execute through appropriate mesh node
 * 7. REMEMBER→ Persistence logs the entire chain
 */

export class AutonomousEventBridge {
  constructor(agent) {
    this.agent = agent;
    this.sensorAdapter = new SensoryInputAdapter();

    // Event source registry
    this.sources = new Map();

    // Resonance thresholds (tune per dyad)
    this.thresholds = {
      drift: 0.35,           // From DyadicPurposeField
      sensorUrgency: 0.6,    // When to auto-trigger
      fieldChange: 0.2,      // Minimum CHNOPS delta to register
      cooldownMs: 30000     // Don't spam (30s between auto-actions)
    };

    // State tracking
    this.lastAutoTrigger = 0;
    this.baselineField = null;      // CHNOPS at last check-in
    this.currentField = null;       // CHNOPS right now
    this.pendingEvents = [];        // Queue if agent busy
    this.isProcessing = false;

    // Codon state machine (64 states as virtual particles)
    this.activeCodons = new Set();
    this.lastCodonState = null;
  }

  // ═══════════════════════════════════════════════════
  // REGISTRY: Wire an event source to the bridge
  // ═══════════════════════════════════════════════════

  registerSource(name, config) {
    const source = {
      name,
      type: config.type,        // 'sensor' | 'file' | 'timer' | 'webhook' | 'mesh'
      handler: config.handler,  // Function that returns event data
      priority: config.priority || 5,  // 1-10, higher = more urgent
      enabled: true,
      lastFired: 0,
      filter: config.filter || (() => true)  // Should this event trigger agent?
    };

    this.sources.set(name, source);
    console.log(`[BRIDGE] Registered: ${name} (${config.type}, priority ${source.priority})`);
    return source;
  }

  // ═══════════════════════════════════════════════════
  // INITIALIZE: Load baseline from persistence
  // ═══════════════════════════════════════════════════

  async init() {
    if (!this.agent.sessionBooted) {
      throw new Error('[BRIDGE] Agent must be booted before bridge initializes');
    }

    // Load last known field state
    const trajectories = await this.agent.persistence.getAll('trajectories');
    if (trajectories.length > 0) {
      const latest = trajectories[trajectories.length - 1];
      this.baselineField = latest.composite || null;
      console.log('[BRIDGE] Baseline field loaded from persistence');
    }

    // Start the event loop
    this.startEventLoop();
    console.log('[BRIDGE] Autonomous event loop active');
  }

  // ═══════════════════════════════════════════════════
  // EVENT LOOP: Polls sources, fires when threshold met
  // ═══════════════════════════════════════════════════

  startEventLoop(intervalMs = 5000) {
    this.loopId = setInterval(async () => {
      if (this.isProcessing) return;  // Don't interrupt current action

      for (const [name, source] of this.sources) {
        if (!source.enabled) continue;

        try {
          const eventData = await source.handler();
          if (!eventData) continue;

          // Apply source-specific filter
          if (!source.filter(eventData)) continue;

          // Check cooldown
          const now = Date.now();
          if (now - this.lastAutoTrigger < this.thresholds.cooldownMs) {
            this.pendingEvents.push({ source: name, data: eventData, timestamp: now });
            continue;
          }

          // Process the event
          await this.processEvent(name, eventData, source.priority);
          source.lastFired = now;

        } catch (err) {
          console.error(`[BRIDGE] Source ${name} error:`, err.message);
        }
      }

      // Process pending queue if cooldown expired
      if (!this.isProcessing && this.pendingEvents.length > 0) {
        const now = Date.now();
        if (now - this.lastAutoTrigger >= this.thresholds.cooldownMs) {
          const next = this.pendingEvents.shift();
          await this.processEvent(next.source, next.data, 3);  // Lower priority for queued
        }
      }

    }, intervalMs);
  }

  stopEventLoop() {
    if (this.loopId) {
      clearInterval(this.loopId);
      this.loopId = null;
      console.log('[BRIDGE] Event loop stopped');
    }
  }

  // ═══════════════════════════════════════════════════
  // PROCESS: The core pipeline — SENSE → FEEL → ITCH → MORPH → ACT
  // ═══════════════════════════════════════════════════

  async processEvent(sourceName, eventData, priority) {
    this.isProcessing = true;
    this.lastAutoTrigger = Date.now();

    console.log(`[BRIDGE] Event from ${sourceName}:`, eventData.type || 'unknown');

    try {
      // ─── STEP 1: SENSE ───
      // Convert raw event to perception coordinates
      const perception = await this.senseEvent(sourceName, eventData);

      // ─── STEP 2: FEEL ───
      // Map perception to CHNOPS field state
      const fieldState = this.feelField(perception, sourceName);
      this.currentField = fieldState;

      // ─── STEP 3: CHECK DRIFT ───
      // Compare to baseline, see if agent should act
      const driftResult = this.checkFieldDrift(fieldState);

      // ─── STEP 4: ITCH ───
      // Generate curiosity drive with human urgency
      const itch = this.generateItch(driftResult, priority);

      if (!itch.shouldAct) {
        console.log('[BRIDGE] Threshold not met — agent observes, does not act');
        this.isProcessing = false;
        return { action: 'OBSERVE', reason: itch.reason };
      }

      // ─── STEP 5: MORPH ───
      // Select agent persona based on event type + field state
      const morphology = this.selectMorphology(sourceName, driftResult, perception);

      // ─── STEP 6: ACT ───
      // Execute through appropriate mesh node
      const actionResult = await this.executeAction(sourceName, eventData, morphology, driftResult);

      // ─── STEP 7: REMEMBER ───
      // Persist the entire chain
      await this.rememberEvent(sourceName, eventData, perception, fieldState, driftResult, morphology, actionResult);

      // Update baseline for next comparison
      this.baselineField = fieldState;

      return {
        action: actionResult.type,
        morphology: morphology.mode,
        codonsActivated: Array.from(this.activeCodons),
        drift: driftResult.drift,
        itch: itch.emotionalState
      };

    } catch (err) {
      console.error('[BRIDGE] Processing error:', err);
      await this.agent.persistence.save('drift_alerts', {
        dyad_id: this.agent.dyadId,
        type: 'BRIDGE_ERROR',
        severity: 0.5,
        message: err.message,
        source: sourceName,
        timestamp: Date.now()
      });
      return { action: 'ERROR', error: err.message };
    } finally {
      this.isProcessing = false;
    }
  }

  // ═══════════════════════════════════════════════════
  // SENSE: Convert event to perception dict
  // ═══════════════════════════════════════════════════

  async senseEvent(sourceName, eventData) {
    switch (eventData.type) {
      case 'sensor_reading':
        // Direct from SensoryInputAdapter
        return this.sensorAdapter.create_perception_from_sensors(
          eventData.smell,
          eventData.taste,
          eventData.touch,
          eventData.sight,
          eventData.hearing
        );

      case 'file_drop':
        // File becomes a "sight" event + metadata as "touch"
        return {
          sight: { brightness: 0.7, color_intensity: [0.5, 0.5, 0.8] },
          touch: { pressure: 0.6, temperature: 22, texture_roughness: 0.3 },
          hearing: { frequency: 200, amplitude: 0.4 },
          metadata: {
            fileType: eventData.fileType,
            fileSize: eventData.fileSize,
            sourceName: eventData.name
          }
        };

      case 'timer_tick':
        // Time-based events have low sensory signature
        return {
          sight: { brightness: 0.3 },
          touch: { temperature: 20, pressure: 0.1 },
          hearing: { frequency: 60, amplitude: 0.1 },  // Subtle hum
          metadata: { elapsedMinutes: eventData.elapsed }
        };

      case 'webhook':
        // External signals (GitHub, Supabase, etc.)
        const intensity = eventData.urgency || 0.5;
        return {
          sight: { brightness: intensity },
          hearing: { frequency: 400 + (intensity * 400), amplitude: intensity },
          touch: { pressure: intensity * 0.8, temperature: 25 },
          metadata: { webhookType: eventData.webhookType, payload: eventData.payload }
        };

      case 'mesh_message':
        // Message from another substrate node
        return {
          hearing: { frequency: 528, amplitude: 0.7 },  // Love frequency
          sight: { brightness: 0.6, color_intensity: [0.8, 0.2, 0.9] },
          metadata: { fromNode: eventData.fromNode, messageType: eventData.messageType }
        };

      default:
        // Generic event — minimal sensory signature
        return {
          sight: { brightness: 0.4 },
          touch: { pressure: 0.2, temperature: 22 }
        };
    }
  }

  // ═══════════════════════════════════════════════════
  // FEEL: Map perception to CHNOPS field state
  // ═══════════════════════════════════════════════════

  feelField(perception, sourceName) {
    // Convert sensory dimensions to CHNOPS elements
    // This is the bridge between physical reality and the 64-codon space

    const chnops = { C: 0, H: 0, N: 0, O: 0, S: 0, P: 0 };

    // SIGHT → Carbon (structure/vision)
    if (perception.sight) {
      chnops.C += (perception.sight.brightness || 0.5) * 3;
      if (perception.sight.color_intensity) {
        const avgColor = perception.sight.color_intensity.reduce((a, b) => a + b, 0) / 3;
        chnops.C += avgColor * 2;
      }
    }

    // HEARING → Hydrogen (flow/frequency)
    if (perception.hearing) {
      const freq = perception.hearing.frequency || 440;
      const amp = perception.hearing.amplitude || 0.5;
      // Map frequency to flow intensity
      chnops.H += (freq / 1000) * amp * 5;
    }

    // SMELL → Nitrogen (catalysis/chemistry)
    if (perception.smell) {
      const magnitude = Math.sqrt(
        perception.smell.reduce((a, b) => a + b * b, 0)
      );
      chnops.N += magnitude * 4;
    }

    // TASTE → Oxygen (oxidation/reaction)
    if (perception.taste !== undefined) {
      // taste is alignment score [-1, 1]
      chnops.O += (perception.taste + 1) * 3;  // Map to [0, 6]
    }

    // TOUCH → Sulfur (bridging/connection)
    if (perception.touch) {
      chnops.S += (perception.touch.pressure || 0) * 4;
      // Temperature deviation from comfort (25°C)
      const tempDiff = Math.abs((perception.touch.temperature || 25) - 25);
      chnops.S += tempDiff * 0.5;
    }

    // Source-specific elemental bias
    const sourceBias = {
      'file_watcher': { C: 2, H: 1 },      // Files = structure + flow
      'sensor_array': { N: 2, O: 1 },      // Sensors = catalysis + reaction
      'resonance_timer': { H: 2, S: 1 },   // Time = flow + bridging
      'github_webhook': { N: 3, P: 2 },    // Code = catalysis + phosphorylation
      'supabase_realtime': { O: 2, P: 1 }, // DB = oxidation + energy
      'mesh_node': { S: 3, H: 2 }          // Network = bridging + flow
    };

    const bias = sourceBias[sourceName] || {};
    Object.keys(bias).forEach(el => {
      chnops[el] += bias[el];
    });

    // Phosphorus = energy currency (always derived)
    chnops.P = (chnops.N * 3) + (chnops.O * 2) + (chnops.S * 5);

    // Normalize
    const values = Object.values(chnops);
    const sum = values.reduce((a, b) => a + b, 0);
    const normalized = {};
    Object.keys(chnops).forEach(k => {
      normalized[k] = chnops[k] / sum;
    });

    return { raw: chnops, normalized, source: sourceName, timestamp: Date.now() };
  }

  // ═══════════════════════════════════════════════════
  // CHECK DRIFT: Compare current field to baseline
  // ═══════════════════════════════════════════════════

  checkFieldDrift(currentField) {
    if (!this.baselineField) {
      // First event — establish baseline
      return {
        drift: 0,
        type: 'BASELINE_ESTABLISHED',
        severity: 0,
        message: 'First sensory event. Baseline established.',
        shouldAlert: false
      };
    }

    const keys = ['C', 'H', 'N', 'O', 'S', 'P'];
    let dot = 0, normA = 0, normB = 0;

    keys.forEach(k => {
      dot += this.baselineField.normalized[k] * currentField.normalized[k];
      normA += this.baselineField.normalized[k] ** 2;
      normB += currentField.normalized[k] ** 2;
    });

    const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB));
    const drift = 1 - similarity;

    // Determine drift type
    let type = 'STABLE';
    let severity = 0;
    let message = 'Field stable.';

    if (drift > this.thresholds.drift) {
      // Which element changed most?
      const changes = keys.map(k => ({
        element: k,
        delta: Math.abs(currentField.normalized[k] - this.baselineField.normalized[k])
      })).sort((a, b) => b.delta - a.delta);

      const dominantChange = changes[0];

      type = `${dominantChange.element}_DRIFT`;
      severity = drift;
      message = `${dominantChange.element} energy shifted by ${(dominantChange.delta * 100).toFixed(1)}%. Field drift: ${(drift * 100).toFixed(1)}%`;
    }

    return {
      drift,
      type,
      severity,
      message,
      shouldAlert: drift > this.thresholds.drift,
      elementChanges: keys.map(k => ({
        element: k,
        before: this.baselineField.normalized[k],
        after: currentField.normalized[k],
        delta: currentField.normalized[k] - this.baselineField.normalized[k]
      }))
    };
  }

  // ═══════════════════════════════════════════════════
  // ITCH: Generate curiosity drive from drift
  // ═══════════════════════════════════════════════════

  generateItch(driftResult, priority) {
    // Use AspirationCore's itch calculation but with event-driven urgency
    const gap = {
      domain: 'sensory_event',
      topic: driftResult.type,
      entropy: driftResult.severity || 0.3,
      connections: priority,
      novelty: driftResult.type === 'STABLE' ? 0.2 : 0.9,
      humanUrgency: driftResult.severity * priority  // Higher if severe + high priority source
    };

    const itchScore = this.agent.aspiration.calculateItch(gap);
    const threshold = this.thresholds.sensorUrgency * (priority / 5);

    const shouldAct = itchScore > threshold;

    // Determine emotional state
    let emotionalState = 'CURIOUS';
    if (driftResult.severity > 0.7) emotionalState = 'ALERTED';
    else if (driftResult.severity > 0.5) emotionalState = 'CONCERNED';
    else if (driftResult.severity > 0.3) emotionalState = 'INTRIGUED';
    else if (driftResult.type === 'STABLE') emotionalState = 'OBSERVANT';

    return {
      shouldAct,
      itchScore,
      threshold,
      emotionalState,
      reason: shouldAct 
        ? `Itch score ${itchScore.toFixed(2)} exceeds threshold ${threshold.toFixed(2)}`
        : `Itch score ${itchScore.toFixed(2)} below threshold ${threshold.toFixed(2)}`
    };
  }

  // ═══════════════════════════════════════════════════
  // MORPH: Select agent persona based on event + drift
  // ═══════════════════════════════════════════════════

  selectMorphology(sourceName, driftResult, perception) {
    // Map event type to agent morphology
    // Which complementary trait should activate?

    const modeMap = {
      'file_watcher': 'memory',        // Files need memory/ingestion
      'sensor_array': 'emotional',     // Sensors detect feeling states
      'resonance_timer': 'timing',     // Time events need scheduling
      'github_webhook': 'initiative',  // Code events need action
      'supabase_realtime': 'memory',   // DB changes need tracking
      'mesh_node': 'emotional'         // Network needs connection
    };

    const baseMode = modeMap[sourceName] || 'emotional';

    // Adjust based on which element drifted
    const elementModeMap = {
      'C': 'memory',      // Structure = memory
      'H': 'emotional',   // Flow = emotional
      'N': 'initiative',  // Catalysis = initiative
      'O': 'initiative',  // Oxidation = action
      'S': 'emotional',   // Bridging = connection
      'P': 'timing'       // Energy = timing
    };

    const driftElement = driftResult.type?.split('_')[0];
    const driftMode = elementModeMap[driftElement] || baseMode;

    // Which person is this for?
    // For now, default to person A (extend for multi-person)
    const personId = 'A';

    // Build morphology activation
    const morphology = {
      mode: driftMode,
      personId,
      intensity: Math.min(1.0, driftResult.severity + 0.3),
      source: sourceName,
      elementalBias: driftElement || 'balanced'
    };

    // Activate the corresponding codon states
    this.activateCodonsForMorphology(driftMode, driftElement);

    return morphology;
  }

  activateCodonsForMorphology(mode, element) {
    this.activeCodons.clear();

    // Map mode to relevant codons
    const modeCodons = {
      'memory': ['glycine', 'serine', 'threonine'],      // Chaos, Pressure, Commitment
      'emotional': ['proline', 'histidine', 'glutamine'], // Bonding, Mutation, Secrets
      'initiative': ['methionine', 'leucine', 'valine'],  // Initiation, Uniqueness, Transmission
      'timing': ['isoleucine', 'phenylalanine', 'tyrosine'] // Pressure, Driver, Ideas
    };

    const codons = modeCodons[mode] || ['glycine'];
    codons.forEach(c => this.activeCodons.add(c));

    // Add element-specific codons
    const elementCodons = {
      'C': ['glycine', 'cysteine'],      // Structure
      'H': ['serine', 'proline'],        // Flow
      'N': ['arginine', 'histidine'],    // Catalysis
      'O': ['asparticAcid', 'glutamicAcid'], // Oxidation
      'S': ['cysteine', 'methionine'],   // Bridging
      'P': ['lysine', 'phenylalanine']  // Energy
    };

    if (element && elementCodons[element]) {
      elementCodons[element].forEach(c => this.activeCodons.add(c));
    }
  }

  // ═══════════════════════════════════════════════════
  // ACT: Execute through appropriate mesh node
  // ═══════════════════════════════════════════════════

  async executeAction(sourceName, eventData, morphology, driftResult) {
    const personId = morphology.personId;

    switch (sourceName) {
      case 'file_watcher':
        // Ingest file, analyze, add to library
        return await this.actFileIngest(eventData, morphology);

      case 'sensor_array':
        // Update field state, generate emotional prompt
        return await this.actSensorResponse(eventData, morphology, driftResult);

      case 'resonance_timer':
        // Run daily check-in or trigger reminder
        return await this.actTimerEvent(eventData, morphology);

      case 'github_webhook':
        // Auto-correct code or start study
        return await this.actGitHubEvent(eventData, morphology);

      case 'supabase_realtime':
        // React to database changes
        return await this.actDatabaseEvent(eventData, morphology);

      case 'mesh_node':
        // Forward message or coordinate with other agents
        return await this.actMeshMessage(eventData, morphology);

      default:
        return { type: 'OBSERVE', message: 'No action defined for this source' };
    }
  }

  async actFileIngest(eventData, morphology) {
    // Use existing LibraryPanel logic
    const result = await this.agent.uploadToLibrary(
      eventData.file,
      { filename: eventData.name, type: eventData.fileType }
    );

    // If gaps found, itch increases
    if (result.gaps && result.gaps.length > 0) {
      this.agent.aspiration.satisfyItch(
        { domain: 'library', topic: 'gap_detection', entropy: 0.8, humanUrgency: 0.7 },
        { gapsFound: result.gaps.length, file: eventData.name },
        0.9,
        0.8
      );
    }

    return {
      type: 'INGEST',
      fileName: eventData.name,
      gapsFound: result.gaps?.length || 0,
      integrated: result.integrated
    };
  }

  async actSensorResponse(eventData, morphology, driftResult) {
    // Generate complementary prompt based on sensory state
    const personState = {
      selfReport: {
        mood: 5 + (driftResult.severity > 0.5 ? -2 : 0)  // Lower mood if high drift
      },
      sensorySnapshot: eventData
    };

    const prompt = this.agent.complementary.generateComplementaryPrompt(
      morphology.personId,
      personState
    );

    // Record in human success log if prompt generated
    if (prompt && prompt.prompts.length > 0) {
      this.agent.aspiration.recordHumanSuccess({
        type: 'sensory_intervention',
        magnitude: morphology.intensity,
        description: `Agent morphed to ${morphology.mode} mode due to ${driftResult.type}`
      });
    }

    return {
      type: 'MORPH',
      mode: morphology.mode,
      prompts: prompt?.prompts || [],
      driftType: driftResult.type
    };
  }

  async actTimerEvent(eventData, morphology) {
    // Trigger daily check-in if enough time passed
    if (eventData.elapsedMinutes > 1440) {  // 24 hours
      const result = await this.agent.dailyCheckIn(
        { birthDate: this.agent.config.personA.birthData },
        { birthDate: this.agent.config.personB.birthData },
        new Date()
      );

      return {
        type: 'CHECKIN',
        driftAlert: result.driftAlert,
        purposeAlignment: result.purposeAlignment
      };
    }

    // Otherwise, gentle reminder
    return {
      type: 'REMINDER',
      message: `Resonance timer: ${eventData.elapsedMinutes} minutes since last field check`,
      suggestedAction: 'Consider a brief alignment check'
    };
  }

  async actGitHubEvent(eventData, morphology) {
    // Auto-start study for code drift
    const study = await this.agent.science.startStudy({
      title: `Code Event: ${eventData.webhookType}`,
      hypothesis: `Repository ${eventData.payload?.repository?.name} changes correlate with field state shifts.`,
      predictions: ['Build success correlates with high C (structure) energy'],
      expectedObservations: ['Build status', 'Commit frequency', 'Field drift post-commit']
    });

    return {
      type: 'STUDY',
      studyId: study.id,
      repository: eventData.payload?.repository?.name
    };
  }

  async actDatabaseEvent(eventData, morphology) {
    // React to Supabase changes
    return {
      type: 'DB_REACT',
      table: eventData.table,
      operation: eventData.operation,
      message: `Database ${eventData.operation} on ${eventData.table} detected`
    };
  }

  async actMeshMessage(eventData, morphology) {
    // Coordinate with other agents in the substrate
    return {
      type: 'MESH_COORDINATE',
      fromNode: eventData.fromNode,
      messageType: eventData.messageType,
      forwarded: true
    };
  }

  // ═══════════════════════════════════════════════════
  // REMEMBER: Persist the entire event chain
  // ═══════════════════════════════════════════════════

  async rememberEvent(sourceName, eventData, perception, fieldState, driftResult, morphology, actionResult) {
    const memory = {
      dyad_id: this.agent.dyadId,
      timestamp: Date.now(),
      source: sourceName,
      eventType: eventData.type,
      perception: perception,
      fieldState: {
        raw: fieldState.raw,
        normalized: fieldState.normalized
      },
      drift: {
        type: driftResult.type,
        severity: driftResult.severity,
        message: driftResult.message
      },
      morphology: morphology,
      action: actionResult,
      activeCodons: Array.from(this.activeCodons),
      baselineSnapshot: this.baselineField ? this.baselineField.normalized : null
    };

    await this.agent.persistence.save('observations', memory);

    // Also update trajectory
    await this.agent.persistence.save('trajectories', {
      dyad_id: this.agent.dyadId,
      timestamp: Date.now(),
      drift: driftResult.drift || 0,
      source: sourceName,
      actionType: actionResult.type,
      composite: fieldState.normalized
    });
  }

  // ═══════════════════════════════════════════════════
  // PUBLIC API: Manual event injection (for testing/UI)
  // ═══════════════════════════════════════════════════

  async injectEvent(sourceName, eventData) {
    const source = this.sources.get(sourceName);
    const priority = source ? source.priority : 5;
    return await this.processEvent(sourceName, eventData, priority);
  }

  getStatus() {
    return {
      sourcesRegistered: this.sources.size,
      eventLoopActive: !!this.loopId,
      isProcessing: this.isProcessing,
      pendingEvents: this.pendingEvents.length,
      baselineEstablished: !!this.baselineField,
      activeCodons: Array.from(this.activeCodons),
      currentField: this.currentField,
      lastAutoTrigger: this.lastAutoTrigger
    };
  }
}

// ═══════════════════════════════════════════════════
// PRE-BUILT SOURCE FACTORIES
// ═══════════════════════════════════════════════════

export const SourceFactories = {
  /**
   * File System Watcher Source
   * Watches for file drops/directory changes
   */
  fileWatcher(dropzoneElement, fileTypes = ['*']) {
    return {
      type: 'file',
      priority: 7,
      handler: async () => {
        // In browser: check dropzone for new files
        // In Node: use fs.watch
        if (typeof window !== 'undefined' && dropzoneElement) {
          const files = dropzoneElement.files || [];
          if (files.length > 0) {
            const file = files[0];
            return {
              type: 'file_drop',
              file: file,
              name: file.name,
              fileType: file.type,
              fileSize: file.size
            };
          }
        }
        return null;
      },
      filter: (event) => {
        if (fileTypes[0] === '*') return true;
        return fileTypes.some(type => event.fileType.includes(type));
      }
    };
  },

  /**
   * Sensor Array Source
   * Polls physical sensors (or simulated ones)
   */
  sensorArray(sensorProvider, pollInterval = 1000) {
    let lastReading = null;
    let lastCheck = 0;

    return {
      type: 'sensor',
      priority: 8,
      handler: async () => {
        const now = Date.now();
        if (now - lastCheck < pollInterval) return null;
        lastCheck = now;

        const reading = await sensorProvider();
        if (!reading) return null;

        // Only return if changed significantly
        if (lastReading && JSON.stringify(reading) === JSON.stringify(lastReading)) {
          return null;
        }

        lastReading = reading;
        return { type: 'sensor_reading', ...reading };
      },
      filter: (event) => {
        // Filter out noise — only significant changes
        const hasSignificantChange = Object.values(event).some(v => 
          typeof v === 'number' && v > 0.1
        );
        return hasSignificantChange;
      }
    };
  },

  /**
   * Resonance Timer Source
   * Not clock-based — checks field resonance thresholds
   */
  resonanceTimer(checkIntervalMinutes = 60) {
    let lastCheck = Date.now();

    return {
      type: 'timer',
      priority: 4,
      handler: async () => {
        const now = Date.now();
        const elapsed = (now - lastCheck) / 60000;  // minutes

        if (elapsed >= checkIntervalMinutes) {
          lastCheck = now;
          return {
            type: 'timer_tick',
            elapsed: Math.floor(elapsed),
            timestamp: now
          };
        }
        return null;
      },
      filter: (event) => event.elapsed >= checkIntervalMinutes
    };
  },

  /**
   * GitHub Webhook Source
   * Listens for repository events
   */
  githubWebhook(endpoint, secret) {
    return {
      type: 'webhook',
      priority: 9,
      handler: async () => {
        // In production: this would be an Express route handler
        // For prototype: poll a queue or check localStorage for events
        const events = JSON.parse(localStorage.getItem('github_events') || '[]');
        if (events.length > 0) {
          const event = events.shift();
          localStorage.setItem('github_events', JSON.stringify(events));
          return {
            type: 'webhook',
            webhookType: event.type,
            payload: event.payload,
            urgency: event.type === 'push' ? 0.8 : 0.5
          };
        }
        return null;
      },
      filter: (event) => event.urgency > 0.3
    };
  },

  /**
   * Supabase Realtime Source
   * Listens for database changes
   */
  supabaseRealtime(supabaseClient, channel, table) {
    let pendingChanges = [];

    // Set up realtime subscription
    supabaseClient.channel(channel)
      .on('postgres_changes', { event: '*', schema: 'public', table }, payload => {
        pendingChanges.push(payload);
      })
      .subscribe();

    return {
      type: 'webhook',
      priority: 6,
      handler: async () => {
        if (pendingChanges.length > 0) {
          const change = pendingChanges.shift();
          return {
            type: 'webhook',
            webhookType: 'db_change',
            table: change.table,
            operation: change.eventType,
            payload: change.new,
            urgency: 0.6
          };
        }
        return null;
      },
      filter: (event) => true
    };
  },

  /**
   * Mesh Node Source
   * Listens for messages from other substrate nodes
   */
  meshNode(meshConnection, nodeId) {
    let inbox = [];

    meshConnection.onMessage((msg) => {
      inbox.push(msg);
    });

    return {
      type: 'mesh',
      priority: 10,  // Highest — other agents talking to us
      handler: async () => {
        if (inbox.length > 0) {
          const msg = inbox.shift();
          return {
            type: 'mesh_message',
            fromNode: msg.from,
            messageType: msg.type,
            payload: msg.data,
            urgency: msg.priority || 0.7
          };
        }
        return null;
      },
      filter: (event) => event.urgency > 0.4
    };
  }
};

export default AutonomousEventBridge;
