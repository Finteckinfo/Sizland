import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration with SSL fallback
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'disable' ? false : { rejectUnauthorized: false },
  // Add connection timeout and retry options
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
  // Add fallback for non-SSL connections
  ...(process.env.DB_SSL === 'disable' && {
    ssl: false
  })
};

const pool = new Pool(dbConfig);

// Test connection function
async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

async function setupDatabase() {
  console.log('🔧 Setting up database for SIZ token payments...');
  
  // Test connection first
  if (!(await testConnection())) {
    console.error('❌ Cannot proceed without database connection');
    return;
  }
  
  const client = await pool.connect();
  
  try {
    // Check if tables exist
    const tableCheckQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'payment_transactions', 
        'webhook_events', 
        'token_inventory', 
        'user_wallet_balances', 
        'token_transfers'
      )
    `;
    
    const tableCheck = await client.query(tableCheckQuery);
    const existingTables = tableCheck.rows.map(row => row.table_name);
    
    console.log('📊 Existing tables:', existingTables);
    
    // Check the actual schema of existing tables to understand column names
    if (existingTables.includes('token_inventory')) {
      console.log('🔍 Checking token_inventory table schema...');
      const schemaCheck = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'token_inventory' 
        ORDER BY ordinal_position
      `);
      console.log('📋 token_inventory columns:', schemaCheck.rows);
    }
    
    if (existingTables.includes('payment_transactions')) {
      console.log('🔍 Checking payment_transactions table schema...');
      const schemaCheck = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' 
        ORDER BY ordinal_position
      `);
      console.log('📋 payment_transactions columns:', schemaCheck.rows);
      
      // Check enum values for status columns
      console.log('🔍 Checking enum values for status columns...');
      try {
        const enumCheck = await client.query(`
          SELECT unnest(enum_range(NULL::payment_status_enum)) as payment_status_values
        `);
        console.log('📋 Valid payment_status values:', enumCheck.rows.map(r => r.payment_status_values));
      } catch (e) {
        console.log('⚠️ Could not check payment_status enum values:', e);
      }
      
      try {
        const enumCheck = await client.query(`
          SELECT unnest(enum_range(NULL::token_transfer_status_enum)) as token_transfer_status_values
        `);
        console.log('📋 Valid token_transfer_status values:', enumCheck.rows.map(r => r.token_transfer_status_values));
      } catch (e) {
        console.log('⚠️ Could not check token_transfer_status enum values:', e);
      }
    }
    
    // Create payment_transactions table if it doesn't exist
    if (!existingTables.includes('payment_transactions')) {
      console.log('📝 Creating payment_transactions table...');
      await client.query(`
        CREATE TABLE payment_transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          payment_reference VARCHAR(100) UNIQUE NOT NULL,
          stripe_session_id VARCHAR(255),
          stripe_payment_intent_id VARCHAR(255),
          user_wallet_address VARCHAR(255) NOT NULL,
          user_email VARCHAR(255),
          token_amount INTEGER NOT NULL,
          price_per_token DECIMAL(10,6) NOT NULL,
          subtotal DECIMAL(10,2) NOT NULL,
          processing_fee DECIMAL(10,2) NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'USD',
          payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
          payment_method VARCHAR(100),
          network VARCHAR(50) DEFAULT 'algorand',
          product_type VARCHAR(50) DEFAULT 'siz_token',
          token_transfer_status VARCHAR(50) DEFAULT 'pending',
          token_transfer_tx_id VARCHAR(255),
          token_transfer_error TEXT,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          paid_at TIMESTAMP WITH TIME ZONE,
          tokens_transferred_at TIMESTAMP WITH TIME ZONE
        )
      `);
      
      // Create indexes
      await client.query(`
        CREATE INDEX idx_payment_transactions_payment_reference ON payment_transactions(payment_reference);
        CREATE INDEX idx_payment_transactions_stripe_session_id ON payment_transactions(stripe_session_id);
        CREATE INDEX idx_payment_transactions_stripe_payment_intent_id ON payment_transactions(stripe_payment_intent_id);
        CREATE INDEX idx_payment_transactions_user_wallet_address ON payment_transactions(user_wallet_address);
        CREATE INDEX idx_payment_transactions_payment_status ON payment_transactions(payment_status);
        CREATE INDEX idx_payment_transactions_token_transfer_status ON payment_transactions(token_transfer_status);
      `);
      
      console.log('✅ payment_transactions table created');
    }
    
    // Create webhook_events table if it doesn't exist
    if (!existingTables.includes('webhook_events')) {
      console.log('📝 Creating webhook_events table...');
      await client.query(`
        CREATE TABLE webhook_events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
          payment_reference VARCHAR(100),
          event_type VARCHAR(100) NOT NULL,
          processed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          processed_at TIMESTAMP WITH TIME ZONE
        )
      `);
      
      // Create indexes
      await client.query(`
        CREATE INDEX idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
        CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
        CREATE INDEX idx_webhook_events_payment_reference ON webhook_events(payment_reference);
        CREATE INDEX idx_webhook_events_processed_at ON webhook_events(processed_at);
      `);
      
      console.log('✅ webhook_events table created');
    }
    
    // Create token_inventory table if it doesn't exist
    if (!existingTables.includes('token_inventory')) {
      console.log('📝 Creating token_inventory table...');
      await client.query(`
        CREATE TABLE token_inventory (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          network VARCHAR(50) NOT NULL,
          asset_id BIGINT NOT NULL,
          asset_name VARCHAR(100) NOT NULL,
          total_supply DECIMAL(20,0) NOT NULL,
          available_balance DECIMAL(20,0) NOT NULL,
          reserved_balance DECIMAL(20,0) DEFAULT 0,
          central_wallet_address VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
      
      // Create indexes
      await client.query(`
        CREATE INDEX idx_token_inventory_network_asset_id ON token_inventory(network, asset_id);
        CREATE INDEX idx_token_inventory_central_wallet_address ON token_inventory(central_wallet_address);
      `);
      
      console.log('✅ token_inventory table created');
    }
    
    // Create user_wallet_balances table if it doesn't exist
    if (!existingTables.includes('user_wallet_balances')) {
      console.log('📝 Creating user_wallet_balances table...');
      await client.query(`
        CREATE TABLE user_wallet_balances (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          wallet_address VARCHAR(255) NOT NULL,
          network VARCHAR(50) NOT NULL,
          asset_id BIGINT NOT NULL,
          asset_name VARCHAR(100) NOT NULL,
          balance DECIMAL(20,0) NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(wallet_address, network, asset_id)
        )
      `);
      
      // Create indexes
      await client.query(`
        CREATE INDEX idx_user_wallet_balances_wallet_address ON user_wallet_balances(wallet_address);
        CREATE INDEX idx_user_wallet_balances_network_asset_id ON user_wallet_balances(network, asset_id);
      `);
      
      console.log('✅ user_wallet_balances table created');
    }
    
    // Create token_transfers table if it doesn't exist
    if (!existingTables.includes('token_transfers')) {
      console.log('📝 Creating token_transfers table...');
      await client.query(`
        CREATE TABLE token_transfers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          payment_transaction_id UUID REFERENCES payment_transactions(id),
          from_address VARCHAR(255) NOT NULL,
          to_address VARCHAR(255) NOT NULL,
          asset_id BIGINT NOT NULL,
          asset_name VARCHAR(100) NOT NULL,
          amount DECIMAL(20,0) NOT NULL,
          network VARCHAR(255) NOT NULL,
          transaction_hash VARCHAR(255),
          block_number BIGINT,
          status VARCHAR(50) DEFAULT 'pending',
          error_message TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE
        )
      `);
      
      // Create indexes
      await client.query(`
        CREATE INDEX idx_token_transfers_payment_transaction_id ON token_transfers(payment_transaction_id);
        CREATE INDEX idx_token_transfers_from_address ON token_transfers(from_address);
        CREATE INDEX idx_token_transfers_to_address ON token_transfers(to_address);
        CREATE INDEX idx_token_transfers_transaction_hash ON token_transfers(transaction_hash);
        CREATE INDEX idx_token_transfers_status ON token_transfers(status);
      `);
      
      console.log('✅ token_transfers table created');
    }
    
    // Insert initial SIZ token inventory if it doesn't exist
    const inventoryCheck = await client.query(`
      SELECT COUNT(*) FROM token_inventory WHERE asset_id = $1
    `, [process.env.SIZ_TOKEN_ASSET_ID || '2905622564']);
    
    if (parseInt(inventoryCheck.rows[0].count) === 0) {
      console.log('📝 Inserting initial SIZ token inventory...');
      await client.query(`
        INSERT INTO token_inventory (
          network, asset_id, asset_name, total_supply, available_supply, central_wallet_address
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        'algorand_mainnet',
        process.env.SIZ_TOKEN_ASSET_ID || '2905622564',
        'SIZ Token',
        '1000000000', // 1 billion tokens
        '1000000000', // All available initially
        process.env.CENTRAL_WALLET_ADDRESS || ''
      ]);
      
      console.log('✅ Initial SIZ token inventory inserted');
    } else {
      console.log('📊 SIZ token inventory already exists, checking current balance...');
      const currentInventory = await client.query(`
        SELECT available_supply, reserved_supply FROM token_inventory WHERE asset_id = $1
      `, [process.env.SIZ_TOKEN_ASSET_ID || '2905622564']);
      
      if (currentInventory.rows.length > 0) {
        console.log('📋 Current inventory:', {
          available: currentInventory.rows[0].available_supply,
          reserved: currentInventory.rows[0].reserved_supply
        });
      }
    }
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Database setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    });
}

export { setupDatabase };
