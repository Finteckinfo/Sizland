import { NextRequest, NextResponse } from 'next/server';
import { paymentDB } from '@/lib/database/payments';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    console.log('🔍 [API] Fetching pending payments for wallet:', walletAddress);
    
    const pendingPayments = await paymentDB.getPendingPaymentsByWallet(walletAddress);
    
    console.log('📊 [API] Found pending payments:', {
      count: pendingPayments.length,
      walletAddress,
      timestamp: new Date().toISOString()
    });

    // Add additional context for each payment
    const enrichedPayments = pendingPayments.map(payment => {
      let status = '';
      let message = '';
      let canClaim = false;

      // Determine status based on payment and transfer status
      if (payment.paymentStatus === 'completed' && payment.tokenTransferStatus === 'direct_transferred') {
        status = 'completed';
        message = '✅ Tokens directly transferred to your wallet!';
        canClaim = false; // No claiming needed for direct transfers
      } else if (payment.paymentStatus === 'paid' && payment.tokenTransferStatus === 'in_inbox') {
        status = 'in_inbox';
        message = '📬 Tokens sent to inbox - ready to claim!';
        canClaim = true; // Can claim from inbox
      } else if (payment.paymentStatus === 'monitoring' && payment.tokenTransferStatus === 'in_inbox') {
        status = 'monitoring';
        message = '⏳ Payment processing - tokens will be available for claiming soon';
        canClaim = false; // Still being monitored
      } else if (payment.paymentStatus === 'processing' && payment.tokenTransferStatus === 'pending') {
        status = 'processing';
        message = '🔄 Payment processing...';
        canClaim = false; // Still processing
      } else if (payment.tokenTransferStatus === 'failed') {
        status = 'failed';
        message = '❌ Token transfer failed - please contact support';
        canClaim = false; // Transfer failed
      } else {
        status = 'unknown';
        message = 'ℹ️ Payment status unknown';
        canClaim = false;
      }

      return {
        ...payment,
        status,
        message,
        canClaim
      };
    });

    return NextResponse.json({
      success: true,
      payments: enrichedPayments,
      total: enrichedPayments.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [API] Error fetching pending payments:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch pending payments',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
