import type { Metadata } from 'next'
import '../styles/globals.css'
import { headers } from 'next/headers'
import ContextProvider from '@/context'

export const metadata: Metadata = {
  title: 'Sizland',
  description: 'Sizland Web3 App',
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


