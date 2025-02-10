import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Item, Bill } from './types';
import Inventory from './components/Inventory';
import Billing from './components/Billing';
import BillingHistory from './components/BillingHistory';
import { Package2, Receipt, History, Sun, Moon, LayoutDashboard } from 'lucide-react';

// Sample data with categories
const initialItems: Item[] = [
  // Dairy Products
  {
    id: '1',
    name: 'Amul Milk',
    quantity: 50,
    unit: 'l',
    sellingPrice: 65,
    purchasePrice: 58,
    barcode: '8901014001505',
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '2',
    name: 'Amul Butter',
    quantity: 30,
    unit: 'pcs',
    sellingPrice: 55,
    purchasePrice: 48,
    barcode: '8901014002205',
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400'
  },
  
  // Grains & Pulses
  {
    id: '3',
    name: 'Tata Salt',
    quantity: 50,
    unit: 'kg',
    sellingPrice: 24,
    purchasePrice: 20,
    barcode: '8901058851007',
    category: 'Essentials',
    image: 'https://images.unsplash.com/photo-1518110925495-5fe89db39c30?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '4',
    name: 'Aashirvaad Atta',
    quantity: 100,
    unit: 'kg',
    sellingPrice: 55,
    purchasePrice: 45,
    barcode: '8901719110018',
    category: 'Grains',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400'
  },
  
  // Beverages
  {
    id: '5',
    name: 'Coca Cola',
    quantity: 75,
    unit: 'pcs',
    sellingPrice: 40,
    purchasePrice: 35,
    barcode: '8901058000107',
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '6',
    name: 'Red Bull',
    quantity: 40,
    unit: 'pcs',
    sellingPrice: 125,
    purchasePrice: 110,
    barcode: '9002490100070',
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1613426757577-d6baeb0d7c4f?auto=format&fit=crop&q=80&w=400'
  },
  
  // Snacks
  {
    id: '7',
    name: 'Lays Classic',
    quantity: 60,
    unit: 'pcs',
    sellingPrice: 20,
    purchasePrice: 16,
    barcode: '8901491000319',
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '8',
    name: 'Cadbury Dairy Milk',
    quantity: 45,
    unit: 'pcs',
    sellingPrice: 80,
    purchasePrice: 70,
    barcode: '8901058850017',
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1623341214825-9f4f963727da?auto=format&fit=crop&q=80&w=400'
  },
  
  // Personal Care
  {
    id: '9',
    name: 'Dove Soap',
    quantity: 55,
    unit: 'pcs',
    sellingPrice: 45,
    purchasePrice: 38,
    barcode: '8901030704833',
    category: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '10',
    name: 'Colgate Toothpaste',
    quantity: 70,
    unit: 'pcs',
    sellingPrice: 55,
    purchasePrice: 48,
    barcode: '8901314010520',
    category: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?auto=format&fit=crop&q=80&w=400'
  }
];

function App() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [bills, setBills] = useState<Bill[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'billing' | 'history'>('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleAddItem = (newItem: Item) => {
    setItems([...items, newItem]);
  };

  const handleEditItem = (updatedItem: Item) => {
    setItems(items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleCheckout = (bill: Bill) => {
    setBills([...bills, bill]);
    setItems(items.map(item => {
      const billItem = bill.items.find(bi => bi.id === item.id);
      if (billItem) {
        return {
          ...item,
          quantity: item.quantity - billItem.billQuantity
        };
      }
      return item;
    }));
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'dark bg-gray-900' : 'bg-gray-100'
    }`}>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-gray-800 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0 flex items-center"
              >
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Grocerize
                </h1>
              </motion.div>
              <nav className="ml-6 flex space-x-4">
                {[
                  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                  { id: 'inventory', icon: Package2, label: 'Inventory' },
                  { id: 'billing', icon: Receipt, label: 'Billing' },
                  { id: 'history', icon: History, label: 'History' }
                ].map(({ id, icon: Icon, label }) => (
                  <motion.button
                    key={id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(id as any)}
                    className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="mr-2" size={20} />
                    {label}
                  </motion.button>
                ))}
              </nav>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
            >
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="py-6"
      >
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <Dashboard items={items} bills={bills} />
          ) : activeTab === 'inventory' ? (
            <Inventory
              items={items}
              onAddItem={handleAddItem}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
            />
          ) : activeTab === 'billing' ? (
            <Billing
              items={items}
              onCheckout={handleCheckout}
            />
          ) : (
            <BillingHistory bills={bills} />
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
}

function Dashboard({ items, bills }: { items: Item[], bills: Bill[] }) {
  const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalSales = bills.reduce((sum, bill) => sum + bill.total, 0);
  const lowStockItems = items.filter(item => item.quantity < 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Stock</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">{totalStock}</p>
        </motion.div>
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Sales</h3>
          <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR'
            }).format(totalSales)}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Low Stock Items</h3>
          <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">{lowStockItems.length}</p>
        </motion.div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Sales</h3>
          <div className="space-y-4">
            {bills.slice(-5).reverse().map(bill => (
              <div key={bill.id} className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(bill.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {bill.items.length} items
                  </p>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                  }).format(bill.total)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Low Stock Alert</h3>
          <div className="space-y-4">
            {lowStockItems.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-red-500">Only {item.quantity} {item.unit} left</p>
                </div>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                >
                  Update Stock
                </button>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                All items are well stocked
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default App;