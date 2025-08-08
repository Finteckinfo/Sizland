import {
  WalletManager,
  NetworkId,
  WalletId,
  type SupportedWallet,
  type WalletConnectOptions,
} from '@txnlab/use-wallet'
import { GeneratedWalletProvider } from './GeneratedWalletProvider'
import { ALGORAND_NETWORKS } from '@/lib/config'

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
  // Always include the GeneratedWalletProvider
  {
    id: WalletId.CUSTOM,
    options: {
      provider: new GeneratedWalletProvider(),
    },
    metadata: {
      name: 'Generated Wallet',
      icon: '/algorand-logo.svg',
    },
  },
]

const networks = {
  [NetworkId.TESTNET]: {
    name: ALGORAND_NETWORKS.testnet.name,
    algod: {
      baseServer: ALGORAND_NETWORKS.testnet.algodUrl,
      port: '',
      token: '',
    },
    indexer: {
      baseServer: ALGORAND_NETWORKS.testnet.indexerUrl,
      port: '',
      token: '',
    },
    chainId: ALGORAND_NETWORKS.testnet.chainId,
  },
  [NetworkId.MAINNET]: {
    name: ALGORAND_NETWORKS.mainnet.name,
    algod: {
      baseServer: ALGORAND_NETWORKS.mainnet.algodUrl,
      port: '',
      token: '',
    },
    indexer: {
      baseServer: ALGORAND_NETWORKS.mainnet.indexerUrl,
      port: '',
      token: '',
    },
    chainId: ALGORAND_NETWORKS.mainnet.chainId,
  },
}

export const manager = new WalletManager({
  wallets,
  networks,
  defaultNetwork: NetworkId.TESTNET,
})
