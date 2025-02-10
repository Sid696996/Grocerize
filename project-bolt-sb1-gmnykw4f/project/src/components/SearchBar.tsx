import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Filter } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Bill } from '../types';

interface SearchBarProps {
  onSearch: (results: Bill[]) => void;
  bills: Bill[];
}

export default function SearchBar({ onSearch, bills }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [showFilters, setShowFilters] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [paymentMethod, setPaymentMethod] = useState<'all' | 'cash' | 'card' | 'upi'>('all');

  useEffect(() => {
    const [startDate, endDate] = dateRange;
    
    const filtered = bills.filter(bill => {
      const matchesSearch = 
        bill.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.items.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesDate = !startDate || !endDate || (
        new Date(bill.date) >= startDate &&
        new Date(bill.date) <= endDate
      );

      const matchesStatus = paymentStatus === 'all' || bill.status === paymentStatus;
      const matchesMethod = paymentMethod === 'all' || bill.paymentMethod === paymentMethod;

      return matchesSearch && matchesDate && matchesStatus && matchesMethod;
    });

    onSearch(filtered);
  }, [searchTerm, dateRange, paymentStatus, paymentMethod, bills]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by customer, invoice, or product..."
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg ${
            showFilters 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          <Filter size={20} />
        </motion.button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Range
                </label>
                <div className="flex gap-2">
                  <DatePicker
                    selectsRange
                    startDate={dateRange[0]}
                    endDate={dateRange[1]}
                    onChange={(update) => setDateRange(update)}
                    className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg"
                    placeholderText="Select date range"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDateRange([null, null])}
                    className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <Calendar size={20} />
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg"
                  >
                    <option value="all">All</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg"
                  >
                    <option value="all">All</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}