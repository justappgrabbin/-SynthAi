// User Discernment Engine - learns each person's Human Design

import { MRNNNode, AstrologicalCoords } from './mrnn-core';

export interface UserProfile {
  id: string;
  name: string;
  humanDesign: {
    type: string;
    authority: string;
    strategy: string;
    profile: string;
    definition: string;
    centers: Record<string, boolean>;
    gates: number[];
    channels: number[];
  };
  astrological: {
    sidereal: Record<string, number>;
    draconic: Record<string, number>;
    true: Record<string, number>;
  };
  resonancePatterns: Map<string, number[]>;
  interactionHistory: InteractionRecord[];
}

export interface InteractionRecord {
  timestamp: number;
  gate: number;
  channel: number;
  center: string;
  outcome: 'success' | 'struggle' | 'neutral';
  context: string;
}

export class UserDiscernmentEngine {
  profiles: Map<string, UserProfile> = new Map();

  registerUser(id: string, name: string, hdData: any, astroData: any): UserProfile {
    const profile: UserProfile = {
      id, name,
      humanDesign: hdData,
      astrological: astroData,
      resonancePatterns: new Map(),
      interactionHistory: []
    };
    this.profiles.set(id, profile);
    return profile;
  }

  recordInteraction(userId: string, record: InteractionRecord) {
    const profile = this.profiles.get(userId);
    if (!profile) return;
    profile.interactionHistory.push(record);
    const key = `gate_${record.gate}_center_${record.center}`;
    const patterns = profile.resonancePatterns.get(key) || [];
    patterns.push(record.outcome === 'success' ? 1 : record.outcome === 'struggle' ? -1 : 0);
    profile.resonancePatterns.set(key, patterns);
  }

  compareGateBehavior(gate: number, userA: string, userB: string): string {
    const profileA = this.profiles.get(userA);
    const profileB = this.profiles.get(userB);
    if (!profileA || !profileB) return 'Unknown users';
    const keyA = `gate_${gate}_center_${this.findCenterForGate(gate, profileA)}`;
    const keyB = `gate_${gate}_center_${this.findCenterForGate(gate, profileB)}`;
    const patternsA = profileA.resonancePatterns.get(keyA) || [];
    const patternsB = profileB.resonancePatterns.get(keyB) || [];
    const avgA = patternsA.reduce((a, b) => a + b, 0) / (patternsA.length || 1);
    const avgB = patternsB.reduce((a, b) => a + b, 0) / (patternsB.length || 1);
    if (Math.abs(avgA - avgB) > 0.5) {
      return `Gate ${gate} behaves differently: ${profileA.name} (${avgA.toFixed(2)}) vs ${profileB.name} (${avgB.toFixed(2)})`;
    }
    return `Gate ${gate} resonates similarly for both users`;
  }

  private findCenterForGate(gate: number, profile: UserProfile): string {
    const centerMap: Record<string, number[]> = {
      'head': [64, 61, 63],
      'ajna': [47, 24, 4, 11, 43, 17],
      'throat': [62, 23, 56, 35, 12, 45, 33, 8, 31, 44, 13, 29, 30, 7, 59, 40],
      'g': [1, 2, 7, 10, 13, 15, 25, 33, 46],
      'heart': [21, 26, 40, 51, 54],
      'sacral': [5, 14, 27, 29, 34, 42, 59],
      'spleen': [18, 28, 38, 39, 48, 57, 44, 50, 32, 54],
      'solar': [9, 52, 53, 60, 41, 19, 49, 39, 55],
      'root': [38, 39, 54, 53, 60, 52, 19, 41, 58, 18, 28, 38]
    };
    for (const [center, gates] of Object.entries(centerMap)) {
      if (gates.includes(gate)) return center;
    }
    return 'unknown';
  }

  getUserResonanceScore(userId: string): number {
    const profile = this.profiles.get(userId);
    if (!profile) return 0;
    let total = 0, count = 0;
    for (const patterns of profile.resonancePatterns.values()) {
      const avg = patterns.reduce((a, b) => a + b, 0) / patterns.length;
      total += avg;
      count++;
    }
    return count > 0 ? total / count : 0;
  }
}
