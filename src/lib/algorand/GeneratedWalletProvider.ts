import algosdk from 'algosdk'
import { CustomProvider, WalletAccount } from '@txnlab/use-wallet'

export class GeneratedWalletProvider implements CustomProvider {
  private account: WalletAccount
  private sk: Uint8Array

  constructor({ address, privateKey }: { address: string; privateKey: string }) {
    this.account = {
      name: 'Generated Wallet',
      address,
    }

    this.sk = new Uint8Array(Buffer.from(privateKey, 'base64'))
    localStorage.setItem('generated-wallet', JSON.stringify({ address, privateKey }))
  }

  async connect(): Promise<WalletAccount[]> {
    return [this.account]
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem('generated-wallet')
  }

  async resumeSession(): Promise<WalletAccount[] | void> {
    const cached = localStorage.getItem('generated-wallet')
    if (cached) {
      const { address, privateKey } = JSON.parse(cached)
      this.account = { name: 'Generated Wallet', address }
      this.sk = new Uint8Array(Buffer.from(privateKey, 'base64'))
      return [this.account]
    }
  }

  async signTransactions(
  txnGroup: algosdk.Transaction[] | Uint8Array[] | (algosdk.Transaction[] | Uint8Array[])[],
  indexesToSign?: number[]
): Promise<(Uint8Array | null)[]> {
  const txns: algosdk.Transaction[] = []

  const flatten = (arr: any[]) => arr.flatMap(tx => Array.isArray(tx) ? tx : [tx])
  const flatGroup = flatten(Array.isArray(txnGroup) ? txnGroup : [txnGroup])

  for (const txn of flatGroup) {
    if (txn instanceof Uint8Array) {
      txns.push(algosdk.decodeUnsignedTransaction(txn))
    } else {
      txns.push(txn)
    }
  }

  const toSign = indexesToSign ?? txns.map((_, i) => i)
  return txns.map((txn, i) => toSign.includes(i) ? algosdk.signTransaction(txn, this.sk).blob : null)
}

}
