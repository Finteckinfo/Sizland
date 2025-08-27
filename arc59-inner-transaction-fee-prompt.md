# ARC-0059 Inner Transaction Fee Issue - Agent Guidance Request

## Context
I'm implementing ARC-0059 token transfers using AlgoKit's typed client and have successfully resolved all major issues (box references, account references, signer registration). The ARC-0059 contract is now working correctly, but I'm encountering a final "fee too small" error for inner transactions.

## Current Status
✅ **RESOLVED**: Box reference errors  
✅ **RESOLVED**: Account reference errors  
✅ **RESOLVED**: Signer registration issues  
✅ **RESOLVED**: Contract communication  
❌ **CURRENT ISSUE**: Inner transaction fee too small

## Error Details
```
Error: Error resolving execution info via simulate in transaction 2: 
transaction TTG3ZGSIB7YKMZGDOJZEMP45UJTXLVI723F2V5ZCQAJYP5IT46JQ: 
logic eval error: fee too small []transactions.SignedTxnWithAD{...}
Details: app=2449590623, pc=245, opcodes=intc_0 // 0; itxn_field Fee; itxn_submit
```

The error occurs at `pc=245` with opcodes `intc_0 // 0; itxn_field Fee; itxn_submit`, indicating the ARC-0059 contract is trying to submit an inner transaction with fee=0.

## Current Implementation

### ARC-0059 Send Function
```typescript
// src/lib/algorand/arc59-send.ts
async function arc59SendAsset(
  appClient: Arc59Client,
  assetId: bigint,
  sender: string,
  receiver: string,
  algorand: algokit.AlgorandClient
): Promise<Arc59SendResult> {
  // Register signer with AlgorandClient AccountManager
  const senderSigner = algorand.account.getSigner(sender);
  await algorand.account.setSignerFromAccount({ addr: sender, signer: senderSigner });
  
  // Get ARC-0059 send requirements
  const sendAssetInfoResult = await appClient.arc59GetSendAssetInfo({
    args: { asset: assetId, receiver }
  });
  
  const { itxns, mbr, routerOptedIn, receiverOptedIn, receiverAlgoNeededForClaim } = sendAssetInfoResult.return!;
  
  console.log(`📊 Send Requirements: {
    innerTransactions: '${itxns}',
    mbrRequired: '${mbr}',
    routerOptedIn: ${routerOptedIn},
    receiverOptedIn: ${receiverOptedIn},
    receiverAlgoNeeded: '${receiverAlgoNeededForClaim}'
  }`);

  // Create transaction composer
  const composer = appClient.newGroup();
  
  // Add MBR payment if needed
  if (mbr > 0n || receiverAlgoNeededForClaim > 0n) {
    const mbrPayment = await algorand.createTransaction.payment({
      sender,
      receiver: appClient.appAddress,
      amount: mbr + receiverAlgoNeededForClaim,
    });
    composer.addTransaction(mbrPayment);
  }

  // Add router opt-in if needed
  if (!routerOptedIn) {
    composer.arc59OptRouterIn({ args: { asa: assetId } });
  }

  // Get box reference for receiver
  const boxes = [algosdk.decodeAddress(receiver).publicKey];
  
  // Create asset transfer to router
  const axfer = await algorand.createTransaction.assetTransfer({
    sender,
    receiver: appClient.appAddress,
    assetId,
    amount: amount,
  });

  // Add ARC-0059 send asset transaction
  const totalItxns = itxns + (receiverAlgoNeededForClaim === 0n ? 0n : 1n);
  console.log(`🚀 Adding ARC-0059 send asset transaction (${totalItxns} inner txns)...`);
  
  composer.arc59SendAsset({
    args: {
      axfer,
      receiver,
      additionalReceiverFunds: receiverAlgoNeededForClaim
    },
    sendParams: { fee: algokit.microAlgos(1000 + 1000 * Number(totalItxns)) },
    boxReferences: boxes,
  });

  // Execute the transaction
  console.log('⚡ Executing ARC-0059 send transaction...');
  const result = await composer.send();
  
  return {
    success: true,
    txId: result.txIds[0],
    requiresOptIn: !receiverOptedIn,
    requiresUserAction: false,
    actionRequired: 'none'
  };
}
```

### Test Output
```
📊 Send Requirements: {
  innerTransactions: '5',
  mbrRequired: '228100',
  routerOptedIn: true,
  receiverOptedIn: false,
  receiverAlgoNeeded: '0'
}
🔧 Step 2: Building ARC-0059 send transaction...
💰 Adding MBR payment: 228100 microALGO
📦 Using receiver's public key for box reference: 8bcd0c0dbd6c35617b4d435c97bf7ed821e4d98b8c2e883007205fa75817d921
🚀 Adding ARC-0059 send asset transaction (5 inner txns)...
⚡ Executing ARC-0059 send transaction...
```

## Questions for Agent

1. **Fee Calculation**: The contract expects 5 inner transactions but fails with "fee too small". How should I calculate the correct fee for the `arc59SendAsset` call to cover all inner transactions?

2. **Fee Structure**: Should the fee be:
   - `1000 + 1000 * Number(totalItxns)` (current approach)
   - `1000 * Number(totalItxns)` (just inner transaction fees)
   - Some other calculation?

3. **Official Pattern**: What's the correct pattern from the official ARC-0059 reference implementation for handling inner transaction fees?

4. **AlgoKit Integration**: Is there a specific AlgoKit method or parameter I should use to ensure proper fee handling for inner transactions?

## Environment
- **Network**: Algorand Mainnet
- **ARC-0059 App ID**: 2449590623
- **AlgoKit Version**: Latest
- **Client**: Typed Arc59Client generated from ARC-56 specification

## Expected Behavior
The ARC-0059 contract should successfully:
1. Create an inbox for the receiver (if needed)
2. Opt the inbox into the asset (if needed)  
3. Transfer the asset to the inbox
4. Handle all inner transactions with proper fees

## Current Error Location
The error occurs during the `composer.send()` call, specifically when the ARC-0059 contract tries to submit its first inner transaction with `itxn_field Fee; itxn_submit`.

Please provide the correct approach to resolve this inner transaction fee issue and complete the ARC-0059 implementation.
