import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, ChevronRight, Scan, Search, 
  AlertCircle, CheckCircle2, Package2, X,
  Plus, Upload, Edit2, Trash2
} from 'lucide-react';
import { Item } from '../types';
import BarcodeScanner from './BarcodeScanner';

interface InventoryProps {
  items: Item[];
  onAddItem: (item: Item) => void;
  onEditItem: (item: Item) => void;
  onDeleteItem: (id: string) => void;
}

export default function Inventory({ items, onAddItem, onEditItem, onDeleteItem }: InventoryProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group items by category
  const categories = Array.from(new Set(items.map(item => item.category || 'Uncategorized')));
  const itemsByCategory = categories.reduce((acc, category) => {
    acc[category] = items.filter(item => (item.category || 'Uncategorized') === category)
      .filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode.includes(searchTerm)
      );
    return acc;
  }, {} as Record<string, Item[]>);

  const handleScan = (scannedItem: Item) => {
    try {
      const existingItem = items.find(item => item.barcode === scannedItem.barcode);
      if (existingItem) {
        onEditItem({
          ...existingItem,
          quantity: existingItem.quantity + 1
        });
        setScanSuccess(`Successfully updated quantity for ${existingItem.name}`);
      } else {
        setEditingItem({
          id: crypto.randomUUID(),
          name: '',
          quantity: 1,
          unit: 'pcs',
          sellingPrice: 0,
          purchasePrice: 0,
          barcode: scannedItem.barcode,
          category: '',
        });
        setShowAddForm(true);
        setScanSuccess('Please enter product details');
      }
      setScanError(null);
    } catch (error) {
      setScanError('Failed to process scan. Please try again.');
      setScanSuccess(null);
    }
    
    setTimeout(() => {
      setScanError(null);
      setScanSuccess(null);
    }, 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingItem) {
          setEditingItem({ ...editingItem, image: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      id: editingItem?.id || crypto.randomUUID(),
      name: formData.get('name') as string,
      quantity: Number(formData.get('quantity')),
      unit: formData.get('unit') as 'kg' | 'g' | 'l' | 'ml' | 'pcs',
      sellingPrice: Number(formData.get('sellingPrice')),
      purchasePrice: Number(formData.get('purchasePrice')),
      barcode: formData.get('barcode') as string,
      category: formData.get('category') as string,
      image: editingItem?.image || '',
    };

    if (editingItem) {
      onEditItem(itemData);
    } else {
      onAddItem(itemData);
    }
    setShowAddForm(false);
    setEditingItem(null);
    setShowScanner(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 relative min-w-[200px] max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search items..."
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingItem(null);
              setShowAddForm(true);
            }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <Plus size={20} />
            <span>Add Manually</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowScanner(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Scan size={20} />
            <span>Scan Product</span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {(scanError || scanSuccess) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
              scanError 
                ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
            }`}
          >
            {scanError ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span>{scanError || scanSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {categories.map(category => (
          <motion.div
            key={category}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
          >
            <motion.button
              whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              onClick={() => setExpandedCategory(
                expandedCategory === category ? null : category
              )}
              className="w-full px-6 py-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <Package2 className="text-blue-600 dark:text-blue-400" size={24} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {category}
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    ({itemsByCategory[category].length} items)
                  </span>
                </h3>
              </div>
              {expandedCategory === category ? (
                <ChevronDown className="text-gray-400" size={20} />
              ) : (
                <ChevronRight className="text-gray-400" size={20} />
              )}
            </motion.button>

            <AnimatePresence>
              {expandedCategory === category && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t dark:border-gray-700"
                >
                  <div className="divide-y dark:divide-gray-700">
                    {itemsByCategory[category].map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <div className="flex items-center gap-4">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </h4>
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="text-green-600 dark:text-green-400">
                                  Selling: ₹{item.sellingPrice}
                                </span>
                                <span className="mx-2 text-gray-400">|</span>
                                <span className="text-blue-600 dark:text-blue-400">
                                  Purchase: ₹{item.purchasePrice}
                                </span>
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Stock: {item.quantity} {item.unit}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                Barcode: {item.barcode}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.quantity < 10 && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full">
                              Low Stock
                            </span>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setEditingItem(item);
                              setShowAddForm(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                          >
                            <Edit2 size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDeleteItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {(showScanner || showAddForm) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold dark:text-white">
                  {showScanner ? 'Scan Product' : (editingItem ? 'Edit Product' : 'Add New Product')}
                </h3>
                <button
                  onClick={() => {
                    setShowScanner(false);
                    setShowAddForm(false);
                    setEditingItem(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              {showScanner ? (
                <BarcodeScanner
                  onScan={handleScan}
                  items={items}
                />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={editingItem?.name}
                      className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-xl dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        required
                        min="0"
                        defaultValue={editingItem?.quantity}
                        className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-xl dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Unit
                      </label>
                      <select
                        name="unit"
                        required
                        defaultValue={editingItem?.unit || 'pcs'}
                        className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-xl dark:text-white"
                      >
                        <option value="kg">Kilogram (kg)</option>
                        <option value="g">Gram (g)</option>
                        <option value="l">Liter (l)</option>
                        <option value="ml">Milliliter (ml)</option>
                        <option value="pcs">Pieces (pcs)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Selling Price (₹)
                      </label>
                      <input
                        type="number"
                        name="sellingPrice"
                        required
                        min="0"
                        step="0.01"
                        defaultValue={editingItem?.sellingPrice}
                        className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-xl dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Purchase Price (₹)
                      </label>
                      <input
                        type="number"
                        name="purchasePrice"
                        required
                        min="0"
                        step="0.01"
                        defaultValue={editingItem?.purchasePrice}
                        className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-xl dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      defaultValue={editingItem?.category}
                      className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-xl dark:text-white"
                      placeholder="e.g., Dairy, Beverages, Snacks"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Barcode
                    </label>
                    <input
                      type="text"
                      name="barcode"
                      required
                      defaultValue={editingItem?.barcode}
                      className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-xl dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Product Image
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-400 flex items-center justify-center gap-2"
                    >
                      <Upload size={20} />
                      <span>Upload Image</span>
                    </motion.button>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingItem(null);
                      }}
                      className="px-4 py-2 border dark:border-gray-700 rounded-xl dark:text-white"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                    >
                      {editingItem ? 'Update' : 'Add'}
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}