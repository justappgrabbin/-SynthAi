// Morph Visualizer - Teal/Purple, message-passing graph

import React, { useEffect, useRef, useState } from 'react';
import { MRNNEngine, MRNNNode } from '../engine/mrnn-core';

interface Props {
  engine: MRNNEngine;
  width?: number;
  height?: number;
}

export const MorphVisualizer: React.FC<Props> = ({ engine, width = 800, height = 600 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<MRNNNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const draw = () => {
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = Math.min(width, height) * 0.4;

      engine.layers.forEach((layer, i) => {
        const radius = maxRadius * ((i + 1) / engine.layers.length);
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = layer.color + '30';
        ctx.lineWidth = 1;
        ctx.stroke();

        layer.nodes.forEach((node, j) => {
          const angle = (j / Math.max(1, layer.nodes.length)) * Math.PI * 2 + (Date.now() * 0.0001 * (i + 1));
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          const glowSize = node.state === 'resonant' ? 12 : node.state === 'active' ? 8 : 4;
          const alpha = node.state === 'resonant' ? 1 : node.state === 'active' ? 0.7 : 0.3;

          ctx.beginPath();
          ctx.arc(x, y, glowSize, 0, Math.PI * 2);
          ctx.fillStyle = layer.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
          ctx.fill();
          (node as any)._x = x;
          (node as any)._y = y;
        });
      });

      engine.layers.forEach(layer => {
        layer.connections.forEach(conn => {
          const from = engine.layers.flatMap(l => l.nodes).find(n => n.id === conn.from);
          const to = engine.layers.flatMap(l => l.nodes).find(n => n.id === conn.to);
          if (!from || !to) return;
          const fx = (from as any)._x || cx;
          const fy = (from as any)._y || cy;
          const tx = (to as any)._x || cx;
          const ty = (to as any)._y || cy;

          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(tx, ty);
          ctx.strokeStyle = `rgba(123, 44, 191, ${conn.resonanceScore * 0.5})`;
          ctx.lineWidth = conn.resonanceScore * 2;
          ctx.stroke();
        });
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [engine, width, height]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const layer of engine.layers) {
      for (const node of layer.nodes) {
        const nx = (node as any)._x;
        const ny = (node as any)._y;
        if (nx && ny && Math.hypot(x - nx, y - ny) < 20) {
          setSelectedNode(node);
          return;
        }
      }
    }
    setSelectedNode(null);
  };

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleClick}
        style={{ borderRadius: '12px', cursor: 'pointer' }}
      />
      {selectedNode && (
        <div style={{
          position: 'absolute',
          top: 10, left: 10,
          background: '#111118',
          border: '1px solid #2a2a4e',
          borderRadius: '12px',
          padding: '16px',
          maxWidth: '250px'
        }}>
          <h4 style={{ color: '#00d4ff', marginBottom: '8px' }}>Node {(selectedNode as any).id.slice(-6)}</h4>
          <p style={{ fontSize: '0.8rem', color: '#aaa' }}>Layer: {selectedNode.layer}</p>
          <p style={{ fontSize: '0.8rem', color: '#aaa' }}>State: {selectedNode.state}</p>
          <p style={{ fontSize: '0.8rem', color: '#aaa' }}>Activation: {selectedNode.activation.toFixed(3)}</p>
          <p style={{ fontSize: '0.8rem', color: '#aaa' }}>Gate: {selectedNode.coordinates.gate}</p>
          <p style={{ fontSize: '0.8rem', color: '#aaa' }}>Channel: {selectedNode.coordinates.channel}</p>
        </div>
      )}
    </div>
  );
};
