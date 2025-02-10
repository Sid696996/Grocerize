import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, CreditCard, Wallet, Smartphone,
  Package2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { PaymentAnalytics } from '../types';
import { formatCurrency } from '../utils/formatters';

interface PaymentAnalyticsProps {
  analytics: PaymentAnalytics;
  previousAnalytics?: PaymentAnalytics;
}

export default function PaymentAnalytics({ analytics, previousAnalytics }: PaymentAnalyticsProps) {
  const calculateGrowth = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const salesGrowth = previousAnalytics 
    ? calculateGrowth(analytics.totalSales, previousAnalytics.totalSales)
    : 0;

  const avgTransactionGrowth = previousAnalytics
    ? calculateGrowth(
        analytics.averageTransactionValue,
        previousAnalytics.averageTransactionValue
      )
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            {salesGrowth !== 0 && (
              <div className={`flex items-center ${
                salesGrowth > 0 
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {salesGrowth > 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                <span className="text-sm font-medium">{Math.abs(salesGrowth).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Total Sales
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(analytics.totalSales)}
          </p>
        </motion.div>

        {/* Average Transaction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Package2 className="text-green-600 dark:text-green-400" size={24} />
            </div>
            {avgTransactionGrowth !== 0 && (
              <div className={`flex items-center ${
                avgTransactionGrowth > 0 
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {avgTransactionGrowth > 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                <span className="text-sm font-medium">{Math.abs(avgTransactionGrowth).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Average Transaction
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(analytics.averageTransactionValue)}
          </p>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg col-span-1 md:col-span-2"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Payment Methods
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="text-green-600 dark:text-green-400" size={20} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cash</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(analytics.paymentMethods.cash)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-600 dark:bg-green-500 rounded-full"
                  style={{ 
                    width: `${(analytics.paymentMethods.cash / analytics.totalSales) * 100}%`
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-blue-600 dark:text-blue-400" size={20} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Card</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(analytics.paymentMethods.card)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                  style={{ 
                    width: `${(analytics.paymentMethods.card / analytics.totalSales) * 100}%`
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="text-purple-600 dark:text-purple-400" size={20} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">UPI</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(analytics.paymentMethods.upi)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600 dark:bg-purple-500 rounded-full"
                  style={{ 
                    width: `${(analytics.paymentMethods.upi / analytics.totalSales) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Selling Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Top Selling Items
        </h3>
        <div className="space-y-4">
          {analytics.topSellingItems.map((item, index) => (
            <div 
              key={item.item.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                {item.item.image && (
                  <img
                    src={item.item.image}
                    alt={item.item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {item.item.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.quantity} {item.item.unit} sold
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(item.revenue)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {((item.revenue / analytics.totalSales) * 100).toFixed(1)}% of sales
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}