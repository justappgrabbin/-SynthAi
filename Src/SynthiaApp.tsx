import React, { useState, useEffect, useCallback } from 'react';
import { MRNNEngine } from './engine/mrnn-core';
import { AutopoieticOS } from './engine/autopoietic-os';
import { IngestionSystem } from './engine/ingestion-system';
import { UserDiscernmentEngine } from './engine/user-discernment';
import { PersonalAlly } from './engine/life-purpose-alignment';
import { MobileMCPConnector } from './engine/mobile-mcp-connector';
import { MorphVisualizer } from './visualizer/morph-visualizer';
import { AppTray } from './components/AppTray';

const SERVER_URL = import.meta.env.VITE_SYNTHIA_SERVER || 'https://synthia-server.onrender.com';
const HF_USER = import.meta.env.VITE_HF_USERNAME || 'stellarproximology';

export const SynthiaApp: React.FC = () => {
  const [engine] = useState(() => new MRNNEngine(5));
  const [os] = useState(() => new AutopoieticOS(SERVER_URL, HF_USER, 5));
  const [ingestion] = useState(() => new IngestionSystem(os));
  const [discernment] = useState(() => new UserDiscernmentEngine());
  const [ally] = useState(() => new PersonalAlly());
  const [mcp] = useState(() => new MobileMCPConnector());

  const [activeTab, setActiveTab] = useState<'visualizer' | 'tray' | 'mcp' | 'settings'>('visualizer');
  const [mcpConnected, setMcpConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>(['Synthia initialized']);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev.slice(-50), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  useEffect(() => {
    // Seed initial nodes
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 8; j++) {
        engine.addNode(i, {
          siderealLongitude: (j * 45) % 360,
          draconicLongitude: ((j * 45 + 30) % 360),
          trueLongitude: ((j * 45 + 60) % 360),
          house: (j % 12) + 1,
          gate: (j % 64) + 1,
          channel: (j % 36) + 1
        });
      }
    }
    addLog('MRNN seeded with 40 nodes across 5 layers');
  }, [engine, addLog]);

  const handleConnectMCP = async () => {
    addLog('Connecting to Mobile MCP...');
    const connected = await mcp.connect();
    setMcpConnected(connected);
    if (connected) addLog('Mobile MCP connected!');
    else addLog('Mobile MCP connection failed');
  };

  const handleInstall = async () => {
    if (!mcpConnected) { addLog('Connect MCP first'); return; }
    addLog('Installing Synthia app on device...');
    await mcp.installApp('./dist');
    addLog('App installed');
  };

  const handleScreenshot = async () => {
    if (!mcpConnected) { addLog('Connect MCP first'); return; }
    addLog('Taking screenshot...');
    await mcp.takeScreenshot();
    addLog('Screenshot captured');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0' }}>
      {/* Header */}
      <header style={{
        padding: '20px',
        borderBottom: '1px solid #1a1a2e',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.5rem',
            background: 'linear-gradient(135deg, #00d4ff, #7b2cbf)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🌌 Synthia
          </h1>
          <p style={{ color: '#888', fontSize: '0.8rem' }}>Living Civilization Platform</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['visualizer', 'tray', 'mcp', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                background: activeTab === tab ? '#00d4ff20' : '#111118',
                border: `1px solid ${activeTab === tab ? '#00d4ff' : '#1a1a2e'}`,
                color: activeTab === tab ? '#00d4ff' : '#888',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'mcp' ? '📱 MCP' : tab === 'visualizer' ? '🔮 Visualizer' : tab === 'tray' ? '📦 Tray' : '⚙️ Settings'}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '20px' }}>
        {activeTab === 'visualizer' && (
          <div>
            <div style={{ marginBottom: '16px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => engine.autopoiesis(0.85)}
                style={{
                  background: '#7b2cbf20',
                  border: '1px solid #7b2cbf',
                  color: '#7b2cbf',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                🔄 Autopoiesis
              </button>
              <button
                onClick={() => os.cycle()}
                style={{
                  background: '#00ff8820',
                  border: '1px solid #00ff88',
                  color: '#00ff88',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                ⚡ OS Cycle
              </button>
            </div>
            <MorphVisualizer engine={engine} width={window.innerWidth - 60} height={500} />
          </div>
        )}

        {activeTab === 'tray' && (
          <AppTray
            entities={os.getAppTray()}
            onExecute={async (uuid) => {
              addLog(`Executing ${uuid.slice(-8)}...`);
              await os.execute(uuid);
              addLog('Executed');
            }}
            onRemove={(uuid) => {
              addLog(`Removed ${uuid.slice(-8)}`);
            }}
          />
        )}

        {activeTab === 'mcp' && (
          <div style={{ maxWidth: '600px' }}>
            <div style={{
              padding: '20px',
              background: '#111118',
              borderRadius: '16px',
              border: `1px solid ${mcpConnected ? '#00ff88' : '#ff006e'}`,
              marginBottom: '20px'
            }}>
              <h3 style={{ color: mcpConnected ? '#00ff88' : '#ff006e', marginBottom: '10px' }}>
                {mcpConnected ? '📱 MCP Connected' : '📵 MCP Disconnected'}
              </h3>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>
                {mcpConnected
                  ? 'Ready to control your device'
                  : 'Run: npx -y @mobilenext/mobile-mcp@latest'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button onClick={handleConnectMCP} style={{
                background: '#00d4ff20', border: '1px solid #00d4ff', color: '#00d4ff',
                padding: '12px', borderRadius: '12px', cursor: 'pointer'
              }}>
                🔌 Connect MCP
              </button>
              <button onClick={handleInstall} disabled={!mcpConnected} style={{
                background: mcpConnected ? '#00ff8820' : '#1a1a2e',
                border: `1px solid ${mcpConnected ? '#00ff88' : '#2a2a4e'}`,
                color: mcpConnected ? '#00ff88' : '#555',
                padding: '12px', borderRadius: '12px', cursor: mcpConnected ? 'pointer' : 'not-allowed'
              }}>
                📲 Install App
              </button>
              <button onClick={handleScreenshot} disabled={!mcpConnected} style={{
                background: mcpConnected ? '#ffaa0020' : '#1a1a2e',
                border: `1px solid ${mcpConnected ? '#ffaa00' : '#2a2a4e'}`,
                color: mcpConnected ? '#ffaa00' : '#555',
                padding: '12px', borderRadius: '12px', cursor: mcpConnected ? 'pointer' : 'not-allowed'
              }}>
                📸 Screenshot
              </button>
              <button onClick={async () => {
                if (!mcpConnected) return;
                addLog('Starting autopoietic test...');
                await mcp.autopoieticTest('com.synthia.app');
                addLog('Autopoietic test complete');
              }} disabled={!mcpConnected} style={{
                background: mcpConnected ? '#7b2cbf20' : '#1a1a2e',
                border: `1px solid ${mcpConnected ? '#7b2cbf' : '#2a2a4e'}`,
                color: mcpConnected ? '#7b2cbf' : '#555',
                padding: '12px', borderRadius: '12px', cursor: mcpConnected ? 'pointer' : 'not-allowed'
              }}>
                🧪 Auto-Test
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ maxWidth: '500px' }}>
            <div style={{ background: '#111118', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
              <h3 style={{ color: '#fff', marginBottom: '12px' }}>Server Configuration</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Synthia Server</label>
                <input
                  type="text"
                  defaultValue={SERVER_URL}
                  style={{
                    width: '100%', background: '#0a0a0f', border: '1px solid #2a2a4e',
                    borderRadius: '8px', padding: '10px', color: '#e0e0e0'
                  }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>HuggingFace Username</label>
                <input
                  type="text"
                  defaultValue={HF_USER}
                  style={{
                    width: '100%', background: '#0a0a0f', border: '1px solid #2a2a4e',
                    borderRadius: '8px', padding: '10px', color: '#e0e0e0'
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Logs */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#050508',
        borderTop: '1px solid #1a1a2e',
        padding: '10px 20px',
        maxHeight: '120px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '0.75rem',
        color: '#888'
      }}>
        {logs.slice(-5).map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
};
