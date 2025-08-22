import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

function checkDatabaseUrls() {
  console.log('🔍 Database URL Analysis...\n');

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL is not set in .env file');
    return;
  }

  console.log('📋 Current DATABASE_URL:', databaseUrl);
  console.log('');

  // Check if it's a Railway internal URL
  if (databaseUrl.includes('railway.internal')) {
    console.log('🚨 ISSUE DETECTED: Railway Internal URL');
    console.log('');
    console.log('❌ Problem: postgres.railway.internal is only accessible from Railway deployment');
    console.log('❌ This URL will NOT work for local development or external access');
    console.log('');
    console.log('🔧 Solution: Use Railway External URL instead');
    console.log('');
    console.log('📋 Steps to fix:');
    console.log('1. Go to Railway Dashboard: https://railway.app/dashboard');
    console.log('2. Select your PostgreSQL database');
    console.log('3. Go to "Connect" tab');
    console.log('4. Copy "External Connection String" (not internal)');
    console.log('5. Update your .env file with the external URL');
    console.log('');
    console.log('🔍 The external URL should look like:');
    console.log('   postgresql://username:password@containers-us-west-XX.railway.app:port/database');
    console.log('');
    console.log('⚠️  Note: Internal URLs (railway.internal) only work when deployed on Railway');
    console.log('⚠️  External URLs work from anywhere but may have connection limits');
  } else if (databaseUrl.includes('railway.app')) {
    console.log('✅ Railway External URL detected');
    console.log('✅ This should work for both local development and production');
  } else if (databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')) {
    console.log('✅ Local database URL detected');
    console.log('✅ This is for local development only');
  } else {
    console.log('📋 Custom database URL detected');
    console.log('✅ This should work if the database is accessible');
  }

  console.log('');
  console.log('🔧 Additional Checks:');
  console.log('1. Verify database is running and accessible');
  console.log('2. Check firewall/security settings');
  console.log('3. Ensure database credentials are correct');
  console.log('4. Test connection with a database client');
}

// Run if this script is executed directly
if (require.main === module) {
  checkDatabaseUrls();
}

export { checkDatabaseUrls };
