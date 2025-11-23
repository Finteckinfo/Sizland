// Allow ENV override for SIZ token IDs (client-safe NEXT_PUBLIC_*)
const envMainnetAssetId = Number(process.env.NEXT_PUBLIC_SIZ_TOKEN_ASSET_ID || 0);
const envTestnetAssetId = Number(process.env.NEXT_PUBLIC_SIZ_TOKEN_ASSET_ID_TESTNET || 0);

export const SIZ_ASSET_IDS = {
  testnet: envTestnetAssetId > 0 ? envTestnetAssetId : 739030083,
  mainnet: envMainnetAssetId > 0 ? envMainnetAssetId : 3186560531,
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