import algosdk from 'algosdk';

export interface GeneratedWallet {
  address: string;
  privateKey: string; // base64 encoded
  mnemonic: string;
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
}
