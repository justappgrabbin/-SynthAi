// MRNN Core - Multi-Layer Recursive Neural Network
// 5-layer architecture with astrological coordinate mapping

export interface MRNNLayer {
  id: number;
  color: string;
  tone: string;
  base: string;
  degree: number;
  minute: number;
  second: number;
  nodes: MRNNNode[];
  connections: Connection[];
}

export interface MRNNNode {
  id: string;
  layer: number;
  coordinates: AstrologicalCoords;
  activation: number;
  state: 'dormant' | 'active' | 'resonant';
  memory: Float32Array;
}

export interface AstrologicalCoords {
  siderealLongitude: number;
  draconicLongitude: number;
  trueLongitude: number;
  house: number;
  gate: number;
  channel: number;
}

export interface Connection {
  from: string;
  to: string;
  weight: number;
  type: 'feedforward' | 'recurrent' | 'lateral' | 'resonance';
  resonanceScore: number;
}

export class MRNNEngine {
  layers: MRNNLayer[] = [];
  resonanceMatrix: Map<string, number> = new Map();

  constructor(layerCount: number = 5) {
    this.initializeLayers(layerCount);
  }

  private initializeLayers(count: number) {
    const colors = ['#00d4ff', '#7b2cbf', '#ff006e', '#00ff88', '#ffaa00'];
    const tones = ['C', 'D', 'E', 'F', 'G'];
    const bases = ['Design', 'Personality', 'Mind', 'Emotions', 'Individuality'];

    for (let i = 0; i < count; i++) {
      this.layers.push({
        id: i,
        color: colors[i % colors.length],
        tone: tones[i % tones.length],
        base: bases[i % bases.length],
        degree: i * 72,
        minute: i * 12,
        second: i * 36,
        nodes: [],
        connections: []
      });
    }
  }

  addNode(layerId: number, coords: AstrologicalCoords): MRNNNode {
    const node: MRNNNode = {
      id: `node_${layerId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      layer: layerId,
      coordinates: coords,
      activation: 0,
      state: 'dormant',
      memory: new Float32Array(64)
    };
    this.layers[layerId].nodes.push(node);
    return node;
  }

  passMessage(fromId: string, toId: string, signal: Float32Array): number {
    const from = this.findNode(fromId);
    const to = this.findNode(toId);
    if (!from || !to) return 0;

    const resonance = this.calculateResonance(from, to);
    const connection = this.findOrCreateConnection(fromId, toId);
    connection.resonanceScore = resonance;

    to.activation = Math.tanh(to.activation + resonance * signal[0]);
    to.state = to.activation > 0.7 ? 'resonant' : to.activation > 0.3 ? 'active' : 'dormant';
    to.memory.set(signal);

    return resonance;
  }

  private calculateResonance(a: MRNNNode, b: MRNNNode): number {
    const coordDiff = Math.abs(a.coordinates.siderealLongitude - b.coordinates.siderealLongitude);
    const gateDiff = Math.abs(a.coordinates.gate - b.coordinates.gate);
    const channelMatch = a.coordinates.channel === b.coordinates.channel ? 1 : 0;

    return Math.exp(-coordDiff / 30) * Math.exp(-gateDiff / 5) * (0.5 + 0.5 * channelMatch);
  }

  private findNode(id: string): MRNNNode | undefined {
    for (const layer of this.layers) {
      const node = layer.nodes.find(n => n.id === id);
      if (node) return node;
    }
    return undefined;
  }

  private findOrCreateConnection(from: string, to: string): Connection {
    for (const layer of this.layers) {
      const conn = layer.connections.find(c => c.from === from && c.to === to);
      if (conn) return conn;
    }
    const conn: Connection = { from, to, weight: Math.random(), type: 'resonance', resonanceScore: 0 };
    this.layers[0].connections.push(conn);
    return conn;
  }

  autopoiesis(threshold: number = 0.85) {
    for (const layer of this.layers) {
      for (const conn of layer.connections) {
        if (conn.resonanceScore > threshold) {
          const from = this.findNode(conn.from);
          const to = this.findNode(conn.to);
          if (from && to) {
            const newCoords: AstrologicalCoords = {
              siderealLongitude: (from.coordinates.siderealLongitude + to.coordinates.siderealLongitude) / 2,
              draconicLongitude: (from.coordinates.draconicLongitude + to.coordinates.draconicLongitude) / 2,
              trueLongitude: (from.coordinates.trueLongitude + to.coordinates.trueLongitude) / 2,
              house: Math.floor((from.coordinates.house + to.coordinates.house) / 2),
              gate: Math.floor((from.coordinates.gate + to.coordinates.gate) / 2),
              channel: from.coordinates.channel
            };
            this.addNode(layer.id, newCoords);
            console.log(`Autopoietic spawn: new node in layer ${layer.id}`);
          }
        }
      }
    }
  }
}
