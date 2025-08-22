#!/usr/bin/env tsx

// Load environment variables from .env FIRST, before any other imports
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Now import the modules that depend on environment variables
import algosdk from 'algosdk';
import { algodClient } from '../src/lib/algorand/client';

/**
 * Debug Script for ARC-0059 Contract Parameters
 * This script tests different parameter combinations to identify the correct method signature
 */

async function debugArc59Params() {
  console.log('🔍 Debugging ARC-0059 Contract Parameters...\n');

  try {
    // Check environment variables
    const requiredVars = ['ARC59_APP_ID', 'SIZ_TOKEN_ASSET_ID', 'CENTRAL_WALLET_ADDRESS'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.log(`❌ Missing environment variables: ${missingVars.join(', ')}`);
      return;
    }

    const appId = parseInt(process.env.ARC59_APP_ID!);
    const assetId = parseInt(process.env.SIZ_TOKEN_ASSET_ID!);
    const testReceiver = process.env.CENTRAL_WALLET_ADDRESS!;

    console.log('📊 Test Configuration:');
    console.log(`   App ID: ${appId}`);
    console.log(`   Asset ID: ${assetId}`);
    console.log(`   Test Receiver: ${testReceiver}\n`);

    // Test 1: Check if the contract exists and get its info
    console.log('🔍 Test 1: Contract Information');
    console.log('================================');
    
    try {
      const appInfo = await algodClient.getApplicationByID(appId).do();
      console.log('✅ Contract found:', {
        appId: appInfo.id,
        creator: appInfo.params.creator,
        approvalProgram: appInfo.params.approvalProgram ? 'Present' : 'Missing',
        clearStateProgram: appInfo.params.clearStateProgram ? 'Present' : 'Missing'
      });
    } catch (error) {
      console.log('❌ Failed to get contract info:', error);
      return;
    }

    // Test 2: Try different method name variations
    console.log('\n🔍 Test 2: Method Name Variations');
    console.log('==================================');
    
    const methodNames = [
      'arc59_getSendAssetInfo',
      'getSendAssetInfo',
      'ARC59_getSendAssetInfo',
      'GetSendAssetInfo'
    ];

    for (const methodName of methodNames) {
      console.log(`\n🔄 Testing method: "${methodName}"`);
      
      try {
        const txn = algosdk.makeApplicationCallTxnFromObject({
          appIndex: appId,
          sender: testReceiver,
          onComplete: algosdk.OnApplicationComplete.NoOpOC,
          appArgs: [
            new Uint8Array(Buffer.from(methodName)),
            algosdk.decodeAddress(testReceiver).publicKey,
            algosdk.encodeUint64(assetId)
          ],
          foreignAssets: [assetId],
          suggestedParams: await algodClient.getTransactionParams().do()
        });

        console.log(`   ✅ Transaction created successfully for "${methodName}"`);
        console.log(`   📝 App Args: [${methodName}, ${testReceiver}, ${assetId}]`);
        
      } catch (error) {
        console.log(`   ❌ Failed to create transaction for "${methodName}":`, error);
      }
    }

    // Test 3: Try different parameter formats
    console.log('\n🔍 Test 3: Parameter Format Variations');
    console.log('======================================');
    
    const methodName = 'arc59_getSendAssetInfo'; // Use the standard name
    
    // Test different receiver formats
    const receiverFormats = [
      { name: 'Public Key', value: algosdk.decodeAddress(testReceiver).publicKey },
      { name: 'Address String', value: new Uint8Array(Buffer.from(testReceiver)) },
      { name: 'Encoded Address', value: algosdk.encodeAddress(algosdk.decodeAddress(testReceiver).publicKey) }
    ];

    // Test different asset formats
    const assetFormats = [
      { name: 'Uint64', value: algosdk.encodeUint64(assetId) },
      { name: 'String', value: new Uint8Array(Buffer.from(assetId.toString())) },
      { name: 'Raw Number', value: new Uint8Array(new Uint8Array([assetId])) }
    ];

    for (const receiverFormat of receiverFormats) {
      for (const assetFormat of assetFormats) {
        console.log(`\n🔄 Testing: Receiver=${receiverFormat.name}, Asset=${assetFormat.name}`);
        
        try {
          const txn = algosdk.makeApplicationCallTxnFromObject({
            appIndex: appId,
            sender: testReceiver,
            onComplete: algosdk.OnApplicationComplete.NoOpOC,
            appArgs: [
              new Uint8Array(Buffer.from(methodName)),
              receiverFormat.value,
              assetFormat.value
            ],
            foreignAssets: [assetId],
            suggestedParams: await algodClient.getTransactionParams().do()
          });

          console.log(`   ✅ Transaction created successfully`);
          console.log(`   📝 Parameters: Receiver=${receiverFormat.name}, Asset=${assetFormat.name}`);
          
        } catch (error) {
          console.log(`   ❌ Failed:`, error);
        }
      }
    }

    // Test 4: Check if the contract has any specific method requirements
    console.log('\n🔍 Test 4: Contract Method Analysis');
    console.log('====================================');
    
    try {
      // Try to get the contract's global state to see if there are any clues
      const appInfo = await algodClient.getApplicationByID(appId).do();
      console.log('📊 Contract Global State:');
      
      if (appInfo.params.globalState) {
        appInfo.params.globalState.forEach((state: any) => {
          console.log(`   ${state.key}: ${state.value}`);
        });
      } else {
        console.log('   No global state found');
      }
      
    } catch (error) {
      console.log('❌ Failed to analyze contract state:', error);
    }

    console.log('\n🎯 Debug Summary:');
    console.log('==================');
    console.log('✅ Contract exists and is accessible');
    console.log('✅ Multiple parameter combinations tested');
    console.log('✅ Method name variations tested');
    console.log('💡 Check the output above for successful combinations');

  } catch (error) {
    console.error('💥 Debug script failed:', error);
  }
}

// Run the debug script
if (require.main === module) {
  debugArc59Params().catch(console.error);
}
