-- SIZ Token Purchase Database Schema
-- This schema tracks all Stripe payments and token transfers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Payment transactions table
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    
    -- Token transfer details
    token_transfer_status VARCHAR(50) DEFAULT 'pending',
    token_transfer_tx_id VARCHAR(255),
    token_transfer_error TEXT,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    tokens_transferred_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_payment_transactions_payment_reference ON payment_transactions(payment_reference);
CREATE INDEX idx_payment_transactions_stripe_session_id ON payment_transactions(stripe_session_id);
CREATE INDEX idx_payment_transactions_stripe_payment_intent_id ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX idx_payment_transactions_user_wallet_address ON payment_transactions(user_wallet_address);
CREATE INDEX idx_payment_transactions_payment_status ON payment_transactions(payment_status);
CREATE INDEX idx_payment_transactions_token_transfer_status ON payment_transactions(token_transfer_status);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at);

-- Payment status enum
CREATE TYPE payment_status_enum AS ENUM (
    'pending',
    'processing',
    'paid',
    'pending_token_transfer',
    'pending_opt_in',
    'completed',
    'failed',
    'canceled',
    'expired'
);

-- Token transfer status enum
CREATE TYPE token_transfer_status_enum AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'skipped',
    'pending_opt_in'
);

-- Update the payment_transactions table to use enums safely
-- 1) Drop existing defaults
ALTER TABLE payment_transactions 
    ALTER COLUMN payment_status DROP DEFAULT,
    ALTER COLUMN token_transfer_status DROP DEFAULT;

-- 2) Convert column types using explicit casts
ALTER TABLE payment_transactions 
    ALTER COLUMN payment_status TYPE payment_status_enum USING payment_status::text::payment_status_enum,
    ALTER COLUMN token_transfer_status TYPE token_transfer_status_enum USING token_transfer_status::text::token_transfer_status_enum;

-- 3) Re-add typed defaults
ALTER TABLE payment_transactions 
    ALTER COLUMN payment_status SET DEFAULT 'pending'::payment_status_enum,
    ALTER COLUMN token_transfer_status SET DEFAULT 'pending'::token_transfer_status_enum;

-- Webhook events table for audit trail
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payment_reference VARCHAR(100),
    stripe_session_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    event_data JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_status VARCHAR(50) DEFAULT 'processed',
    error_message TEXT
);

-- Indexes for webhook events
CREATE INDEX idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_payment_reference ON webhook_events(payment_reference);
CREATE INDEX idx_webhook_events_processed_at ON webhook_events(processed_at);

-- Token inventory table (for central wallet tracking)
CREATE TABLE token_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    network VARCHAR(50) NOT NULL,
    asset_id BIGINT NOT NULL,
    asset_name VARCHAR(100) NOT NULL,
    total_supply DECIMAL(20,0) NOT NULL,
    available_supply DECIMAL(20,0) NOT NULL,
    reserved_supply DECIMAL(20,0) DEFAULT 0,
    central_wallet_address VARCHAR(255) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for token inventory
CREATE INDEX idx_token_inventory_network_asset_id ON token_inventory(network, asset_id);
CREATE INDEX idx_token_inventory_central_wallet_address ON token_inventory(central_wallet_address);

-- User wallet balances table
CREATE TABLE user_wallet_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_wallet_address VARCHAR(255) NOT NULL,
    network VARCHAR(50) NOT NULL,
    asset_id BIGINT NOT NULL,
    asset_name VARCHAR(100) NOT NULL,
    balance DECIMAL(20,0) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_wallet_address, network, asset_id)
);

-- Indexes for user wallet balances
CREATE INDEX idx_user_wallet_balances_user_wallet_address ON user_wallet_balances(user_wallet_address);
CREATE INDEX idx_user_wallet_balances_network_asset_id ON user_wallet_balances(network, asset_id);

-- Token transfer history table
CREATE TABLE token_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Indexes for token transfers
CREATE INDEX idx_token_transfers_payment_transaction_id ON token_transfers(payment_transaction_id);
CREATE INDEX idx_token_transfers_from_address ON token_transfers(from_address);
CREATE INDEX idx_token_transfers_to_address ON token_transfers(to_address);
CREATE INDEX idx_token_transfers_transaction_hash ON token_transfers(transaction_hash);
CREATE INDEX idx_token_transfers_status ON token_transfers(status);

-- Insert initial SIZ token inventory
INSERT INTO token_inventory (
    network, 
    asset_id, 
    asset_name, 
    total_supply, 
    available_supply, 
    central_wallet_address
) VALUES (
    'algorand_testnet',
    0, -- Replace with actual testnet asset ID
    'SIZ Token',
    1000000000, -- 1 billion tokens
    1000000000, -- All available initially
    '' -- Replace with actual central wallet address
), (
    'algorand_mainnet',
    0, -- Replace with actual mainnet asset ID
    'SIZ Token',
    1000000000, -- 1 billion tokens
    1000000000, -- All available initially
    '' -- Replace with actual central wallet address
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to payment_transactions
CREATE TRIGGER update_payment_transactions_updated_at 
    BEFORE UPDATE ON payment_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to check payment idempotency
CREATE OR REPLACE FUNCTION check_payment_idempotency(
    p_payment_reference VARCHAR(100),
    p_stripe_session_id VARCHAR(255),
    p_stripe_payment_intent_id VARCHAR(255)
)
RETURNS TABLE(
    found BOOLEAN,
    payment_id UUID,
    current_status payment_status_enum
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TRUE,
        pt.id,
        pt.payment_status
    FROM payment_transactions pt
    WHERE pt.payment_reference = p_payment_reference
       OR pt.stripe_session_id = p_stripe_session_id
       OR pt.stripe_payment_intent_id = p_stripe_payment_intent_id
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::payment_status_enum;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to get payment statistics
CREATE OR REPLACE FUNCTION get_payment_statistics(
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE(
    total_transactions BIGINT,
    total_tokens_sold BIGINT,
    total_revenue DECIMAL(10,2),
    successful_transfers BIGINT,
    failed_transfers BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_transactions,
        COALESCE(SUM(token_amount), 0)::BIGINT as total_tokens_sold,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(*) FILTER (WHERE token_transfer_status = 'completed')::BIGINT as successful_transfers,
        COUNT(*) FILTER (WHERE token_transfer_status = 'failed')::BIGINT as failed_transfers
    FROM payment_transactions pt
    WHERE pt.created_at BETWEEN p_start_date AND p_end_date
      AND pt.payment_status = 'paid';
END;
$$ LANGUAGE plpgsql;
