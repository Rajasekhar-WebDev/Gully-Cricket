import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorAlert = ({ message, onDismiss, retry }) => {
  if (!message) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 18px',
      background: 'rgba(239, 68, 68, 0.12)',
      border: '1px solid rgba(239, 68, 68, 0.35)',
      borderRadius: 'var(--radius-md)',
      color: '#fca5a5',
      marginBottom: '20px',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {retry && (
          <button
            onClick={retry}
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.25)',
              color: '#fff'
            }}
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button onClick={onDismiss} style={{ color: '#fca5a5', padding: '4px' }}>
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;
