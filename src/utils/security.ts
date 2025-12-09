import crypto from 'crypto';

// Generate a secure random nonce
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

// Get CSP header with nonce
export function getCSP(nonce: string, isDev: boolean = false): string {
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://vercel.live https://pulse.walletconnect.org https://api.web3modal.org ${isDev ? "'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' https://db.onlinewebfonts.com",
    `connect-src 'self' https://*.vercel.live https://sizerpbackend.onrender.com https://pulse.walletconnect.org https://api.web3modal.org`,
    "frame-src 'self' https://vercel.live",
    "object-src 'none'",
    "base-uri 'self'",
    `report-uri https://sizerpbackend.onrender.com/api/csp-report`
  ];

  return csp.join('; ');
}
