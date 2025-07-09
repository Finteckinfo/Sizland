'use client'

import React from 'react';

export const WalletPopup = ({
  data,
  onClose,
}: {
  data: { address: string; private_key: string; mnemonic: string };
  onClose: () => void;
}) => {
  const handleCopy = () => {
    const copyText = `Address: ${data.address}\nPrivate Key: ${data.private_key}\nMnemonic: ${data.mnemonic}`;
    navigator.clipboard.writeText(copyText);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '1rem',
          maxWidth: '600px',
          width: '100%',
          padding: '2rem',
          fontFamily: 'monospace',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        }}
      >
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: '#111' }}>
          ✅ Wallet Created Successfully
        </h2>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
            Address:
          </label>
          <pre
            style={{
              backgroundColor: '#f4f4f4',
              padding: '1rem',
              borderRadius: '0.5rem',
              overflowX: 'auto',
              wordWrap: 'break-word',
              fontSize: '0.95rem',
            }}
          >
            {data.address}
          </pre>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
            Private Key:
          </label>
          <pre
            style={{
              backgroundColor: '#f4f4f4',
              padding: '1rem',
              borderRadius: '0.5rem',
              overflowX: 'auto',
              wordWrap: 'break-word',
              fontSize: '0.95rem',
            }}
          >
            {data.private_key}
          </pre>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
            Mnemonic:
          </label>
          <pre
            style={{
              backgroundColor: '#f4f4f4',
              padding: '1rem',
              borderRadius: '0.5rem',
              overflowX: 'auto',
              wordWrap: 'break-word',
              fontSize: '0.95rem',
              whiteSpace: 'pre-wrap',
            }}
          >
            {data.mnemonic}
          </pre>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            onClick={handleCopy}
            style={{
              padding: '0.6rem 1.2rem',
              backgroundColor: '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            📋 Copy Info
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.2rem',
              backgroundColor: '#e0e0e0',
              color: '#333',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ❌ Close
          </button>
        </div>
      </div>
    </div>
  );
};
