/**
 * Godot Bridge - WebSocket Server
 * 
 * Connects Node.js consciousness engine to Godot game client
 * Streams consciousness state, agent actions, and world updates
 */

import { WebSocketServer, WebSocket } from 'ws';
import { GameGANSimulator, type GameState, type GameAction } from '../shared/gamegan-simulator';
import { type CognitiveState } from '../shared/unified-cognitive-engine';

export interface GodotMessage {
  type: 'action' | 'state_request' | 'handshake' | 'ping';
  agentId?: string;
  action?: GameAction;
  data?: any;
}

export interface BridgeMessage {
  type: 'state_update' | 'consciousness_update' | 'world_event' | 'pong';
  agentId?: string;
  gameState?: GameState;
  cognitiveState?: CognitiveState;
  data?: any;
}

/**
 * Godot Bridge Server
 */
export class GodotBridge {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocket> = new Map();
  private simulators: Map<string, GameGANSimulator> = new Map();
  private port: number;
  
  constructor(port: number = 9001) {
    this.port = port;
  }
  
  /**
   * Start WebSocket server
   */
  start(): void {
    if (this.wss) {
      console.log(`🌉 Godot Bridge already running on ws://localhost:${this.port}`);
      return;
    }
    
    this.wss = new WebSocketServer({ port: this.port });
    
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);
      
      // Create simulator for this client
      this.simulators.set(clientId, new GameGANSimulator());
      
      console.log(`🎮 Godot client connected: ${clientId}`);
      
      // Send handshake
      this.sendToClient(clientId, {
        type: 'consciousness_update',
        agentId: clientId,
        data: { message: 'Connected to YOU-N-I-VERSE consciousness network' }
      });
      
      // Handle messages
      ws.on('message', (data: Buffer) => {
        try {
          const message: GodotMessage = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('Error parsing Godot message:', error);
        }
      });
      
      // Handle disconnect
      ws.on('close', () => {
        console.log(`🎮 Godot client disconnected: ${clientId}`);
        this.clients.delete(clientId);
        this.simulators.delete(clientId);
      });
      
      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for ${clientId}:`, error);
      });
    });
    
    console.log(`🌉 Godot Bridge listening on ws://localhost:${this.port}`);
  }
  
  /**
   * Handle incoming message from Godot
   */
  private handleMessage(clientId: string, message: GodotMessage): void {
    const simulator = this.simulators.get(clientId);
    
    switch (message.type) {
      case 'handshake':
        console.log(`Handshake from ${message.agentId || clientId}`);
        break;
        
      case 'action':
        if (simulator && message.action) {
          // Process action through GameGAN
          const newState = simulator.step(message.action);
          
          // Send updated state back to Godot
          this.sendToClient(clientId, {
            type: 'state_update',
            agentId: message.agentId || clientId,
            gameState: newState
          });
        }
        break;
        
      case 'state_request':
        if (simulator) {
          const state = simulator.getState();
          this.sendToClient(clientId, {
            type: 'state_update',
            agentId: message.agentId || clientId,
            gameState: state
          });
        }
        break;
        
      case 'ping':
        this.sendToClient(clientId, { type: 'pong' });
        break;
    }
  }
  
  /**
   * Send message to specific client
   */
  private sendToClient(clientId: string, message: BridgeMessage): void {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
  
  /**
   * Broadcast consciousness update to all connected clients
   */
  broadcastConsciousnessUpdate(
    agentId: string,
    cognitiveState: CognitiveState
  ): void {
    const message: BridgeMessage = {
      type: 'consciousness_update',
      agentId,
      cognitiveState
    };
    
    this.broadcast(message);
  }
  
  /**
   * Broadcast to all clients
   */
  private broadcast(message: BridgeMessage): void {
    const payload = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
  
  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `godot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get simulator for specific client
   */
  getSimulator(clientId: string): GameGANSimulator | undefined {
    return this.simulators.get(clientId);
  }
  
  /**
   * Stop the bridge server
   */
  stop(): void {
    if (this.wss) {
      this.wss.close();
      this.clients.clear();
      this.simulators.clear();
      console.log('🌉 Godot Bridge stopped');
    }
  }
  
  /**
   * Get connection stats
   */
  getStats(): {
    connectedClients: number;
    activeSimulators: number;
  } {
    return {
      connectedClients: this.clients.size,
      activeSimulators: this.simulators.size
    };
  }
}

// Export singleton instance
let bridgeInstance: GodotBridge | null = null;

export function getGodotBridge(port: number = 9001): GodotBridge {
  if (!bridgeInstance) {
    bridgeInstance = new GodotBridge(port);
  }
  return bridgeInstance;
}
