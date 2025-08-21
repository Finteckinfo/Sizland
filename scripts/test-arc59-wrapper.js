const dotenv = require('dotenv');
dotenv.config();

// Mock the algodClient for testing
const mockAlgodClient = {
  getTransactionParams: async () => ({ do: () => ({ fee: 1000, firstRound: 1, lastRound: 1000 }) }),
  sendRawTransaction: async (txn) => ({ do: () => ({ txid: 'mock-txid-' + Date.now() }) }),
  waitForConfirmation: async () => Promise.resolve(),
  accountInformation: async (address) => ({ 
    do: () => ({ 
      assets: [], 
      amount: 1000000, 
      'min-balance': 100000 
    }) 
  }),
  getAssetByID: async (assetId) => ({ do: () => ({ params: { freeze: null } }) })
};

// Mock the algosdk for testing
const mockAlgosdk = {
  makeApplicationCallTxnFromObject: (params) => ({
    signTxn: (sk) => new Uint8Array([1, 2, 3, 4]),
    group: null
  }),
  makeAssetTransferTxnWithSuggestedParamsFromObject: (params) => ({
    signTxn: (sk) => new Uint8Array([1, 2, 3, 4]),
    group: null
  }),
  computeGroupID: (txns) => 'mock-group-id',
  waitForConfirmation: async () => Promise.resolve(),
  getApplicationAddress: (appId) => 'mock-app-address',
  encodeUint64: (value) => new Uint8Array([value]),
  decodeAddress: (address) => ({ publicKey: new Uint8Array([1, 2, 3, 4]) }),
  OnApplicationComplete: {
    NoOpOC: 0
  }
};

// Create a mock Arc59Client for testing
class MockArc59Client {
  constructor(config) {
    this.appId = config.appId;
    this.sender = config.sender;
    this.signer = config.signer;
  }

  async optRouterIn(assetId) {
    console.log(`✅ Mock: Opting router into asset ${assetId}`);
    return 'mock-opt-in-txid';
  }

  async getSendAssetInfo(receiver, assetId) {
    console.log(`✅ Mock: Getting send asset info for ${receiver}, asset ${assetId}`);
    return {
      itxns: 3,
      mbr: 100000,
      routerOptedIn: true,
      receiverOptedIn: false,
      receiverAlgoNeededForClaim: 100000
    };
  }

  async sendAsset(params) {
    console.log(`✅ Mock: Sending asset via ARC-0059:`, params);
    return 'mock-send-asset-txid';
  }

  async claimAsset(params) {
    console.log(`✅ Mock: Claiming asset via ARC-0059:`, params);
    return 'mock-claim-txid';
  }

  async claimAlgo(claimer) {
    console.log(`✅ Mock: Claiming ALGO for ${claimer}`);
    return 'mock-claim-algo-txid';
  }

  async checkInboxBalance(receiver, assetId) {
    console.log(`✅ Mock: Checking inbox balance for ${receiver}, asset ${assetId}`);
    return 0;
  }

  async getInboxAddress(receiver) {
    console.log(`✅ Mock: Getting inbox address for ${receiver}`);
    return 'mock-inbox-address';
  }

  async rejectAsset(params) {
    console.log(`✅ Mock: Rejecting asset via ARC-0059:`, params);
    return 'mock-reject-txid';
  }

  async getOrCreateInbox(receiver) {
    console.log(`✅ Mock: Getting or creating inbox for ${receiver}`);
    return 'mock-inbox-address';
  }
}

// Export the mock client for testing
module.exports = {
  MockArc59Client,
  mockAlgodClient,
  mockAlgosdk
};
