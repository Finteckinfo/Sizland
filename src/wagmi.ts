import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId && process.env.NODE_ENV !== 'development') {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required in production');
}

export const config = getDefaultConfig({
  appName: 'RainbowKit App',
  projectId: projectId || 'dev-local-placeholder',
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  ssr: true,
});