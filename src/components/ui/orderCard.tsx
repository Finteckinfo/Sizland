// src/components/ui/orderCard.tsx
import React from 'react';

interface OrderCardProps {
  type: 'buy' | 'sell';
  data: { price: string; amount: string; total: string }[];
}

export const OrderCard: React.FC<OrderCardProps> = ({ type, data }) => {
  const title = type === 'buy' ? 'Buy Order' : 'Sell Order';

  return (
    <div className="rounded-2xl border border-gray-300 p-4 w-full bg-white text-gray-900 dark:bg-navy-blue dark:text-gray-100">
      <h2 className="text-lg font-bold mb-2 capitalize">{title}</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600 dark:text-gray-400">
            <th>Price</th>
            <th>Amount</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="text-gray-800 dark:text-gray-200">
              <td>{row.price}</td>
              <td>{row.amount}</td>
              <td>{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
