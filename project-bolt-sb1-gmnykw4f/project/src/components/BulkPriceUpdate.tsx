import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Download, AlertTriangle } from 'lucide-react';
import { Item } from '../types';

interface BulkPriceUpdateProps {
  items: Item[];
  onUpdate: (updates: Partial<Item>[]) => void;
  onClose: () => void;
}

export default function BulkPriceUpdate({ items, onUpdate, onClose }: BulkPriceUpdateProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [updateType, setUpdateType] = useState<'fixed' | 'percentage'>('fixed');
  const [value, setValue] = useState<number>(0);
  const [applyTo, setApplyTo] = useState<'selling' | 'purchase' | 'both'>('both');
  const [errors, setErrors] = useState<string[]>([]);

  const handleUpdate = () => {
    const updates = items
      .filter(item => selectedItems.includes(item.id))
      .map(item => {
        const update: Partial<Item> = {
          id: item.id,
          lastUpdated: new Date().toISOString(),
        };

        if (applyTo === 'selling' || applyTo === 'both') {
          update.sellingPrice = updateType === 'fixed'
            ? value
            : item.sellingPrice * (1 + value / 100);
        }

        if (applyTo === 'purchase' || applyTo === 'both') {
          update.purchasePrice = updateType === 'fixed'
            ? value
            : item.purchasePrice * (1 + value / 100);
        }

        // Add to price history
        const priceHistory = [...item.priceHistory, {
          id: crypto.randomUUID(),
          itemId: item.id,
          purchasePrice: update.purchasePrice || item.purchasePrice,
          sellingPrice: update.sellingPrice || item.sellingPrice,
          date: update.lastUpdated,
          reason: `Bulk update: ${updateType === 'fixed' ? 'Fixed price' : `${value}% ${value >= 0 ? 'increase' : 'decrease'}`}`,
        }];

        return { ...update, priceHistory };
      });

    onUpdate(updates);
    onClose();
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

  const downloadTemplate = () => {
    const headers = ['ID', 'Name', 'Current Purchase Price', 'Current Selling Price', 'New Purchase Price', 'New Selling Price'];
    const rows = items.map(item => [
      item.id,
      item.name,
      item.purchasePrice,
      item.sellingPrice,
      '',
      ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'price_update_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold dark:text-white">Bulk Price Update</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="text-gray-500 dark:text-gray-400" />
          </motion.button>
        </div>

        <div className="space-y-6">
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"
            >
              <Download size={20} />
              <span>Download Template</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {/* Handle CSV upload */}}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg"
            >
              <Upload size={20} />
              <span>Upload CSV</span>
            </motion.button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium dark:text-white">Select Items</h3>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {selectedItems.length === items.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto border dark:border-gray-700 rounded-lg divide-y dark:divide-gray-700">
              {items.map(item => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, item.id]);
                      } else {
                        setSelectedItems(selectedItems.filter(id => id !== item.id));
                      }
                    }}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Purchase: ₹{item.purchasePrice} | Selling: ₹{item.sellingPrice}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Update Type
              </label>
              <select
                value={updateType}
                onChange={(e) => setUpdateType(e.target.value as 'fixed' | 'percentage')}
                className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-lg dark:text-white"
              >
                <option value="fixed">Fixed Amount</option>
                <option value="percentage">Percentage Change</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {updateType === 'fixed' ? 'Amount (₹)' : 'Percentage (%)'}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-lg dark:text-white"
                step={updateType === 'fixed' ? '0.01' : '0.1'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Apply To
            </label>
            <select
              value={applyTo}
              onChange={(e) => setApplyTo(e.target.value as 'selling' | 'purchase' | 'both')}
              className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-lg dark:text-white"
            >
              <option value="both">Both Prices</option>
              <option value="selling">Selling Price Only</option>
              <option value="purchase">Purchase Price Only</option>
            </select>
          </div>

          <AnimatePresence>
            {errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg flex items-start gap-3"
              >
                <AlertTriangle className="flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Please fix the following errors:</p>
                  <ul className="list-disc list-inside mt-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-4 py-2 border dark:border-gray-700 rounded-lg dark:text-white"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpdate}
              disabled={selectedItems.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Prices
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}