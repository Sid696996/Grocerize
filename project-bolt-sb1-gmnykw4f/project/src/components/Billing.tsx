import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Minus, Plus, X, Printer, Send, CreditCard,
  Wallet, Smartphone, Receipt, Download, Mail, AlertCircle
} from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import { Item, BillItem, Bill, Customer } from '../types';
import BarcodeScanner from './BarcodeScanner';
import { generatePDF } from '../utils/pdfGenerator';
import { formatCurrency } from '../utils/formatters';
import { sendInvoice } from '../utils/notifications';
import 'react-phone-number-input/style.css';

interface BillingProps {
  items: Item[];
  onCheckout: (bill: Bill) => void;
}

export default function Billing({ items, onCheckout }: BillingProps) {
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [customer, setCustomer] = useState<Customer>({});
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = (item: Item) => {
    if (item.quantity === 0) {
      setError('Item out of stock!');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const existingItem = billItems.find(bi => bi.id === item.id);
    if (existingItem) {
      if (existingItem.billQuantity >= item.quantity) {
        setError('Not enough stock!');
        setTimeout(() => setError(null), 3000);
        return;
      }
      setBillItems(billItems.map(bi =>
        bi.id === item.id
          ? { ...bi, billQuantity: bi.billQuantity + 1 }
          : bi
      ));
    } else {
      setBillItems([...billItems, { ...item, billQuantity: 1 }]);
    }
  };

  const removeItem = (id: string) => {
    setBillItems(billItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setBillItems(billItems.map(item => {
      if (item.id === id) {
        const newQuantity = item.billQuantity + delta;
        if (newQuantity < 1 || newQuantity > item.quantity) return item;
        return { ...item, billQuantity: newQuantity };
      }
      return item;
    }));
  };

  const subtotal = billItems.reduce((sum, item) => 
    sum + (item.sellingPrice * item.billQuantity), 0
  );
  const total = subtotal - discount;

  const handleCheckout = async () => {
    if (billItems.length === 0) {
      setError('Cart is empty!');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setProcessing(true);
    try {
      const bill: Bill = {
        id: crypto.randomUUID(),
        items: billItems,
        subtotal,
        discount,
        total,
        date: new Date().toISOString(),
        customer,
        paymentMethod,
        status: 'completed',
        invoiceNumber: `INV-${Date.now().toString(36).toUpperCase()}`,
        tax: 0
      };

      // Generate and send invoice
      if (customer.email || customer.phone) {
        await sendInvoice(bill, customer);
      }

      onCheckout(bill);
      setBillItems([]);
      setDiscount(0);
      setCustomer({});
      setShowPaymentForm(false);
    } catch (err) {
      setError('Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Search and Scanner */}
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-xl dark:text-white"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchTerm('')}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={20} />
              </motion.button>
            </div>
            <BarcodeScanner onScan={addItem} items={items} />
          </motion.div>

          {/* Product Grid */}
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group cursor-pointer"
                  onClick={() => addItem(item)}
                >
                  {item.image && (
                    <div 
                      className="aspect-square rounded-lg overflow-hidden mb-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(item.image);
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-200"
                      />
                    </div>
                  )}
                  <div className="p-2">
                    <h3 className="font-medium dark:text-white truncate">{item.name}</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600 dark:text-green-400">
                          Selling: ₹{item.sellingPrice}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                          Purchase: ₹{item.purchasePrice}
                        </span>
                        <span className={`text-sm ${
                          item.quantity > 10 
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {item.quantity} left
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bill Section */}
        <div className="space-y-6">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            ref={printRef}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold dark:text-white">Current Bill</h2>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCustomerForm(true)}
                  className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                >
                  <Send size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.print()}
                  className="p-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300"
                >
                  <Printer size={20} />
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {billItems.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-xl mb-2"
                >
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium dark:text-white">{item.name}</div>
                      <div className="space-y-1">
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Selling: ₹{item.sellingPrice} × {item.billQuantity} {item.unit}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          Purchase: ₹{item.purchasePrice}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <Minus size={16} className="dark:text-white" />
                      </motion.button>
                      <span className="w-8 text-center dark:text-white">{item.billQuantity}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <Plus size={16} className="dark:text-white" />
                      </motion.button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <X size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="border-t dark:border-gray-700 mt-4 pt-4 space-y-3">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="Discount amount"
                  className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-xl dark:text-white"
                />
              </div>
              <div className="flex justify-between font-bold text-lg dark:text-white">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {(['cash', 'card', 'upi'] as const).map(method => (
                  <motion.button
                    key={method}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-2 rounded-xl flex items-center justify-center gap-2 ${
                      paymentMethod === method
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {method === 'cash' && <Wallet size={16} />}
                    {method === 'card' && <CreditCard size={16} />}
                    {method === 'upi' && <Smartphone size={16} />}
                    <span className="capitalize">{method}</span>
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPaymentForm(true)}
                disabled={processing || billItems.length === 0}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Receipt size={20} />
                    <span>Proceed to Payment</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Customer Form Modal */}
      <AnimatePresence>
        {showCustomerForm && (
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
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Customer Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={customer.name || ''}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-xl dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <PhoneInput
                    international
                    defaultCountry="IN"
                    value={customer.phone}
                    onChange={(value) => setCustomer({ ...customer, phone: value })}
                    className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-xl dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customer.email || ''}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-xl dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preferred Contact Method
                  </label>
                  <select
                    value={customer.preferredContact || 'email'}
                    onChange={(e) => setCustomer({ 
                      ...customer, 
                      preferredContact: e.target.value as 'email' | 'sms' | 'both'
                    })}
                    className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-xl dark:text-white"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCustomerForm(false)}
                    className="px-4 py-2 border dark:border-gray-700 rounded-xl dark:text-white"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCustomerForm(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl"
                  >
                    Save
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Form Modal */}
      <AnimatePresence>
        {showPaymentForm && (
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
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold dark:text-white">Complete Payment</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPaymentForm(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Amount to Pay</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(total)}
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-xl dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-xl dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-xl dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        placeholder="username@upi"
                        className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-700 rounded-xl dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  disabled={processing}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      <span>Complete Payment</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
          >
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={selectedImage}
              alt="Product preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}