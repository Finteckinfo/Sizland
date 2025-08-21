'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Button1 } from '@/components/ui/button1';
// Call the API route instead of importing server actions directly to avoid bundling server-only deps in the browser
import { calculateTokenPrice, validateTokenAmount, formatCurrency } from '@/lib/stripe/config';
import { useWallet } from '@txnlab/use-wallet-react';
import { Loader2, CreditCard, Shield, CheckCircle, AlertCircle } from 'lucide-react';


interface TokenPurchaseFormProps {
  className?: string;
}

export const TokenPurchaseForm: React.FC<TokenPurchaseFormProps> = ({ className = '' }) => {
  const { activeAccount } = useWallet();
  const [tokenAmount, setTokenAmount] = useState<number>(100);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [pricing, setPricing] = useState<{
    pricePerToken: number;
    subtotal: number;
    processingFee: number;
    total: number;
  } | null>(null);

  // Calculate pricing when token amount changes
  useEffect(() => {
    try {
      const calculatedPricing = calculateTokenPrice(tokenAmount);
      setPricing(calculatedPricing);
      setError('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setPricing(null);
    }
  }, [tokenAmount]);

  // Handle input change with validation
  const handleTokenAmountChange = (value: string) => {
    const amount = parseInt(value) || 0;
    setTokenAmount(amount);
    
    // Clear previous errors
    setError('');
    setSuccess('');
  };



  // Handle Stripe checkout
  const handleStripeCheckout = async () => {
    if (!activeAccount?.address) {
      setError('Please connect your wallet first');
      return;
    }



    if (!userEmail.trim()) {
      setError('Please enter your email address');
      return;
    }

    // Validate token amount
    const validation = validateTokenAmount(tokenAmount);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid token amount');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenAmount,
          userEmail: userEmail.trim(),
          userWalletAddress: activeAccount.address,
          successUrl: `${window.location.origin}/wallet?success=true&tokens=${tokenAmount}`,
          cancelUrl: `${window.location.origin}/wallet?canceled=true`,
        }),
      });
      const result = await res.json();

      if (result.success && result.sessionId) {
        setSuccess('Redirecting to secure checkout...');
        
        // Redirect to Stripe Checkout
        const stripe = await import('@stripe/stripe-js');
        const stripeInstance = await stripe.loadStripe(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
        );
        
        if (stripeInstance) {
          const { error: stripeError } = await stripeInstance.redirectToCheckout({
            sessionId: result.sessionId,
          });
          
          if (stripeError) {
            setError(`Checkout error: ${stripeError.message}`);
          }
        }
      } else {
        setError(result.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick amount selection
  const quickAmounts = [100, 500, 1000, 2500, 5000];

  return (
    <div className={`rounded-2xl border border-gray-300 p-6 w-full space-y-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Buy SIZ Tokens</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Secure payment powered by Stripe
        </p>
      </div>

      {/* Token Amount Input */}
      <div className="space-y-4">
        <div>
          <label htmlFor="tokenAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number of SIZ Tokens
          </label>
          <input
            id="tokenAmount"
            type="number"
            min={1}
            max={10000}
            step={1}
            value={tokenAmount}
            onChange={(e) => handleTokenAmountChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter amount"
          />
        </div>

        {/* Quick Amount Selection */}
        <div className="flex flex-wrap gap-2 justify-center">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => setTokenAmount(amount)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                tokenAmount === amount
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {amount.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Email Input */}
      <div>
        <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Address
        </label>
        <input
          id="userEmail"
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="your@email.com"
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          We'll send your purchase confirmation to this email
        </p>
      </div>



      {/* Pricing Breakdown */}
      {pricing && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Order Summary</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {tokenAmount.toLocaleString()} SIZ tokens × {formatCurrency(pricing.pricePerToken)}
              </span>
              <span className="text-gray-900 dark:text-gray-100">
                {formatCurrency(pricing.subtotal)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Processing fee</span>
              <span className="text-gray-900 dark:text-gray-100">
                {formatCurrency(pricing.processingFee)}
              </span>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-900 dark:text-gray-100">Total</span>
                <span className="text-green-600 dark:text-green-400">
                  {formatCurrency(pricing.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error and Success Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-green-700 dark:text-green-400 text-sm">{success}</span>
        </div>
      )}

      {/* Purchase Button */}
      <div className="space-y-3">
        <Button
          onClick={handleStripeCheckout}
          disabled={isLoading || !activeAccount?.address || !userEmail.trim() || !pricing}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 text-lg font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              Buy {tokenAmount.toLocaleString()} SIZ Tokens
            </>
          )}
        </Button>

        {!activeAccount?.address && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Please connect your wallet to continue
          </p>
        )}
      </div>

      {/* Security Features */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Shield className="h-4 w-4" />
        <span>Secure payment powered by Stripe</span>
      </div>
    </div>
  );
};
