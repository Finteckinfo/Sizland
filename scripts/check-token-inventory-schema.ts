import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

async function checkTokenInventorySchema() {
  console.log('🔍 Checking token_inventory table schema...\n');
  
  const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'disable' ? false : { rejectUnauthorized: false },
  };
  
  const pool = new Pool(dbConfig);
  
  try {
    const client = await pool.connect();
    
    // Check the actual schema of token_inventory table
    const schemaCheck = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'token_inventory' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 token_inventory table columns:');
    schemaCheck.rows.forEach((row: any) => {
      console.log(`   ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });
    
    // Check if there's any data in the table
    const dataCheck = await client.query(`
      SELECT COUNT(*) as row_count FROM token_inventory
    `);
    
    console.log(`\n📊 Table has ${dataCheck.rows[0].row_count} rows`);
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error checking token_inventory schema:', error);
  } finally {
    await pool.end();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  checkTokenInventorySchema()
    .then(() => {
      console.log('\n✅ Schema check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Schema check failed:', error);
      process.exit(1);
    });
}

export { checkTokenInventorySchema };
