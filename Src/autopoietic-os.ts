// Autopoietic OS - Self-scaffolding, self-morphing
// Everything ingested gets ontological address

import { MRNNEngine, MRNNNode, AstrologicalCoords } from './mrnn-core';

export interface OntologicalAddress {
  uuid: string;
  path: string;
  layer: number;
  coordinates: AstrologicalCoords;
  permissions: AccessLevel;
  createdAt: number;
  lastResonance: number;
}

export type AccessLevel = 'public' | 'verified_young' | 'general' | 'restricted' | 'adult_sovereign';

export interface IngestedEntity {
  id: string;
  source: 'file' | 'url' | 'api' | 'huggingface' | 'git' | 'conversation';
  content: any;
  metadata: Record<string, any>;
  address: OntologicalAddress;
  resonanceHistory: number[];
}

export class AutopoieticOS {
  engine: MRNNEngine;
  registry: Map<string, IngestedEntity> = new Map();
  appTray: IngestedEntity[] = [];
  serverUrl: string;
  hfUsername: string;

  constructor(serverUrl: string, hfUsername: string, layers: number = 5) {
    this.engine = new MRNNEngine(layers);
    this.serverUrl = serverUrl;
    this.hfUsername = hfUsername;
  }

  async ingest(source: IngestedEntity['source'], content: any, metadata: any = {}): Promise<OntologicalAddress> {
    const validation = this.validate(content);
    if (!validation.valid) throw new Error(`Validation failed: ${validation.reason}`);

    const quality = this.scoreQuality(content);
    if (quality < 0.3) throw new Error('Content quality too low');

    const coords = this.inferCoordinates(content, metadata);
    const layer = this.inferLayer(content);
    const access = this.inferAccessLevel(content, metadata);

    const address: OntologicalAddress = {
      uuid: crypto.randomUUID(),
      path: `/synthia/${source}/${layer}/${crypto.randomUUID()}`,
      layer,
      coordinates: coords,
      permissions: access,
      createdAt: Date.now(),
      lastResonance: 0
    };

    const node = this.engine.addNode(layer, coords);
    const entity: IngestedEntity = {
      id: node.id,
      source,
      content,
      metadata,
      address,
      resonanceHistory: []
    };
    this.registry.set(address.uuid, entity);
    await this.callbackToServer('ingest', entity);
    this.learn(entity);
    this.grow(entity);
    this.appTray.push(entity);
    return address;
  }

  private validate(content: any): { valid: boolean; reason?: string } {
    if (!content) return { valid: false, reason: 'Empty content' };
    if (typeof content === 'string' && content.length > 1000000) return { valid: false, reason: 'Too large' };
    return { valid: true };
  }

  private scoreQuality(content: any): number {
    if (typeof content === 'string') {
      const entropy = this.calculateEntropy(content);
      return Math.min(1, entropy / 4.5);
    }
    return 0.5;
  }

  private calculateEntropy(str: string): number {
    const freq: Record<string, number> = {};
    for (const char of str) freq[char] = (freq[char] || 0) + 1;
    let entropy = 0;
    const len = str.length;
    for (const char in freq) {
      const p = freq[char] / len;
      entropy -= p * Math.log2(p);
    }
    return entropy;
  }

  private inferCoordinates(content: any, metadata: any): AstrologicalCoords {
    const hash = this.hashContent(JSON.stringify(content));
    return {
      siderealLongitude: (hash % 360),
      draconicLongitude: ((hash * 7) % 360),
      trueLongitude: ((hash * 13) % 360),
      house: (hash % 12) + 1,
      gate: (hash % 64) + 1,
      channel: (hash % 36) + 1
    };
  }

  private inferLayer(content: any): number {
    const size = JSON.stringify(content).length;
    if (size < 1000) return 0;
    if (size < 10000) return 1;
    if (size < 100000) return 2;
    if (size < 500000) return 3;
    return 4;
  }

  private inferAccessLevel(content: any, metadata: any): AccessLevel {
    if (metadata.sensitive) return 'adult_sovereign';
    if (metadata.restricted) return 'restricted';
    if (metadata.verified) return 'general';
    if (metadata.young) return 'verified_young';
    return 'public';
  }

  private hashContent(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private async callbackToServer(endpoint: string, data: any) {
    try {
      const response = await fetch(`${this.serverUrl}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`Server ${response.status}`);
    } catch (e) {
      console.warn('Server callback failed:', e);
    }
  }

  private learn(entity: IngestedEntity) {
    entity.resonanceHistory.push(entity.address.lastResonance);
  }

  private grow(entity: IngestedEntity) {
    if (entity.source === 'huggingface') { /* spawn model forge */ }
    if (entity.source === 'git') { /* spawn repo analyzer */ }
  }

  async execute(uuid: string): Promise<any> {
    const entity = this.registry.get(uuid);
    if (!entity) throw new Error('Entity not found');
    await this.callbackToServer('execute', { uuid, entity });
    return entity.content;
  }

  getAppTray(): IngestedEntity[] { return this.appTray; }
  cycle() { this.engine.autopoiesis(0.85); }
}
