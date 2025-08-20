import algosdk from 'algosdk';

/**
 * Convert a private key from various formats to base64 for storage
 */
export function encodePrivateKey(privateKey: string | Uint8Array): string {
  if (typeof privateKey === 'string') {
    // If it's already base64, return as is
    if (isBase64(privateKey)) {
      return privateKey;
    }
    
    // If it's a mnemonic, convert to private key first
    if (privateKey.split(' ').length === 25) {
      const account = algosdk.mnemonicToSecretKey(privateKey);
      return Buffer.from(account.sk).toString('base64');
    }
    
    // If it's hex, convert to base64
    if (isHex(privateKey)) {
      return Buffer.from(privateKey, 'hex').toString('base64');
    }
    
    throw new Error('Unsupported private key format. Use base64, mnemonic, or hex.');
  }
  
  // If it's Uint8Array, convert to base64
  return Buffer.from(privateKey).toString('base64');
}

/**
 * Convert a base64 encoded private key back to Uint8Array
 */
export function decodePrivateKey(privateKeyBase64: string): Uint8Array {
  try {
    return new Uint8Array(Buffer.from(privateKeyBase64, 'base64'));
  } catch (error) {
    throw new Error('Invalid private key format. Expected base64 encoded string.');
  }
}

/**
 * Generate a new Algorand account and return the private key in base64 format
 */
export function generateNewAccount(): {
  address: string;
  privateKey: string;
  mnemonic: string;
} {
  const account = algosdk.generateAccount();
  return {
    address: account.addr,
    privateKey: Buffer.from(account.sk).toString('base64'),
    mnemonic: algosdk.secretKeyToMnemonic(account.sk),
  };
}

/**
 * Check if a string is valid base64
 */
function isBase64(str: string): boolean {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch {
    return false;
  }
}

/**
 * Check if a string is valid hex
 */
function isHex(str: string): boolean {
  return /^[0-9a-fA-F]+$/.test(str);
}

/**
 * Validate Algorand address format
 */
export function isValidAlgorandAddress(address: string): boolean {
  try {
    algosdk.decodeAddress(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format Algorand address for display (add ellipsis in middle)
 */
export function formatAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Convert microAlgos to Algos
 */
export function microAlgosToAlgos(microAlgos: number): number {
  return microAlgos / 1000000;
}

/**
 * Convert Algos to microAlgos
 */
export function algosToMicroAlgos(algos: number): number {
  return Math.round(algos * 1000000);
}
