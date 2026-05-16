// Discerning Ingestion System - learns and grows

import { AutopoieticOS, IngestedEntity } from './autopoietic-os';

export interface UploadPayload {
  type: 'file' | 'url' | 'api' | 'huggingface' | 'git';
  data: any;
  metadata: {
    filename?: string;
    url?: string;
    apiEndpoint?: string;
    modelName?: string;
    repoUrl?: string;
    tags?: string[];
  };
}

export class IngestionSystem {
  os: AutopoieticOS;
  learningMemory: Map<string, any> = new Map();
  patternWeights: Map<string, number> = new Map();
  thresholdEvolution: number = 0.5;

  constructor(os: AutopoieticOS) {
    this.os = os;
  }

  async upload(payload: UploadPayload): Promise<string> {
    console.log(`Uploading ${payload.type}`);
    let processed = payload.data;
    if (payload.type === 'file') processed = await this.processFile(payload.data);
    if (payload.type === 'url') processed = await this.fetchUrl(payload.metadata.url!);
    if (payload.type === 'huggingface') processed = await this.fetchHuggingFace(payload.metadata.modelName!);
    if (payload.type === 'git') processed = await this.fetchGit(payload.metadata.repoUrl!);

    const address = await this.os.ingest(payload.type, processed, payload.metadata);
    this.learnFromIngestion(payload, address.uuid);
    return address.uuid;
  }

  private async processFile(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsText(file);
    });
  }

  private async fetchUrl(url: string): Promise<string> {
    const response = await fetch(url);
    return response.text();
  }

  private async fetchHuggingFace(modelName: string): Promise<any> {
    const hfUrl = `https://huggingface.co/${this.os.hfUsername}/${modelName}`;
    const response = await fetch(`${hfUrl}/raw/main/README.md`);
    const readme = await response.text();
    return { modelName, readme, source: 'huggingface' };
  }

  private async fetchGit(repoUrl: string): Promise<any> {
    return { repoUrl, structure: [], source: 'git' };
  }

  private learnFromIngestion(payload: UploadPayload, uuid: string) {
    const key = `${payload.type}:${payload.metadata.filename || payload.metadata.modelName || 'generic'}`;
    const currentWeight = this.patternWeights.get(key) || 0.5;
    this.patternWeights.set(key, currentWeight + 0.1);
    this.learningMemory.set(key, { uuid, timestamp: Date.now(), weight: this.patternWeights.get(key) });
    this.thresholdEvolution = Math.min(0.95, this.thresholdEvolution + 0.01);
  }

  getLearningStats() {
    return {
      patterns: Array.from(this.patternWeights.entries()),
      memorySize: this.learningMemory.size,
      threshold: this.thresholdEvolution
    };
  }
}
