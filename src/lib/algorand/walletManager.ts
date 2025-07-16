import {
  WalletManager,
  NetworkId,
  WalletId,
  type SupportedWallet,
  type WalletConnectOptions,
} from '@txnlab/use-wallet'
import { GeneratedWalletProvider } from './GeneratedWalletProvider'

// Only access localStorage on client-side
const localGeneratedWallet =
  typeof window !== 'undefined' ? localStorage.getItem('generated-wallet') : null

const customGeneratedWallet: SupportedWallet[] = localGeneratedWallet
  ? [
      {
        id: WalletId.CUSTOM,
        options: {
          provider: new GeneratedWalletProvider(JSON.parse(localGeneratedWallet)),
        },
        metadata: {
          name: 'Generated Wallet',
          icon: '/algorand-logo.svg',
        },
      },
    ]
  : []

const wallets: SupportedWallet[] = [
  { id: WalletId.PERA },
  { id: WalletId.DEFLY },
  {
    id: WalletId.LUTE,
    options: {
      siteName: 'Sizland',
    },
  },
  {
    id: WalletId.WALLETCONNECT,
    options: {
      projectId: '73c1e95ad151f47ceaf415c997c218f5',
      metadata: {
        name: 'SiZLand',
        description: 'Learn, Earn, Invest, Grow.',
        url: 'https://siz.land',
        icons: [
          'https://www.siz.land/_next/image?url=%2Flogo1.png&w=96&q=75',
        ],
      },
    } satisfies WalletConnectOptions,
  },
  ...customGeneratedWallet,
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
    chainId: '416001',
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
    chainId: '4160',
  },
}

export const manager = new WalletManager({
  wallets,
  networks,
  defaultNetwork: NetworkId.TESTNET,
})
