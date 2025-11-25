import algosdk from 'algosdk';

export interface GeneratedWallet {
  address: string;
  privateKey: string; // base64 encoded
  mnemonic: string;
}

export interface EncryptedWallet {
  address: string;
  encryptedPrivateKey: string;
  salt: string;
  iv: string;
  hasPassword: boolean;
}

// Generates a new Algorand account and returns address, privateKey (base64), and mnemonic
export function generateAlgorandWallet(): GeneratedWallet {
  try {
    const account = algosdk.generateAccount();
    
    // Minimal debug; avoid logging secrets
    console.log('🔍 Debug - Algorand account generated');
    
    const privateKeyBase64 = Buffer.from(account.sk).toString('base64');
    
    // Try to generate mnemonic with error handling
    let mnemonic: string;
    try {
      // First attempt: direct conversion
      mnemonic = algosdk.secretKeyToMnemonic(account.sk);
      // success
    } catch (mnemonicError) {
      console.error('🔍 Debug - direct mnemonic generation failed');
      
      try {
        // Second attempt: ensure it's a proper Uint8Array
        const secretKeyBytes = new Uint8Array(account.sk);
        mnemonic = algosdk.secretKeyToMnemonic(secretKeyBytes);
        // success
      } catch (fallbackError) {
          console.error('🔍 Debug - Uint8Array mnemonic generation failed');
        
        try {
          // Third attempt: try with Buffer
          const secretKeyBuffer = Buffer.from(account.sk);
          mnemonic = algosdk.secretKeyToMnemonic(new Uint8Array(secretKeyBuffer));
          // success
        } catch (bufferError) {
          console.error('🔍 Debug - Buffer mnemonic generation failed');
          
          // Final attempt: try with array conversion
          const secretKeyArray = Array.from(account.sk);
          mnemonic = algosdk.secretKeyToMnemonic(new Uint8Array(secretKeyArray));
          // success
        }
      }
    }
    
    // Do not log private key or mnemonic

    const result = { 
      address: account.addr.toString(), // Convert Address object to string
      privateKey: privateKeyBase64, 
      mnemonic 
    };
    
    console.log('🔍 Debug - wallet generated with address:', result.address);
    
    // Validate the result
    if (!result.address || !result.privateKey || !result.mnemonic) {
      throw new Error('Invalid wallet generation result: ' + JSON.stringify(result));
    }
    
    return result;
  } catch (error) {
    console.error('🔍 Debug - Wallet generation error');
    throw error;
  }
}

// To recover from mnemonic:
export function recoverAlgorandWallet(mnemonic: string): GeneratedWallet {
  try {
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    
    // Avoid logging secret material
    
    const privateKeyBase64 = Buffer.from(account.sk).toString('base64');
    const result = { 
      address: account.addr.toString(), // Convert Address object to string
      privateKey: privateKeyBase64, 
      mnemonic 
    };
    
    console.log('🔍 Debug - wallet recovered with address:', result.address);
    return result;
  } catch (error) {
    console.error('🔍 Debug - Wallet recovery error');
    throw error;
  }
}

// Store wallet in localStorage
export function storeWallet(wallet: GeneratedWallet): void {
  console.log('🔍 Debug - storing wallet for address:', wallet.address);
  
  // Validate wallet before storing
  if (!wallet.address || !wallet.privateKey || !wallet.mnemonic) {
    console.error('🔍 Debug - Invalid wallet data for storage');
    throw new Error('Invalid wallet data for storage');
  }
  
  localStorage.setItem('generated-wallet', JSON.stringify(wallet));
}

// Load wallet from localStorage
export function loadWallet(): GeneratedWallet | null {
  const data = localStorage.getItem('generated-wallet');
  if (!data) return null;
  
  try {
    const parsed = JSON.parse(data);
    console.log('🔍 Debug - loaded wallet for address:', parsed?.address);
    
    // Validate loaded wallet
    if (!parsed.address || !parsed.privateKey || !parsed.mnemonic) {
      console.error('🔍 Debug - Invalid wallet data loaded');
      return null;
    }
    
    return parsed;
  } catch (err) {
    console.error('Failed to parse stored wallet:', err);
    return null;
  }
}

