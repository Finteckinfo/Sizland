import * as algokit from '@algorandfoundation/algokit-utils';
import algosdk from 'algosdk';

/**
 * ALGO Funding Service
 * Handles funding user wallets with ALGO for opt-in and claiming operations
 */

// Constants in microAlgos for atomic group (opt-in + transfer)
const BASE_MBR = 100_000n;           // 0.1 ALGO base minimum balance
const ASA_OPT_IN_MBR = 100_000n;     // 0.1 ALGO per asset opt-in
const FEE_PER_TXN = 1_000n;          // typical minimum fee per transaction
const TXNS_IN_GROUP = 2n;            // opt-in + transfer = 2 transactions
const SAFETY_BUFFER = 3_000n;        // 0.003 ALGO safety buffer

const REQUIRED_MBR_FOR_ONE_ASSET = BASE_MBR + ASA_OPT_IN_MBR;            // 200_000
const REQUIRED_FEES = FEE_PER_TXN * TXNS_IN_GROUP;                        // 2_000
const TARGET_TOTAL = REQUIRED_MBR_FOR_ONE_ASSET + REQUIRED_FEES + SAFETY_BUFFER; // 205_000

export interface FundingParams {
  algorand: algokit.AlgorandClient;
  receiver: string;
  centralAccount: algosdk.Account;
  minSpendableAlgo: algokit.AlgoAmount;
}

export interface FundingResult {
  success: boolean;
  funded: boolean;
  amount?: number;
  error?: string;
}

/**
 * Fund receiver wallet if needed using AlgoKit ensureFunded
 * Ensures receiver has at least minSpendableAlgo spendable ALGOs
 * If underfunded, sends just enough ALGO from centralAccount
 */
export async function fundReceiverIfNeeded(params: FundingParams): Promise<FundingResult> {
  const { algorand, receiver, centralAccount } = params;

  try {
    console.log(`💰 Checking ALGO funding for receiver: ${receiver}`);
    console.log(`   Target balance: ${TARGET_TOTAL} microALGO (${Number(TARGET_TOTAL) / 1e6} ALGO)`);
    console.log(`   Breakdown:`);
    console.log(`     - Base MBR: ${BASE_MBR} microALGO (${Number(BASE_MBR) / 1e6} ALGO)`);
    console.log(`     - Asset opt-in MBR: ${ASA_OPT_IN_MBR} microALGO (${Number(ASA_OPT_IN_MBR) / 1e6} ALGO)`);
    console.log(`     - Transaction fees: ${REQUIRED_FEES} microALGO (${Number(REQUIRED_FEES) / 1e6} ALGO)`);
    console.log(`     - Safety buffer: ${SAFETY_BUFFER} microALGO (${Number(SAFETY_BUFFER) / 1e6} ALGO)`);

    // Register the central account signer with the AlgoKit client
    console.log('   🔧 Registering central wallet signer...');
    algorand.setSignerFromAccount({
      addr: centralAccount.addr,
      signer: algosdk.makeBasicAccountTransactionSigner(centralAccount)
    });

    // Get current receiver balance
    const receiverInfo = await algorand.account.getInformation(receiver);
    const currentBalance = algokit.microAlgos(receiverInfo.amount);
    
    console.log(`   Current balance: ${currentBalance.microAlgos} microALGO (${currentBalance.algos} ALGO)`);

    if (currentBalance.microAlgos >= TARGET_TOTAL) {
      console.log('   ✅ Receiver already has sufficient ALGO balance');
      return {
        success: true,
        funded: false,
        amount: 0
      };
    }

    console.log('   🔄 Receiver needs funding, sending ALGO...');
    
    // Ensure receiver has at least TARGET_TOTAL microAlgos
    const fundingResult = await algorand.account.ensureFunded(
      receiver,
      centralAccount.addr,
      algokit.microAlgos(Number(TARGET_TOTAL))
    );

    if (fundingResult) {
      console.log('   ✅ ALGO funding successful:', {
        amount: fundingResult.amount,
        transactionId: fundingResult.transactionId
      });
      
      return {
        success: true,
        funded: true,
        amount: fundingResult.amount
      };
    } else {
      console.log('   ℹ️ No funding needed (should not reach here)');
      return {
        success: true,
        funded: false,
        amount: 0
      };
    }

  } catch (error) {
    console.error('   ❌ ALGO funding failed:', error);
    return {
      success: false,
      funded: false,
      error: error instanceof Error ? error.message : 'Unknown funding error'
    };
  }
}

/**
 * Alternative simple payment method (if ensureFunded is not available)
 * Sends a fixed amount of ALGO to the receiver
 */
export async function sendAlgoPayment(params: {
  algorand: algokit.AlgorandClient;
  sender: string;
  receiver: string;
  amount: algokit.AlgoAmount;
  signer: algosdk.Account;
}): Promise<FundingResult> {
  const { algorand, sender, receiver, amount, signer } = params;

  try {
    console.log(`💰 Sending ALGO payment: ${amount.algos} ALGO to ${receiver}`);

    const payment = await algorand.transactions.payment({
      sender,
      receiver,
      amount: amount.microAlgos,
    });

    const signedTxn = algosdk.signTransaction(payment, signer.sk);
    const result = await algorand.send.rawTransaction({ signedTransaction: signedTxn });

    console.log('   ✅ ALGO payment successful:', {
      amount: amount.algos,
      transactionId: result.transactionId
    });

    return {
      success: true,
      funded: true,
      amount: amount.algos
    };

  } catch (error) {
    console.error('   ❌ ALGO payment failed:', error);
    return {
      success: false,
      funded: false,
      error: error instanceof Error ? error.message : 'Unknown payment error'
    };
  }
}
