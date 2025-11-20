import 'server-only';
import axios from 'axios';

// Check for Paystack secret key with better error messaging
if (!process.env.PAYSTACK_SECRET_KEY) {
  console.warn('⚠️  PAYSTACK_SECRET_KEY is not set in environment variables');
  console.warn('📝 Please create a .env.local file with your Paystack configuration');
  console.warn('💡 See PAYSTACK_INTEGRATION.md for setup instructions');
  console.warn('🔧 Using placeholder key for build - Paystack features will not work until configured');
}

// Use placeholder for development if key is missing, otherwise use the actual key
const paystackKey = process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder_for_development_build';

// Paystack API configuration
export const paystackConfig = {
  secretKey: paystackKey,
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder',
  baseURL: process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co',
  webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || '',
};

// Create axios instance for Paystack API
export const paystackAPI = axios.create({
  baseURL: paystackConfig.baseURL,
  headers: {
    'Authorization': `Bearer ${paystackConfig.secretKey}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Paystack API methods
export class PaystackService {
  /**
   * Initialize a transaction
   */
  static async initializeTransaction(data: {
    email: string;
    amount: number; // Amount in kobo (smallest currency unit)
    currency?: string;
    reference?: string;
    metadata?: Record<string, any>;
    callback_url?: string;
  }) {
    try {
      const response = await paystackAPI.post('/transaction/initialize', data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Paystack initialize transaction error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to initialize transaction',
      };
    }
  }

  /**
   * Verify a transaction
   */
  static async verifyTransaction(reference: string) {
    try {
      const response = await paystackAPI.get(`/transaction/verify/${reference}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Paystack verify transaction error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to verify transaction',
      };
    }
  }

  /**
   * Get transaction details
   */
  static async getTransaction(transactionId: string) {
    try {
      const response = await paystackAPI.get(`/transaction/${transactionId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Paystack get transaction error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get transaction',
      };
    }
  }

  /**
   * List transactions
   */
  static async listTransactions(params?: {
    perPage?: number;
    page?: number;
    customer?: string;
    status?: string;
    from?: string;
    to?: string;
  }) {
    try {
      const response = await paystackAPI.get('/transaction', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Paystack list transactions error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to list transactions',
      };
    }
  }

  /**
   * Create a customer
   */
  static async createCustomer(data: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const response = await paystackAPI.post('/customer', data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Paystack create customer error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create customer',
      };
    }
  }

  /**
   * Get customer details
   */
  static async getCustomer(customerId: string) {
    try {
      const response = await paystackAPI.get(`/customer/${customerId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Paystack get customer error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get customer',
      };
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', paystackConfig.webhookSecret)
      .update(payload)
      .digest('hex');
    
    return hash === signature;
  }
}

// Export the service instance
export const paystack = PaystackService;
