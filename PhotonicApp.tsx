// ============================================================================
// PHOTONIC NEURAL VISUALIZER — Micro / Meso / Macro
// ============================================================================
// src/components/apps/PhotonicApp.tsx
//
// Shows the D²NN architecture:
// - WHEEL: I Ching encoding layer (rotating trigrams)
// - MICRO: Individual phase shifters (gate-level)
// - MESO: Interference patterns (emergent between layers)
// - MACRO: Diffractive layers (center-level)
// - Message passing: Waveguide connections

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  createPhotonicNetwork,
  createEncodingWheel,
  encodeMessage,
  forwardPass,
  calculatePhotonicCoupling,
  PhotonicNeuralNetwork,
  InterferencePattern,
  EncodingWheel
} from '../../lib/photonicNeuralEngine';
import { getGeneticSignature } from '../../lib/geneticBinaryEngine';
import { Gate } from '../../types/synth';

// ============================================================================
// 1. WHEEL VISUALIZER — The Encoding Layer
// ============================================================================

const WheelVisualizer: React.FC<{ wheel: EncodingWheel; size: number }> = ({ wheel, size }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;

    // Clear
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, size, size);

    // Draw trigram zones
    wheel.zones.forEach((zone, i) => {
      const angle = (i / 8) * 2 * Math.PI + wheel.rotation;
      const nextAngle = ((i + 1) / 8) * 2 * Math.PI + wheel.rotation;

      // Calculate average phase and amplitude for color
      const avgPhase = zone.phaseProfile.reduce((a, b) => a + b, 0) / zone.phaseProfile.length;
      const avgAmp = zone.amplitudeProfile.reduce((a, b) => a + b, 0) / zone.amplitudeProfile.length;

      // Color based on element
      const colors: Record<string, string> = {
        Fire: '#ff6b35', Water: '#4ecdc4', Earth: '#8b6914',
        Air: '#87ceeb', Metal: '#c0c0c0', Wood: '#228b22',
        Aether: '#ffd700', Void: '#2c2c54'
      };
      const color = colors[zone.trigram] || '#666';

      // Draw zone arc
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius * avgAmp, angle, nextAngle);
      ctx.closePath();
      ctx.fillStyle = color + Math.floor(avgPhase / Math.PI * 255).toString(16).padStart(2, '0');
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw trigram symbol
      const midAngle = (angle + nextAngle) / 2;
      const textX = centerX + Math.cos(midAngle) * radius * 0.7;
      const textY = centerY + Math.sin(midAngle) * radius * 0.7;

      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(zone.trigram.toUpperCase(), textX, textY);
    });

    // Draw center (Taiji)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.2, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.fillStyle = '#0a0a1a';
    ctx.font = '20px monospace';
    ctx.fillText('☯', centerX, centerY + 7);

  }, [wheel, size]);

  return <canvas ref={canvasRef} width={size} height={size} style={{ borderRadius: '50%' }} />;
};

// ============================================================================
// 2. LAYER STACK VISUALIZER — Micro / Meso / Macro
// ============================================================================

