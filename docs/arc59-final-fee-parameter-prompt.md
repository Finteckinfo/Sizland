# ARC-0059 Final Fee Parameter Issue - Agent Guidance Request

## Context
I'm implementing ARC-0059 token transfers using AlgoKit's typed client and have successfully resolved ALL major issues (box references, account references, signer registration, contract communication). The ARC-0059 contract is now working perfectly, but I'm encountering a final fee parameter application issue.

## Current Status
✅ **RESOLVED**: Box reference errors  
✅ **RESOLVED**: Account reference errors  
✅ **RESOLVED**: Signer registration issues  
✅ **RESOLVED**: Contract communication  
✅ **RESOLVED**: Return value parsing  
✅ **RESOLVED**: ARC-0059 parameters  
❌ **CURRENT ISSUE**: Fee parameter not being applied to transaction

## Error Details
```
Error: Error resolving execution info via simulate in transaction 2: 
transaction QR53ZS3MVNNJTK6NVN47NUTXECXCUO5BAW6SKJLJHIUUFEFCPZCA: 
logic eval error: fee too small []transactions.SignedTxnWithAD{...}
Details: app=2449590623, pc=245, opcodes=intc_0 // 0; itxn_field Fee; itxn_submit
```

**Key Issue**: The transaction shows `Fee:basics.MicroAlgos{Raw:0x0}` (fee = 0) instead of the expected `5000` microALGO.

## Current Implementation (Failing Code)

```typescript
// src/lib/algorand/arc59-send.ts
async function arc59SendAsset(
  appClient: Arc59Client,
  assetId: bigint,
  sender: string,
  receiver: string,
  algorand: algokit.AlgorandClient
): Promise<Arc59SendResult> {
  // ... (signer registration and other working code) ...

  // Get send asset info - WORKING PERFECTLY
  const sendAssetInfoResult = await appClient.newGroup().arc59GetSendAssetInfo({
    args: { asset: assetId, receiver }
  }).simulate();
  
  const { itxns, mbr, routerOptedIn, receiverOptedIn, receiverAlgoNeededForClaim } = sendAssetInfoResult.return!;
  console.log(`📊 Send Requirements: { innerTransactions: '${itxns}', mbrRequired: '${mbr}', routerOptedIn: ${routerOptedIn}, receiverOptedIn: ${receiverOptedIn}, receiverAlgoNeededForClaim: '${receiverAlgoNeededForClaim}' }`);

  // Create composer - WORKING PERFECTLY
  const composer = new algokit.TransactionComposer({ algod: algorand.algod });

  // Add MBR payment - WORKING PERFECTLY
  if (mbr > 0n || receiverAlgoNeededForClaim > 0n) {
    const mbrPayment = await algorand.createTransaction.payment({
      sender,
      receiver: appClient.appAddress,
      amount: algokit.microAlgos(Number(mbr + receiverAlgoNeededForClaim)),
    });
    composer.addTransaction(mbrPayment);
  }

  // Add asset transfer - WORKING PERFECTLY
  const axfer = await algorand.createTransaction.assetTransfer({
    sender,
    receiver: appClient.appAddress,
    assetId,
    amount: 1n,
  });
  composer.addTransaction(axfer);

  // Add ARC-0059 send asset transaction - FEE PARAMETER NOT BEING APPLIED
  const totalItxns = itxns + (receiverAlgoNeededForClaim === 0n ? 0n : 1n);
  console.log(`🚀 Adding ARC-0059 send asset transaction (${totalItxns} inner txns)...`);
  
  composer.arc59SendAsset({
    args: {
      axfer,
      receiver,
      additionalReceiverFunds: receiverAlgoNeededForClaim
    },
    sendParams: { fee: algokit.microAlgos(1000 * Number(totalItxns)) }, // ❌ THIS FEE IS NOT BEING APPLIED
    boxReferences: boxes,
  });

  // Execute the transaction
  console.log('⚡ Executing ARC-0059 send transaction...');
  
  const result = await composer.send(); // ❌ TRANSACTION SHOWS FEE = 0
}
```

## Test Output Showing the Issue

```
📊 Send Requirements: {
  innerTransactions: '5',
  mbrRequired: '228100',
  routerOptedIn: true,
  receiverOptedIn: false,
  receiverAlgoNeededForClaim: '0'
}
🚀 Adding ARC-0059 send asset transaction (5 inner txns)...
⚡ Executing ARC-0059 send transaction...

// ERROR: Transaction shows Fee:basics.MicroAlgos{Raw:0x0} instead of 5000
```

## Expected vs Actual Behavior

**Expected**: Transaction should have fee = `1000 * 5 = 5000` microALGO  
**Actual**: Transaction shows fee = `0` microALGO  
**Result**: ARC-0059 contract fails with "fee too small" when trying to submit inner transactions

## Environment Details

- **Network**: Algorand Mainnet
- **ARC-0059 App ID**: 2449590623
- **AlgoKit Version**: Latest
- **Node.js**: Latest
- **TypeScript**: Latest

## Specific Questions

1. **Fee Parameter Application**: How should I correctly apply the fee parameter to the `arc59SendAsset` method call? The current `sendParams: { fee: algokit.microAlgos(1000 * Number(totalItxns)) }` is not working.

2. **TransactionComposer Integration**: Should I use a different approach to set the fee on the ARC-0059 send asset transaction?

3. **AlgoKit Typed Client**: Is there a specific way to set fees on typed client method calls that I'm missing?

4. **Alternative Approaches**: Should I use `coverAppCallInnerTransactionFees: true` instead of manual fee calculation, and if so, how do I implement it correctly with the typed client?

## Code Context

The implementation is using:
- AlgoKit's typed `Arc59Client` generated from ARC-0059 specification
- `TransactionComposer` for building atomic transaction groups
- Manual fee calculation: `1000 * Number(totalItxns)` for inner transactions
- Box references: `[algosdk.decodeAddress(receiver).publicKey]`

## Success Criteria

The solution should result in:
- Transaction fee = `5000` microALGO (for 5 inner transactions)
- Successful ARC-0059 contract execution
- No "fee too small" errors
- Successful token transfer to receiver's inbox

## Next Steps After Resolution

Once this fee parameter issue is resolved, the complete ARC-0059 implementation will be ready for integration with the real asset transfer flow after Stripe payment processing.

---

**Note**: This is the final issue preventing successful ARC-0059 token transfers. All other complex problems (box references, account references, signer registration, contract communication) have been successfully resolved.
