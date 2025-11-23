import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration with enhanced resilience
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'disable' ? false : { rejectUnauthorized: false },
  // Enhanced connection management
  connectionTimeoutMillis: 30000, // Increased from 10s to 30s
  idleTimeoutMillis: 60000, // Increased from 30s to 60s
  max: 10, // Reduced from 20 to prevent overload
  min: 2, // Keep minimum connections alive
  // Retry configuration
  retryDelay: 1000, // 1 second delay between retries
  maxRetries: 3, // Maximum retry attempts
  // Connection health checks
  healthCheck: true,
  // Add fallback for non-SSL connections
  ...(process.env.DB_SSL === 'disable' && {
    ssl: false
  })
};

// Create connection pool
const pool = new Pool(dbConfig);

// Enhanced connection pool event handling
pool.on('connect', (client) => {
  console.log('✅ [DB] Database client connected');
});

pool.on('error', (err) => {
  console.error('❌ [DB] Database pool error:', err);
});

pool.on('acquire', (client) => {
  console.log('🔗 [DB] Client acquired from pool');
});

pool.on('release', (client) => {
  console.log('🔓 [DB] Client released back to pool');
});

// Handle connection timeouts
pool.on('connect', (client) => {
  client.on('error', (err) => {
    console.error('❌ [DB] Individual client error:', err);
  });
  
  client.on('end', () => {
    console.log('🔚 [DB] Client connection ended');
  });
});

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

// Interfaces
export interface PaymentTransaction {
  id: string;
  payment_reference: string;
  stripe_payment_intent_id: string;
  stripe_session_id?: string;
  subtotal: number;
  processing_fee: number;
  total_amount: number;
  currency: string;
  token_amount: number;
  price_per_token: number;
  user_wallet_address: string;
  user_email?: string;
  payment_status: string;
  token_transfer_status: string;
  created_at: Date;
  updated_at: Date;
}

export interface WebhookEvent {
  id: string;
  stripe_event_id: string;
  event_type: string;
  processed: boolean;
  created_at: Date;
}

export interface TokenTransfer {
  id: string;
  payment_transaction_id: string;
  from_address: string;
  to_address: string;
  asset_id: string;
  amount: number;
  transaction_id?: string;
  status: string;
  error_message?: string;
  created_at: Date;
  completed_at?: Date;
}

export class PaymentDatabase {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  /**
   * Check if payment has already been processed (idempotency)
   */
  async checkPaymentIdempotency(paymentReference: string): Promise<{
    found: boolean;
    payment_id: string;
    current_status: string;
  }> {
    try {
      const query = `
        SELECT id, payment_status 
        FROM payment_transactions 
        WHERE payment_reference = $1
      `;
      const result = await this.pool.query(query, [paymentReference]);
      
      if (result.rows.length === 0) {
        return { found: false, payment_id: '', current_status: '' };
      }
      
      return {
        found: true,
        payment_id: result.rows[0].id,
        current_status: result.rows[0].payment_status,
      };
    } catch (error) {
      console.error('Error checking payment idempotency:', error);
      throw error;
    }
  }

