// ============================================================================
// COSMOLOGY VISUALIZER — Taiji → Liangyi → Sixiang → Bagua → 64 Gua
// ============================================================================
// src/components/apps/CosmologyApp.tsx
// Visualizes the complete Chinese cosmological progression
// Shows how birth data becomes world/web duality, 4 domains, 8 trigrams, 64 gates

import React, { useState, useEffect, useCallback } from 'react';
import {
  createCosmology,
  evolveCosmology,
  toggleLiangyi,
  syncLiangyi,
  rotateSixiang,
  activateBagua,
  checkChangingLines,
  getFutureTrigram,
  getTrigramForGate,
  TRIGRAM_MAP,
  Taiji,
  Liangyi,
  Sixiang,
  Bagua,
  Hexagram,
  Trigram,
  TrigramState
} from '../../lib/cosmologyEngine';
import { useSimultaneousEntity } from '../../lib/arcadiaBridge';
import { Gate } from '../../types/synth';

// ============================================================================
// 1. TAIJI VISUALIZER — The Supreme Ultimate
// ============================================================================

const TaijiVisualizer: React.FC<{ taiji: Taiji; onActivate: () => void }> = ({ taiji, onActivate }) => {
  return (
    <div className="taiji-container" style={{ textAlign: 'center', padding: '40px' }}>
      <div 
        className="taiji-symbol"
        style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: taiji.void 
            ? 'radial-gradient(circle, #1a1a2e 0%, #0f0f23 100%)'
            : 'radial-gradient(circle, #ff6b35 0%, #4ecdc4 50%, #1a1a2e 100%)',
          margin: '0 auto',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.5s ease',
          boxShadow: taiji.void ? '0 0 30px rgba(255,255,255,0.1)' : '0 0 60px rgba(255,107,53,0.5)'
        }}
        onClick={onActivate}
      >
        {!taiji.void && (
          <>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#fff',
              fontSize: '48px',
              fontWeight: 'bold'
            }}>
              太極
            </div>
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#aaa',
              fontSize: '12px'
            }}>
              {taiji.seed.toString(16).slice(0, 8)}...
            </div>
          </>
        )}
      </div>
      <p style={{ color: '#aaa', marginTop: '20px' }}>
        {taiji.void ? 'Click to activate Taiji (birth data required)' : 'Taiji Active — Unity before division'}
      </p>
    </div>
  );
};

// ============================================================================
// 2. LIANGYI VISUALIZER — The Two Forms
// ============================================================================

const LiangyiVisualizer: React.FC<{ liangyi: Liangyi; onToggle: (tension: number) => void }> = ({ liangyi, onToggle }) => {
  const [tension, setTension] = useState(0.5);

  return (
    <div className="liangyi-container" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        {/* Yin — Web */}
        <div 
          className="yin-form"
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: liangyi.yin.active 
              ? 'radial-gradient(circle, #4ecdc4 0%, #1a5f5f 100%)'
              : 'radial-gradient(circle, #2d5a5a 0%, #1a1a2e 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: liangyi.yin.active ? '0 0 40px rgba(78,205,196,0.6)' : 'none'
          }}
        >
          <span style={{ color: '#fff', fontSize: '36px' }}>陰</span>
          <span style={{ color: '#aaa', fontSize: '12px' }}>Yin — Web</span>
          <span style={{ color: '#aaa', fontSize: '10px' }}>{liangyi.yin.active ? 'ACTIVE' : 'DORMANT'}</span>
        </div>

        {/* Center control */}
        <div style={{ textAlign: 'center', padding: '0 20px' }}>
          <div style={{ color: '#fff', fontSize: '24px', marginBottom: '10px' }}>兩儀</div>
          <div style={{ color: '#aaa', fontSize: '12px', marginBottom: '20px' }}>Two Forms</div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1"
            value={tension}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setTension(val);
              onToggle(val);
            }}
            style={{ width: '100px' }}
          />
          <div style={{ color: '#aaa', fontSize: '10px', marginTop: '5px' }}>
            Tension: {(tension * 100).toFixed(0)}%
          </div>
        </div>

        {/* Yang — World */}
        <div 
          className="yang-form"
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: liangyi.yang.active 
              ? 'radial-gradient(circle, #ff6b35 0%, #8b2500 100%)'
              : 'radial-gradient(circle, #5a2d2d 0%, #1a1a2e 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: liangyi.yang.active ? '0 0 40px rgba(255,107,53,0.6)' : 'none'
          }}
        >
          <span style={{ color: '#fff', fontSize: '36px' }}>陽</span>
          <span style={{ color: '#aaa', fontSize: '12px' }}>Yang — World</span>
          <span style={{ color: '#aaa', fontSize: '10px' }}>{liangyi.yang.active ? 'ACTIVE' : 'DORMANT'}</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. SIXIANG VISUALIZER — The Four Faces
