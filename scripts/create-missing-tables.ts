#!/usr/bin/env tsx

/**
 * Create missing database tables for the webhook flow
 */

import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

async function createMissingTables() {
  console.log('🔧 Creating missing database tables...\n');

  const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'disable' ? false : { rejectUnauthorized: false },
  };

  const pool = new Pool(dbConfig);

  try {
    const client = await pool.connect();
    console.log('✅ Database client connected');

    // Create payment_transactions table
    console.log('\n📋 Creating payment_transactions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
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
      );
    `);
    console.log('✅ payment_transactions table created');

    // Create webhook_events table
    console.log('\n📋 Creating webhook_events table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS webhook_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ webhook_events table created');

    // Create user_wallet_balances table
    console.log('\n📋 Creating user_wallet_balances table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_wallet_balances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_wallet_address VARCHAR(255) NOT NULL,
        network VARCHAR(50) NOT NULL,
        asset_id BIGINT NOT NULL,
        asset_name VARCHAR(100) NOT NULL,
        balance DECIMAL(20,0) NOT NULL DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_wallet_address, network, asset_id)
      );
    `);
    console.log('✅ user_wallet_balances table created');

    // Create token_transfers table
    console.log('\n📋 Creating token_transfers table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS token_transfers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        payment_transaction_id UUID REFERENCES payment_transactions(id),
        from_address VARCHAR(255) NOT NULL,
        to_address VARCHAR(255) NOT NULL,
        asset_id BIGINT NOT NULL,
        asset_name VARCHAR(100) NOT NULL,
        amount DECIMAL(20,0) NOT NULL,
        network VARCHAR(50) NOT NULL,
        transaction_hash VARCHAR(255),
        block_number BIGINT,
        status VARCHAR(50) DEFAULT 'pending',
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE
      );
    `);
    console.log('✅ token_transfers table created');

    // Create indexes for performance
    console.log('\n📋 Creating indexes...');
    
    // Payment transactions indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_reference 
      ON payment_transactions(payment_reference);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_wallet_address 
      ON payment_transactions(user_wallet_address);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_status 
      ON payment_transactions(payment_status);
    `);
    
    // Webhook events indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id 
      ON webhook_events(stripe_event_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type 
      ON webhook_events(event_type);
    `);
    
    // User wallet balances indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_wallet_balances_user_wallet_address 
      ON user_wallet_balances(user_wallet_address);
    `);
    
    // Token transfers indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_token_transfers_payment_transaction_id 
      ON token_transfers(payment_transaction_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_token_transfers_transaction_hash 
      ON token_transfers(transaction_hash);
    `);
    
    console.log('✅ Indexes created');

    // Verify tables exist
    console.log('\n🔍 Verifying tables...');
    const tables = ['payment_transactions', 'webhook_events', 'user_wallet_balances', 'token_transfers'];
    
    for (const tableName of tables) {
      const result = await client.query(`
        SELECT COUNT(*) as count FROM ${tableName}
      `);
      console.log(`   ${tableName}: ${result.rows[0].count} rows`);
    }

    client.release();
    console.log('\n🎉 All missing tables created successfully!');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

// Run the function
createMissingTables().catch(console.error);
