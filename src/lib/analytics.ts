'use client'

type TrackPayload = Record<string, unknown>

type AnalyticsAdapter = (eventName: string, props?: TrackPayload) => void

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: TrackPayload }) => void
    analytics?: { track?: (eventName: string, props?: TrackPayload) => void }
    gtag?: (...args: unknown[]) => void
    dataLayer?: Record<string, unknown>[]
  }
}

const BACKEND_ANALYTICS_URL =
  typeof window === 'undefined'
    ? null
    : (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/$/, '') + '/api/analytics/wallet-auth'

const getAdapters = (): AnalyticsAdapter[] => {
  if (typeof window === 'undefined') return []

  const adapters: AnalyticsAdapter[] = []

  if (typeof window.plausible === 'function') {
    adapters.push((event, props) => window.plausible?.(event, { props }))
  }

  if (typeof window.analytics?.track === 'function') {
    adapters.push((event, props) => window.analytics?.track?.(event, props))
  }

  if (typeof window.gtag === 'function') {
    adapters.push((event, props) => window.gtag?.('event', event, props ?? {}))
  }

  if (Array.isArray(window.dataLayer)) {
    adapters.push((event, props) =>
      window.dataLayer?.push({ event, ...props })
    )
  }

  return adapters
}

const sendToBackend = (payload?: TrackPayload) => {
  if (!BACKEND_ANALYTICS_URL || typeof window === 'undefined' || !payload) return

  try {
    const body = JSON.stringify(payload)

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon(BACKEND_ANALYTICS_URL, blob)
      return
    }

    fetch(BACKEND_ANALYTICS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      mode: 'cors',
      credentials: 'omit',
    }).catch(err => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[analytics] backend send failed', err)
      }
    })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[analytics] backend payload error', error)
    }
  }
}

export const trackEvent = (
  eventName: string,
  publicProps?: TrackPayload,
  internalProps?: TrackPayload
) => {
  const props = publicProps ?? {}
  const adapters = getAdapters()

  if (adapters.length === 0 && process.env.NODE_ENV !== 'production') {
    console.debug(`[analytics] ${eventName}`, props)
  }

  adapters.forEach(adapter => {
    try {
      adapter(eventName, props)
    } catch (err) {
      console.error('[analytics] adapter failed', err)
    }
  })

  sendToBackend(internalProps ?? publicProps)
}

export type WalletAuthChannel =
  | 'siz-generated'
  | 'stored-wallet'
  | 'manual-address'
  | 'mnemonic-recovery'
  | 'algorand'
  | 'metamask'

export interface WalletAuthAnalyticsContext {
  channel: WalletAuthChannel
  surface?: 'create' | 'returning' | 'algorand' | 'metamask'
  chain?: 'algorand' | 'evm' | 'unknown'
  method?: string
  providerId?: string
  isNewWallet?: boolean
  isRecovery?: boolean
  [key: string]: unknown
}

export type WalletAuthStatus = 'attempt' | 'success' | 'error'

export const maskWalletAddress = (address?: string | null) => {
  if (!address) return undefined
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const trackWalletAuthEvent = (
  status: WalletAuthStatus,
  context: WalletAuthAnalyticsContext & {
    walletAddress?: string
    error?: string
    stage?: string
  }
) => {
  const { walletAddress, ...rest } = context
  const masked = maskWalletAddress(walletAddress)
  const base = {
    status,
    ts: new Date().toISOString(),
    ...rest,
  }

  trackEvent(
    'wallet_auth',
    {
      ...base,
      walletAddress: masked,
    },
    {
      ...base,
      walletAddress,
      walletAddressMasked: masked,
    }
  )
}
