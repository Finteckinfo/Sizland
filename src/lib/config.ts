export const SIZ_ASSET_IDS = {
  testnet: 739030083,
  mainnet: 2905622564,
} as const;

export const ALGORAND_NETWORKS = {
  testnet: {
    name: 'TestNet',
    algodUrl: 'https://testnet-api.algonode.cloud',
    indexerUrl: 'https://testnet-idx.algonode.cloud',
    chainId: '416001',
  },
  mainnet: {
    name: 'MainNet',
    algodUrl: 'https://mainnet-api.algonode.cloud',
    indexerUrl: 'https://mainnet-idx.algonode.cloud',
    chainId: '4160',
  },
} as const;

export type Network = keyof typeof SIZ_ASSET_IDS; 