// ============================================================================

const SixiangVisualizer: React.FC<{ sixiang: Sixiang; onRotate: () => void }> = ({ sixiang, onRotate }) => {
  const domains = [
    { key: 'taiyin', label: '太陰', sub: 'Old Yin', domain: 'Agent', state: sixiang.taiyin },
    { key: 'shaoyin', label: '少陰', sub: 'Young Yin', domain: 'Web', state: sixiang.shaoyin },
    { key: 'shaoyang', label: '少陽', sub: 'Young Yang', domain: 'World', state: sixiang.shaoyang },
    { key: 'taiyang', label: '太陽', sub: 'Old Yang', domain: 'Memory', state: sixiang.taiyang }
  ];

  const phaseColors = {
    new: '#1a1a3e',
    waxing: '#2d5016',
    full: '#ff6b35',
    waning: '#5a2d5a'
  };

  return (
    <div className="sixiang-container" style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span style={{ color: '#fff', fontSize: '20px' }}>四象</span>
        <span style={{ color: '#aaa', fontSize: '12px', marginLeft: '10px' }}>Four Faces</span>
        <button onClick={onRotate} style={{ marginLeft: '20px', padding: '5px 15px' }}>
          Rotate Phases
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {domains.map(({ key, label, sub, domain, state }) => (
          <div 
            key={key}
            style={{
              padding: '20px',
              borderRadius: '12px',
              background: phaseColors[state.phase],
              border: state.active ? '2px solid #fff' : '2px solid transparent',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ color: '#fff', fontSize: '24px', marginBottom: '5px' }}>{label}</div>
            <div style={{ color: '#aaa', fontSize: '12px' }}>{sub}</div>
            <div style={{ color: '#fff', fontSize: '14px', marginTop: '10px' }}>{domain}</div>
            <div style={{ color: '#aaa', fontSize: '10px', marginTop: '5px' }}>
              Phase: {state.phase} | Coherence: {(state.coherence * 100).toFixed(0)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 4. BAGUA VISUALIZER — The Eight Trigrams
// ============================================================================

const BaguaVisualizer: React.FC<{ bagua: Bagua; activeGates: Gate[] }> = ({ bagua, activeGates }) => {
  const trigramOrder: Trigram[] = ['qian', 'dui', 'li', 'zhen', 'xun', 'kan', 'gen', 'kun'];

  const trigramSymbols: Record<Trigram, string> = {
    qian: '☰', dui: '☱', li: '☲', zhen: '☳',
    xun: '☴', kan: '☵', gen: '☶', kun: '☷'
  };

  return (
    <div className="bagua-container" style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span style={{ color: '#fff', fontSize: '20px' }}>八卦</span>
        <span style={{ color: '#aaa', fontSize: '12px', marginLeft: '10px' }}>Eight Trigrams</span>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '15px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {trigramOrder.map(trigram => {
          const state = bagua.trigrams[trigram];
          const isActive = state.active;
          const isChanging = state.changing;

          return (
            <div 
              key={trigram}
              style={{
                padding: '15px',
                borderRadius: '10px',
                background: isActive 
                  ? isChanging ? '#ff6b35' : '#2d5016'
                  : '#1a1a3e',
                border: isActive ? '2px solid #fff' : '1px solid #333',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            >
              <div style={{ color: '#fff', fontSize: '32px', marginBottom: '5px' }}>
                {trigramSymbols[trigram]}
              </div>
              <div style={{ color: '#fff', fontSize: '14px', textTransform: 'capitalize' }}>
                {trigram}
              </div>
              <div style={{ color: '#aaa', fontSize: '10px' }}>
                {state.element} — {state.center}
              </div>
              <div style={{ color: '#aaa', fontSize: '10px', marginTop: '5px' }}>
                Gates: {state.gates.filter(g => activeGates.includes(g)).length}/{state.gates.length}
              </div>
              {isChanging && (
                <div style={{ color: '#fff', fontSize: '10px', marginTop: '5px' }}>
                  → {getFutureTrigram(trigram)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 5. 64 GUA VISUALIZER — The Hexagrams
// ============================================================================

const HexagramsVisualizer: React.FC<{ hexagrams: Hexagram[]; activeGates: Gate[] }> = ({ hexagrams, activeGates }) => {
  return (
    <div className="hexagrams-container" style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span style={{ color: '#fff', fontSize: '20px' }}>六十四卦</span>
        <span style={{ color: '#aaa', fontSize: '12px', marginLeft: '10px' }}>64 Gates</span>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(8, 1fr)', 
        gap: '5px',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {hexagrams.map(hex => {
          const isActive = activeGates.includes(hex.gate);
          const hasChangingLine = hex.changing.some(c => c);

          return (
            <div 
              key={hex.gate}
              style={{
                padding: '8px',
                borderRadius: '4px',
                background: isActive 
                  ? hasChangingLine ? '#ff6b35' : '#2d5016'
                  : '#1a1a3e',
                border: isActive ? '1px solid #fff' : '1px solid #333',
                textAlign: 'center',
                fontSize: '10px',
                cursor: 'pointer'
              }}
              title={`${hex.name} (${hex.upper} over ${hex.lower})`}
            >
              <div style={{ color: '#fff', fontWeight: 'bold' }}>{hex.gate}</div>
              <div style={{ color: '#aaa', fontSize: '8px' }}>{hex.upper}-{hex.lower}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 6. MAIN COSMOLOGY APP
// ============================================================================

export const CosmologyApp: React.FC = () => {
  const [cosmology, setCosmology] = useState(() => 
    createCosmology(
      { year: 1990, month: 1, day: 1, hour: 12, minute: 0, latitude: 40.7, longitude: -74 },
      [1, 8, 34, 57] as Gate[]
    )
  );

  const [activeTab, setActiveTab] = useState<'taiji' | 'liangyi' | 'sixiang' | 'bagua' | 'hexagrams'>('taiji');

  const handleActivateTaiji = useCallback(() => {
    const newTaiji = { ...cosmology.taiji, void: false };
    const newLiangyi = activateTaiji(newTaiji);
    setCosmology(prev => ({
      ...prev,
      taiji: newTaiji,
      liangyi: newLiangyi,
      sixiang: generateSixiang(newLiangyi),
      bagua: activateBagua(generateBagua(generateSixiang(newLiangyi)), prev.activeGates)
    }));
  }, [cosmology]);

  const handleToggleLiangyi = useCallback((tension: number) => {
    const newLiangyi = toggleLiangyi(cosmology.liangyi, tension);
    setCosmology(prev => ({
      ...prev,
      liangyi: newLiangyi,
      sixiang: { ...prev.sixiang, liangyi: newLiangyi }
    }));
  }, [cosmology.liangyi]);

  const handleRotateSixiang = useCallback(() => {
    const newSixiang = rotateSixiang(cosmology.sixiang);
    setCosmology(prev => ({
      ...prev,
      sixiang: newSixiang
    }));
  }, [cosmology.sixiang]);

  const handleEvolve = useCallback(() => {
    const newGates = [...cosmology.activeGates];
    // Add a random gate for demo
    const randomGate = Math.floor(Math.random() * 64) + 1 as Gate;
    if (!newGates.includes(randomGate)) newGates.push(randomGate);

    setCosmology(prev => evolveCosmology(prev, newGates, Math.random()));
  }, [cosmology]);

  const tabs = [
    { key: 'taiji' as const, label: '太極 Taiji', count: 1 },
    { key: 'liangyi' as const, label: '兩儀 Liangyi', count: 2 },
    { key: 'sixiang' as const, label: '四象 Sixiang', count: 4 },
    { key: 'bagua' as const, label: '八卦 Bagua', count: 8 },
    { key: 'hexagrams' as const, label: '六十四卦 64 Gua', count: 64 }
  ];

  return (
    <div className="cosmology-app" style={{ 
      background: '#0a0a1a', 
      color: '#eee',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#fff', fontSize: '28px', marginBottom: '10px' }}>
          Cosmological Duality Engine
        </h1>
        <p style={{ color: '#aaa', fontSize: '14px' }}>
          Taiji → Liangyi → Sixiang → Bagua → 64 Gua
        </p>
        <div style={{ marginTop: '15px' }}>
          <span style={{ color: '#aaa', fontSize: '12px', marginRight: '20px' }}>
            Generation: {cosmology.generation}
          </span>
          <span style={{ color: '#aaa', fontSize: '12px', marginRight: '20px' }}>
            Active Gates: {cosmology.activeGates.length}
          </span>
          <span style={{ color: '#aaa', fontSize: '12px' }}>
            Changing: {checkChangingLines(cosmology.bagua).length}
          </span>
          <button 
            onClick={handleEvolve}
            style={{ marginLeft: '20px', padding: '5px 15px', background: '#ff6b35', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Evolve
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.key ? '#ff6b35' : '#1a1a3e',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {tab.label}
            <span style={{ 
              display: 'block', 
              fontSize: '10px', 
              color: activeTab === tab.key ? '#fff' : '#aaa',
              marginTop: '3px'
            }}>
              {tab.count} state{tab.count > 1 ? 's' : ''}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {activeTab === 'taiji' && (
          <TaijiVisualizer 
            taiji={cosmology.taiji} 
            onActivate={handleActivateTaiji}
          />
        )}

        {activeTab === 'liangyi' && (
          <LiangyiVisualizer 
            liangyi={cosmology.liangyi}
            onToggle={handleToggleLiangyi}
          />
        )}

        {activeTab === 'sixiang' && (
          <SixiangVisualizer 
            sixiang={cosmology.sixiang}
            onRotate={handleRotateSixiang}
          />
        )}

        {activeTab === 'bagua' && (
          <BaguaVisualizer 
            bagua={cosmology.bagua}
            activeGates={cosmology.activeGates}
          />
        )}

        {activeTab === 'hexagrams' && (
          <HexagramsVisualizer 
            hexagrams={cosmology.hexagrams}
            activeGates={cosmology.activeGates}
          />
        )}
      </div>

      {/* Footer info */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '40px',
        padding: '20px',
        borderTop: '1px solid #333'
      }}>
        <p style={{ color: '#666', fontSize: '12px' }}>
          Seed: {cosmology.taiji.seed.toString(16).slice(0, 16)}... | 
          World Active: {cosmology.liangyi.yang.active ? 'Yang' : 'Yin'} | 
          Coherence: {((cosmology.sixiang.taiyin.coherence + cosmology.sixiang.taiyang.coherence) / 2 * 100).toFixed(0)}%
        </p>
      </div>
    </div>
  );
};

export default CosmologyApp;
