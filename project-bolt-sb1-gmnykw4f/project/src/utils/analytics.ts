import { Bill, PaymentAnalytics, Item } from '../types';

export const generatePaymentAnalytics = (bills: Bill[]): PaymentAnalytics => {
  const totalSales = bills.reduce((sum, bill) => sum + bill.total, 0);
  
  const paymentMethods = bills.reduce((acc, bill) => ({
    cash: acc.cash + (bill.paymentMethod === 'cash' ? bill.total : 0),
    card: acc.card + (bill.paymentMethod === 'card' ? bill.total : 0),
    upi: acc.upi + (bill.paymentMethod === 'upi' ? bill.total : 0),
  }), { cash: 0, card: 0, upi: 0 });

  const averageTransactionValue = totalSales / bills.length || 0;

  // Calculate top selling items
  const itemSales = new Map<string, { item: Item; quantity: number; revenue: number }>();
  
  bills.forEach(bill => {
    bill.items.forEach(item => {
      const existing = itemSales.get(item.id) || { 
        item, 
        quantity: 0, 
        revenue: 0 
      };
      
      itemSales.set(item.id, {
        item,
        quantity: existing.quantity + item.billQuantity,
        revenue: existing.revenue + (item.sellingPrice * item.billQuantity)
      });
    });
  });

  const topSellingItems = Array.from(itemSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    totalSales,
    paymentMethods,
    averageTransactionValue,
    topSellingItems
  };
};