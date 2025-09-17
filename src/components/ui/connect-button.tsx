'use client'

import { useEffect, useRef, useState } from 'react'
import { useWallet, WalletId } from '@txnlab/use-wallet-react'
import { Button } from './button'
import { Button1 } from './button1'
import Image from 'next/image'
import { Toast } from './Toast'
import { generateAlgorandWallet, storeWallet } from '@/lib/algorand/walletGenerator'
import { useAuth } from '@clerk/nextjs'
 
import { useRouter } from 'next/router'

export const ConnectWalletButton = () => {
  const { wallets, activeAccount, activeWallet, isReady } = useWallet()
  const router = useRouter()
  const { userId } = useAuth()

  const [isOpen, setIsOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const postWalletToExternalDB = async (walletAddress: string) => {
    console.log('🔍 [Wallet] Starting postWalletToExternalDB with:', {
      walletAddress,
      userId: userId ? `${userId.substring(0, 8)}...` : 'undefined'
    })

    if (!userId) {
      console.log('⚠️ [Wallet] No userId available, skipping external DB post')
      return
    }

    try {
      const requestBody = {
        userId,
        walletAddress
      }
      
      console.log('🔍 [Wallet] Making API call to /api/user/wallet with body:', {
        userId: `${userId.substring(0, 8)}...`,
        walletAddress
      })

      const response = await fetch('/api/user/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('🔍 [Wallet] API response status:', response.status)
      console.log('🔍 [Wallet] API response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.log('❌ [Wallet] API error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ [Wallet] API success response:', data)
      console.log('✅ [Wallet] Wallet address posted to external database successfully')
    } catch (error) {
      console.error('❌ [Wallet] Error posting wallet to external database:', {
        message: error.message,
        stack: error.stack,
        userId: userId ? `${userId.substring(0, 8)}...` : 'undefined',
        walletAddress
      })
    }
  }

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
          
          // Post wallet address to external database after successful connection
          if (wallet.address) {
            console.log('🔍 [Wallet] Generated wallet connected, posting address to external DB:', wallet.address)
            await postWalletToExternalDB(wallet.address)
          } else {
            console.log('⚠️ [Wallet] Generated wallet connected but no address available')
          }
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
      
      // Post wallet address to external database after successful connection
      if (activeAccount?.address) {
        console.log('🔍 [Wallet] Wallet connected, posting address to external DB:', activeAccount.address)
        await postWalletToExternalDB(activeAccount.address)
      } else {
        console.log('⚠️ [Wallet] Wallet connected but no active account address available')
      }
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
                  minWidth: '280px',
                  maxWidth: '320px',
                  padding: '1rem',
                  minHeight: '320px',
                }}
              >
                <ul className="list">
                  <li className="element" style={{ marginBottom: '0.5rem' }}>
                    <button onClick={() => connectWallet(WalletId.PERA)} className="element" style={{ 
                      width: '100%', 
                      padding: '0.5rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      backgroundColor: '#f9fafb',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }} onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }} onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      <Image src="/pera.svg" alt="Pera Wallet" width={16} height={16} />
                      <p className="label" style={{ margin: 0, fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Connect Pera</p>
                    </button>
                  </li>
                  <li className="element" style={{ marginBottom: '0.5rem' }}>
                    <button onClick={() => connectWallet(WalletId.DEFLY)} className="element" style={{ 
                      width: '100%', 
                      padding: '0.5rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      backgroundColor: '#f9fafb',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }} onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }} onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      <Image src="/defly.png" alt="Defly Wallet" width={16} height={16} />
                      <p className="label" style={{ margin: 0, fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Connect Defly</p>
                    </button>
                  </li>
                  <li className="element" style={{ marginBottom: '0.5rem' }}>
                    <button onClick={() => connectWallet(WalletId.LUTE)} className="element" style={{ 
                      width: '100%', 
                      padding: '0.5rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      backgroundColor: '#f9fafb',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }} onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }} onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      <Image src="/lute.png" alt="Lute Wallet" width={16} height={16} />
                      <p className="label" style={{ margin: 0, fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Connect Lute</p>
                    </button>
                  </li>
                  <li className="element" style={{ marginBottom: '0.5rem' }}>
                    <button onClick={() => connectWallet(WalletId.WALLETCONNECT)} className="element" style={{ 
                      width: '100%', 
                      padding: '0.5rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      backgroundColor: '#f9fafb',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }} onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }} onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      <Image src="/walletconnect.png" alt="WalletConnect" width={16} height={16} />
                      <p className="label" style={{ margin: 0, fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>WalletConnect</p>
                    </button>
                  </li>
                  <div className="line" style={{ margin: '0.75rem 0' }}></div>
                </ul>
                <div style={{ 
                  padding: '0.75rem 0.5rem 0.5rem', 
                  fontSize: '0.875rem', 
                  color: '#666',
                  textAlign: 'center',
                  borderTop: '1px solid #e5e7eb',
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem'
                }}>
                  Don't have a wallet?{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowCreate(true)
                    }}
                    style={{ 
                      color: '#0070f3', 
                      textDecoration: 'underline', 
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Create
                  </a>
                </div>
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
