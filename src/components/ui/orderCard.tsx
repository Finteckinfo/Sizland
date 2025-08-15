// src/components/ui/orderCard.tsx
import React from 'react';

interface OrderCardProps {
  type: 'buy' | 'sell';
  data: { price: string; amount: string; total: string }[];
}

export const OrderCard: React.FC<OrderCardProps> = ({ type, data }) => {
  const title = type === 'buy' ? 'Buy Order' : 'Sell Order';

  return (
    <div className="rounded-2xl border border-gray-300 p-4 sm:p-6 w-full bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <h2 className="text-lg font-bold mb-3 sm:mb-4 capitalize">{title}</h2>
      
      {/* Mobile-friendly table with horizontal scroll on small screens */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[280px]">
          <thead>
            <tr className="text-left text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <th className="pb-2 pr-4">Price</th>
              <th className="pb-2 pr-4">Amount</th>
              <th className="pb-2">Total</th>
            </tr>
          </thead>
          <tbody className="space-y-2">
            {data.slice(0, 8).map((row, idx) => (
              <tr key={idx} className="text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">{row.price}</td>
                <td className="py-2 pr-4">{row.amount}</td>
                <td className="py-2">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Show limited data on mobile for better performance */}
      {data.length > 8 && (
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
          Showing 8 of {data.length} orders
        </div>
      )}
    </div>
  );
};
