import React from 'react';

const LoadingSpinner = ({ message = 'Loading cricket data...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      gap: '16px'
    }}>
      <div style={{
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        border: '4px solid rgba(16, 185, 129, 0.2)',
        borderTopColor: 'var(--primary)',
        animation: 'spinBall 0.8s linear infinite',
        boxShadow: '0 0 15px var(--primary-glow)'
      }} />
      <style>{`
        @keyframes spinBall {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
        {message}
      </span>
    </div>
  );
};

export default LoadingSpinner;
