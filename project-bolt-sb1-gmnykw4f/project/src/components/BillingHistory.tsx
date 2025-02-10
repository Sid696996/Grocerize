import React from 'react';
import { Bill } from '../types';
import { formatCurrency } from '../utils';

interface BillingHistoryProps {
  bills: Bill[];
}

export default function BillingHistory({ bills }: BillingHistoryProps) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Billing History</h2>
      
      <div className="space-y-4">
        {bills.map((bill) => (
          <div key={bill.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(bill.date).toLocaleString()}
                </p>
                {bill.customerName && (
                  <p className="text-gray-700 dark:text-gray-300">
                    Customer: {bill.customerName}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(bill.total)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Items: {bill.items.length}
                </p>
              </div>
            </div>
            
            <div className="border-t dark:border-gray-700 pt-4">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {bill.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 text-gray-900 dark:text-gray-100">{item.name}</td>
                      <td className="py-2 text-right text-gray-900 dark:text-gray-100">
                        {item.billQuantity} {item.unit}
                      </td>
                      <td className="py-2 text-right text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.sellingPrice)}
                      </td>
                      <td className="py-2 text-right text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.sellingPrice * item.billQuantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t dark:border-gray-700">
                  <tr>
                    <td colSpan={3} className="py-2 text-right font-medium text-gray-700 dark:text-gray-300">Subtotal:</td>
                    <td className="py-2 text-right text-gray-900 dark:text-gray-100">{formatCurrency(bill.subtotal)}</td>
                  </tr>
                  {bill.discount > 0 && (
                    <tr>
                      <td colSpan={3} className="py-2 text-right font-medium text-gray-700 dark:text-gray-300">Discount:</td>
                      <td className="py-2 text-right text-red-600 dark:text-red-400">-{formatCurrency(bill.discount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={3} className="py-2 text-right font-bold text-gray-900 dark:text-white">Total:</td>
                    <td className="py-2 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(bill.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))}
        
        {bills.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No billing history available
          </div>
        )}
      </div>
    </div>
  );
}