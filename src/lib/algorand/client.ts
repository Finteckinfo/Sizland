import algosdk from 'algosdk';

function validateEnvironment() {
  if (!process.env.ALGORAND_NETWORK_URL) {
    throw new Error('ALGORAND_NETWORK_URL is not set');
  }
  if (!process.env.ALGORAND_NETWORK_TOKEN) {
    throw new Error('ALGORAND_NETWORK_TOKEN is not set');
  }
}

let _algodClient: algosdk.Algodv2 | null = null;

// Create client with timeout and retry configuration
function createAlgodClient(): algosdk.Algodv2 {
  validateEnvironment();
  
  const client = new algosdk.Algodv2(
    process.env.ALGORAND_NETWORK_TOKEN!,
    process.env.ALGORAND_NETWORK_URL!,
    ''
  );
  
  return client;
}

export const algodClient = new Proxy({} as algosdk.Algodv2, {
  get(target, prop) {
    if (!_algodClient) {
      _algodClient = createAlgodClient();
    }
    return _algodClient[prop as keyof algosdk.Algodv2];
  }
});

// Alternative network endpoints for fallback
export const ALTERNATIVE_NETWORKS = {
  mainnet: [
    'https://mainnet-api.algonode.cloud',
    'https://algo-mainnet.public.blastapi.io',
    'https://mainnet.algoexplorer.io'
  ],
  testnet: [
    'https://testnet-api.algonode.cloud',
    'https://algo-testnet.public.blastapi.io',
    'https://testnet.algoexplorer.io'
  ]
};

// Function to test network connectivity
export async function testNetworkConnectivity(url: string): Promise<boolean> {
  try {
    const testClient = new algosdk.Algodv2('', url, '');
    await testClient.healthCheck().do();
    return true;
  } catch (error) {
    console.log(`❌ Network ${url} failed: ${(error as Error).message}`);
    return false;
  }
}

// Function to get working network endpoint
export async function getWorkingNetwork(): Promise<string | null> {
  const currentUrl = process.env.ALGORAND_NETWORK_URL;
  if (currentUrl) {
    const isWorking = await testNetworkConnectivity(currentUrl);
    if (isWorking) {
      return currentUrl;
    }
  }
  
  // Try alternative endpoints
  const networks = ALTERNATIVE_NETWORKS.mainnet;
  for (const network of networks) {
    const isWorking = await testNetworkConnectivity(network);
    if (isWorking) {
      console.log(`✅ Found working network: ${network}`);
      return network;
    }
  }
  
  return null;
}
