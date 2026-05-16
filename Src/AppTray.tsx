// App Tray - shows all ingested entities as launchable items

import React from 'react';
import { IngestedEntity } from '../engine/autopoietic-os';

interface Props {
  entities: IngestedEntity[];
  onExecute: (uuid: string) => void;
  onRemove: (uuid: string) => void;
}

export const AppTray: React.FC<Props> = ({ entities, onExecute, onRemove }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '16px',
      padding: '20px'
    }}>
      {entities.map(entity => (
        <div key={entity.address.uuid} style={{
          background: '#111118',
          border: '1px solid #1a1a2e',
          borderRadius: '16px',
          padding: '20px',
          cursor: 'pointer',
          transition: 'all 0.3s',
          position: 'relative'
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#00d4ff'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a2e'}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, #7b2cbf, #00d4ff)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            marginBottom: '12px'
          }}>
            {entity.source === 'file' ? '📄' :
             entity.source === 'url' ? '🔗' :
             entity.source === 'huggingface' ? '🤗' :
             entity.source === 'git' ? '📦' : '⚡'}
          </div>
          <h4 style={{ color: '#fff', marginBottom: '4px', fontSize: '0.95rem' }}>
            {entity.metadata.filename || entity.metadata.modelName || entity.id.slice(-8)}
          </h4>
          <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: '8px' }}>
            {entity.source} • Layer {entity.address.layer}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onExecute(entity.address.uuid)}
              style={{
                flex: 1,
                background: '#00d4ff20',
                border: '1px solid #00d4ff',
                color: '#00d4ff',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Execute
            </button>
            <button
              onClick={() => onRemove(entity.address.uuid)}
              style={{
                background: '#ff006e20',
                border: '1px solid #ff006e',
                color: '#ff006e',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