  /**
   * Create a new payment transaction record
   */
  async createPaymentTransaction(data: Omit<PaymentTransaction, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentTransaction> {
    try {
      const query = `
        INSERT INTO payment_transactions (
          payment_reference, stripe_payment_intent_id, stripe_session_id, 
          subtotal, processing_fee, total_amount, currency, token_amount, price_per_token, 
          user_wallet_address, user_email, payment_status, token_transfer_status,
          network, product_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `;
      
      const values = [
        data.payment_reference,
        data.stripe_payment_intent_id,
        data.stripe_session_id,
        data.subtotal,
        data.processing_fee,
        data.total_amount,
        data.currency,
        data.token_amount,
        data.price_per_token,
        data.user_wallet_address,
        data.user_email,
        data.payment_status,
        data.token_transfer_status,
        'algorand', // network
        'siz_token' // product_type
      ];
      
      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      throw error;
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(paymentId: string, status: string, notes?: string): Promise<void> {
    try {
      const query = `
        UPDATE payment_transactions 
        SET payment_status = $1, updated_at = NOW()
        WHERE id = $2
      `;
      
      await this.pool.query(query, [status, paymentId]);
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  /**
   * Update token transfer status
   */
  async updateTokenTransferStatus(
    paymentId: string, 
    status: string, 
    transactionId?: string, 
    errorMessage?: string
  ): Promise<void> {
    try {
      let query = `
        UPDATE payment_transactions 
        SET token_transfer_status = $1, updated_at = NOW()
      `;
      
      let values: any[] = [status, paymentId];
      let paramIndex = 3;
      
      if (transactionId) {
        query += `, token_transfer_tx_id = $${paramIndex}`;
        values.push(transactionId);
        paramIndex++;
      }
      
      if (errorMessage) {
        query += `, token_transfer_error = $${paramIndex}`;
        values.push(errorMessage);
      }
      
      query += ` WHERE id = $2`;
      
      await this.pool.query(query, values);
    } catch (error) {
      console.error('Error updating token transfer status:', error);
      throw error;
    }
  }

  /**
   * Record webhook event
   */
  async recordWebhookEvent(stripeEventId: string, eventType: string): Promise<WebhookEvent> {
    try {
      const query = `
        INSERT INTO webhook_events (
          stripe_event_id, event_type, processed
        ) VALUES ($1, $2, $3)
        RETURNING *
      `;
      
      const result = await this.pool.query(query, [
        stripeEventId, 
        eventType,
        eventType === 'processed' ? true : false
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error recording webhook event:', error);
      throw error;
    }
  }

  /**
   * Record token transfer
   */
  async recordTokenTransfer(data: Omit<TokenTransfer, 'id' | 'created_at'>): Promise<TokenTransfer> {
    try {
      const query = `
        INSERT INTO token_transfers (
          payment_transaction_id, from_address, to_address, 
          asset_id, asset_name, amount, network, transaction_hash, status, error_message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      
      const values = [
        data.payment_transaction_id,
        data.from_address,
        data.to_address,
        data.asset_id,
        'SIZ Token', // asset_name
        data.amount,
        'algorand', // network
        data.transaction_id, // transaction_hash
        data.status,
        data.error_message,
      ];
      
      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error recording token transfer:', error);
      throw error;
    }
  }

  /**
   * Get payment transaction by ID
   */
  async getPaymentTransaction(id: string): Promise<PaymentTransaction | null> {
    try {
      const query = 'SELECT * FROM payment_transactions WHERE id = $1';
      const result = await this.pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting payment transaction:', error);
      throw error;
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStatistics(): Promise<{
    total_payments: number;
    successful_payments: number;
    failed_payments: number;
    total_tokens_sold: number;
  }> {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_payments,
          COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as successful_payments,
          COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_payments,
          COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN token_amount END), 0) as total_tokens_sold
        FROM payment_transactions
      `;
      
      const result = await this.pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting payment statistics:', error);
      throw error;
    }
  }

  /**
   * Check token inventory availability
   */
  async checkTokenInventory(amount: number, network: string = 'algorand'): Promise<{ available: boolean; current_balance: number }> {
    try {
      const query = `
        SELECT available_balance 
        FROM token_inventory 
        WHERE asset_id = $1 AND network = $2
      `;
      
      const result = await this.pool.query(query, [process.env.SIZ_TOKEN_ASSET_ID, network]);
      
      if (result.rows.length === 0) {
        console.warn(`No token inventory found for asset ${process.env.SIZ_TOKEN_ASSET_ID} on network ${network}`);
        return { available: false, current_balance: 0 };
      }
      
      const currentBalance = result.rows[0].available_balance;
      const available = currentBalance >= amount;
      
      console.log(`Token inventory check: ${amount} tokens requested, ${currentBalance} available, ${available ? 'SUFFICIENT' : 'INSUFFICIENT'}`);
      
      return { available, current_balance: currentBalance };
    } catch (error) {
      console.error('Error checking token inventory:', error);
      return { available: false, current_balance: 0 };
    }
  }

  /**
   * Reserve tokens for a transaction
   */
  async reserveTokens(amount: number, paymentId: string): Promise<void> {
    try {
      const query = `
        UPDATE token_inventory 
        SET 
          available_balance = available_balance - $1,
          reserved_balance = reserved_balance + $1,
          updated_at = NOW()
        WHERE asset_id = $2
      `;
      
      await this.pool.query(query, [amount, process.env.SIZ_TOKEN_ASSET_ID]);
    } catch (error) {
      console.error('Error reserving tokens:', error);
      throw error;
    }
  }

  /**
   * Release reserved tokens back to available balance
   */
  async releaseReservedTokens(paymentId: string): Promise<void> {
    try {
      // Get the amount that was reserved for this payment
      const getAmountQuery = `
        SELECT token_amount 
        FROM payment_transactions 
        WHERE id = $1
      `;
      
      const amountResult = await this.pool.query(getAmountQuery, [paymentId]);
      if (amountResult.rows.length === 0) return;
      
      const amount = amountResult.rows[0].token_amount;
      
      const query = `
        UPDATE token_inventory 
        SET 
          available_balance = available_balance + $1,
          reserved_balance = reserved_balance - $1,
          updated_at = NOW()
        WHERE asset_id = $2
      `;
      
      await this.pool.query(query, [amount, process.env.SIZ_TOKEN_ASSET_ID]);
    } catch (error) {
      console.error('Error releasing reserved tokens:', error);
      throw error;
    }
  }

  /**
   * Update user wallet balance
   */
  async updateUserWalletBalance(
    walletAddress: string, 
    amount: number, 
    operation: 'credit' | 'debit'
  ): Promise<void> {
    try {
      if (operation === 'credit') {
        const query = `
          INSERT INTO user_wallet_balances (user_wallet_address, network, asset_id, asset_name, balance, last_updated)
          VALUES ($1, $2, $3, $4, $5, NOW())
          ON CONFLICT (user_wallet_address, network, asset_id)
          DO UPDATE SET 
            balance = user_wallet_balances.balance + $5,
            last_updated = NOW()
        `;
        
        await this.pool.query(query, [
          walletAddress, 
          'algorand', 
          process.env.SIZ_TOKEN_ASSET_ID, 
          'SIZ Token',
          amount
        ]);
      } else {
        const query = `
          UPDATE user_wallet_balances 
          SET 
            balance = balance - $1,
            last_updated = NOW()
          WHERE user_wallet_address = $2 AND network = $3 AND asset_id = $4
        `;
        
        await this.pool.query(query, [
          amount, 
          walletAddress, 
          'algorand',
          process.env.SIZ_TOKEN_ASSET_ID
        ]);
      }
    } catch (error) {
      console.error('Error updating user wallet balance:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Delete test payment transaction (for testing purposes only)
   */
  async deleteTestPaymentTransaction(paymentId: string): Promise<void> {
    try {
      await this.pool.query('DELETE FROM payment_transactions WHERE id = $1', [paymentId]);
    } catch (error) {
      console.error('Error deleting test payment transaction:', error);
      throw error;
    }
  }

  /**
   * Get webhook event statistics
   */
  async getWebhookEventStatistics(): Promise<{
    total_events: number;
    processed_events: number;
    unprocessed_events: number;
    recent_event_types: string[];
  }> {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_events,
          COUNT(CASE WHEN processing_status = 'processed' THEN 1 END) as processed_events,
          COUNT(CASE WHEN processing_status != 'processed' THEN 1 END) as unprocessed_events
        FROM webhook_events
      `;
      
      const result = await this.pool.query(query);
      
      // Get recent event types
      const eventTypesQuery = `
        SELECT event_type, COUNT(*) as count
        FROM webhook_events 
        GROUP BY event_type
        ORDER BY MAX(processed_at) DESC 
        LIMIT 5
      `;
      
      const eventTypesResult = await this.pool.query(eventTypesQuery);
      const recentEventTypes = eventTypesResult.rows.map((row: any) => row.event_type);
      
      return {
        ...result.rows[0],
        recent_event_types: recentEventTypes
      };
    } catch (error) {
      console.error('Error getting webhook event statistics:', error);
      throw error;
    }
  }

  /**
   * Get webhook event by Stripe event ID for idempotency
   */
  async getWebhookEventByStripeId(stripeEventId: string): Promise<WebhookEvent | null> {
    try {
      const query = `
        SELECT 
          id, stripe_event_id, event_type, processed, created_at
        FROM webhook_events 
        WHERE stripe_event_id = $1
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      
      const result = await this.pool.query(query, [stripeEventId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting webhook event by Stripe ID:', error);
      throw error;
    }
  }

  /**
   * Get recent webhook events
   */
  async getRecentWebhookEvents(limit: number = 10): Promise<any[]> {
    try {
      const query = `
        SELECT 
          id, stripe_event_id, event_type, processed, created_at
        FROM webhook_events 
        ORDER BY created_at DESC 
        LIMIT $1
      `;
      
      const result = await this.pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting recent webhook events:', error);
      throw error;
    }
  }

  /**
   * Get recent payment transactions
   */
  async getRecentPaymentTransactions(limit: number = 10): Promise<any[]> {
    try {
      const query = `
        SELECT 
          id, payment_reference, payment_status, token_transfer_status, 
          token_amount, total_amount, user_wallet_address, created_at
        FROM payment_transactions 
        ORDER BY created_at DESC 
        LIMIT $1
      `;
      
      const result = await this.pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting recent payment transactions:', error);
      throw error;
    }
  }

  /**
   * Get ALL payments for a specific wallet address (any status)
   */
  async getAllPaymentsByWallet(walletAddress: string): Promise<PaymentTransaction[]> {
    try {
      const query = `
        SELECT * FROM payment_transactions 
        WHERE user_wallet_address = $1 
        ORDER BY created_at DESC
      `;
      
      const result = await this.pool.query(query, [walletAddress]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching all payments by wallet:', error);
      throw error;
    }
  }

  /**
   * Get user wallet balance
   */
  async getUserWalletBalance(walletAddress: string): Promise<{
    balance: number;
    assetName: string;
    lastUpdated: Date;
  } | null> {
    try {
      const query = `
        SELECT balance, asset_name, last_updated
        FROM user_wallet_balances 
        WHERE user_wallet_address = $1 AND network = 'algorand' AND asset_id = $2
      `;
      
      const result = await this.pool.query(query, [
        walletAddress, 
        process.env.SIZ_TOKEN_ASSET_ID
      ]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return {
        balance: result.rows[0].balance,
        assetName: result.rows[0].asset_name,
        lastUpdated: result.rows[0].last_updated
      };
    } catch (error) {
      console.error('Error getting user wallet balance:', error);
      throw error;
    }
  }

  /**
   * Get pending payments for a specific wallet address
   * Updated to include ARC-0059 inbox statuses and direct transfers
   * Enhanced with connection retry logic
   */
  async getPendingPaymentsByWallet(walletAddress: string): Promise<{
    id: string;
    tokenAmount: number;
    paymentStatus: string;
    tokenTransferStatus: string;
    createdAt: string;
  }[]> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔍 [DB] Attempt ${attempt}/${maxRetries} to fetch pending payments for wallet: ${walletAddress}`);
        
        const query = `
          SELECT 
            id,
            token_amount as "tokenAmount",
            payment_status as "paymentStatus",
            token_transfer_status as "tokenTransferStatus",
            created_at as "createdAt"
          FROM payment_transactions 
          WHERE user_wallet_address = $1 
          AND payment_status IN ('paid', 'processing', 'monitoring', 'completed')
          AND token_transfer_status IN ('pending', 'failed', 'in_inbox', 'ready_to_claim', 'direct_transferred')
          ORDER BY created_at DESC
        `;
        
        const result = await this.pool.query(query, [walletAddress]);
        
        console.log(`✅ [DB] Successfully fetched ${result.rows.length} pending payments on attempt ${attempt}`);
        
        return result.rows.map(row => ({
          id: row.id,
          tokenAmount: row.tokenAmount,
          paymentStatus: row.paymentStatus,
          tokenTransferStatus: row.tokenTransferStatus,
          createdAt: row.createdAt
        }));
        
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ [DB] Attempt ${attempt}/${maxRetries} failed:`, {
          error: error instanceof Error ? error.message : String(error),
          code: (error as any)?.code,
          errno: (error as any)?.errno,
          attempt,
          maxRetries
        });

        // If this is a connection error and we have retries left, wait and retry
        if (attempt < maxRetries && this.isConnectionError(error)) {
          const delay = attempt * 1000; // Exponential backoff: 1s, 2s, 3s
          console.log(`⏳ [DB] Waiting ${delay}ms before retry...`);
          await this.sleep(delay);
          continue;
        }
        
        // If we're out of retries or it's not a connection error, break
        break;
      }
    }

    // If we get here, all retries failed
    console.error(`💥 [DB] All ${maxRetries} attempts failed for wallet: ${walletAddress}`);
    throw lastError || new Error('Database connection failed after all retry attempts');
  }

  /**
   * Check if an error is a connection-related error that should trigger a retry
   */
  private isConnectionError(error: any): boolean {
    const connectionErrorCodes = [
      'ECONNRESET',
      'ECONNREFUSED', 
      'ENOTFOUND',
      'ETIMEDOUT',
      'EHOSTUNREACH',
      'ENETUNREACH'
    ];
    
    return connectionErrorCodes.includes(error?.code) || 
           error?.code === 'ECONNRESET' ||
           error?.errno === -104;
  }

  /**
   * Utility function to sleep for a given number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if a transfer has already been processed for a specific payment
   * This prevents duplicate transfers when webhooks are retried
   * FIXED: Now payment-specific, not wallet-specific - allows multiple transfers to same wallet
   */
  async checkTransferIdempotency(transferIdempotencyKey: string): Promise<{
    found: boolean;
    status?: string;
    txId?: string;
    timestamp?: string;
  }> {
    try {
      const query = `
        SELECT 
          token_transfer_status as status,
          token_transfer_tx_id as "txId",
          updated_at as timestamp
        FROM payment_transactions 
        WHERE payment_reference = $1
        AND token_transfer_status IN ('direct_transferred', 'in_inbox', 'ready_to_claim', 'claimed')
        ORDER BY updated_at DESC
        LIMIT 1
      `;
      
      const result = await this.pool.query(query, [transferIdempotencyKey]);
      
      if (result.rows.length > 0) {
        return {
          found: true,
          status: result.rows[0].status,
          txId: result.rows[0].txId,
          timestamp: result.rows[0].timestamp
        };
      }
      
      return { found: false };
    } catch (error) {
      console.error('Error checking transfer idempotency:', error);
      return { found: false };
    }
  }
}

// Export singleton instance
export const paymentDB = new PaymentDatabase();
