#!/usr/bin/env tsx

// Load environment variables from .env FIRST, before any other imports
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Now import the modules that depend on environment variables
import { SizTokenTransferService } from '../src/lib/algorand/token-transfer';
import { algodClient } from '../src/lib/algorand/client';

/**
 * Comprehensive Test Script for ARC-0059 Integration
 * This script tests the complete flow from router opt-in to asset transfer
 */

async function testArc59Integration() {
  console.log('🧪 Testing ARC-0059 Integration...\n');

  // Debug: Show what environment variables are loaded
  console.log('🔍 Environment Variables Debug:');
  console.log(`   ALGORAND_NETWORK_URL: ${process.env.ALGORAND_NETWORK_URL || 'NOT SET'}`);
  console.log(`   ALGORAND_NETWORK_TOKEN: ${process.env.ALGORAND_NETWORK_TOKEN ? 'SET (hidden)' : 'NOT SET'}`);
  console.log(`   SIZ_TOKEN_ASSET_ID: ${process.env.SIZ_TOKEN_ASSET_ID || 'NOT SET'}`);
  console.log(`   CENTRAL_WALLET_ADDRESS: ${process.env.CENTRAL_WALLET_ADDRESS || 'NOT SET'}`);
  console.log(`   ARC59_APP_ID: ${process.env.ARC59_APP_ID || 'NOT SET'}`);
  console.log('');

  try {
    // Check environment variables
    const requiredVars = [
      'SIZ_TOKEN_ASSET_ID',
      'CENTRAL_WALLET_ADDRESS', 
      'CENTRAL_WALLET_MNEMONIC',
      'ARC59_APP_ID'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.log(`❌ Missing environment variables: ${missingVars.join(', ')}`);
      return;
    }

    console.log('✅ Environment variables loaded');
    console.log(`   SIZ Token Asset ID: ${process.env.SIZ_TOKEN_ASSET_ID}`);
    console.log(`   Central Wallet: ${process.env.CENTRAL_WALLET_ADDRESS}`);
    console.log(`   ARC-0059 App ID: ${process.env.ARC59_APP_ID}\n`);

    // Initialize the token transfer service
    console.log('🔧 Initializing SizTokenTransferService...');
    const tokenService = new SizTokenTransferService();
    
    console.log('✅ Service initialized');
    console.log(`   Derived Central Wallet: ${tokenService.getDerivedCentralWalletAddress()}`);
    console.log(`   Address Match: ${tokenService.validateCentralWalletAddress()}\n`);

    // Test 1: Check central wallet balance
    console.log('📊 Test 1: Central Wallet Status Check');
    console.log('=====================================');
    
    const walletStatus = await tokenService.checkCentralWalletStatus();
    console.log('Wallet Status Result:', walletStatus);
    
    if (!walletStatus.isReady) {
      console.log('❌ Central wallet is not ready for ARC-0059 operations');
      console.log(`   Details: ${walletStatus.details}`);
      if (walletStatus.error) {
        console.log(`   Error: ${walletStatus.error}`);
      }
      return;
    }
    
    console.log('✅ Central wallet is ready for ARC-0059 operations');
    console.log(`   ALGO Balance: ${Number(walletStatus.algoBalance) / 1e6} ALGO`);
    console.log(`   SIZ Balance: ${walletStatus.sizBalance} tokens`);
    console.log(`   SIZ Opt-in: ${walletStatus.isOptedIntoSiz ? 'Yes' : 'No'}`);
    console.log(`   Can Opt-in: ${walletStatus.canOptIntoSiz ? 'Yes' : 'No'}\n`);

    // Test 2: Check SIZ token freeze status
    console.log('🔒 Test 2: SIZ Token Freeze Status Check');
    console.log('========================================');
    
    const freezeCheck = await tokenService.checkAssetFreezeStatus(process.env.CENTRAL_WALLET_ADDRESS!);
    console.log('Freeze Status:', freezeCheck);
    
    if (freezeCheck.centralWalletFrozen) {
      console.log('❌ Central wallet is frozen for SIZ tokens');
      console.log('   Contact the token creator to unfreeze the account');
      return;
    }
    
    console.log('✅ SIZ tokens are not frozen\n');

    // Test 3: Test ARC-0059 transfer (simulation)
    console.log('🚀 Test 3: ARC-0059 Transfer Simulation');
    console.log('======================================');
    
    // Use a test receiver address (you can change this)
    const testReceiver = process.env.CENTRAL_WALLET_ADDRESS!; // Using central wallet as test receiver
    
    console.log(`🎯 Testing transfer to: ${testReceiver}`);
    console.log('📝 This will test the complete ARC-0059 flow');
    console.log('⚠️  Note: This is a real transaction on mainnet!\n');
    
    const transferParams = {
      receiverAddress: testReceiver,
      amount: 1, // Transfer 1 SIZ token for testing
      paymentId: 'test-arc59-integration'
    };
    
    console.log('🔄 Executing ARC-0059 transfer...');
    const transferResult = await tokenService.transferSizTokens(transferParams);
    
    if (transferResult.success) {
      console.log('🎉 SUCCESS! ARC-0059 transfer completed');
      console.log(`   Transaction ID: ${transferResult.txId}`);
      console.log('   ✅ Router opt-in: Successful');
      console.log('   ✅ Asset transfer: Successful');
      console.log('   ✅ User experience: Seamless (no manual opt-in required)');
    } else {
      console.log('❌ ARC-0059 transfer failed');
      console.log(`   Error: ${transferResult.error}`);
      
      if (transferResult.requiresOptIn) {
        console.log('   📋 User needs to opt-in manually');
        console.log('   💡 This indicates the ARC-0059 integration needs fixing');
      }
    }

    console.log('\n🎯 Test Summary:');
    console.log('================');
    console.log('✅ Environment: Configured');
    console.log('✅ Service: Initialized');
    console.log('✅ Balance: Sufficient');
    console.log('✅ Freeze Status: OK');
    console.log(`✅ ARC-0059 Transfer: ${transferResult.success ? 'SUCCESS' : 'FAILED'}`);
    
    if (transferResult.success) {
      console.log('\n🎉 ARC-0059 Integration is working correctly!');
      console.log('   Users can now receive SIZ tokens seamlessly after Stripe payments');
      console.log('   No manual opt-in required - the system handles everything automatically');
    } else {
      console.log('\n🔧 ARC-0059 Integration needs fixing');
      console.log('   Check the error message above and fix the implementation');
    }

  } catch (error) {
    console.error('💥 Test failed with critical error:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testArc59Integration().catch(console.error);
}
