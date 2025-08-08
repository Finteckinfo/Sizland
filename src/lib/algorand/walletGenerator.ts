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
    
    // Debug logging to check data types
    console.log('🔍 Debug - account object:', account);
    console.log('🔍 Debug - account.addr type:', typeof account.addr, 'value:', account.addr);
    console.log('🔍 Debug - account.sk type:', typeof account.sk, 'value:', account.sk);
    console.log('🔍 Debug - account.sk instanceof Uint8Array:', account.sk instanceof Uint8Array);
    console.log('🔍 Debug - account.sk length:', account.sk.length);
    
    const privateKeyBase64 = Buffer.from(account.sk).toString('base64');
    
    // Try to generate mnemonic with error handling
    let mnemonic: string;
    try {
      // First attempt: direct conversion
      mnemonic = algosdk.secretKeyToMnemonic(account.sk);
      console.log('🔍 Debug - mnemonic generation successful (direct)');
    } catch (mnemonicError) {
      console.error('🔍 Debug - direct mnemonic generation failed:', mnemonicError);
      
      try {
        // Second attempt: ensure it's a proper Uint8Array
        const secretKeyBytes = new Uint8Array(account.sk);
        mnemonic = algosdk.secretKeyToMnemonic(secretKeyBytes);
        console.log('🔍 Debug - mnemonic generation successful (Uint8Array)');
      } catch (fallbackError) {
        console.error('🔍 Debug - Uint8Array mnemonic generation failed:', fallbackError);
        
        try {
          // Third attempt: try with Buffer
          const secretKeyBuffer = Buffer.from(account.sk);
          mnemonic = algosdk.secretKeyToMnemonic(new Uint8Array(secretKeyBuffer));
          console.log('🔍 Debug - mnemonic generation successful (Buffer)');
        } catch (bufferError) {
          console.error('🔍 Debug - Buffer mnemonic generation failed:', bufferError);
          
          // Final attempt: try with array conversion
          const secretKeyArray = Array.from(account.sk);
          mnemonic = algosdk.secretKeyToMnemonic(new Uint8Array(secretKeyArray));
          console.log('🔍 Debug - mnemonic generation successful (Array conversion)');
        }
      }
    }
    
    // Debug logging for generated values
    console.log('🔍 Debug - privateKeyBase64 type:', typeof privateKeyBase64, 'value:', privateKeyBase64);
    console.log('🔍 Debug - mnemonic type:', typeof mnemonic, 'value:', mnemonic);
    console.log('🔍 Debug - mnemonic length:', mnemonic ? mnemonic.split(' ').length : 'undefined');

    const result = { 
      address: account.addr.toString(), // Convert Address object to string
      privateKey: privateKeyBase64, 
      mnemonic 
    };
    
    console.log('🔍 Debug - final result:', result);
    
    // Validate the result
    if (!result.address || !result.privateKey || !result.mnemonic) {
      throw new Error('Invalid wallet generation result: ' + JSON.stringify(result));
    }
    
    return result;
  } catch (error) {
    console.error('🔍 Debug - Wallet generation error:', error);
    throw error;
  }
}

// To recover from mnemonic:
export function recoverAlgorandWallet(mnemonic: string): GeneratedWallet {
  try {
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    
    // Debug logging
    console.log('🔍 Debug - recovered account object:', account);
    console.log('🔍 Debug - recovered account.addr type:', typeof account.addr, 'value:', account.addr);
    console.log('🔍 Debug - recovered account.sk type:', typeof account.sk, 'value:', account.sk);
    
    const privateKeyBase64 = Buffer.from(account.sk).toString('base64');
    const result = { 
      address: account.addr.toString(), // Convert Address object to string
      privateKey: privateKeyBase64, 
      mnemonic 
    };
    
    console.log('🔍 Debug - recovered result:', result);
    return result;
  } catch (error) {
    console.error('🔍 Debug - Wallet recovery error:', error);
    throw error;
  }
}

// Store wallet in localStorage
export function storeWallet(wallet: GeneratedWallet): void {
  console.log('🔍 Debug - storing wallet:', wallet);
  
  // Validate wallet before storing
  if (!wallet.address || !wallet.privateKey || !wallet.mnemonic) {
    console.error('🔍 Debug - Invalid wallet data for storage:', wallet);
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
    console.log('🔍 Debug - loaded wallet:', parsed);
    
    // Validate loaded wallet
    if (!parsed.address || !parsed.privateKey || !parsed.mnemonic) {
      console.error('🔍 Debug - Invalid wallet data loaded:', parsed);
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
