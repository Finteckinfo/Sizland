import { Pool } from 'pg';

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL !== 'disable' ? { rejectUnauthorized: false } : false,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Interfaces
export interface PaymentTransaction {
  id: string;
  payment_reference: string;
  stripe_payment_intent_id: string;
  stripe_session_id?: string;
  amount: number;
  currency: string;
  token_amount: number;
  price_per_token: number;
  user_wallet_address: string;
  customer_email?: string;
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
  updated_at: Date;
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
          amount, currency, token_amount, price_per_token, 
          user_wallet_address, customer_email, payment_status, token_transfer_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      
      const values = [
        data.payment_reference,
        data.stripe_payment_intent_id,
        data.stripe_session_id,
        data.amount,
        data.currency,
        data.token_amount,
        data.price_per_token,
        data.user_wallet_address,
        data.customer_email,
        data.payment_status,
        data.token_transfer_status,
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
        ${notes ? ', notes = $3' : ''}
        WHERE id = $2
      `;
      
      const values = notes ? [status, paymentId, notes] : [status, paymentId];
      await this.pool.query(query, values);
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
      const query = `
        UPDATE payment_transactions 
        SET token_transfer_status = $1, updated_at = NOW()
        ${transactionId ? ', token_transaction_id = $3' : ''}
        ${errorMessage ? ', token_transfer_error = $4' : ''}
        WHERE id = $2
      `;
      
      let values: any[] = [status, paymentId];
      if (transactionId) values.push(transactionId);
      if (errorMessage) values.push(errorMessage);
      
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
        INSERT INTO webhook_events (stripe_event_id, event_type)
        VALUES ($1, $2)
        RETURNING *
      `;
      
      const result = await this.pool.query(query, [stripeEventId, eventType]);
      return result.rows[0];
    } catch (error) {
      console.error('Error recording webhook event:', error);
      throw error;
    }
  }

  /**
   * Record token transfer
   */
  async recordTokenTransfer(data: Omit<TokenTransfer, 'id' | 'created_at' | 'updated_at'>): Promise<TokenTransfer> {
    try {
      const query = `
        INSERT INTO token_transfers (
          payment_transaction_id, from_address, to_address, 
          asset_id, amount, transaction_id, status, error_message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const values = [
        data.payment_transaction_id,
        data.from_address,
        data.to_address,
        data.asset_id,
        data.amount,
        data.transaction_id,
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
          COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as successful_payments,
          COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_payments,
          COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN token_amount END), 0) as total_tokens_sold
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
  async checkTokenInventory(amount: number): Promise<{ available: boolean; current_balance: number }> {
    try {
      const query = `
        SELECT available_balance 
        FROM token_inventory 
        WHERE asset_id = $1
      `;
      
      const result = await this.pool.query(query, [process.env.SIZ_TOKEN_ASSET_ID]);
      
      if (result.rows.length === 0) {
        return { available: false, current_balance: 0 };
      }
      
      const currentBalance = result.rows[0].available_balance;
      return {
        available: currentBalance >= amount,
        current_balance: currentBalance,
      };
    } catch (error) {
      console.error('Error checking token inventory:', error);
      throw error;
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
          INSERT INTO user_wallet_balances (wallet_address, asset_id, balance, updated_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (wallet_address, asset_id)
          DO UPDATE SET 
            balance = user_wallet_balances.balance + $3,
            updated_at = NOW()
        `;
        
        await this.pool.query(query, [walletAddress, process.env.SIZ_TOKEN_ASSET_ID, amount]);
      } else {
        const query = `
          UPDATE user_wallet_balances 
          SET 
            balance = balance - $1,
            updated_at = NOW()
          WHERE wallet_address = $2 AND asset_id = $3
        `;
        
        await this.pool.query(query, [amount, walletAddress, process.env.SIZ_TOKEN_ASSET_ID]);
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
}

// Export singleton instance
export const paymentDB = new PaymentDatabase();
