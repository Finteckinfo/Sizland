import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import { headers } from 'next/headers'
import ContextProvider from '@/context'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export const metadata: Metadata = {
  title: 'Sizland - Decentralized Platform for Remote Teams',
  description: 'Sizland unites remote teams, founders, and freelancers on a decentralized platform where tasks, payments, and growth live transparently on the blockchain. Experience blockchain-powered ERP and investment opportunities.',
  keywords: ['blockchain', 'remote teams', 'decentralized', 'ERP', 'DeFi', 'crypto', 'web3', 'freelancers', 'blockchain payments'],
  authors: [{ name: 'Sizland Dev Argwings' }],
  creator: 'Sizland',
  publisher: 'Sizland',
  metadataBase: new URL('https://www.siz.land'),
  alternates: {
    canonical: 'https://www.siz.land',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.siz.land',
    siteName: 'Sizland',
    title: 'Sizland - Decentralized Platform for Remote Teams',
    description: 'Sizland unites remote teams, founders, and freelancers on a decentralized platform where tasks, payments, and growth live transparently on the blockchain.',
    images: [
      {
        url: '/metaimage.png',
        width: 1200,
        height: 630,
        alt: 'Sizland - Decentralized Platform for Remote Teams',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sizland - Decentralized Platform for Remote Teams',
    description: 'Sizland unites remote teams, founders, and freelancers on a decentralized platform where tasks, payments, and growth live transparently on the blockchain.',
    images: ['/metaimage.png'],
    creator: '@sizlandofficial',
    site: '@sizlandofficial',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes here if needed
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersObj = await headers()
  const cookies = headersObj.get('cookie')

  return (
    <html lang="en">
      <body>
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  )
}


