'use client'

import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, cookieToInitialState, type Config } from 'wagmi'
import { createAppKit } from '@reown/appkit/react'
import { config, networks, projectId, wagmiAdapter } from '@/config'
import { mainnet } from '@reown/appkit/networks'

const queryClient = new QueryClient()

const metadata = {
  name: 'Sizland',
  description: 'Sizland Web3 App',
  url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  icons: ['/favicon.ico'],
}

if (projectId) {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId: projectId!,
    networks,
    defaultNetwork: mainnet,
    metadata,
    features: { analytics: true },
  })
} else {
  console.error('AppKit Initialization Error: Project ID is missing.')
}

export default function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode
  cookies: string | null
}) {
  const initialState = cookieToInitialState(config as Config, cookies)

  return (
    <WagmiProvider config={config as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}


