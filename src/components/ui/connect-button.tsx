'use client'

import { useEffect, useRef, useState } from 'react'
import { useWallet, WalletId } from '@txnlab/use-wallet-react'
import { Button } from './button'
import { Button1 } from './button1'
import Image from 'next/image'
import { Toast } from './Toast'
import { generateWallet } from '@/pages/api/generateWallet'
import { WalletPopup } from './wallet'
import { GeneratedWalletProvider } from '@/lib/algorand/GeneratedWalletProvider'

export const ConnectWalletButton = () => {
  const { wallets, activeAccount, activeWallet, isReady } = useWallet()

  const [isOpen, setIsOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [generatedWallet, setGeneratedWallet] = useState<null | {
    address: string
    private_key: string
    mnemonic: string
  }>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleGenerateWallet = async () => {
    try {
      const wallet = await generateWallet()
      setGeneratedWallet(wallet)

      // Store it in localStorage so `resumeSession()` works
      localStorage.setItem(
        'generated-wallet',
        JSON.stringify({ address: wallet.address, privateKey: wallet.private_key })
      )

      // Now connect to the custom wallet without reloading
      const customWallet = wallets.find(w => w.id === WalletId.CUSTOM)
      if (!customWallet) {
        console.error('Custom wallet not registered in walletManager.')
        setToastMsg('Custom wallet not available.')
        return
      }

      await customWallet.connect()
      setIsOpen(false)
    } catch (err) {
      console.error('Wallet creation failed', err)
      setToastMsg('Wallet creation failed.')
      setTimeout(() => setToastMsg(''), 3000)
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
                      handleGenerateWallet()
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
      {generatedWallet && (
        <WalletPopup data={generatedWallet} onClose={() => setGeneratedWallet(null)} />
      )}
    </>
  )
}
