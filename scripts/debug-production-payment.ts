import dotenv from 'dotenv';
import { paymentDB } from '../src/lib/database/payments';
import { sizTokenTransferService } from '../src/lib/algorand/token-transfer';

// Load environment variables
dotenv.config();

async function debugProductionPayment() {
  console.log('🔍 Debugging Production Payment Flow...\n');
  
  try {
    // Test 1: Database Connection and Tables
    console.log('📊 Test 1: Database Connection and Tables');
    console.log('=====================================');
    
    try {
      // Test database connection
      const inventoryCheck = await paymentDB.checkTokenInventory(1);
      console.log('✅ Database connected successfully');
      
      // Check if payment_transactions table exists and has data
      const paymentStats = await paymentDB.getPaymentStatistics();
      console.log('📊 Payment statistics:', paymentStats);
      
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return;
    }
    
    // Test 2: Environment Variables Check
    console.log('\n📊 Test 2: Environment Variables Check');
    console.log('=====================================');
    
    const requiredEnvVars = [
      'DATABASE_URL',
      'STRIPE_WEBHOOK_SECRET',
      'SIZ_TOKEN_ASSET_ID',
      'CENTRAL_WALLET_ADDRESS',
      'CENTRAL_WALLET_MNEMONIC',
      'ARC59_APP_ID',
      'UNFREEZE_ACCOUNT_ADDRESS',
      'UNFREEZE_ACCOUNT_MNEMONIC'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      console.log('✅ All required environment variables are set');
      console.log('   SIZ_TOKEN_ASSET_ID:', process.env.SIZ_TOKEN_ASSET_ID);
      console.log('   ARC59_APP_ID:', process.env.ARC59_APP_ID);
      console.log('   CENTRAL_WALLET_ADDRESS:', process.env.CENTRAL_WALLET_ADDRESS);
    } else {
      console.error('❌ Missing environment variables:', missingVars);
      return;
    }
    
    // Test 3: Central Wallet Status
    console.log('\n📊 Test 3: Central Wallet Status');
    console.log('=====================================');
    
    try {
      const walletStatus = await sizTokenTransferService.checkCentralWalletStatus();
      console.log('📊 Central wallet status:', {
        isReady: walletStatus.isReady,
        algoBalance: Number(walletStatus.algoBalance) / 1e6,
        sizBalance: walletStatus.sizBalance,
        isOptedIntoSiz: walletStatus.isOptedIntoSiz,
        canOptIntoSiz: walletStatus.canOptIntoSiz,
        details: walletStatus.details
      });
      
      if (walletStatus.isReady) {
        console.log('✅ Central wallet is ready for operations');
      } else {
        console.log('❌ Central wallet is not ready:', walletStatus.details);
        return;
      }
      
    } catch (error) {
      console.error('❌ Central wallet status check failed:', error);
      return;
    }
    
    // Test 4: ARC-0059 Client Status
    console.log('\n📊 Test 4: ARC-0059 Client Status');
    console.log('=====================================');
    
    try {
      const arc59Client = (sizTokenTransferService as any).arc59Client;
      if (arc59Client) {
        console.log('✅ ARC-0059 client initialized successfully');
        console.log('   App ID:', process.env.ARC59_APP_ID);
        console.log('   Central Wallet:', sizTokenTransferService.getDerivedCentralWalletAddress());
      } else {
        console.log('❌ ARC-0059 client not initialized');
        return;
      }
    } catch (error) {
      console.error('❌ ARC-0059 client check failed:', error);
      return;
    }
    
    // Test 5: Simulate Complete Payment Flow
    console.log('\n📊 Test 5: Simulate Complete Payment Flow');
    console.log('=====================================');
    
    try {
      const testPaymentData = {
        payment_reference: `debug-test-${Date.now()}`,
        stripe_payment_intent_id: `pi_debug_${Date.now()}`,
        stripe_session_id: `cs_debug_${Date.now()}`,
        subtotal: 25.00,
        processing_fee: 0.00,
        total_amount: 25.00,
        currency: 'USD',
        token_amount: 100,
        price_per_token: 0.25,
        user_wallet_address: '2DAEOSKQGXJKIEWMDENGMEN7PW2LWRW2LDWVHPY4O4DO4CCGLKMFOA2JFI',
        user_email: 'debug@example.com',
        payment_status: 'pending',
        token_transfer_status: 'pending',
      };
      
      console.log('📝 Creating test payment transaction...');
      const paymentTransaction = await paymentDB.createPaymentTransaction(testPaymentData);
      console.log('✅ Test payment transaction created:', {
        id: paymentTransaction.id,
        paymentReference: paymentTransaction.payment_reference
      });
      
      // Test token inventory check
      console.log('🔍 Checking token inventory...');
      const inventoryCheck = await paymentDB.checkTokenInventory(testPaymentData.token_amount);
      console.log('📊 Inventory check result:', inventoryCheck);
      
      if (!inventoryCheck.available) {
        console.log('❌ Insufficient token inventory');
        await paymentDB.deleteTestPaymentTransaction(paymentTransaction.id);
        return;
      }
      
      // Test token reservation
      console.log('🔒 Reserving tokens...');
      await paymentDB.reserveTokens(testPaymentData.token_amount, paymentTransaction.id);
      console.log('✅ Tokens reserved successfully');
      
      // Test token transfer
      console.log('🚀 Testing token transfer...');
      const transferResult = await sizTokenTransferService.transferSizTokens({
        receiverAddress: testPaymentData.user_wallet_address,
        amount: testPaymentData.token_amount,
        paymentId: paymentTransaction.id,
      });
      
      console.log('📊 Transfer result:', transferResult);
      
      if (transferResult.success && transferResult.txId) {
        console.log('✅ Token transfer successful!');
        
        // Update database with successful transfer
        await paymentDB.updateTokenTransferStatus(
          paymentTransaction.id,
          'completed',
          transferResult.txId
        );
        await paymentDB.updatePaymentStatus(paymentTransaction.id, 'paid', 'Debug test successful');
        
        // Update user wallet balance
        await paymentDB.updateUserWalletBalance(
          testPaymentData.user_wallet_address,
          testPaymentData.token_amount,
          'credit'
        );
        
        // Record token transfer
        await paymentDB.recordTokenTransfer({
          payment_transaction_id: paymentTransaction.id,
          from_address: process.env.CENTRAL_WALLET_ADDRESS!,
          to_address: testPaymentData.user_wallet_address,
          asset_id: process.env.SIZ_TOKEN_ASSET_ID!,
          amount: testPaymentData.token_amount,
          transaction_id: transferResult.txId,
          status: 'completed',
        });
        
        console.log('✅ All database updates completed successfully');
        
      } else {
        console.error('❌ Token transfer failed:', transferResult.error);
      }
      
      // Clean up test transaction
      console.log('🧹 Cleaning up test transaction...');
      await paymentDB.deleteTestPaymentTransaction(paymentTransaction.id);
      console.log('✅ Test transaction cleaned up');
      
    } catch (error) {
      console.error('❌ Payment flow simulation failed:', error);
    }
    
    // Test 6: Database Tables Status
    console.log('\n📊 Test 6: Database Tables Status');
    console.log('=====================================');
    
    try {
      // Check if tables have data
      const paymentStats = await paymentDB.getPaymentStatistics();
      console.log('📊 Payment transactions table:', paymentStats);
      
      // Check token inventory
      const inventoryCheck = await paymentDB.checkTokenInventory(1);
      console.log('📊 Token inventory table:', inventoryCheck);
      
    } catch (error) {
      console.error('❌ Database tables status check failed:', error);
    }
    
    console.log('\n🎉 Production Payment Debug Completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run debug if this script is executed directly
if (require.main === module) {
  debugProductionPayment()
    .then(() => {
      console.log('\n✅ Debug completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Debug failed:', error);
      process.exit(1);
    });
}

export { debugProductionPayment };
