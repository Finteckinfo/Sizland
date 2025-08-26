#!/usr/bin/env tsx

/**
 * Test script for complete webhook flow
 * This simulates the Stripe webhook processing and token transfer
 */

import dotenv from 'dotenv';
import { sizTokenTransferService } from '../src/lib/algorand/token-transfer';
import { paymentDB } from '../src/lib/database/payments';

// Load environment variables
dotenv.config();

async function testWebhookFlow() {
  console.log('🧪 Testing Complete Webhook Flow\n');

  // Check environment variables
  const requiredVars = [
    'SIZ_TOKEN_ASSET_ID',
    'CENTRAL_WALLET_MNEMONIC',
    'CENTRAL_WALLET_ADDRESS',
    'DATABASE_URL'
  ];

  console.log('🔍 Environment Variables Check:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${varName.includes('MNEMONIC') ? '[HIDDEN]' : value}`);
    } else {
      console.log(`   ❌ ${varName}: NOT SET`);
      return;
    }
  }

  // Check if test receiver address is provided
  if (!process.env.TEST_RECEIVER_ADDRESS) {
    console.log('\n⚠️  TEST_RECEIVER_ADDRESS not set - this is required for testing');
    console.log('   Add TEST_RECEIVER_ADDRESS to your .env file to test the transfer');
    return;
  }

  console.log('\n🔑 Test Receiver Address:', process.env.TEST_RECEIVER_ADDRESS);

  try {
    // Step 1: Check central wallet status
    console.log('\n📋 Step 1: Checking central wallet status...');
    const walletStatus = await sizTokenTransferService.checkCentralWalletStatus();
    console.log('📊 Central Wallet Status:', walletStatus);

    if (!walletStatus.isReady) {
      console.error('❌ Central wallet is not ready for transfers');
      return;
    }

    // Step 2: Check receiver opt-in status
    console.log('\n📋 Step 2: Checking receiver opt-in status...');
    const optInStatus = await sizTokenTransferService.checkReceiverOptIn(process.env.TEST_RECEIVER_ADDRESS);
    console.log('📊 Opt-in Status:', optInStatus);

    // Step 3: Simulate payment processing
    console.log('\n📋 Step 3: Simulating payment processing...');
    const paymentData = {
      paymentReference: 'test-webhook-' + Date.now(),
      tokenAmount: 100,
      userWalletAddress: process.env.TEST_RECEIVER_ADDRESS,
      network: 'algorand',
      amount: 25.00, // $25 for 100 tokens
      currency: 'USD'
    };

    console.log('📊 Payment Data:', paymentData);

    // Step 4: Check token inventory
    console.log('\n📋 Step 4: Checking token inventory...');
    const inventoryCheck = await paymentDB.checkTokenInventory(paymentData.tokenAmount, paymentData.network);
    console.log('📊 Inventory Check:', inventoryCheck);

    if (!inventoryCheck.available) {
      console.error('❌ Insufficient token inventory');
      return;
    }

    // Step 5: Create payment transaction record
    console.log('\n📋 Step 5: Creating payment transaction record...');
    const paymentTransaction = await paymentDB.createPaymentTransaction({
      payment_reference: paymentData.paymentReference,
      stripe_payment_intent_id: 'test-pi-' + Date.now(),
      subtotal: paymentData.amount,
      processing_fee: 0,
      total_amount: paymentData.amount,
      currency: paymentData.currency,
      token_amount: paymentData.tokenAmount,
      price_per_token: paymentData.amount / paymentData.tokenAmount,
      user_wallet_address: paymentData.userWalletAddress,
      user_email: 'test@example.com',
      payment_status: 'paid',
      token_transfer_status: 'pending',
    });

    console.log('✅ Payment transaction created:', {
      transactionId: paymentTransaction.id,
      paymentReference: paymentTransaction.payment_reference
    });

    // Step 6: Reserve tokens
    console.log('\n📋 Step 6: Reserving tokens...');
    await paymentDB.reserveTokens(paymentData.tokenAmount, paymentTransaction.id);
    console.log('✅ Tokens reserved successfully');

    try {
      // Step 7: Execute token transfer
      console.log('\n📋 Step 7: Executing token transfer...');
      const transferResult = await sizTokenTransferService.transferSizTokensHybrid({
        receiverAddress: paymentData.userWalletAddress,
        amount: paymentData.tokenAmount,
        paymentId: paymentTransaction.id,
      });

      console.log('📊 Transfer Result:', transferResult);

      if (transferResult.success && transferResult.txId) {
        // Step 8: Update database with successful transfer
        console.log('\n📋 Step 8: Updating database with successful transfer...');
        await paymentDB.updateTokenTransferStatus(
          paymentTransaction.id,
          'completed',
          transferResult.txId
        );
        await paymentDB.updatePaymentStatus(paymentTransaction.id, 'completed', 'Tokens transferred successfully');
        
        // Step 9: Update user wallet balance
        console.log('\n📋 Step 9: Updating user wallet balance...');
        await paymentDB.updateUserWalletBalance(
          paymentData.userWalletAddress,
          paymentData.tokenAmount,
          'credit'
        );

        console.log('🎉 SIZ token transfer completed successfully:', {
          paymentReference: paymentData.paymentReference,
          txId: transferResult.txId,
          tokenAmount: paymentData.tokenAmount,
          userWalletAddress: paymentData.userWalletAddress,
          timestamp: new Date().toISOString()
        });

        // Step 10: Record successful token transfer
        console.log('\n📋 Step 10: Recording token transfer...');
        await paymentDB.recordTokenTransfer({
          payment_transaction_id: paymentTransaction.id,
          from_address: process.env.CENTRAL_WALLET_ADDRESS!,
          to_address: paymentData.userWalletAddress,
          asset_id: process.env.SIZ_TOKEN_ASSET_ID!,
          amount: paymentData.tokenAmount,
          transaction_id: transferResult.txId,
          status: 'completed',
        });
        
        console.log('✅ Token transfer recorded successfully');

      } else {
        // Transfer failed
        console.error('❌ SIZ token transfer failed:', transferResult.error);
        
        // Check if this is an opt-in issue
        if (transferResult.requiresOptIn) {
          console.log('⚠️ Transfer failed due to opt-in requirement:', {
            paymentReference: paymentData.paymentReference,
            userWalletAddress: paymentData.userWalletAddress,
            optInInstructions: transferResult.optInInstructions,
          });
          
          // Update status to indicate opt-in is required
          await paymentDB.updateTokenTransferStatus(
            paymentTransaction.id,
            'pending',
            undefined,
            'User wallet not opted into SIZ token'
          );
          await paymentDB.updatePaymentStatus(
            paymentTransaction.id, 
            'processing', 
            'Payment successful but wallet not opted into SIZ token. User must opt-in to receive tokens.'
          );
          
          console.log('📝 Payment status updated to pending_opt_in');
          
        } else {
          // Other transfer failure
          console.error('❌ Other transfer failure, updating status...');
          await paymentDB.updateTokenTransferStatus(
            paymentTransaction.id,
            'failed',
            undefined,
            transferResult.error
          );
          await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', `Token transfer failed: ${transferResult.error}`);
          
          // Release reserved tokens
          console.log('🔓 Releasing reserved tokens...');
          await paymentDB.releaseReservedTokens(paymentTransaction.id);
          console.log('✅ Reserved tokens released');
        }
      }

    } catch (transferError) {
      console.error('❌ Error during token transfer:', {
        error: transferError instanceof Error ? transferError.message : String(transferError),
        stack: transferError instanceof Error ? transferError.stack : undefined,
        paymentId: paymentTransaction.id,
        timestamp: new Date().toISOString()
      });
      
      // Update database with failure
      await paymentDB.updateTokenTransferStatus(
        paymentTransaction.id,
        'failed',
        undefined,
        transferError instanceof Error ? transferError.message : 'Unknown transfer error'
      );
      await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', 'Token transfer error occurred');
      
      // Release reserved tokens
      console.log('🔓 Releasing reserved tokens due to transfer error...');
      await paymentDB.releaseReservedTokens(paymentTransaction.id);
      console.log('✅ Reserved tokens released');
      
      throw transferError;
    }

    console.log('\n✅ Webhook flow test completed successfully!');

  } catch (error) {
    console.error('\n💥 Webhook flow test failed:', error);
  } finally {
    // Close database connection
    await paymentDB.close();
  }
}

// Run the test
testWebhookFlow().catch(console.error);