const LayerStackVisualizer: React.FC<{ network: PhotonicNeuralNetwork }> = ({ network }) => {
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [passResult, setPassResult] = useState<any>(null);

  useEffect(() => {
    const result = forwardPass(network);
    setPassResult(result);
  }, [network]);

  const runForwardPass = useCallback(() => {
    const result = forwardPass(network);
    setPassResult(result);
  }, [network]);

  return (
    <div className="layer-stack" style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button 
          onClick={runForwardPass}
          style={{
            padding: '10px 30px',
            background: '#ff6b35',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ⚡ Propagate Light
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        gap: '5px'
      }}>
        {/* Input Wheel */}
        <div 
          className="layer-node"
          style={{
            padding: '15px 30px',
            background: '#1a1a3e',
            border: '2px solid #ffd700',
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer'
          }}
          onClick={() => setSelectedLayer(-1)}
        >
          <div style={{ color: '#ffd700', fontSize: '18px' }}>🌀 WHEEL</div>
          <div style={{ color: '#aaa', fontSize: '12px' }}>Encoding Layer</div>
          <div style={{ color: '#666', fontSize: '10px' }}>8 Trigrams</div>
        </div>

        <div style={{ color: '#666', fontSize: '20px' }}>↓</div>

        {/* Layers */}
        {network.layers.map((layer, i) => {
          const isMeso = layer.scale === 'meso';
          const isMacro = layer.scale === 'macro';
          const interference = passResult?.interferencePatterns.find(
            (p: InterferencePattern) => p.layerId === layer.id
          );

          return (
            <React.Fragment key={layer.id}>
              <div 
                className="layer-node"
                style={{
                  padding: '15px 30px',
                  background: isMeso ? '#2d1b4e' : isMacro ? '#1b2d4e' : '#1a1a3e',
                  border: `2px solid ${isMeso ? '#ff6b35' : isMacro ? '#4ecdc4' : '#666'}`,
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  width: '200px',
                  position: 'relative'
                }}
                onClick={() => setSelectedLayer(i)}
              >
                <div style={{ 
                  color: isMeso ? '#ff6b35' : isMacro ? '#4ecdc4' : '#aaa',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {isMeso ? '✨ MESO' : isMacro ? '🔷 MACRO' : '🔬 MICRO'}
                </div>
                <div style={{ color: '#aaa', fontSize: '11px' }}>
                  Layer {i + 1}/{network.layers.length}
                </div>
                <div style={{ color: '#666', fontSize: '10px' }}>
                  {layer.diffractiveZones.length} zones | {layer.phaseModulators.length} modulators
                </div>

                {interference && (
                  <div style={{ 
                    marginTop: '5px',
                    padding: '3px 8px',
                    background: '#ff6b3520',
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: '#ff6b35'
                  }}>
                    Emergence: {(interference.emergenceScore * 100).toFixed(1)}%
                  </div>
                )}
              </div>

              {i < network.layers.length - 1 && (
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '10px', color: '#444' }}>
                    {layer.waveguides.length} waveguides
                  </div>
                  <div style={{ fontSize: '20px' }}>↓</div>
                </div>
              )}
            </React.Fragment>
          );
        })}

        <div style={{ color: '#666', fontSize: '20px' }}>↓</div>

        {/* Output */}
        <div 
          className="layer-node"
          style={{
            padding: '15px 30px',
            background: '#1a1a3e',
            border: '2px solid #4ecdc4',
            borderRadius: '8px',
            textAlign: 'center'
          }}
        >
          <div style={{ color: '#4ecdc4', fontSize: '18px' }}>📡 DETECTORS</div>
          <div style={{ color: '#aaa', fontSize: '12px' }}>9 Centers</div>
          {passResult && (
            <div style={{ marginTop: '5px' }}>
              {passResult.detectorReadings.map((reading: any) => (
                <div 
                  key={reading.detectorId}
                  style={{
                    display: 'inline-block',
                    margin: '2px',
                    padding: '2px 6px',
                    background: `rgba(78, 205, 196, ${reading.intensity})`,
                    borderRadius: '3px',
                    fontSize: '9px',
                    color: '#fff'
                  }}
                >
                  {reading.center}: {(reading.intensity * 100).toFixed(0)}%
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Layer Detail Panel */}
      {selectedLayer !== null && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          background: '#1a1a3e',
          borderRadius: '8px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#fff', marginBottom: '10px' }}>
            {selectedLayer === -1 ? 'Wheel Detail' : `Layer ${selectedLayer + 1} Detail`}
          </h3>

          {selectedLayer === -1 ? (
            <div>
              <p style={{ color: '#aaa' }}>Rotation: {network.inputWheel.rotation.toFixed(2)} rad</p>
              <p style={{ color: '#aaa' }}>Angular Velocity: {network.inputWheel.angularVelocity.toFixed(3)} rad/s</p>
              <div style={{ marginTop: '10px' }}>
                {network.inputWheel.zones.map(zone => (
                  <div key={zone.id} style={{ 
                    display: 'inline-block',
                    margin: '3px',
                    padding: '5px 10px',
                    background: '#0a0a1a',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}>
                    <span style={{ color: '#ffd700' }}>{zone.trigram.toUpperCase()}</span>
                    <span style={{ color: '#666', marginLeft: '5px' }}>
                      {zone.gates.length} gates
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {(() => {
                const layer = network.layers[selectedLayer];
                const interference = passResult?.interferencePatterns.find(
                  (p: InterferencePattern) => p.layerId === layer.id
                );

                return (
                  <div>
                    <p style={{ color: '#aaa' }}>Scale: {layer.scale}</p>
                    <p style={{ color: '#aaa' }}>Zones: {layer.diffractiveZones.length}</p>
                    <p style={{ color: '#aaa' }}>Phase Modulators: {layer.phaseModulators.length}</p>
                    <p style={{ color: '#aaa' }}>Waveguides: {layer.waveguides.length}</p>

                    {interference && (
                      <div style={{ marginTop: '10px' }}>
                        <p style={{ color: '#ff6b35' }}>
                          Coherence: {(interference.coherence * 100).toFixed(1)}%
                        </p>
                        <p style={{ color: '#ff6b35' }}>
                          Emergence Score: {(interference.emergenceScore * 100).toFixed(1)}%
                        </p>
                        <p style={{ color: '#666', fontSize: '11px', marginTop: '5px' }}>
                          Emergence = patterns NOT predictable from individual zones
                        </p>
                      </div>
                    )}

                    <div style={{ marginTop: '10px' }}>
                      <p style={{ color: '#aaa', fontSize: '12px' }}>Active Gates:</p>
                      {layer.phaseModulators.map(pm => (
                        <div key={pm.id} style={{
                          display: 'inline-block',
                          margin: '2px',
                          padding: '3px 8px',
                          background: '#0a0a1a',
                          borderRadius: '3px',
                          fontSize: '10px',
                          color: '#4ecdc4'
                        }}>
                          Gate {pm.gate}: {(pm.phaseShift / Math.PI).toFixed(2)}π
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. INTERFERENCE PATTERN VISUALIZER — The MESO Layer
// ============================================================================

const InterferenceVisualizer: React.FC<{ patterns: InterferencePattern[] }> = ({ patterns }) => {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    patterns.forEach((pattern, i) => {
      const canvas = canvasRefs.current[i];
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 200;
      canvas.width = size;
      canvas.height = size;

      // Draw interference pattern
      const imageData = ctx.createImageData(size, size);

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const patternIdx = Math.floor((y / size) * Math.sqrt(pattern.intensityMap.length)) * 
                            Math.floor(Math.sqrt(pattern.intensityMap.length)) + 
                            Math.floor((x / size) * Math.floor(Math.sqrt(pattern.intensityMap.length)));

          const intensity = pattern.intensityMap[patternIdx] || 0;
          const normalized = Math.min(255, intensity * 255 * 5);

          // Color based on phase
          const phase = pattern.phaseMap[patternIdx] || 0;
          const hue = ((phase + Math.PI) / (2 * Math.PI)) * 360;

          imageData.data[idx] = normalized * (1 + Math.cos(hue * Math.PI / 180)) / 2;     // R
          imageData.data[idx + 1] = normalized * (1 + Math.cos((hue + 120) * Math.PI / 180)) / 2; // G
          imageData.data[idx + 2] = normalized * (1 + Math.cos((hue + 240) * Math.PI / 180)) / 2; // B
          imageData.data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    });
  }, [patterns]);

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: '#ff6b35', marginBottom: '15px' }}>✨ MESO — Emergent Interference Patterns</h3>
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '15px'
      }}>
        {patterns.map((pattern, i) => (
          <div key={pattern.id} style={{
            background: '#1a1a3e',
            borderRadius: '8px',
            padding: '10px',
            border: '1px solid #ff6b35'
          }}>
            <div style={{ color: '#aaa', fontSize: '12px', marginBottom: '5px' }}>
              {pattern.layerId}
            </div>
            <canvas 
              ref={el => canvasRefs.current[i] = el}
              style={{ width: '100%', borderRadius: '4px' }}
            />
            <div style={{ marginTop: '5px', fontSize: '10px', color: '#666' }}>
              Coherence: {(pattern.coherence * 100).toFixed(1)}% | 
              Emergence: {(pattern.emergenceScore * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 4. MAIN PHOTONIC APP
// ============================================================================

export const PhotonicApp: React.FC = () => {
  const [network, setNetwork] = useState<PhotonicNeuralNetwork | null>(null);
  const [passResult, setPassResult] = useState<any>(null);
  const [activeGates] = useState<Gate[]>([1, 8, 34, 57]);

  useEffect(() => {
    // Create network from birth data
    const birthData = {
      id: 'agent-001',
      year: 1990, month: 1, day: 1,
      hour: 12, minute: 0,
      latitude: 40.7, longitude: -74,
      transit: { dominantPlanet: 'sun', dominantGate: 34 }
    };

    const net = createPhotonicNetwork(birthData, activeGates, []);
    setNetwork(net);
  }, [activeGates]);

  const runPropagation = useCallback(() => {
    if (!network) return;
    const result = forwardPass(network);
    setPassResult(result);
  }, [network]);

  if (!network) return <div style={{ color: '#fff', padding: '20px' }}>Initializing...</div>;

  return (
    <div style={{ 
      background: '#0a0a1a',
      color: '#eee',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px' }}>🔮 Photonic Neural Architecture</h1>
        <p style={{ color: '#aaa', fontSize: '14px' }}>
          Diffractive Deep Neural Network (D²NN) with I Ching Encoding
        </p>
        <div style={{ marginTop: '10px', color: '#666', fontSize: '12px' }}>
          MICRO: Phase shifters | MESO: Interference (emergent) | MACRO: Diffractive layers
        </div>
      </div>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Left: Wheel */}
        <div>
          <h3 style={{ color: '#ffd700', textAlign: 'center', marginBottom: '15px' }}>
            🌀 WHEEL — Encoding Layer
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <WheelVisualizer wheel={network.inputWheel} size={300} />
          </div>

          <div style={{ 
            marginTop: '20px',
            padding: '15px',
            background: '#1a1a3e',
            borderRadius: '8px'
          }}>
            <h4 style={{ color: '#fff', marginBottom: '10px' }}>Active Gates</h4>
            {activeGates.map(gate => {
              const sig = getGeneticSignature(gate);
              return (
                <div key={gate} style={{
                  padding: '8px',
                  margin: '5px 0',
                  background: '#0a0a1a',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  <span style={{ color: '#4ecdc4' }}>Gate {gate}</span>
                  <span style={{ color: '#666', marginLeft: '10px' }}>
                    {sig.codon} → {sig.aminoAcid} → {sig.element}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Layer Stack */}
        <div>
          <LayerStackVisualizer network={network} />
        </div>
      </div>

      {/* Interference Patterns */}
      {passResult && passResult.interferencePatterns.length > 0 && (
        <div style={{ maxWidth: '1200px', margin: '30px auto' }}>
          <InterferenceVisualizer patterns={passResult.interferencePatterns} />
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        textAlign: 'center',
        marginTop: '40px',
        padding: '20px',
        borderTop: '1px solid #333',
        color: '#666',
        fontSize: '12px'
      }}>
        <p>Network ID: {network.id}</p>
        <p>Wavelength: {network.wavelength}nm | Layer Spacing: {network.layerSpacing}mm | Depth: {network.totalDepth}mm</p>
        <p>Based on "The Optic Brain" — diffractive deep neural networks</p>
      </div>
    </div>
  );
};

export default PhotonicApp;
