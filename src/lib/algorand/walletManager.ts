// src/lib/algorand/walletManager.ts
import { WalletManager, NetworkId, WalletId } from '@txnlab/use-wallet'

const wallets = [
  { id: WalletId.PERA },
  { id: WalletId.DEFLY },
  {
    id: WalletId.WALLETCONNECT as WalletId.WALLETCONNECT,
    options: {
      projectId: 'your_project_id_from_reown_cloud',
    },
    metadata: {
      name: 'Your DApp Name',
      description: 'Your dApp Description',
      url: 'https://your-dapp.com',
      icons: ['https://your-dapp.com/icon.png']
    }
  }
]

const networks = {
  [NetworkId.TESTNET]: {
    name: 'Testnet',
    algod: {
      baseServer: 'https://testnet-api.algonode.cloud',
      port: '',
      token: ''
    },
    indexer: {
      baseServer: 'https://testnet-idx.algonode.cloud',
      port: '',
      token: ''
    }
  },
  [NetworkId.MAINNET]: {
    name: 'MainNet',
    algod: {
      baseServer: 'https://mainnet-api.algonode.cloud',
      port: '',
      token: ''
    },
    indexer: {
      baseServer: 'https://mainnet-idx.algonode.cloud',
      port: '',
      token: ''
    }
  }
}

export const manager = new WalletManager({
  wallets,
  networks,
  defaultNetwork: NetworkId.TESTNET
})
