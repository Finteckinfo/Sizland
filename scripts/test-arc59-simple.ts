const dotenv = require('dotenv');

dotenv.config();

async function testArc59BasicSetup() {
  console.log('🧪 Testing ARC-0059 Basic Setup...\n');

  try {
    // Check environment variables
    console.log('📋 Environment Variables Check:');
    
    if (process.env.ARC59_APP_ID) {
      console.log(`✅ ARC59_APP_ID: ${process.env.ARC59_APP_ID}`);
    } else {
      console.log('❌ ARC59_APP_ID: Not set');
    }

    if (process.env.ALGORAND_NETWORK_URL) {
      console.log(`✅ ALGORAND_NETWORK_URL: ${process.env.ALGORAND_NETWORK_URL}`);
    } else {
      console.log('❌ ALGORAND_NETWORK_URL: Not set');
    }

    if (process.env.SIZ_TOKEN_ASSET_ID) {
      console.log(`✅ SIZ_TOKEN_ASSET_ID: ${process.env.SIZ_TOKEN_ASSET_ID}`);
    } else {
      console.log('❌ SIZ_TOKEN_ASSET_ID: Not set');
    }

    if (process.env.CENTRAL_WALLET_MNEMONIC) {
      console.log(`✅ CENTRAL_WALLET_MNEMONIC: Set (${process.env.CENTRAL_WALLET_MNEMONIC.length} characters)`);
    } else {
      console.log('❌ CENTRAL_WALLET_MNEMONIC: Not set');
    }

    if (process.env.CENTRAL_WALLET_ADDRESS) {
      console.log(`✅ CENTRAL_WALLET_ADDRESS: ${process.env.CENTRAL_WALLET_ADDRESS}`);
    } else {
      console.log('❌ CENTRAL_WALLET_ADDRESS: Not set');
    }

    // Check canonical contract IDs
    console.log('\n📱 Canonical ARC-0059 Contract IDs:');
    console.log(`   Testnet: 643020148`);
    console.log(`   Mainnet: 2449590623`);

    // Check if we're using canonical contracts
    if (process.env.ARC59_APP_ID === '643020148') {
      console.log('✅ Using Testnet Canonical Contract');
    } else if (process.env.ARC59_APP_ID === '2449590623') {
      console.log('✅ Using Mainnet Canonical Contract');
    } else if (process.env.ARC59_APP_ID) {
      console.log('⚠️  Using Custom Contract ID (not canonical)');
    } else {
      console.log('❌ No Contract ID Set');
    }

    // Check network configuration
    console.log('\n🌐 Network Configuration:');
    if (process.env.ALGORAND_NETWORK_URL?.includes('testnet')) {
      console.log('✅ Configured for Testnet');
    } else if (process.env.ALGORAND_NETWORK_URL?.includes('mainnet')) {
      console.log('✅ Configured for Mainnet');
    } else {
      console.log('⚠️  Network not clearly identified');
    }

    // Summary
    console.log('\n📊 Setup Summary:');
    const requiredVars = [
      'ARC59_APP_ID',
      'ALGORAND_NETWORK_URL', 
      'SIZ_TOKEN_ASSET_ID',
      'CENTRAL_WALLET_MNEMONIC',
      'CENTRAL_WALLET_ADDRESS'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      console.log('🎉 All required environment variables are set!');
      console.log('✅ ARC-0059 integration is ready for testing');
    } else {
      console.log(`⚠️  Missing ${missingVars.length} environment variables:`);
      missingVars.forEach(varName => console.log(`   - ${varName}`));
      console.log('\n💡 Set these variables in your .env.local file to enable full testing');
    }

    console.log('\n✨ Basic setup test completed!');

  } catch (error) {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  testArc59BasicSetup()
    .then(() => {
      console.log('\n🎯 Next Steps:');
      console.log('1. Set missing environment variables in .env.local');
      console.log('2. Run: npm run test:arc59');
      console.log('3. Or run: npx ts-node scripts/test-arc59.ts');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Testing failed:', error);
      process.exit(1);
    });
}

module.exports = { testArc59BasicSetup };
