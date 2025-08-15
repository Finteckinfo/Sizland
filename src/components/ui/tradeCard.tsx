// src/components/ui/tradeCard.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export const TradeCard: React.FC = () => {
  const [amount, setAmount] = useState<number>(0);

  // Price increases by $0.01 for every 10 tokens above 0
  const pricePerToken = 0.25 + Math.floor(amount / 10) * 0.01;
  const subtotal = amount * pricePerToken;
  const fee = subtotal * 0.01;
  const total = subtotal + fee;

  return (
    <div className="rounded-2xl border border-gray-300 p-4 sm:p-6 w-full space-y-4 sm:space-y-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Header - Centered */}
      <div className="text-center">
        <h2 className="text-lg font-bold mb-2">Quick Trade</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Learn. Earn. Invest. Grow.</p>
      </div>

      {/* SIZ Amount Display - Centered */}
      <div className="text-center">
        <Button className="h-[40px] sm:h-[48px] px-6 sm:px-8 text-sm bg-blue-500 hover:bg-blue-600 text-white">
          {amount.toFixed(2)} SIZ
        </Button>
      </div>

      {/* Form - Centered */}
      <form className="space-y-3 sm:space-y-4 max-w-sm mx-auto" onSubmit={e => e.preventDefault()}>
        <input
          type="number"
          min={0}
          step={1}
          placeholder="Amount SIZ"
          value={amount === 0 ? '' : amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center"
        />
        <input
          type="text"
          placeholder="Price Per Token"
          value={`$${pricePerToken.toFixed(2)} USD`}
          readOnly
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center"
        />
        <input
          type="text"
          placeholder="Fee (1%)"
          value={`$${fee.toFixed(2)} USD`}
          readOnly
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center"
        />
        <input
          type="text"
          placeholder="Total"
          value={`$${total.toFixed(2)} USD`}
          readOnly
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center"
        />
        
        {/* Buy/Sell Buttons - Side by side and centered */}
        <div className="flex justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
          <Button className="bg-green-500 text-white hover:bg-green-600 flex items-center justify-center gap-2 px-6 sm:px-8">
            <span>Buy</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
          <Button className="bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-2 px-6 sm:px-8">
            <span>Sell</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </Button>
        </div>
      </form>
    </div>
  );
};
