'use client'

import { useState } from 'react'
import { useWallet, WalletId } from '@txnlab/use-wallet-react'
import { MetaMaskSignIn } from '@/components/auth/metamask-signin'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { generateAlgorandWallet, storeWallet, clearWallet, type GeneratedWallet } from '@/lib/algorand/walletGenerator'
import { Copy, CheckCircle, Download, Trash2, Shield } from 'lucide-react'

export default function WalletAuth() {
  const router = useRouter()
  const { wallets, isReady } = useWallet()
  
  const [selectedOption, setSelectedOption] = useState<'create' | 'algorand' | 'metamask' | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [generatedWallet, setGeneratedWallet] = useState<GeneratedWallet | null>(null)
  const [showSensitive, setShowSensitive] = useState(false)
  const [validationOpen, setValidationOpen] = useState(false)
  const [wordInputs, setWordInputs] = useState<string[]>(['', '', ''])
  const [validationError, setValidationError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const handleSuccess = () => {
    router.push('/lobby')
  }

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownloadCredentials = () => {
    if (!generatedWallet) return

    const credentials = `Sizland Wallet Credentials

Address: ${generatedWallet.address}
Private Key (Base64): ${generatedWallet.privateKey}
Mnemonic (25 words): ${generatedWallet.mnemonic}

IMPORTANT: Keep these credentials secure and never share them with anyone.
You can use the mnemonic to recover your wallet if needed.

Generated on: ${new Date().toLocaleString()}
`

    const blob = new Blob([credentials], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sizland-wallet-credentials.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClearWallet = () => {
    if (confirm('Are you sure you want to clear this wallet? This action cannot be undone and you will lose access if you haven\'t saved your credentials.')) {
      clearWallet()
      setGeneratedWallet(null)
      setShowSensitive(false)
      window.dispatchEvent(new CustomEvent('walletCleared'))
      setSuccess('Wallet cleared successfully. You can generate a new one.')
    }
  }

  const handleValidateReveal = () => {
    if (!generatedWallet) return
    const target = generatedWallet.mnemonic
      .split(' ')
      .map(w => w.trim().toLowerCase())
      .filter(Boolean)
    const entered = wordInputs
      .map(w => w.trim().toLowerCase())
      .filter(Boolean)
    const uniqueEntered = Array.from(new Set(entered))
    const matches = uniqueEntered.filter(w => target.includes(w)).length
    if (matches >= 3) {
      setShowSensitive(true)
      setValidationError(null)
      setValidationOpen(false)
      setWordInputs(['', '', ''])
    } else {
      setValidationError('Please enter at least 3 correct words from your recovery phrase.')
    }
  }

  const handleGenerateWallet = async () => {
    setIsGenerating(true)
    setError(null)
    setSuccess(null)

    try {
      console.log('🚀 [Create Wallet] Starting wallet generation...')
      
      // Generate wallet
      const wallet = generateAlgorandWallet()
      console.log('✅ [Create Wallet] Wallet generated successfully:', wallet.address)
      
      // Store wallet locally
      storeWallet(wallet)
      console.log('✅ [Create Wallet] Wallet stored locally')

      // Auto-connect the generated wallet
      try {
        const customWallet = wallets.find(w => w.id === WalletId.CUSTOM)
        if (customWallet) {
          await customWallet.connect()
          console.log('✅ [Create Wallet] Auto-connected to custom wallet')
        }
      } catch (connectError) {
        console.error('Failed to auto-connect wallet:', connectError)
      }
      
      // Create NextAuth session using the wallet provider
      try {
        const result = await signIn('wallet', {
          redirect: false,
          walletAddress: wallet.address,
        })

        if (result?.ok) {
          console.log('✅ [Create Wallet] NextAuth session created')
          
          // Notify that a wallet has been generated
          window.dispatchEvent(new CustomEvent('walletGenerated'))
          console.log('✅ [Create Wallet] Dispatched walletGenerated event')
          
          setSuccess('Wallet created successfully! Redirecting to your Sizland dashboard...')
          
          // NextAuth redirect callback will handle sending to /lobby
          setTimeout(() => {
            router.push('/lobby')
          }, 1500)
        } else {
          console.error('Failed to create NextAuth session:', result?.error)
          setError('Failed to create session. Please try again.')
        }
      } catch (authError) {
        console.error('Error creating NextAuth session:', authError)
        setError('Failed to authenticate. Please try again.')
      }
      
    } catch (err) {
      console.error('Wallet generation failed:', err)
      setError('Failed to generate wallet. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const connectAlgorandWallet = async (id: WalletId) => {
    const wallet = wallets.find(w => w.id === id)
    if (!wallet) return

    try {
      await wallet.connect()
      
      // Get the connected wallet address
      const accounts = wallet.accounts
      if (!accounts || accounts.length === 0) {
        setError('No accounts found in wallet')
        return
      }
      
      const walletAddress = accounts[0].address
      console.log('✅ [Algorand Wallet] Connected:', walletAddress)
      
      // Create NextAuth session using the wallet provider
      try {
        const result = await signIn('wallet', {
          redirect: false,
          walletAddress: walletAddress,
        })

        if (result?.ok) {
          console.log('✅ [Algorand Wallet] NextAuth session created')
          router.push('/lobby')
        } else {
          console.error('Failed to create NextAuth session:', result?.error)
          setError('Failed to create session. Please try again.')
        }
      } catch (authError) {
        console.error('Error creating NextAuth session:', authError)
        setError('Failed to authenticate. Please try again.')
      }
    } catch (err: any) {
      console.error('Wallet connect error:', err)
      const canceled = err?.data?.type === 'CONNECT_MODAL_CLOSED' || 
                      err?.message?.includes('cancelled') ||
                      err?.message === 'Operation Cancelled'
      
      setError(canceled ? 'Wallet connection was cancelled.' : 'Failed to connect wallet. Try again.')
    }
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading wallets...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20">
              <Image
                src="/images/sizlogo.png"
                alt="SIZ Logo"
                width={80}
                height={80}
                className="object-contain drop-shadow-lg"
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Web3 Authentication
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Choose your preferred authentication method
          </p>
        </div>

        {!selectedOption ? (
          /* Wallet Selection Screen */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Create SIZ Wallet - PRIMARY/RECOMMENDED */}
            <button
              onClick={() => setSelectedOption('create')}
              className="relative bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl shadow-xl p-8 transition-all duration-200 hover:scale-105 hover:shadow-2xl"
            >
              <div className="absolute top-4 right-4 bg-yellow-400 text-green-900 text-xs font-bold px-3 py-1 rounded-full">
                RECOMMENDED
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">🎉</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Create SIZ Wallet</h3>
                <p className="text-sm text-green-100">
                  Generate your own Sizland wallet instantly and securely
                </p>
              </div>
            </button>

            {/* 2. Algorand Wallets */}
            <button
              onClick={() => setSelectedOption('algorand')}
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl shadow-xl p-8 transition-all duration-200 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <Image src="/algorand-logo.svg" alt="Algorand" width={32} height={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Algorand Wallets
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect with Pera, Defly, Lute, or WalletConnect
                </p>
              </div>
            </button>

            {/* 3. MetaMask */}
            <button
              onClick={() => setSelectedOption('metamask')}
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl shadow-xl p-8 transition-all duration-200 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-orange-500"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">🦊</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">MetaMask</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect with your Ethereum wallet
                </p>
              </div>
            </button>
          </div>
        ) : selectedOption === 'create' ? (
          /* SIZ Wallet Creation Flow */
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <button
              onClick={() => setSelectedOption(null)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
            >
              ← Back to options
            </button>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">🎉</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Create Your SIZ Wallet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your wallet will be generated locally in your browser. Nothing is sent to a server.
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">What you'll receive:</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>✓ Unique Algorand wallet address</li>
                <li>✓ 25-word recovery phrase</li>
                <li>✓ Private key (keep it safe!)</li>
              </ul>
            </div>

            <button
              onClick={handleGenerateWallet}
              disabled={isGenerating}
              className={`w-full py-4 px-6 rounded-lg font-medium transition-all duration-200 ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isGenerating ? 'Generating Wallet...' : '🎉 Generate SIZ Wallet Now'}
            </button>
          </div>
        ) : selectedOption === 'algorand' ? (
          /* Algorand Wallets Selection */
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <button
              onClick={() => setSelectedOption(null)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
            >
              ← Back to options
            </button>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Image src="/algorand-logo.svg" alt="Algorand" width={40} height={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Connect Algorand Wallet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose your preferred Algorand wallet
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {/* Pera Wallet */}
              <button
                onClick={() => connectAlgorandWallet(WalletId.PERA)}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-blue-500"
              >
                <Image src="/pera.svg" alt="Pera Wallet" width={32} height={32} />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">Pera Wallet</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mobile & Web</p>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              {/* Defly Wallet */}
              <button
                onClick={() => connectAlgorandWallet(WalletId.DEFLY)}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-blue-500"
              >
                <Image src="/defly.png" alt="Defly Wallet" width={32} height={32} />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">Defly Wallet</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mobile & Desktop</p>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              {/* Lute Wallet */}
              <button
                onClick={() => connectAlgorandWallet(WalletId.LUTE)}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-blue-500"
              >
                <Image src="/lute.png" alt="Lute Wallet" width={32} height={32} />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">Lute Wallet</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Browser Extension</p>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              {/* WalletConnect */}
              <button
                onClick={() => connectAlgorandWallet(WalletId.WALLETCONNECT)}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-blue-500"
              >
                <Image src="/walletconnect.png" alt="WalletConnect" width={32} height={32} />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">WalletConnect</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Universal Protocol</p>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        ) : (
          /* MetaMask Sign In */
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <button
              onClick={() => setSelectedOption(null)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
            >
              ← Back to options
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sign In with MetaMask
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You&apos;ll be prompted to sign a message with your wallet. This proves you own the wallet without revealing your private key.
              </p>
            </div>

            <MetaMaskSignIn onSuccess={handleSuccess} />

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Don&apos;t have MetaMask?{' '}
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Install it here
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Info Cards - Only show on selection screen */}
        {!selectedOption && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Secure & Private</p>
                  <p className="text-blue-800 dark:text-blue-400">
                    We never store your private keys. Authentication happens entirely through cryptographic signatures.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="text-sm">
                  <p className="font-semibold text-green-900 dark:text-green-300 mb-1">Decentralized</p>
                  <p className="text-green-800 dark:text-green-400">
                    Your wallet, your identity. No central authority controls your access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
