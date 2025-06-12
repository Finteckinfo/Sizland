'use client'

import { useState } from 'react'
import { useWallet, WalletId } from '@txnlab/use-wallet-react'
import { Button } from './button'
import { Button1 } from './button1'
import Image from 'next/image'

export const ConnectWalletButton = () => {
  const { wallets, activeAccount, activeWallet, isReady } = useWallet()
  const [isOpen, setIsOpen] = useState(false)

  const connectWallet = async (id: WalletId) => {
    const wallet = wallets.find(w => w.id === id)
    if (wallet) {
      await wallet.connect()
      setIsOpen(false)
    }
  }

  const handleDisconnect = async () => {
    if (activeWallet) {
      await activeWallet.disconnect()
    }
  }

  const shortenAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`

  if (!isReady) {
    return <Button disabled>Loading...</Button>
  }

  return (
    <div className="relative inline-block text-left">
      {!activeAccount ? (
        <>
          <Button1 onClick={() => setIsOpen(!isOpen)} className="rounded-xl">
            Connect Wallet
          </Button1>

          {isOpen && (
            <div className="absolute mt-2 w-48 origin-top-right rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 bg-white dark:bg-zinc-900 border dark:border-zinc-700">
              <div className="py-1">
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={() => connectWallet(WalletId.PERA)}
                >
                  Connect Pera
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={() => connectWallet(WalletId.DEFLY)}
                >
                  Connect Defly
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={() => connectWallet(WalletId.WALLETCONNECT)}
                >
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
  )
}
