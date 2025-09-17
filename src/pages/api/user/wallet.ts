import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 [API] /api/user/wallet called with method:', req.method)
  
  if (req.method !== 'POST') {
    console.log('❌ [API] Method not allowed:', req.method)
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, walletAddress } = req.body
  console.log('🔍 [API] Request body:', { userId: userId ? `${userId.substring(0, 8)}...` : 'undefined', walletAddress })

  if (!userId || !walletAddress) {
    console.log('❌ [API] Missing required fields:', { hasUserId: !!userId, hasWalletAddress: !!walletAddress })
    return res.status(400).json({ error: 'userId and walletAddress are required' })
  }

  try {
    // Get the external API URL from DATABASE_URL2 environment variable
    const externalApiUrl = process.env.DATABASE_URL2
    console.log('🔍 [API] External API URL:', externalApiUrl)
    
    if (!externalApiUrl) {
      console.log('❌ [API] DATABASE_URL2 environment variable not set')
      return res.status(500).json({ error: 'External API URL not configured' })
    }

    const requestBody = {
      userId,
      walletAddress
    }
    console.log('🔍 [API] Posting to external API:', { 
      url: `${externalApiUrl}/api/user/wallet`,
      body: { userId: `${userId.substring(0, 8)}...`, walletAddress }
    })
    
    const response = await fetch(`${externalApiUrl}/api/user/wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(requestBody)
    })

    console.log('🔍 [API] External API response status:', response.status)
    console.log('🔍 [API] External API response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ [API] External API error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ [API] External API success response:', data)
    console.log('✅ [API] Successfully posted wallet to external database')
    return res.status(200).json(data)
  } catch (error) {
    console.error('❌ [API] Error posting wallet to external database:', {
      message: error.message,
      stack: error.stack,
      userId: userId ? `${userId.substring(0, 8)}...` : 'undefined',
      walletAddress
    })
    return res.status(500).json({ 
      error: 'Failed to post wallet address',
      details: error.message 
    })
  }
}
