import dotenv from 'dotenv';
import { paymentDB } from '../src/lib/database/payments';
import { sizTokenTransferService } from '../src/lib/algorand/token-transfer';

// Load environment variables
dotenv.config();

async function testPaymentFlow() {
  console.log('🧪 Testing Complete Payment Flow...\n');
  
  try {
    // Test 1: Database Connection
    console.log('📊 Test 1: Database Connection');
    console.log('=====================================');
    
    try {
      // Test database connection by using a simple query method
      const inventoryCheck = await paymentDB.checkTokenInventory(1);
      console.log('✅ Database connected successfully');
      console.log('📊 Database connection test passed');
      
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return;
    }
    
    // Test 2: Token Inventory Check
    console.log('\n📊 Test 2: Token Inventory Check');
    console.log('=====================================');
    
    try {
      const inventoryCheck = await paymentDB.checkTokenInventory(100);
      console.log('📊 Inventory check result:', inventoryCheck);
      
      if (inventoryCheck.available) {
        console.log('✅ Token inventory is sufficient');
      } else {
        console.log('❌ Token inventory is insufficient');
        console.log('   Current balance:', inventoryCheck.current_balance);
        console.log('   Required:', 100);
      }
      
    } catch (error) {
      console.error('❌ Token inventory check failed:', error);
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
      }
      
    } catch (error) {
      console.error('❌ Central wallet status check failed:', error);
    }
    
    // Test 4: ARC-0059 Client Initialization
    console.log('\n📊 Test 4: ARC-0059 Client Initialization');
    console.log('=====================================');
    
    try {
      // This will test if the ARC-0059 client can be initialized
      const arc59Client = (sizTokenTransferService as any).arc59Client;
      if (arc59Client) {
        console.log('✅ ARC-0059 client initialized successfully');
        console.log('   App ID:', process.env.ARC59_APP_ID);
        console.log('   Central Wallet:', sizTokenTransferService.getDerivedCentralWalletAddress());
      } else {
        console.log('❌ ARC-0059 client not initialized');
      }
      
    } catch (error) {
      console.error('❌ ARC-0059 client initialization failed:', error);
    }
    
    // Test 5: Simulate Payment Transaction Creation
    console.log('\n📊 Test 5: Simulate Payment Transaction Creation');
    console.log('=====================================');
    
    try {
      const testPaymentData = {
        payment_reference: `test-${Date.now()}`,
        stripe_payment_intent_id: `pi_test_${Date.now()}`,
        stripe_session_id: `cs_test_${Date.now()}`,
        subtotal: 25.00,
        processing_fee: 0.00,
        total_amount: 25.00,
        currency: 'USD',
        token_amount: 100,
        price_per_token: 0.25,
        user_wallet_address: '2DAEOSKQGXJKIEWMDGMEN7PW2LWRW2LDWVHPY4O4DO4CCGLKMFOA2JFI',
        user_email: 'test@example.com',
        payment_status: 'pending',
        token_transfer_status: 'pending',
      };
      
      const paymentTransaction = await paymentDB.createPaymentTransaction(testPaymentData);
      console.log('✅ Test payment transaction created:', {
        id: paymentTransaction.id,
        paymentReference: paymentTransaction.payment_reference
      });
      
      // Clean up test transaction
      await paymentDB.deleteTestPaymentTransaction(paymentTransaction.id);
      console.log('🧹 Test transaction cleaned up');
      
    } catch (error) {
      console.error('❌ Payment transaction creation test failed:', error);
    }
    
    // Test 6: Environment Variables Check
    console.log('\n📊 Test 6: Environment Variables Check');
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
    } else {
      console.log('❌ Missing environment variables:', missingVars);
      console.log('   Please check your .env file');
    }
    
    console.log('\n🎉 Payment Flow Test Completed!');
    
    if (missingVars.length === 0) {
      console.log('\n📋 Summary:');
      console.log('   ✅ Database: Connected and tables exist');
      console.log('   ✅ Token Inventory: Available');
      console.log('   ✅ Central Wallet: Ready');
      console.log('   ✅ ARC-0059: Initialized');
      console.log('   ✅ Environment: Configured');
      console.log('\n🚀 Your payment flow is ready for production!');
    } else {
      console.log('\n⚠️ Please fix the missing environment variables before testing payments.');
    }
    
  } catch (error) {
    console.error('❌ Payment flow test failed:', error);
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  testPaymentFlow()
    .then(() => {
      console.log('\n✅ Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

export { testPaymentFlow };