// Clear wallet from localStorage
export function clearWallet(): void {
  localStorage.removeItem('generated-wallet');
  localStorage.removeItem('encrypted-wallet');
}

// ============== PASSWORD-PROTECTED WALLET FUNCTIONS ==============

/**
 * Derive an encryption key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import password as a key
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Derive a key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt wallet data with a password
 */
export async function encryptWalletWithPassword(
  wallet: GeneratedWallet,
  password: string
): Promise<EncryptedWallet> {
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Derive encryption key from password
  const key = await deriveKey(password, salt);
  
  // Encrypt the private key
  const encoder = new TextEncoder();
  const dataToEncrypt = encoder.encode(wallet.privateKey);
  
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    dataToEncrypt
  );
  
  // Convert to base64 for storage
  const encryptedPrivateKey = Buffer.from(encryptedData).toString('base64');
  const saltBase64 = Buffer.from(salt).toString('base64');
  const ivBase64 = Buffer.from(iv).toString('base64');
  
  return {
    address: wallet.address,
    encryptedPrivateKey,
    salt: saltBase64,
    iv: ivBase64,
    hasPassword: true
  };
}

/**
 * Decrypt wallet data with a password
 */
export async function decryptWalletWithPassword(
  encryptedWallet: EncryptedWallet,
  password: string
): Promise<string> {
  // Convert from base64
  const salt = Buffer.from(encryptedWallet.salt, 'base64');
  const iv = Buffer.from(encryptedWallet.iv, 'base64');
  const encryptedData = Buffer.from(encryptedWallet.encryptedPrivateKey, 'base64');
  
  // Derive decryption key from password
  const key = await deriveKey(password, salt);
  
  try {
    // Decrypt the private key
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encryptedData
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    throw new Error('Incorrect password');
  }
}

/**
 * Store encrypted wallet in localStorage
 */
export function storeEncryptedWallet(encryptedWallet: EncryptedWallet): void {
  console.log('🔍 Debug - storing encrypted wallet for address:', encryptedWallet.address);
  localStorage.setItem('encrypted-wallet', JSON.stringify(encryptedWallet));
  // Clear unencrypted wallet if it exists
  localStorage.removeItem('generated-wallet');
}

/**
 * Load encrypted wallet from localStorage
 */
export function loadEncryptedWallet(): EncryptedWallet | null {
  const data = localStorage.getItem('encrypted-wallet');
  if (!data) return null;
  
  try {
    const parsed = JSON.parse(data);
    console.log('🔍 Debug - loaded encrypted wallet for address:', parsed?.address);
    return parsed;
  } catch (err) {
    console.error('Failed to parse encrypted wallet:', err);
    return null;
  }
}

/**
 * Check if user has an encrypted wallet
 */
export function hasEncryptedWallet(): boolean {
  return !!localStorage.getItem('encrypted-wallet');
}

/**
 * Unlock wallet with password and return full wallet data
 */
export async function unlockWallet(password: string): Promise<GeneratedWallet | null> {
  const encryptedWallet = loadEncryptedWallet();
  if (!encryptedWallet) {
    return null;
  }
  
  try {
    const privateKey = await decryptWalletWithPassword(encryptedWallet, password);
    
    // Recover the full wallet from the private key
    const privateKeyBytes = Buffer.from(privateKey, 'base64');
    const account = algosdk.mnemonicToSecretKey(
      algosdk.secretKeyToMnemonic(new Uint8Array(privateKeyBytes))
    );
    
    return {
      address: encryptedWallet.address,
      privateKey: privateKey,
      mnemonic: algosdk.secretKeyToMnemonic(new Uint8Array(privateKeyBytes))
    };
  } catch (error) {
    console.error('Failed to unlock wallet:', error);
    return null;
  }
}
