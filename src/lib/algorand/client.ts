import algosdk from 'algosdk';

if (!process.env.ALGORAND_NETWORK_URL) {
  throw new Error('ALGORAND_NETWORK_URL is not set');
}

if (!process.env.ALGORAND_NETWORK_TOKEN) {
  throw new Error('ALGORAND_NETWORK_TOKEN is not set');
}

// Initialize Algorand client
export const algodClient = new algosdk.Algodv2(
  process.env.ALGORAND_NETWORK_TOKEN,
  process.env.ALGORAND_NETWORK_URL,
  ''
);


