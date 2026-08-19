import crypto from 'crypto';

// Generate a secure random nonce
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

// Inline script hashes used by Web3Modal / WalletConnect (injected at runtime; not covered by nonce).
const WALLET_INLINE_SCRIPT_HASHES = [
  "'sha256-eMuh8xiwcX72rRYNAGENurQBAcH7kLlAUQcoOri3BIo='",
  "'sha256-NzvNrqk5jB9YZATwo5BF4JoRlJ02HsnFikbKXgEPdaQ='",
].join(' ');

/**
 * CSP for <meta http-equiv="Content-Security-Policy"> (see _document).
 * Note: browsers ignore report-uri in meta tags; use HTTP headers if you need reports.
 */
export function getCSP(nonce: string, isDev: boolean = false): string {
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' ${WALLET_INLINE_SCRIPT_HASHES} https://vercel.live https://pulse.walletconnect.org https://api.web3modal.org${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: https://tile.openstreetmap.org",
    "font-src 'self' https://db.onlinewebfonts.com https://fonts.gstatic.com",
    `connect-src 'self' https://*.vercel.live https://sizerpbackend.onrender.com https://*.up.railway.app https://cca-lite.coinbase.com https://*.coinbase.com https://pulse.walletconnect.org https://api.web3modal.org wss://*.walletconnect.org wss://*.walletconnect.com https://*.walletconnect.org https://*.walletconnect.com https://rpc.walletconnect.org https://tile.openstreetmap.org`,
    "worker-src 'self' blob:",
    "frame-src 'self' https://vercel.live https://verify.walletconnect.org https://verify.walletconnect.com",
    "object-src 'none'",
    "base-uri 'self'",
  ];

  return csp.join('; ');
}
