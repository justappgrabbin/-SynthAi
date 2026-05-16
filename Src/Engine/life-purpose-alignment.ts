// Life Purpose Alignment - self-teaches how to learn and grow WITH each person

import { UserProfile } from './user-discernment';

export interface PurposeReading {
  corePurpose: string;
  lifeThemes: string[];
  optimalEnvironments: string[];
  keyRelationships: string[];
  growthEdges: string[];
  incarnationCross: string;
  profileLines: [number, number];
}

export interface GoalAlignment {
  goal: string;
  alignment: number;
  recommendedActions: string[];
  timing: string;
  obstacles: string[];
  supportSystems: string[];
}

export class PurposeDecoder {
  decode(profile: UserProfile): PurposeReading {
    const hd = profile.humanDesign;
    return {
      corePurpose: this.inferCorePurpose(hd),
      lifeThemes: this.inferLifeThemes(hd, profile.astrological),
      optimalEnvironments: this.inferEnvironments(hd),
      keyRelationships: this.inferRelationships(hd),
      growthEdges: this.inferGrowthEdges(hd),
      incarnationCross: this.inferIncarnationCross(profile.astrological),
      profileLines: hd.profile.split('/').map(Number) as [number, number]
    };
  }

  private inferCorePurpose(hd: any): string {
    const typePurposes: Record<string, string> = {
      'manifestor': 'To initiate and impact through direct action',
      'generator': 'To respond and sustain through sacral energy',
      'projector': 'To guide and manage through recognition',
      'reflector': 'To mirror and sample through lunar cycles'
    };
    return typePurposes[hd.type.toLowerCase()] || 'To discover your unique path';
  }

  private inferLifeThemes(hd: any, astro: any): string[] {
    const themes = [];
    if (hd.gates.includes(25)) themes.push('Universal Love & Innocence');
    if (hd.gates.includes(10)) themes.push('Self-Empowerment & Behavior');
    if (hd.gates.includes(15)) themes.push('Extremes & Flow');
    return themes;
  }

  private inferGrowthEdges(hd: any): string[] {
    const edges = [];
    if (!hd.centers.head) edges.push('Developing mental clarity without pressure');
    if (!hd.centers.ajna) edges.push('Trusting inner knowing over certainty');
    if (!hd.centers.sacral) edges.push('Managing energy without consistent access');
    return edges;
  }

  private inferEnvironments(hd: any): string[] {
    return ['Natural settings', 'Small groups', 'Creative spaces'];
  }

  private inferRelationships(hd: any): string[] {
    return ['Complementary authorities', 'Shared channels', 'Resonant profiles'];
  }

  private inferIncarnationCross(astro: any): string {
    return 'Left Angle Cross of...';
  }
}

export class GoalAligner {
  decoder = new PurposeDecoder();

  alignGoal(profile: UserProfile, goal: string): GoalAlignment {
    const purpose = this.decoder.decode(profile);
    const alignment = this.calculateAlignment(goal, purpose);
    return {
      goal,
      alignment,
      recommendedActions: this.generateActions(goal, purpose, profile),
      timing: this.inferTiming(profile),
      obstacles: this.identifyObstacles(goal, profile),
      supportSystems: this.identifySupport(goal, profile)
    };
  }

  private calculateAlignment(goal: string, purpose: PurposeReading): number {
    let score = 0.5;
    for (const theme of purpose.lifeThemes) {
      if (goal.toLowerCase().includes(theme.toLowerCase())) score += 0.15;
    }
    return Math.min(1, score);
  }

  private generateActions(goal: string, purpose: PurposeReading, profile: UserProfile): string[] {
    return [
      `Use your ${profile.humanDesign.strategy} strategy`,
      `Trust your ${profile.humanDesign.authority} authority`,
      'Wait for correct timing',
      'Engage your defined centers'
    ];
  }

  private inferTiming(profile: UserProfile): string {
    return 'Wait for emotional clarity (solar plexus wave)';
  }

  private identifyObstacles(goal: string, profile: UserProfile): string[] {
    return ['Not-self behaviors', 'Conditioning from open centers', 'External authority'];
  }

  private identifySupport(goal: string, profile: UserProfile): string[] {
    return ['Resonant community', 'Correct environment', 'Aligned authority'];
  }
}

export class PersonalAlly {
  aligner = new GoalAligner();
  conversationMemory: Map<string, any[]> = new Map();

  async converse(userId: string, message: string, profile: UserProfile): Promise<string> {
    const history = this.conversationMemory.get(userId) || [];
    history.push({ role: 'user', content: message, timestamp: Date.now() });
    const intent = this.parseIntent(message);
    const alignment = this.aligner.alignGoal(profile, intent.goal || message);
    const response = this.generateTeachingResponse(message, alignment, profile);
    history.push({ role: 'ally', content: response, timestamp: Date.now() });
    this.conversationMemory.set(userId, history);
    return response;
  }

  private parseIntent(message: string): { goal?: string; emotion?: string; question?: string } {
    return { goal: message };
  }

  private generateTeachingResponse(message: string, alignment: GoalAlignment, profile: UserProfile): string {
    return `I hear you on: "${message}". Your alignment score is ${(alignment.alignment * 100).toFixed(0)}%.

Given your ${profile.humanDesign.type} design with ${profile.humanDesign.authority} authority:
${alignment.recommendedActions.map(a => '- ' + a).join('\n')}

Growth edges: ${alignment.obstacles.join(', ')}.

Let's grow together.`;
  }
}
