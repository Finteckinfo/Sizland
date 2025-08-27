#!/usr/bin/env tsx

/**
 * Fix webhook_events table schema mismatch
 */

import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

async function fixWebhookTable() {
  console.log('🔧 Fixing webhook_events table schema...\n');

  const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'disable' ? false : { rejectUnauthorized: false },
  };

  const pool = new Pool(dbConfig);

  try {
    const client = await pool.connect();
    console.log('✅ Database client connected');

    // Drop the existing webhook_events table
    console.log('\n📋 Dropping existing webhook_events table...');
    await client.query('DROP TABLE IF EXISTS webhook_events CASCADE');
    console.log('✅ Table dropped');

    // Create the correct webhook_events table
    console.log('\n📋 Creating correct webhook_events table...');
    await client.query(`
      CREATE TABLE webhook_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Correct table created');

    // Create index
    console.log('\n📋 Creating index...');
    await client.query(`
      CREATE INDEX idx_webhook_events_stripe_event_id 
      ON webhook_events(stripe_event_id);
    `);
    await client.query(`
      CREATE INDEX idx_webhook_events_event_type 
      ON webhook_events(event_type);
    `);
    console.log('✅ Indexes created');

    // Verify the table structure
    console.log('\n🔍 Verifying table structure...');
    const tableCheck = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'webhook_events' 
      ORDER BY ordinal_position
    `);
    
    console.log('   Webhook Events Table Structure:');
    tableCheck.rows.forEach((col: any) => {
      console.log(`     ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Test inserting a webhook event
    console.log('\n🧪 Testing webhook event insertion...');
    const testEvent = await client.query(`
      INSERT INTO webhook_events (stripe_event_id, event_type)
      VALUES ($1, $2)
      RETURNING *
    `, ['evt_test_' + Date.now(), 'checkout.session.completed']);
    
    console.log('✅ Test webhook event inserted:', testEvent.rows[0].id);

    // Clean up test event
    await client.query('DELETE FROM webhook_events WHERE id = $1', [testEvent.rows[0].id]);
    console.log('✅ Test event cleaned up');

    console.log('\n🎉 Webhook table schema fixed successfully!');
    console.log('   The table now matches the interface expected by the code.');

  } catch (error) {
    console.error('❌ Failed to fix webhook table:', error);
  } finally {
    await pool.end();
  }
}

// Run the fix
fixWebhookTable().catch(console.error);
