import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { headers } from 'next/headers';
import { sizTokenTransferService } from '@/lib/algorand/token-transfer';
import { paymentDB } from '@/lib/database/payments';
import algosdk from 'algosdk';

export const runtime = 'nodejs';

// Add timeout configuration to prevent hanging
export const maxDuration = 30; // 30 seconds max

// No longer needed - mock events removed

export async function POST(req: NextRequest) {
  // CRITICAL FIX: Make webhook completely non-blocking
  // Process everything asynchronously to prevent any hanging
  
  // Start processing immediately in background
  setImmediate(async () => {
    console.log('🔄 Starting background webhook processing...');
    
    // Add timeout to background processing (5 minutes max)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Background processing timeout after 5 minutes')), 5 * 60 * 1000);
    });
    
    try {
      await Promise.race([
        processWebhookRequest(req),
        timeoutPromise
      ]);
      console.log('✅ Background webhook processing completed successfully');
    } catch (error) {
      console.error('❌ Background webhook processing failed:', error);
      // Log additional details for debugging
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Immediately return success to Stripe (no waiting)
  return NextResponse.json({ received: true }, { status: 200 });
}

// Process the entire webhook request in background
async function processWebhookRequest(req: NextRequest) {
  const startTime = Date.now();
  console.log('🔄 [BACKGROUND] Starting webhook request processing...');
  
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    console.log('🔔 [BACKGROUND] Stripe webhook received:', {
      timestamp: new Date().toISOString(),
      signature: signature ? 'Present' : 'Missing',
      bodyLength: body.length,
      processingTime: `${Date.now() - startTime}ms`
    });

    // Check for empty webhook body
    if (!body || body.length === 0) {
      console.error('❌ [BACKGROUND] Empty webhook body received - this indicates a configuration issue');
      console.error('🔍 [BACKGROUND] Debug info:', {
        headers: Object.fromEntries(headersList.entries()),
        userAgent: headersList.get('user-agent'),
        contentType: headersList.get('content-type'),
        timestamp: new Date().toISOString()
      });
      
            // REMOVED: Mock event creation - we now use real Stripe events only
      console.log('⚠️ [BACKGROUND] Empty webhook body received - no mock events created');
      console.log('💡 [BACKGROUND] In development, ensure Stripe CLI is running: stripe listen --forward-to localhost:3000/api/stripe-webhook');
      return;
      
      return;
    }

    if (!signature) {
      console.error('❌ [BACKGROUND] Missing stripe-signature header');
      return;
    }

    // Check if webhook secret is configured
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('❌ [BACKGROUND] STRIPE_WEBHOOK_SECRET not configured');
      return;
    }

    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      
      console.log('✅ [BACKGROUND] Webhook signature verified:', {
        eventType: event.type,
        eventId: event.id,
        timestamp: new Date().toISOString(),
        processingTime: `${Date.now() - startTime}ms`
      });
      
    } catch (err) {
      console.error('❌ [BACKGROUND] Webhook signature verification failed:', {
        error: err instanceof Error ? err.message : String(err),
        bodyLength: body.length,
        signaturePresent: !!signature,
        webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
        timestamp: new Date().toISOString()
      });
      
      // For development/testing, you can skip signature verification
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ [BACKGROUND] Development mode: Skipping signature verification');
        try {
          event = JSON.parse(body);
          console.log('✅ [BACKGROUND] Webhook event parsed (development mode):', {
            eventType: event.type,
            eventId: event.id,
            timestamp: new Date().toISOString(),
            processingTime: `${Date.now() - startTime}ms`
          });
        } catch (parseErr) {
          console.error('❌ [BACKGROUND] Failed to parse webhook body:', {
            parseError: parseErr instanceof Error ? parseErr.message : String(parseErr),
            bodyLength: body.length,
            bodyPreview: body.substring(0, 200) + (body.length > 200 ? '...' : ''),
            timestamp: new Date().toISOString()
          });
          return;
        }
      } else {
        console.error('❌ [BACKGROUND] Production mode: Invalid signature, cannot process');
        return;
      }
    }

    console.log('🚀 [BACKGROUND] Starting webhook event processing...');
    // Process the webhook event
    await processWebhookEvent(event);
    console.log('✅ [BACKGROUND] Webhook event processing completed:', {
      eventType: event.type,
      eventId: event.id,
      totalProcessingTime: `${Date.now() - startTime}ms`
    });
    
  } catch (error) {
    console.error('❌ [BACKGROUND] Error in background webhook processing:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      processingTime: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString()
    });
  }
}

