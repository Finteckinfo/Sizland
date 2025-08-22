import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

async function checkAllTableSchemas() {
  console.log('🔍 Checking All Table Schemas...\n');
  
  const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'disable' ? false : { rejectUnauthorized: false },
  };
  
  const pool = new Pool(dbConfig);
  
  try {
    const client = await pool.connect();
    
    const tables = [
      'payment_transactions',
      'webhook_events', 
      'token_inventory',
      'user_wallet_balances',
      'token_transfers'
    ];
    
    for (const tableName of tables) {
      console.log(`📋 ${tableName.toUpperCase()} table columns:`);
      console.log('='.repeat(50));
      
      try {
        const schemaCheck = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position
        `, [tableName]);
        
        if (schemaCheck.rows.length === 0) {
          console.log(`   Table '${tableName}' does not exist`);
        } else {
          schemaCheck.rows.forEach((row: any) => {
            console.log(`   ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
          });
        }
        
        // Check row count
        const dataCheck = await client.query(`SELECT COUNT(*) as row_count FROM ${tableName}`);
        console.log(`\n📊 Table has ${dataCheck.rows[0].row_count} rows\n`);
        
      } catch (error) {
        console.log(`   Error checking ${tableName}: ${error instanceof Error ? error.message : String(error)}\n`);
      }
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error checking table schemas:', error);
  } finally {
    await pool.end();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  checkAllTableSchemas()
    .then(() => {
      console.log('\n✅ All schema checks completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Schema checks failed:', error);
      process.exit(1);
    });
}

export { checkAllTableSchemas };
