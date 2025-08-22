import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

async function checkTableSchema() {
  console.log('🔍 Checking user_wallet_balances table schema...\n');
  
  const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'disable' ? false : { rejectUnauthorized: false },
  };
  
  const pool = new Pool(dbConfig);
  
  try {
    const client = await pool.connect();
    
    // Check the actual schema of user_wallet_balances table
    const schemaCheck = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_wallet_balances' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 user_wallet_balances table columns:');
    schemaCheck.rows.forEach((row: any) => {
      console.log(`   ${row.column_name}: ${row.data_type}`);
    });
    
    // Check if there's any data in the table
    const dataCheck = await client.query(`
      SELECT COUNT(*) as row_count FROM user_wallet_balances
    `);
    
    console.log(`\n📊 Table has ${dataCheck.rows[0].row_count} rows`);
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error checking table schema:', error);
  } finally {
    await pool.end();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  checkTableSchema()
    .then(() => {
      console.log('\n✅ Schema check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Schema check failed:', error);
      process.exit(1);
    });
}

export { checkTableSchema };
