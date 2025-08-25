import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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

/**
 * Initialize token inventory with environment variables
 */
async function initializeTokenInventory() {
  console.log('🔧 Initializing token inventory...');
  
  try {
    const assetId = process.env.SIZ_TOKEN_ASSET_ID;
    const centralWalletAddress = process.env.CENTRAL_WALLET_ADDRESS;
    const rawNetwork = (process.env.ALGORAND_NETWORK || '').toLowerCase();
    const network = rawNetwork.includes('main') ? 'algorand' : rawNetwork.includes('test') ? 'algorand_testnet' : 'algorand';

    // Ensure token_inventory table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS token_inventory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        network VARCHAR(50) NOT NULL,
        asset_id VARCHAR(50) NOT NULL,
        asset_name VARCHAR(100) NOT NULL,
        total_supply DECIMAL(20,0) NOT NULL,
        available_balance DECIMAL(20,0) NOT NULL,
        reserved_balance DECIMAL(20,0) DEFAULT 0,
        central_wallet_address VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(network, asset_id)
      );
    `);

    if (!assetId || !centralWalletAddress) {
      console.error('❌ Missing required environment variables:');
      console.error('   SIZ_TOKEN_ASSET_ID:', assetId ? 'SET' : 'MISSING');
      console.error('   CENTRAL_WALLET_ADDRESS:', centralWalletAddress ? 'SET' : 'MISSING');
      return false;
    }
    
    console.log('📋 Environment variables:');
    console.log(`   Asset ID: ${assetId}`);
    console.log(`   Central Wallet: ${centralWalletAddress}`);
    console.log(`   Network: ${network}`);
    
    // Check if token inventory already exists
    const existingCheck = await pool.query(`
      SELECT id FROM token_inventory 
      WHERE asset_id = $1 AND network = $2
    `, [assetId, network]);
    
    if (existingCheck.rows.length > 0) {
      console.log('✅ Token inventory already exists, updating...');
      
      // Update existing inventory
      await pool.query(`
        UPDATE token_inventory 
        SET 
          asset_name = 'SIZ Token',
          total_supply = 1000000,
          available_balance = 1000000,
          reserved_balance = 0,
          central_wallet_address = $1,
          updated_at = NOW()
        WHERE asset_id = $2 AND network = $3
      `, [centralWalletAddress, assetId, network]);
      
      console.log('✅ Token inventory updated successfully');
    } else {
      console.log('📝 Creating new token inventory...');
      
      // Create new token inventory
      await pool.query(`
        INSERT INTO token_inventory (
          network, asset_id, asset_name, total_supply, 
          available_balance, reserved_balance, central_wallet_address
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [network, assetId, 'SIZ Token', 1000000, 1000000, 0, centralWalletAddress]);
      
      console.log('✅ Token inventory created successfully');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error initializing token inventory:', error);
    return false;
  }
}

/**
 * Create database schema
 */
async function createSchema(client: any) {
  console.log('📝 Creating database schema...');
  
  try {
    // Create schema from SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split SQL into individual statements and execute
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
        } catch (error) {
          // Ignore errors for statements that might already exist
          if (!error.message.includes('already exists') && !error.message.includes('duplicate key')) {
            console.warn('⚠️ Statement execution warning:', error.message);
          }
        }
      }
    }
    
    console.log('✅ Database schema created successfully');
    
  } catch (error) {
    console.error('❌ Error creating schema:', error);
    throw error;
  }
}

async function setupDatabase() {
  console.log('🚀 Setting up database...\n');
  
  try {
    // Test database connection
    const client = await pool.connect();
    console.log('✅ Database connection successful\n');
    
    // Create schema
    await createSchema(client);
    
    // Initialize token inventory
    await initializeTokenInventory();
    
    client.release();
    console.log('\n🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error);
    process.exit(1);
  } finally {
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
