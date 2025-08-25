import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'disable' ? false : { rejectUnauthorized: false },
};

const pool = new Pool(dbConfig);

async function fixDatabaseSchema() {
  console.log('🔧 Fixing database schema...\n');
  
  try {
    const client = await pool.connect();
    
    // 1. Fix asset_id column type in token_inventory
    console.log('📝 Step 1: Fixing asset_id column type in token_inventory...');
    try {
      await client.query(`
        ALTER TABLE token_inventory 
        ALTER COLUMN asset_id TYPE VARCHAR(50)
      `);
      console.log('✅ asset_id column type changed to VARCHAR(50)');
    } catch (error: any) {
      if (error.message.includes('already exists') || error.message.includes('does not exist')) {
        console.log('ℹ️ asset_id column already correct or table does not exist');
      } else {
        console.error('❌ Error fixing asset_id column:', error.message);
      }
    }

    // 2. Fix column names in token_inventory
    console.log('\n📝 Step 2: Fixing column names in token_inventory...');
    try {
      // Check if available_supply exists and rename to available_balance
      const columnCheck = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'token_inventory' AND column_name = 'available_supply'
      `);
      
      if (columnCheck.rows.length > 0) {
        await client.query(`
          ALTER TABLE token_inventory 
          RENAME COLUMN available_supply TO available_balance
        `);
        console.log('✅ available_supply renamed to available_balance');
      } else {
        console.log('ℹ️ available_balance column already exists');
      }
      
      // Check if reserved_supply exists and rename to reserved_balance
      const reservedCheck = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'token_inventory' AND column_name = 'reserved_supply'
      `);
      
      if (reservedCheck.rows.length > 0) {
        await client.query(`
          ALTER TABLE token_inventory 
          RENAME COLUMN reserved_supply TO reserved_balance
        `);
        console.log('✅ reserved_supply renamed to reserved_balance');
      } else {
        console.log('ℹ️ reserved_balance column already exists');
      }
      
    } catch (error: any) {
      console.error('❌ Error fixing column names:', error.message);
    }

    // 3. Add missing enum types
    console.log('\n📝 Step 3: Adding missing enum types...');
    try {
      // Create payment_status_enum if it doesn't exist
      await client.query(`
        DO $$ BEGIN
          CREATE TYPE payment_status_enum AS ENUM (
            'pending', 'processing', 'paid', 'failed', 'canceled', 'refunded'
          );
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
      console.log('✅ payment_status_enum created/verified');

      // Create token_transfer_status_enum if it doesn't exist
      await client.query(`
        DO $$ BEGIN
          CREATE TYPE token_transfer_status_enum AS ENUM (
            'pending', 'processing', 'completed', 'failed', 'requires_opt_in'
          );
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
      console.log('✅ token_transfer_status_enum created/verified');

    } catch (error: any) {
      console.error('❌ Error creating enum types:', error.message);
    }

    // 4. Add missing columns to payment_transactions
    console.log('\n📝 Step 4: Adding missing columns to payment_transactions...');
    try {
      // Add network column if it doesn't exist
      await client.query(`
        ALTER TABLE payment_transactions 
        ADD COLUMN IF NOT EXISTS network VARCHAR(50) DEFAULT 'algorand'
      `);
      console.log('✅ network column added/verified');

      // Add product_type column if it doesn't exist
      await client.query(`
        ALTER TABLE payment_transactions 
        ADD COLUMN IF NOT EXISTS product_type VARCHAR(50) DEFAULT 'siz_token'
      `);
      console.log('✅ product_type column added/verified');

    } catch (error: any) {
      console.error('❌ Error adding columns to payment_transactions:', error.message);
    }

    // 5. Add missing columns to token_transfers
    console.log('\n📝 Step 5: Adding missing columns to token_transfers...');
    try {
      // Add transaction_id column if it doesn't exist
      await client.query(`
        ALTER TABLE token_transfers 
        ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255)
      `);
      console.log('✅ transaction_id column added/verified');

      // Add error_message column if it doesn't exist
      await client.query(`
        ALTER TABLE token_transfers 
        ADD COLUMN IF NOT EXISTS error_message TEXT
      `);
      console.log('✅ error_message column added/verified');

    } catch (error: any) {
      console.error('❌ Error adding columns to token_transfers:', error.message);
    }

    client.release();
    console.log('\n🎉 Database schema fixes completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error fixing database schema:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  fixDatabaseSchema()
    .then(() => {
      console.log('\n✅ Schema fix completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Schema fix failed:', error);
      process.exit(1);
    });
}

export { fixDatabaseSchema };
