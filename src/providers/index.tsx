// app/layout.tsx or app/providers.tsx
import { WalletProvider } from '@txnlab/use-wallet-react'
import { manager } from '@/lib/algorand/walletManager'

export function Providers({ children }: { children: React.ReactNode }) {
  return <WalletProvider manager={manager}>{children}</WalletProvider>
}
