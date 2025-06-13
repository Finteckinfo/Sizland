'use client'

import { useEffect, useRef, useState } from 'react'
import { useWallet, WalletId } from '@txnlab/use-wallet-react'
import { Button } from './button'
import { Button1 } from './button1'
import Image from 'next/image'
import { Toast } from './Toast'

export const ConnectWalletButton = () => {
  const { wallets, activeAccount, activeWallet, isReady } = useWallet()
  const [isOpen, setIsOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

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
      <div className="relative inline-block text-left" ref={dropdownRef}>
        {!activeAccount ? (
          <>
            <Button1 onClick={() => setIsOpen(!isOpen)} className="rounded-xl">
              Connect Wallet
            </Button1>

            {isOpen && (
              <div className="absolute mt-2 w-56 origin-top-right rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 bg-white dark:bg-zinc-900 border dark:border-zinc-700">
                <div className="py-1">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => connectWallet(WalletId.PERA)}
                  >
                    <Image src="/pera.svg" alt="Pera Wallet" width={20} height={20} />
                    Connect Pera
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => connectWallet(WalletId.DEFLY)}
                  >
                    <Image src="/defly.png" alt="Defly Wallet" width={20} height={20} />
                    Connect Defly
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => connectWallet(WalletId.LUTE)}
                  >
                    <Image src="/lute.png" alt="Lute Wallet" width={20} height={20} />
                    Connect Lute
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => connectWallet(WalletId.WALLETCONNECT)}
                  >
                    <Image src="/walletconnect.png" alt="WalletConnect" width={20} height={20} />
                    WalletConnect
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex gap-2 max-md:flex-col-reverse md:justify-center md:items-center">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() =>
                alert(`Connected to ${activeWallet?.metadata?.name || activeWallet?.id}`)
              }
            >
              <div className="bg-black w-3 h-3 rounded-full overflow-hidden mr-2">
                <Image alt="Algorand icon" src="/algorand-logo.svg" width={12} height={12} />
              </div>
              {activeWallet?.metadata?.name || 'Algorand'}
            </Button>

            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="bg-gradient rounded-xl font-normal hover:opacity-90 text-gray-100 dark:text-foreground"
            >
              {shortenAddress(activeAccount.address)}
            </Button>
          </div>
        )}
      </div>

      {toastMsg && <Toast message={toastMsg} />}
    </>
  )
}