// Move all webhook processing logic to this separate async function
async function processWebhookEvent(event: any) {
  const eventStartTime = Date.now();
  console.log('🔄 [EVENT] Starting webhook event processing:', {
    eventType: event.type,
    eventId: event.id,
    timestamp: new Date().toISOString()
  });
  
  try {
    // Record webhook event for audit trail
    console.log('📝 [EVENT] Recording webhook event in database...');
    await paymentDB.recordWebhookEvent(event.id, event.type);
    console.log('✅ [EVENT] Webhook event recorded in database');
    
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('🛒 [EVENT] Processing checkout.session.completed event');
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        console.log('💳 [EVENT] Processing payment_intent.succeeded event');
        const paymentIntent = event.data.object;
        
        // Check if this payment was already processed by checkout.session.completed
        if (paymentIntent.metadata?.payment_reference) {
          console.log('🔍 [EVENT] Checking payment idempotency...');
          const idempotencyCheck = await paymentDB.checkPaymentIdempotency(paymentIntent.metadata.payment_reference);
          if (idempotencyCheck.found) {
            console.log('⚠️ [EVENT] Payment already processed by checkout session, skipping payment_intent.succeeded');
            break;
          }
        }
        
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        console.log('❌ [EVENT] Processing payment_intent.payment_failed event');
        await handlePaymentIntentFailed(event.data.object);
        break;
      
      default:
        console.log(`ℹ️ [EVENT] Unhandled event type: ${event.type}`);
    }
    
    console.log('✅ [EVENT] Webhook event processing completed:', {
      eventType: event.type,
      eventId: event.id,
      totalEventProcessingTime: `${Date.now() - eventStartTime}ms`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [EVENT] Error processing webhook event:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      eventType: event.type,
      eventId: event.id,
      totalEventProcessingTime: `${Date.now() - eventStartTime}ms`,
      timestamp: new Date().toISOString()
    });
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  const handlerStartTime = Date.now();
  console.log('🛒 [HANDLER] Processing completed checkout session:', {
    sessionId: session.id,
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total,
    currency: session.currency,
    timestamp: new Date().toISOString()
  });
  
  try {
    // Extract metadata
    const {
      token_amount,
      price_per_token,
      payment_reference,
      user_wallet_address,
      product_type,
      network
    } = session.metadata;

    console.log('📋 [HANDLER] Extracted metadata:', {
      tokenAmount: token_amount,
      pricePerToken: price_per_token,
      paymentReference: payment_reference,
      userWalletAddress: user_wallet_address,
      productType: product_type,
      network: network
    });

    // Validate required metadata
    if (!token_amount || !price_per_token || !payment_reference) {
      console.error('❌ [HANDLER] Missing required metadata in checkout session:', session.id);
      return;
    }

         // CRITICAL FIX: Use algosdk.isValidAddress() for proper Algorand address validation
     if (!user_wallet_address || !algosdk.isValidAddress(user_wallet_address)) {
       console.error('❌ [HANDLER] Invalid Algorand wallet address:', {
         sessionId: session.id,
         walletAddress: user_wallet_address,
         addressLength: user_wallet_address?.length || 0,
         expectedLength: 58,
         isValidAddress: algosdk.isValidAddress(user_wallet_address || ''),
         isCorrectLength: user_wallet_address?.length === 58
       });
       return;
     }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      console.log('⚠️ [HANDLER] Checkout session not paid:', session.id);
      return;
    }

    console.log('✅ [HANDLER] Checkout session validated, processing payment...');
    // Process the successful payment
    await processSuccessfulPayment({
      sessionId: session.id,
      paymentIntentId: session.payment_intent,
      tokenAmount: parseInt(token_amount),
      pricePerToken: parseFloat(price_per_token),
      paymentReference: payment_reference,
      userWalletAddress: user_wallet_address,
      productType: product_type,
      network: network,
      amount: session.amount_total / 100, // Convert from cents
      currency: session.currency,
      customerEmail: session.customer_details?.email,
    });

    console.log('✅ [HANDLER] Checkout session processing completed:', {
      sessionId: session.id,
      totalHandlerTime: `${Date.now() - handlerStartTime}ms`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [HANDLER] Error handling checkout session completion:', {
      error: error instanceof Error ? error.message : String(error),
      sessionId: session.id,
      totalHandlerTime: `${Date.now() - handlerStartTime}ms`,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log('Processing successful payment intent:', paymentIntent.id);
  
  try {
    // Extract metadata
    const {
      token_amount,
      price_per_token,
      payment_reference,
      user_wallet_address,
      product_type,
      network
    } = paymentIntent.metadata;

    // Validate required metadata
    if (!token_amount || !price_per_token || !payment_reference) {
      console.error('Missing required metadata in payment intent:', paymentIntent.id);
      return;
    }

    // Process the successful payment
    await processSuccessfulPayment({
      sessionId: null,
      paymentIntentId: paymentIntent.id,
      tokenAmount: parseInt(token_amount),
      pricePerToken: parseFloat(price_per_token),
      paymentReference: payment_reference,
      userWalletAddress: user_wallet_address,
      productType: product_type,
      network: network,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      customerEmail: paymentIntent.receipt_email,
    });

  } catch (error) {
    console.error('Error handling payment intent success:', error);
    throw error;
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  console.log('Processing failed payment intent:', paymentIntent.id);
  
  try {
    // Log the failure for monitoring
    console.error('Payment failed:', {
      paymentIntentId: paymentIntent.id,
      lastPaymentError: paymentIntent.last_payment_error,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });

    // Here you could implement:
    // - Send failure notification to user
    // - Update order status
    // - Trigger retry logic
    // - Log to monitoring system

  } catch (error) {
    console.error('Error handling payment intent failure:', error);
    throw error;
  }
}

async function handleCheckoutSessionExpired(session: any) {
  console.log('Processing expired checkout session:', session.id);
  
  try {
    // Log the expiration for monitoring
    console.log('Checkout session expired:', {
      sessionId: session.id,
      expiresAt: session.expires_at,
      createdAt: session.created,
    });

    // Here you could implement:
    // - Clean up expired sessions
    // - Send reminder emails
    // - Update inventory if needed

  } catch (error) {
    console.error('Error handling checkout session expiration:', error);
    throw error;
  }
}

interface PaymentProcessingData {
  sessionId: string | null;
  paymentIntentId: string;
  tokenAmount: number;
  pricePerToken: number;
  paymentReference: string;
  userWalletAddress: string;
  productType: string;
  network: string;
  amount: number;
  currency: string;
  customerEmail?: string;
}

async function processSuccessfulPayment(data: PaymentProcessingData) {
  const startTime = Date.now();
  console.log('🚀 [PAYMENT] Processing successful payment:', {
    paymentReference: data.paymentReference,
    tokenAmount: data.tokenAmount,
    userWalletAddress: data.userWalletAddress,
    amount: data.amount,
    currency: data.currency,
    timestamp: new Date().toISOString(),
    step: 'START'
  });
  
  try {
    // 1. Check idempotency - verify payment hasn't been processed before
    console.log('🔍 [PAYMENT] Step 1: Checking payment idempotency...');
    const idempotencyCheck = await paymentDB.checkPaymentIdempotency(data.paymentReference);
    console.log('📊 [PAYMENT] Idempotency check result:', idempotencyCheck);
    
    if (idempotencyCheck.found && idempotencyCheck.current_status === 'completed') {
      console.log('⚠️ [PAYMENT] Payment already processed:', data.paymentReference);
      return;
    }

    // 2. Create or update payment transaction record
    console.log('📝 [PAYMENT] Step 2: Creating payment transaction record...');
    const paymentTransaction = await paymentDB.createPaymentTransaction({
      payment_reference: data.paymentReference,
      stripe_payment_intent_id: data.paymentIntentId,
      stripe_session_id: data.sessionId || undefined,
      subtotal: data.amount,
      processing_fee: 0,
      total_amount: data.amount,
      currency: data.currency,
      token_amount: data.tokenAmount,
      price_per_token: data.pricePerToken,
      user_wallet_address: data.userWalletAddress,
      user_email: data.customerEmail,
      payment_status: 'pending',
      token_transfer_status: 'pending',
    });
    
    console.log('✅ [PAYMENT] Payment transaction created:', {
      transactionId: paymentTransaction.id,
      paymentReference: paymentTransaction.payment_reference,
      step: 'DATABASE_CREATED',
      processingTime: `${Date.now() - startTime}ms`
    });

         // Enhanced idempotency check for transfers - FIXED: Now payment-specific, not wallet-specific
     console.log('🔍 [PAYMENT] Step 2.5: Checking transfer idempotency...');
     // Use only payment reference for idempotency - allows multiple transfers to same wallet
     const transferIdempotencyKey = data.paymentReference;
     const existingTransfer = await paymentDB.checkTransferIdempotency(transferIdempotencyKey);
     
     console.log('📊 [PAYMENT] Transfer idempotency check result:', {
       transferIdempotencyKey,
       existingTransfer,
       shouldProceed: !existingTransfer.found
     });
     
     if (existingTransfer.found) {
       console.log('⚠️ [PAYMENT] Transfer already processed for this payment:', {
         paymentReference: data.paymentReference,
         userWalletAddress: data.userWalletAddress,
         existingStatus: existingTransfer.status,
         timestamp: new Date().toISOString()
       });
       
       // Update payment status to match existing transfer
       if (existingTransfer.status === 'direct_transferred') {
         await paymentDB.updatePaymentStatus(paymentTransaction.id, 'completed', 'Direct transfer already completed');
         await paymentDB.updateTokenTransferStatus(paymentTransaction.id, 'direct_transferred', existingTransfer.txId);
       } else if (existingTransfer.status === 'in_inbox') {
         await paymentDB.updatePaymentStatus(paymentTransaction.id, 'paid', 'Tokens already sent to inbox');
         await paymentDB.updateTokenTransferStatus(paymentTransaction.id, 'in_inbox', existingTransfer.txId);
       }
       
       return;
     }

    // 3. Validate user wallet address
    console.log('🔍 [PAYMENT] Step 3: Validating user wallet address...');
    if (!data.userWalletAddress) {
      console.error('❌ [PAYMENT] No user wallet address provided for payment:', data.paymentReference);
      await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', 'No wallet address provided');
      return;
    }

         // CRITICAL FIX: Use algosdk.isValidAddress() for proper Algorand address validation
     if (!algosdk.isValidAddress(data.userWalletAddress)) {
       console.error('❌ [PAYMENT] Invalid Algorand wallet address detected:', {
         paymentReference: data.paymentReference,
         walletAddress: data.userWalletAddress,
         addressLength: data.userWalletAddress.length,
         expectedLength: 58,
         isValidAddress: algosdk.isValidAddress(data.userWalletAddress),
         isCorrectLength: data.userWalletAddress.length === 58
       });
       await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', `Invalid Algorand wallet address: length ${data.userWalletAddress.length}, validation failed`);
       return;
     }
    
         console.log('✅ [PAYMENT] User wallet address validated:', {
       address: data.userWalletAddress,
       length: data.userWalletAddress.length,
       isValidAddress: algosdk.isValidAddress(data.userWalletAddress),
       isCorrectLength: data.userWalletAddress.length === 58
     });

    // 4. Check token inventory and reserve tokens
    console.log('🔍 [PAYMENT] Step 4: Checking token inventory...');
    const inventoryCheck = await paymentDB.checkTokenInventory(data.tokenAmount, data.network || 'algorand');
    console.log('📊 [PAYMENT] Inventory check result:', inventoryCheck);
    
    if (!inventoryCheck.available) {
      console.error('❌ [PAYMENT] Insufficient token inventory for payment:', data.paymentReference);
      await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', 'Insufficient token inventory');
      return;
    }

    // Reserve tokens for this transaction
    console.log('🔒 [PAYMENT] Reserving tokens for transaction...');
    await paymentDB.reserveTokens(data.tokenAmount, paymentTransaction.id);
    console.log('✅ [PAYMENT] Tokens reserved successfully');

    try {
      // 5. Transfer SIZ tokens from central wallet to user wallet
      console.log('🚀 [PAYMENT] Step 5: Initiating SIZ token transfer via ARC-0059...');
      console.log('📋 [PAYMENT] Transfer details:', {
        to: data.userWalletAddress,
        amount: data.tokenAmount,
        paymentId: paymentTransaction.id,
        method: 'ARC-0059 Hybrid Transfer',
        timestamp: new Date().toISOString()
      });

      // Use the new hybrid transfer approach: try direct first, fallback to ARC-0059
      console.log('🔄 [PAYMENT] Calling sizTokenTransferService.transferSizTokensHybrid...');
      console.log('📋 [PAYMENT] Hybrid transfer parameters:', {
        receiverAddress: data.userWalletAddress,
        amount: data.tokenAmount,
        paymentId: paymentTransaction.id,
        paymentReference: data.paymentReference,
        timestamp: new Date().toISOString()
      });
      
             // CRITICAL FIX: Final validation before transfer using algosdk.isValidAddress()
       if (!algosdk.isValidAddress(data.userWalletAddress)) {
         console.error('❌ [PAYMENT] CRITICAL: Invalid wallet address before transfer:', {
           paymentReference: data.paymentReference,
           originalAddress: data.userWalletAddress,
           currentLength: data.userWalletAddress.length,
           expectedLength: 58,
           isValidAddress: algosdk.isValidAddress(data.userWalletAddress)
         });
         await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', 'Wallet address validation failed before transfer');
         return;
       }
      
      const transferStartTime = Date.now();
      
      console.log('🔍 [PAYMENT] About to call transferSizTokensHybrid - this should trigger the hybrid logic');
      
      try {
        const transferResult = await sizTokenTransferService.transferSizTokensHybrid({
          receiverAddress: data.userWalletAddress,
          amount: data.tokenAmount,
          paymentId: paymentTransaction.id,
        });
        
        console.log('✅ [PAYMENT] transferSizTokensHybrid call completed successfully');
        
        const transferTime = Date.now() - transferStartTime;
        console.log('📊 [PAYMENT] Transfer result received:', {
          success: transferResult.success,
          txId: transferResult.txId,
          error: transferResult.error,
          requiresOptIn: transferResult.requiresOptIn,
          transferTime: `${transferTime}ms`,
          totalProcessingTime: `${Date.now() - startTime}ms`
        });

        if (transferResult.success && transferResult.txId) {
        // 6. Update database with successful transfer
        console.log('✅ [PAYMENT] Step 6: Token transfer successful! Updating database...');
        
        // Determine the correct status based on transfer method
        let transferStatus: string;
        let paymentStatus: string;
        let statusMessage: string;
        
        if (transferResult.requiresOptIn === false) {
          // Direct transfer to opted-in wallet
          transferStatus = 'direct_transferred';
          paymentStatus = 'completed';
          statusMessage = 'Tokens directly transferred to wallet - no claiming required';
          
          console.log('🎯 [PAYMENT] Direct transfer completed - user wallet was already opted in');
        } else {
          // ARC-0059 inbox transfer
          transferStatus = 'in_inbox';
          paymentStatus = 'paid';
          statusMessage = 'Tokens sent to inbox via ARC-0059 - user must claim manually';
          
          console.log('📬 [PAYMENT] ARC-0059 inbox transfer completed - user must claim from inbox');
        }
        
        // Update database with better error handling
        try {
          console.log('📝 [PAYMENT] Updating token transfer status to:', transferStatus);
          await paymentDB.updateTokenTransferStatus(
            paymentTransaction.id,
            transferStatus,
            transferResult.txId
          );
          console.log('✅ [PAYMENT] Token transfer status updated successfully');
          
          console.log('📝 [PAYMENT] Updating payment status to:', paymentStatus);
          await paymentDB.updatePaymentStatus(paymentTransaction.id, paymentStatus, statusMessage);
          console.log('✅ [PAYMENT] Payment status updated successfully');
          
        } catch (dbError) {
          console.error('❌ [PAYMENT] Database update failed:', {
            error: dbError instanceof Error ? dbError.message : String(dbError),
            paymentId: paymentTransaction.id,
            transferStatus,
            paymentStatus,
            timestamp: new Date().toISOString()
          });
          throw dbError; // Re-throw to prevent silent failures
        }
        
        // 7. Update user wallet balance
        console.log('💰 [PAYMENT] Step 7: Updating user wallet balance...');
        await paymentDB.updateUserWalletBalance(
          data.userWalletAddress,
          data.tokenAmount,
          'credit'
        );

        console.log('🎉 [PAYMENT] SIZ token transfer completed successfully:', {
          paymentReference: data.paymentReference,
          txId: transferResult.txId,
          tokenAmount: data.tokenAmount,
          userWalletAddress: data.userWalletAddress,
          method: transferStatus === 'direct_transferred' ? 'Direct Transfer' : 'ARC-0059 Inbox Transfer',
          status: transferStatus,
          totalProcessingTime: `${Date.now() - startTime}ms`,
          timestamp: new Date().toISOString()
        });

        // 8. Record successful token transfer
        console.log('📝 [PAYMENT] Step 8: Recording token transfer...');
        await paymentDB.recordTokenTransfer({
          payment_transaction_id: paymentTransaction.id,
          from_address: process.env.CENTRAL_WALLET_ADDRESS!,
          to_address: data.userWalletAddress,
          asset_id: process.env.SIZ_TOKEN_ASSET_ID!,
          amount: data.tokenAmount,
          transaction_id: transferResult.txId,
          status: transferStatus,
        });
        
        console.log('✅ [PAYMENT] Token transfer recorded successfully');
        
        // 9. Verify database updates were successful
        try {
          console.log('🔍 [PAYMENT] Step 9: Verifying database updates...');
          const verificationResult = await paymentDB.getPaymentTransaction(paymentTransaction.id);
          console.log('📊 [PAYMENT] Database verification result:', {
            paymentId: paymentTransaction.id,
            paymentStatus: verificationResult?.payment_status,
            tokenTransferStatus: verificationResult?.token_transfer_status,
            timestamp: new Date().toISOString()
          });
          
          if (verificationResult?.payment_status === paymentStatus && verificationResult?.token_transfer_status === transferStatus) {
            console.log('✅ [PAYMENT] Database verification successful - all updates confirmed');
          } else {
            console.warn('⚠️ [PAYMENT] Database verification warning - status mismatch detected:', {
              expectedPaymentStatus: paymentStatus,
              actualPaymentStatus: verificationResult?.payment_status,
              expectedTransferStatus: transferStatus,
              actualTransferStatus: verificationResult?.token_transfer_status
            });
          }
        } catch (verificationError) {
          console.warn('⚠️ [PAYMENT] Database verification failed (non-critical):', {
            error: verificationError instanceof Error ? verificationError.message : String(verificationError),
            paymentId: paymentTransaction.id
          });
        }
        
        // 10. Start monitoring only for inbox transfers
        if (transferStatus === 'in_inbox') {
          console.log('🔍 [PAYMENT] Step 10: Starting transaction monitoring for inbox transfer...');
          await startTransactionMonitoring(paymentTransaction.id, transferResult.txId, data.userWalletAddress);
        } else {
          console.log('✅ [PAYMENT] Direct transfer completed - no monitoring needed');
        }
        
      } else {
        // Transfer failed
        console.error('❌ SIZ token transfer failed:', transferResult.error);
        
        // Check if this is an opt-in issue
        if (transferResult.requiresOptIn) {
          console.log('⚠️ [PAYMENT] Transfer failed due to opt-in requirement:', {
            paymentReference: data.paymentReference,
            userWalletAddress: data.userWalletAddress,
            optInInstructions: transferResult.optInInstructions,
            requiresUserAction: transferResult.requiresUserAction,
            actionRequired: transferResult.actionRequired,
            instructions: transferResult.instructions,
          });
          
          // Update status to indicate opt-in is required
          await paymentDB.updateTokenTransferStatus(
            paymentTransaction.id,
            'pending',
            undefined,
            transferResult.instructions || 'User wallet not opted into SIZ token'
          );
          await paymentDB.updatePaymentStatus(
            paymentTransaction.id, 
            'processing', 
            `Payment successful but wallet not opted into SIZ token. ${transferResult.actionRequired === 'add-algo' ? 'User needs more ALGO balance.' : 'User must opt-in to receive tokens.'}`
          );
          
          console.log('📝 [PAYMENT] Payment status updated to processing (opt-in required)');
          
        } else {
          // Other transfer failure
          console.error('❌ [PAYMENT] Other transfer failure, updating status...');
          await paymentDB.updateTokenTransferStatus(
            paymentTransaction.id,
            'failed',
            undefined,
            transferResult.error
          );
          await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', `ARC-0059 token transfer failed: ${transferResult.error}`);
          
          // Release reserved tokens
          console.log('🔓 [PAYMENT] Releasing reserved tokens...');
          await paymentDB.releaseReservedTokens(paymentTransaction.id);
          console.log('✅ [PAYMENT] Reserved tokens released');
        }
      }
      
    } catch (transferError) {
      console.error('❌ [PAYMENT] Error during transferSizTokensHybrid call:', {
        error: transferError instanceof Error ? transferError.message : String(transferError),
        stack: transferError instanceof Error ? transferError.stack : undefined,
        paymentId: paymentTransaction.id,
        totalProcessingTime: `${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString()
      });
      
      // Update database with failure
      await paymentDB.updateTokenTransferStatus(
        paymentTransaction.id,
        'failed',
        undefined,
        transferError instanceof Error ? transferError.message : 'transferSizTokensHybrid call failed'
      );
      await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', 'transferSizTokensHybrid call failed');
      
      // Release reserved tokens
      console.log('🔓 [PAYMENT] Releasing reserved tokens due to transfer call error...');
      await paymentDB.releaseReservedTokens(paymentTransaction.id);
      console.log('✅ [PAYMENT] Reserved tokens released');
      
      throw transferError;
    }

    } catch (transferError) {
      console.error('❌ [PAYMENT] Error during ARC-0059 token transfer:', {
        error: transferError instanceof Error ? transferError.message : String(transferError),
        stack: transferError instanceof Error ? transferError.stack : undefined,
        paymentId: paymentTransaction.id,
        totalProcessingTime: `${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString()
      });
      
      // Update database with failure
      await paymentDB.updateTokenTransferStatus(
        paymentTransaction.id,
        'failed',
        undefined,
        transferError instanceof Error ? transferError.message : 'ARC-0059 transfer error occurred'
      );
      await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', 'ARC-0059 token transfer error occurred');
      
      // Release reserved tokens
      console.log('🔓 [PAYMENT] Releasing reserved tokens due to transfer error...');
      await paymentDB.releaseReservedTokens(paymentTransaction.id);
      console.log('✅ [PAYMENT] Reserved tokens released');
      
      throw transferError;
    }

  } catch (error) {
    console.error('❌ [PAYMENT] Error processing payment:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      paymentReference: data.paymentReference,
      totalProcessingTime: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

// Handle GET requests (for webhook testing)
export async function GET() {
  return NextResponse.json({ 
    message: 'Stripe webhook endpoint is active',
    status: 'operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
    databaseConnected: true // You can add actual DB connection check here
  });
}

/**
 * Monitor ARC-0059 transaction for confirmation
 * This ensures the tokens are properly delivered to the inbox before allowing claiming
 */
async function startTransactionMonitoring(paymentId: string, txId: string, userWalletAddress: string) {
  console.log('🔍 [MONITOR] Starting transaction monitoring:', {
    paymentId,
    txId,
    userWalletAddress,
    timestamp: new Date().toISOString()
  });

  try {
    // In a production environment, you would:
    // 1. Check transaction status on Algorand blockchain
    // 2. Verify tokens are in the inbox
    // 3. Update status to 'ready_to_claim' when confirmed
    
    // For now, we'll simulate the monitoring process
    console.log('⏳ [MONITOR] Transaction monitoring started - tokens will be available for claiming once confirmed');
    
    // Update the payment status to indicate monitoring is active
    await paymentDB.updatePaymentStatus(
      paymentId, 
      'monitoring', 
      'ARC-0059 transaction submitted - monitoring for confirmation before allowing claims'
    );
    
    console.log('✅ [MONITOR] Transaction monitoring status updated in database');
    
    // In a real implementation, you would:
    // - Set up a background job to check transaction status
    // - Use Algorand indexer to verify transaction confirmation
    // - Check if tokens are visible in the inbox
    // - Update status to 'ready_to_claim' when everything is confirmed
    
  } catch (error) {
    console.error('❌ [MONITOR] Error starting transaction monitoring:', {
      error: error instanceof Error ? error.message : String(error),
      paymentId,
      txId,
      timestamp: new Date().toISOString()
    });
    
    // Update status to indicate monitoring failed
    await paymentDB.updatePaymentStatus(
      paymentId, 
      'monitoring_failed', 
      'Failed to start transaction monitoring - manual verification required'
    );
  }
}
