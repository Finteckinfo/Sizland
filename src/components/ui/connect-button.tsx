'use client'

import { useEffect, useRef, useState } from 'react'
import { useWallet, WalletId } from '@txnlab/use-wallet-react'
import { Button } from './button'
import { Button1 } from './button1'
import Image from 'next/image'
import { Toast } from './Toast'
import { generateAlgorandWallet, storeWallet } from '@/lib/algorand/walletGenerator'
 
import { useRouter } from 'next/router'

export const ConnectWalletButton = () => {
  const { wallets, activeAccount, activeWallet, isReady } = useWallet()
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleGenerateWallet = async () => {
    setIsGenerating(true)
    setError(null)
    setSuccess(null)

    try {
      // Generate wallet
      const wallet = generateAlgorandWallet()

      // Store wallet in localStorage
      storeWallet(wallet)

      setSuccess('Wallet generated successfully!')

      // Auto-connect the generated wallet with proper error handling
      try {
        const customWallet = wallets.find(w => w.id === WalletId.CUSTOM)
        if (customWallet) {
          console.log('🔍 Debug - Found custom wallet, attempting to connect...')
          await customWallet.connect()
          console.log('🔍 Debug - Custom wallet connected successfully!')
        } else {
          console.error('🔍 Debug - Custom wallet not found in wallets list')
        }
      } catch (connectError) {
        console.error('🔍 Debug - Failed to auto-connect wallet:', connectError)
        // Don't throw error here as wallet was still generated successfully
        // The user can manually connect later
      }

      setIsOpen(false)
      setShowCreate(false)
      
      // Notify navbar that a wallet has been generated
      window.dispatchEvent(new CustomEvent('walletGenerated'));
      
      // Redirect to the new wallet page
      router.push('/new-wallet')
    } catch (err) {
      console.error('Wallet generation failed:', err)
      setError('Failed to generate wallet. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const connectWallet = async (id: WalletId) => {
    const wallet = wallets.find(w => w.id === id)
    if (!wallet) return

    try {
      await wallet.connect()
      setIsOpen(false)
    } catch (err: any) {
      console.error('Wallet connect error:', err)

      const canceled =
        err?.data?.type === 'CONNECT_MODAL_CLOSED' ||
        err?.message?.includes('cancelled') ||
        err?.message === 'Operation Cancelled'

      setToastMsg(
        canceled
          ? 'Wallet connection was cancelled.'
          : 'Failed to connect wallet. Try again.'
      )

      setTimeout(() => setToastMsg(''), 3000)
    }
  }

  const handleDisconnect = async () => {
    if (activeWallet) {
      await activeWallet.disconnect()
    }
  }

  const shortenAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isReady) {
    return <Button disabled>Loading...</Button>
  }

  return (
    <>
      <div className="wallet-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
        {!activeAccount ? (
          <>
            <Button1 onClick={() => setIsOpen(!isOpen)}>Connect Wallet</Button1>

            {isOpen && (
              <div
                className="card"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  zIndex: 1000,
                  marginTop: '0.5rem',
                  background: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  borderRadius: '0.5rem',
                  minWidth: '200px',
                }}
              >
                <ul className="list">
                  <li className="element">
                    <button onClick={() => connectWallet(WalletId.PERA)} className="element">
                      <Image src="/pera.svg" alt="Pera Wallet" width={20} height={20} />
                      <p className="label">Connect Pera</p>
                    </button>
                  </li>
                  <li className="element">
                    <button onClick={() => connectWallet(WalletId.DEFLY)} className="element">
                      <Image src="/defly.png" alt="Defly Wallet" width={20} height={20} />
                      <p className="label">Connect Defly</p>
                    </button>
                  </li>
                  <li className="element">
                    <button onClick={() => connectWallet(WalletId.LUTE)} className="element">
                      <Image src="/lute.png" alt="Lute Wallet" width={20} height={20} />
                      <p className="label">Connect Lute</p>
                    </button>
                  </li>
                  <li className="element">
                    <button onClick={() => connectWallet(WalletId.WALLETCONNECT)} className="element">
                      <Image src="/walletconnect.png" alt="WalletConnect" width={20} height={20} />
                      <p className="label">WalletConnect</p>
                    </button>
                  </li>
                  <div className="line" style={{ margin: '0.5rem 0' }}></div>
                </ul>
                <p style={{ padding: '0 1rem 1rem', fontSize: '0.875rem', color: '#666' }}>
                  Don’t have a wallet?{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowCreate(true)
                    }}
                    style={{ color: '#0070f3', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Create
                  </a>
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="wallet-button-group" style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outline"
              onClick={() =>
                alert(`Connected to ${activeWallet?.metadata?.name || activeWallet?.id}`)
              }
            >
              <div
                style={{
                  background: 'black',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  marginRight: 8,
                }}
              >
                <Image alt="Algorand icon" src="/algorand-logo.svg" width={12} height={12} />
              </div>
              {activeWallet?.metadata?.name || 'Algorand'}
            </Button>

            <Button
              variant="outline"
              onClick={handleDisconnect}
              style={{
                background: 'linear-gradient(135deg, #1d1d1d, #444)',
                color: 'white',
                borderRadius: 12,
                fontWeight: 400,
              }}
            >
              {shortenAddress(activeAccount.address)}
            </Button>
          </div>
        )}
      </div>

      {toastMsg && <Toast message={toastMsg} />}
      
      {/* Create Wallet Modal */}
      {showCreate && (
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
              maxWidth: '500px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            }}
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#111', textAlign: 'center' }}>
              🎉 Create Your Sizland Wallet
            </h2>
            
            <p style={{ marginBottom: '1.5rem', color: '#666', textAlign: 'center' }}>
              Your wallet will be generated locally in your browser. Nothing is sent to a server.
            </p>

            {error && (
              <div style={{ 
                padding: '0.75rem', 
                backgroundColor: '#fee2e2', 
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                color: '#dc2626'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ 
                padding: '0.75rem', 
                backgroundColor: '#dcfce7', 
                border: '1px solid #bbf7d0',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                color: '#166534'
              }}>
                {success}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <button
                onClick={() => {
                  setShowCreate(false)
                  setError(null)
                  setSuccess(null)
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  flex: 1,
                }}
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateWallet}
                disabled={isGenerating}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: isGenerating ? '#ccc' : '#0070f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  flex: 1,
                }}
              >
                {isGenerating ? 'Generating...' : 'Generate Wallet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
