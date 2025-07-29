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
    <div className="rounded-2xl border border-gray-300 p-4 w-full space-y-4 bg-white text-gray-900 dark:bg-navy-blue dark:text-gray-100">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold">Quick Trade</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Learn. Earn. Invest. Grow.</p>
        </div>
        <Button className="h-[48px] px-4 text-sm">
          {amount.toFixed(2)} SIZ
        </Button>
      </div>

      {/* Form */}
      <form className="space-y-3" onSubmit={e => e.preventDefault()}>
        <input
          type="number"
          min={0}
          step={1}
          placeholder="Amount SIZ"
          value={amount === 0 ? '' : amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <input
          type="text"
          placeholder="Price Per Token"
          value={`$${pricePerToken.toFixed(2)} USD`}
          readOnly
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <input
          type="text"
          placeholder="Fee (1%)"
          value={`$${fee.toFixed(2)} USD`}
          readOnly
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <input
          type="text"
          placeholder="Total"
          value={`$${total.toFixed(2)} USD`}
          readOnly
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        {/* Buy/Sell Buttons */}
        <div className="flex space-x-4 pt-2">
          <Button className="bg-green-500 text-white hover:bg-green-600 flex items-center gap-2">
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
          <Button className="bg-red-500 text-white hover:bg-red-600 flex items-center gap-2">
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
