// src/components/ui/wallet.tsx
'use client'

import React from 'react';

export const WalletPopup = ({ data, onClose }: {
  data: { address: string; private_key: string; mnemonic: string };
  onClose: () => void;
}) => {
  const handleCopy = () => {
    const copyText = `Address: ${data.address}\nPrivate Key: ${data.private_key}\nMnemonic: ${data.mnemonic}`;
    navigator.clipboard.writeText(copyText);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '1rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        fontFamily: 'monospace'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Wallet Created</h2>
        <p><strong>Address:</strong><br />{data.address}</p>
        <p><strong>Private Key:</strong><br />{data.private_key}</p>
        <p><strong>Mnemonic:</strong><br />{data.mnemonic}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
          <button
            onClick={handleCopy}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Copy Info
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#eaeaea',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
