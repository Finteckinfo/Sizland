import { WalletManager, NetworkId, WalletId } from '@txnlab/use-wallet'

const wallets = [
  { id: WalletId.PERA },
  { id: WalletId.DEFLY },
  { id: WalletId.LUTE as WalletId.LUTE,
    options: {
        siteName: 'Sizland'  // Required
      },
   },
  {
    id: WalletId.WALLETCONNECT as WalletId.WALLETCONNECT,
    options: {
      projectId: '73c1e95ad151f47ceaf415c997c218f5',
      requiredNamespaces: {
        algorand: {
          methods: ['algo_signTxn', 'algo_signMsg'],
          chains: ['algorand:416001'], // ✅ CAIP-2 format
          events: ['chainChanged', 'accountsChanged'],
        },
      },
      metadata: {
        name: 'SiZLand',
        description: 'Learn, Earn, Invest, Grow.',
        url: 'https://siz.land',
        icons: ['https://www.siz.land/_next/image?url=%2Flogo1.png&w=96&q=75'],
      },
    }
  }
]

const networks = {
  [NetworkId.TESTNET]: {
    name: 'Testnet',
    algod: {
      baseServer: 'https://testnet-api.algonode.cloud',
      port: '',
      token: '',
    },
    indexer: {
      baseServer: 'https://testnet-idx.algonode.cloud',
      port: '',
      token: '',
    },
    chainId: '416001', // ✅ Required for WalletConnect to resolve CAIP
  },
  [NetworkId.MAINNET]: {
    name: 'MainNet',
    algod: {
      baseServer: 'https://mainnet-api.algonode.cloud',
      port: '',
      token: '',
    },
    indexer: {
      baseServer: 'https://mainnet-idx.algonode.cloud',
      port: '',
      token: '',
    },
    chainId: '4160', // Algorand mainnet CAIP ID
  }
}

export const manager = new WalletManager({
  wallets,
  networks,
  defaultNetwork: NetworkId.TESTNET,
})
