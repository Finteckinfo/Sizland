import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

async function checkWebhookSchema() {
  console.log('🔍 Checking webhook_events table schema...\n');
  
  const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'disable' ? false : { rejectUnauthorized: false },
  };
  
  const pool = new Pool(dbConfig);
  
  try {
    const client = await pool.connect();
    
    // Check the actual schema of webhook_events table
    const schemaCheck = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'webhook_events' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 webhook_events table columns:');
    schemaCheck.rows.forEach((row: any) => {
      console.log(`   ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });
    
    // Check if there's any data in the table
    const dataCheck = await client.query(`
      SELECT COUNT(*) as row_count FROM webhook_events
    `);
    
    console.log(`\n📊 Table has ${dataCheck.rows[0].row_count} rows`);
    
    // Check sample data if any exists
    if (parseInt(dataCheck.rows[0].row_count) > 0) {
      const sampleData = await client.query(`
        SELECT * FROM webhook_events ORDER BY created_at DESC LIMIT 3
      `);
      
      console.log('\n📋 Sample webhook events:');
      sampleData.rows.forEach((row: any, index: number) => {
        console.log(`   Event ${index + 1}:`, {
          id: row.id,
          stripe_event_id: row.stripe_event_id,
          event_type: row.event_type,
          created_at: row.created_at
        });
      });
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error checking webhook schema:', error);
  } finally {
    await pool.end();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  checkWebhookSchema()
    .then(() => {
      console.log('\n✅ Schema check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Schema check failed:', error);
      process.exit(1);
    });
}

export { checkWebhookSchema };
