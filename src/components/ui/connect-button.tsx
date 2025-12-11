'use client'

import { useEffect, useRef, useState } from 'react'
import { useWallet, WalletId } from '@txnlab/use-wallet-react'
import { Button } from './button'
import { Button1 } from './button1'
import Image from 'next/image'
import { Toast } from './Toast'
import { generateAlgorandWallet, recoverAlgorandWallet, storeWallet } from '@/lib/algorand/walletGenerator'
import { useSession } from 'next-auth/react'
import { Copy, LogOut, ChevronDown, X } from 'lucide-react'
import algosdk from 'algosdk'
 
import { useRouter } from 'next/router'

export const ConnectWalletButton = () => {
  const { wallets, activeAccount, activeWallet, isReady } = useWallet()
  const router = useRouter()
  const { data: session } = useSession()

  const [isOpen, setIsOpen] = useState(false)
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showSizConnect, setShowSizConnect] = useState(false)
  const [recoverMode, setRecoverMode] = useState(false)
  const [manualAddress, setManualAddress] = useState('')
  const [manualPrivateKey, setManualPrivateKey] = useState('')
  const [mnemonicInput, setMnemonicInput] = useState('')
  const [manualError, setManualError] = useState<string | null>(null)
  const [manualLoading, setManualLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const walletDropdownRef = useRef<HTMLDivElement>(null)

  const postWalletToExternalDB = async (walletAddress: string) => {
    console.log('🔍 [Wallet] Starting postWalletToExternalDB with:', {
      walletAddress,
      userId: session?.user?.id ? `${session.user.id.substring(0, 8)}...` : 'undefined'
    })

    if (!session?.user?.id) {
      console.log('⚠️ [Wallet] No user available, skipping external DB post')
      return
    }

    try {
      const requestBody = {
        userId: session.user.id,
        walletAddress
      }
      
      console.log('🔍 [Wallet] Making API call to /api/user/wallet with body:', {
        userId: `${session.user.id.substring(0, 8)}...`,
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
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: session?.user?.id ? `${session.user.id.substring(0, 8)}...` : 'undefined',
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
    setIsWalletDropdownOpen(false)
  }

  const handleCopyAddress = async () => {
    if (activeAccount?.address) {
      try {
        await navigator.clipboard.writeText(activeAccount.address)
        setCopied(true)
        setToastMsg('Address copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
        setTimeout(() => setToastMsg(''), 3000)
        setIsWalletDropdownOpen(false)
      } catch (err) {
        console.error('Failed to copy address:', err)
        setToastMsg('Failed to copy address')
        setTimeout(() => setToastMsg(''), 3000)
      }
    }
  }

  const shortenAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
      if (walletDropdownRef.current && !walletDropdownRef.current.contains(event.target as Node)) {
        setIsWalletDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const closeSizConnect = () => {
    setShowSizConnect(false)
    setRecoverMode(false)
    setManualAddress('')
    setManualPrivateKey('')
    setMnemonicInput('')
    setManualError(null)
  }

  const handleManualConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setManualError(null)
    setManualLoading(true)
    try {
      const trimmedPk = manualPrivateKey.trim()
      const trimmedAddress = manualAddress.trim()

      if (!trimmedPk) {
        throw new Error('Private key is required')
      }

      // Convert base64 private key to mnemonic + derive address
      const skBytes = new Uint8Array(Buffer.from(trimmedPk, 'base64'))
      const mnemonic = algosdk.secretKeyToMnemonic(skBytes)
      const { addr } = algosdk.mnemonicToSecretKey(mnemonic)
      const derivedAddress = typeof addr === 'string' ? addr : addr.toString()
      const finalAddress = trimmedAddress || derivedAddress

      if (!finalAddress) {
        throw new Error('Could not derive address from private key')
      }

      storeWallet({
        address: finalAddress,
        privateKey: trimmedPk,
        mnemonic
      })

      await connectWallet(WalletId.CUSTOM)
      setShowSizConnect(false)
      setToastMsg('Wallet connected')
      setTimeout(() => setToastMsg(''), 3000)
    } catch (err: any) {
      console.error('Manual connect error:', err)
      setManualError(err?.message || 'Failed to connect wallet. Check your inputs.')
    } finally {
      setManualLoading(false)
    }
  }

  const handleMnemonicRecover = async (e: React.FormEvent) => {
    e.preventDefault()
    setManualError(null)
    setManualLoading(true)
    try {
      const wallet = recoverAlgorandWallet(mnemonicInput.trim())
      storeWallet(wallet)
      await connectWallet(WalletId.CUSTOM)
      setShowSizConnect(false)
      setRecoverMode(false)
      setToastMsg('Wallet recovered and connected')
      setTimeout(() => setToastMsg(''), 3000)
    } catch (err: any) {
      console.error('Mnemonic recover error:', err)
      setManualError(err?.message || 'Failed to recover wallet. Check your phrase.')
    } finally {
      setManualLoading(false)
    }
  }

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
                  minWidth: '260px',
                  maxWidth: 'calc(100vw - 24px)',
                  width: 'min(320px, 100vw - 24px)',
                  padding: '1rem',
                  minHeight: '320px',
                  boxSizing: 'border-box',
                  overflow: 'hidden'
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
                <li className="element" style={{ marginBottom: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      setShowSizConnect(true)
                    }}
                    className="element"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      backgroundColor: '#f0fdf4',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#dcfce7';
                      e.currentTarget.style.borderColor = '#bbf7d0';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0fdf4';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Image src="/logo1.png" alt="Siz Connect" width={18} height={18} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#064e3b', fontSize: '0.95rem' }}>Siz Connect</p>
                      <span style={{ margin: 0, color: '#0f172a', fontSize: '0.78rem' }}>Reconnect with address & key</span>
                    </div>
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
                  Don&apos;t have a wallet?{' '}
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
          <div className="wallet-dropdown-container" ref={walletDropdownRef} style={{ position: 'relative' }}>
            <Button
              variant="outline"
              onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #1d1d1d, #444)',
                color: 'white',
                borderRadius: 12,
                fontWeight: 400,
                border: '1px solid #374151',
                minWidth: '200px',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    background: 'black',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    overflow: 'hidden',
                  }}
                >
                  <Image alt="Algorand icon" src="/algorand-logo.svg" width={12} height={12} />
                </div>
                <span>{shortenAddress(activeAccount.address)}</span>
              </div>
              <ChevronDown 
                size={16} 
                style={{ 
                  transform: isWalletDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </Button>

            {isWalletDropdownOpen && (
              <div
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
                  maxWidth: 'calc(100vw - 24px)',
                  width: 'min(240px, 100vw - 24px)',
                  padding: '0.5rem',
                  border: '1px solid #e5e7eb',
                  boxSizing: 'border-box',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <button
                    onClick={handleCopyAddress}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      border: 'none',
                      borderRadius: '0.375rem',
                      backgroundColor: 'transparent',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Copy size={16} />
                    <span>{copied ? 'Copied!' : 'Copy Address'}</span>
                  </button>
                  
                  <button
                    onClick={handleDisconnect}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      border: 'none',
                      borderRadius: '0.375rem',
                      backgroundColor: 'transparent',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#dc2626'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <LogOut size={16} />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {toastMsg && (
        <Toast 
          message={toastMsg} 
          type={toastMsg.includes('copied') ? 'success' : toastMsg.includes('Failed') ? 'error' : 'info'} 
        />
      )}
      
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

      {/* Siz Connect Modal */}
      {showSizConnect && (
        <div
          onClick={closeSizConnect}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              background: 'linear-gradient(180deg, #0f172a 0%, #0b1a14 100%)',
              color: 'white',
              borderRadius: '1rem',
              padding: '1.75rem',
              boxShadow: '0 20px 45px rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.06)',
              position: 'relative',
            }}
          >
            <button
              onClick={closeSizConnect}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: '0.85rem',
                right: '0.85rem',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '9999px',
                width: '34px',
                height: '34px',
                display: 'grid',
                placeItems: 'center',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: 38, height: 38, position: 'relative' }}>
                <Image src="/logo1.png" alt="Siz connect" fill style={{ objectFit: 'contain' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Siz Connect</h3>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.95rem' }}>
                  Reconnect your Sizland wallet with your keys
                </p>
              </div>
            </div>

            {!recoverMode ? (
              <form onSubmit={handleManualConnect} className="space-y-4">
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', color: '#e2e8f0', fontWeight: 600 }}>
                    Wallet address
                  </label>
                  <input
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="Optional: auto-derived from key"
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.04)',
                      color: 'white',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', color: '#e2e8f0', fontWeight: 600 }}>
                    Private key (base64)
                  </label>
                  <textarea
                    value={manualPrivateKey}
                    onChange={(e) => setManualPrivateKey(e.target.value)}
                    placeholder="Paste your base64 private key"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.04)',
                      color: 'white',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Forgot private key?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setRecoverMode(true)
                        setManualError(null)
                      }}
                      style={{ color: '#34d399', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Reset with mnemonic
                    </button>
                  </div>
                </div>

                {manualError && (
                  <div style={{
                    padding: '0.75rem 0.85rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(248,113,113,0.12)',
                    border: '1px solid rgba(248,113,113,0.4)',
                    color: '#fecdd3'
                  }}>
                    {manualError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={manualLoading}
                  className="w-full"
                  style={{
                    width: '100%',
                    padding: '0.95rem 1rem',
                    borderRadius: '999px',
                    border: 'none',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem',
                    background:
                      "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.32), transparent 42%), linear-gradient(90deg, #34d399 0%, #10b981 60%, #0ea970 100%)",
                    cursor: manualLoading ? 'not-allowed' : 'pointer',
                    opacity: manualLoading ? 0.8 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)'
                  }}
                >
                  {manualLoading && (
                    <div className="h-5 w-5 animate-spin border-2 border-gray-200 border-t-emerald-400 rounded-full" />
                  )}
                  Connect wallet
                </button>
              </form>
            ) : (
              <form onSubmit={handleMnemonicRecover} className="space-y-4">
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', color: '#e2e8f0', fontWeight: 600 }}>
                    Recovery phrase (25-word mnemonic)
                  </label>
                  <textarea
                    value={mnemonicInput}
                    onChange={(e) => setMnemonicInput(e.target.value)}
                    placeholder="enter your mnemonic phrase in order"
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.04)',
                      color: 'white',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setRecoverMode(false)
                        setManualError(null)
                      }}
                      style={{ color: '#34d399', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Back to private key
                    </button>
                  </div>
                </div>

                {manualError && (
                  <div style={{
                    padding: '0.75rem 0.85rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(248,113,113,0.12)',
                    border: '1px solid rgba(248,113,113,0.4)',
                    color: '#fecdd3'
                  }}>
                    {manualError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={manualLoading}
                  className="w-full"
                  style={{
                    width: '100%',
                    padding: '0.95rem 1rem',
                    borderRadius: '999px',
                    border: 'none',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem',
                    background:
                      "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.32), transparent 42%), linear-gradient(90deg, #34d399 0%, #10b981 60%, #0ea970 100%)",
                    cursor: manualLoading ? 'not-allowed' : 'pointer',
                    opacity: manualLoading ? 0.8 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)'
                  }}
                >
                  {manualLoading && (
                    <div className="h-5 w-5 animate-spin border-2 border-gray-200 border-t-emerald-400 rounded-full" />
                  )}
                  Recover & connect
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
