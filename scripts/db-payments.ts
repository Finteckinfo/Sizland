import { Pool, PoolClient } from 'pg';

// Database connection configuration
// Prefer a single DATABASE_URL (common for cloud providers like Supabase, Neon, Railway, Render, Heroku)
// Fallback to individual parameters when DATABASE_URL is not provided
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        // Many cloud Postgres providers require SSL; disable cert verification by default
        process.env.DB_SSL === 'disable'
          ? false
          : { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'sizland',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

// Payment transaction interface
export interface PaymentTransaction {
  id: string;
  payment_reference: string;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  user_wallet_address: string;
  user_email?: string;
  token_amount: number;
  price_per_token: number;
  subtotal: number;
  processing_fee: number;
  total_amount: number;
  currency: string;
  payment_status: 'pending' | 'processing' | 'paid' | 'failed' | 'canceled' | 'expired';
  payment_method?: string;
  network: string;
  product_type: string;
  token_transfer_status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  token_transfer_tx_id?: string;
  token_transfer_error?: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
  paid_at?: Date;
  tokens_transferred_at?: Date;
}

// Webhook event interface
export interface WebhookEvent {
  id: string;
  stripe_event_id: string;
  event_type: string;
  payment_reference?: string;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  event_data: any;
  processed_at: Date;
  processing_status: string;
  error_message?: string;
}

// Token transfer interface
export interface TokenTransfer {
  id: string;
  payment_transaction_id: string;
  from_address: string;
  to_address: string;
  asset_id: number;
  asset_name: string;
  amount: number;
  network: string;
  transaction_hash?: string;
  block_number?: number;
  status: string;
  error_message?: string;
  created_at: Date;
  completed_at?: Date;
}

// Database operations class
export class PaymentDatabase {
  private client: PoolClient | null = null;

  // Get database connection
  private async getClient(): Promise<PoolClient> {
    if (!this.client) {
      this.client = await pool.connect();
    }
    return this.client;
  }

  // Release database connection
  private async releaseClient(): Promise<void> {
    if (this.client) {
      this.client.release();
      this.client = null;
    }
  }

  // Check payment idempotency
  async checkPaymentIdempotency(
    paymentReference: string,
    stripeSessionId?: string,
    stripePaymentIntentId?: string
  ): Promise<{ exists: boolean; paymentId?: string; currentStatus?: string }> {
    const client = await this.getClient();
    
    try {
      const result = await client.query(
        `SELECT found, payment_id, current_status FROM check_payment_idempotency($1, $2, $3)`,
        [paymentReference, stripeSessionId, stripePaymentIntentId]
      );
      
      if (result.rows.length > 0 && result.rows[0].found) {
        return {
          exists: true,
          paymentId: result.rows[0].payment_id,
          currentStatus: result.rows[0].current_status,
        };
      }
      
      return { exists: false };
    } catch (error) {
      console.error('Error checking payment idempotency:', error);
      throw error;
    }
  }

  // Create new payment transaction
  async createPaymentTransaction(transaction: Omit<PaymentTransaction, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const client = await this.getClient();
    
    try {
      const result = await client.query(
        `INSERT INTO payment_transactions (
          payment_reference, stripe_session_id, stripe_payment_intent_id, user_wallet_address,
          user_email, token_amount, price_per_token, subtotal, processing_fee, total_amount,
          currency, payment_status, payment_method, network, product_type, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id`,
        [
          transaction.payment_reference,
          transaction.stripe_session_id,
          transaction.stripe_payment_intent_id,
          transaction.user_wallet_address,
          transaction.user_email,
          transaction.token_amount,
          transaction.price_per_token,
          transaction.subtotal,
          transaction.processing_fee,
          transaction.total_amount,
          transaction.currency,
          transaction.payment_status,
          transaction.payment_method,
          transaction.network,
          transaction.product_type,
          transaction.metadata ? JSON.stringify(transaction.metadata) : null,
        ]
      );
      
      return result.rows[0].id;
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      throw error;
    }
  }

  // Update payment status
  async updatePaymentStatus(
    paymentId: string,
    status: PaymentTransaction['payment_status'],
    additionalData?: Partial<PaymentTransaction>
  ): Promise<void> {
    const client = await this.getClient();
    
    try {
      const updateFields: string[] = ['payment_status = $2', 'updated_at = NOW()'];
      const values: any[] = [paymentId, status];
      let paramIndex = 3;

      if (additionalData?.paid_at) {
        updateFields.push(`paid_at = $${paramIndex++}`);
        values.push(additionalData.paid_at);
      }

      if (additionalData?.payment_method) {
        updateFields.push(`payment_method = $${paramIndex++}`);
        values.push(additionalData.payment_method);
      }

      if (additionalData?.metadata) {
        updateFields.push(`metadata = $${paramIndex++}`);
        values.push(JSON.stringify(additionalData.metadata));
      }

      const query = `UPDATE payment_transactions SET ${updateFields.join(', ')} WHERE id = $1`;
      await client.query(query, values);
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Update token transfer status
  async updateTokenTransferStatus(
    paymentId: string,
    status: PaymentTransaction['token_transfer_status'],
    transactionHash?: string,
    errorMessage?: string
  ): Promise<void> {
    const client = await this.getClient();
    
    try {
      const updateFields: string[] = [
        'token_transfer_status = $2',
        'updated_at = NOW()',
        'tokens_transferred_at = CASE WHEN $2 = \'completed\' THEN NOW() ELSE tokens_transferred_at END'
      ];
      const values: any[] = [paymentId, status];
      let paramIndex = 3;

      if (transactionHash) {
        updateFields.push(`token_transfer_tx_id = $${paramIndex++}`);
        values.push(transactionHash);
      }

      if (errorMessage) {
        updateFields.push(`token_transfer_error = $${paramIndex++}`);
        values.push(errorMessage);
      }

      const query = `UPDATE payment_transactions SET ${updateFields.join(', ')} WHERE id = $1`;
      await client.query(query, values);
    } catch (error) {
      console.error('Error updating token transfer status:', error);
      throw error;
    }
  }

  // Record webhook event
  async recordWebhookEvent(event: Omit<WebhookEvent, 'id' | 'processed_at'>): Promise<string> {
    const client = await this.getClient();
    
    try {
      const result = await client.query(
        `INSERT INTO webhook_events (
          stripe_event_id, event_type, payment_reference, stripe_session_id,
          stripe_payment_intent_id, event_data, processing_status, error_message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`,
        [
          event.stripe_event_id,
          event.event_type,
          event.payment_reference,
          event.stripe_session_id,
          event.stripe_payment_intent_id,
          JSON.stringify(event.event_data),
          event.processing_status,
          event.error_message,
        ]
      );
      
      return result.rows[0].id;
    } catch (error) {
      console.error('Error recording webhook event:', error);
      throw error;
    }
  }

  // Record token transfer
  async recordTokenTransfer(transfer: Omit<TokenTransfer, 'id' | 'created_at'>): Promise<string> {
    const client = await this.getClient();
    
    try {
      const result = await client.query(
        `INSERT INTO token_transfers (
          payment_transaction_id, from_address, to_address, asset_id, asset_name,
          amount, network, transaction_hash, block_number, status, error_message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id`,
        [
          transfer.payment_transaction_id,
          transfer.from_address,
          transfer.to_address,
          transfer.asset_id,
          transfer.asset_name,
          transfer.amount,
          transfer.network,
          transfer.transaction_hash,
          transfer.block_number,
          transfer.status,
          transfer.error_message,
        ]
      );
      
      return result.rows[0].id;
    } catch (error) {
      console.error('Error recording token transfer:', error);
      throw error;
    }
  }

  // Get payment transaction by reference
  async getPaymentTransaction(paymentReference: string): Promise<PaymentTransaction | null> {
    const client = await this.getClient();
    
    try {
      const result = await client.query(
        `SELECT * FROM payment_transactions WHERE payment_reference = $1`,
        [paymentReference]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting payment transaction:', error);
      throw error;
    }
  }

  // Get payment statistics
  async getPaymentStatistics(
    startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: Date = new Date()
  ): Promise<{
    totalTransactions: number;
    totalTokensSold: number;
    totalRevenue: number;
    successfulTransfers: number;
    failedTransfers: number;
  }> {
    const client = await this.getClient();
    
    try {
      const result = await client.query(
        `SELECT * FROM get_payment_statistics($1, $2)`,
        [startDate, endDate]
      );
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          totalTransactions: parseInt(row.total_transactions) || 0,
          totalTokensSold: parseInt(row.total_tokens_sold) || 0,
          totalRevenue: parseFloat(row.total_revenue) || 0,
          successfulTransfers: parseInt(row.successful_transfers) || 0,
          failedTransfers: parseInt(row.failed_transfers) || 0,
        };
      }
      
      return {
        totalTransactions: 0,
        totalTokensSold: 0,
        totalRevenue: 0,
        successfulTransfers: 0,
        failedTransfers: 0,
      };
    } catch (error) {
      console.error('Error getting payment statistics:', error);
      throw error;
    }
  }

  // Check token inventory
  async checkTokenInventory(network: string, assetId: number): Promise<{
    availableSupply: number;
    reservedSupply: number;
    centralWalletAddress: string;
  } | null> {
    const client = await this.getClient();
    
    try {
      const result = await client.query(
        `SELECT available_supply, reserved_supply, central_wallet_address 
         FROM token_inventory 
         WHERE network = $1 AND asset_id = $2`,
        [network, assetId]
      );
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          availableSupply: parseFloat(row.available_supply),
          reservedSupply: parseFloat(row.reserved_supply),
          centralWalletAddress: row.central_wallet_address,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error checking token inventory:', error);
      throw error;
    }
  }

  // Reserve tokens for transfer
  async reserveTokens(network: string, assetId: number, amount: number): Promise<boolean> {
    const client = await this.getClient();
    
    try {
      const result = await client.query(
        `UPDATE token_inventory 
         SET available_supply = available_supply - $3, 
             reserved_supply = reserved_supply + $3,
             last_updated = NOW()
         WHERE network = $1 AND asset_id = $2 AND available_supply >= $3
         RETURNING id`,
        [network, assetId, amount]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error reserving tokens:', error);
      throw error;
    }
  }

  // Release reserved tokens
  async releaseReservedTokens(network: string, assetId: number, amount: number): Promise<void> {
    const client = await this.getClient();
    
    try {
      await client.query(
        `UPDATE token_inventory 
         SET available_supply = available_supply + $3, 
             reserved_supply = reserved_supply - $3,
             last_updated = NOW()
         WHERE network = $1 AND asset_id = $2`,
        [network, assetId, amount]
      );
    } catch (error) {
      console.error('Error releasing reserved tokens:', error);
      throw error;
    }
  }

  // Update user wallet balance
  async updateUserWalletBalance(
    userWalletAddress: string,
    network: string,
    assetId: number,
    assetName: string,
    balance: number
  ): Promise<void> {
    const client = await this.getClient();
    
    try {
      await client.query(
        `INSERT INTO user_wallet_balances (user_wallet_address, network, asset_id, asset_name, balance, last_updated)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (user_wallet_address, network, asset_id)
         DO UPDATE SET balance = $5, last_updated = NOW()`,
        [userWalletAddress, network, assetId, assetName, balance]
      );
    } catch (error) {
      console.error('Error updating user wallet balance:', error);
      throw error;
    }
  }

  // Close database connections
  async close(): Promise<void> {
    await this.releaseClient();
    await pool.end();
  }
}

// Export singleton instance
export const paymentDB = new PaymentDatabase();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connections...');
  await paymentDB.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing database connections...');
  await paymentDB.close();
  process.exit(0);
});
