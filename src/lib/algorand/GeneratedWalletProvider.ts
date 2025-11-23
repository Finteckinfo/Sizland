import algosdk from 'algosdk'
import { CustomProvider, WalletAccount } from '@txnlab/use-wallet'

export class GeneratedWalletProvider implements CustomProvider {
  private account: WalletAccount | null = null
  private sk: Uint8Array | null = null

  constructor() {
    // Initialize without parameters - will load from localStorage when needed
  }

  private loadWalletFromStorage(): boolean {
    if (typeof window === 'undefined') return false
    
    const data = localStorage.getItem('generated-wallet')
    if (!data) return false

    try {
      const { address, privateKey } = JSON.parse(data)
      this.account = {
        name: 'Generated Wallet',
        address,
      }
      this.sk = new Uint8Array(Buffer.from(privateKey, 'base64'))
      return true
    } catch (err) {
      console.error('Failed to load generated wallet from storage:', err)
      return false
    }
  }

  async connect(): Promise<WalletAccount[]> {
    if (!this.loadWalletFromStorage()) {
      throw new Error('No generated wallet found in storage')
    }
    
    if (!this.account) {
      throw new Error('Failed to load wallet account')
    }

    return [this.account]
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem('generated-wallet')
    this.account = null
    this.sk = null
  }

  async resumeSession(): Promise<WalletAccount[] | void> {
    if (this.loadWalletFromStorage() && this.account) {
      return [this.account]
    }
    return
  }

  async signTransactions(
    txnGroup:
      | algosdk.Transaction[]
      | Uint8Array[]
      | (algosdk.Transaction[] | Uint8Array[])[],
    indexesToSign?: number[]
  ): Promise<(Uint8Array | null)[]> {
    if (!this.sk) {
      throw new Error('No private key available for signing')
    }

    const txns: algosdk.Transaction[] = []

    const flatten = (arr: any[]) =>
      arr.flatMap((tx) => (Array.isArray(tx) ? tx : [tx]))
    const flatGroup = flatten(Array.isArray(txnGroup) ? txnGroup : [txnGroup])

    for (const txn of flatGroup) {
      if (txn instanceof Uint8Array) {
        txns.push(algosdk.decodeUnsignedTransaction(txn))
      } else {
        txns.push(txn)
      }
    }

    const toSign = indexesToSign ?? txns.map((_, i) => i)
    return txns.map((txn, i) =>
      toSign.includes(i) ? algosdk.signTransaction(txn, this.sk!).blob : null
    )
  }
}
