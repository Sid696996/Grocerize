import { Observable } from '@nativescript/core';
import { formatCurrency } from '../../utils/formatters';

export class HomeViewModel extends Observable {
  constructor() {
    super();

    // Initialize with sample data
    this.set('todaySales', '15');
    this.set('todayRevenue', formatCurrency(25000));
    this.set('recentTransactions', [
      {
        customerName: 'John Doe',
        date: '2 hours ago',
        amount: formatCurrency(1500)
      },
      {
        customerName: 'Jane Smith',
        date: '4 hours ago',
        amount: formatCurrency(2300)
      }
    ]);
  }

  onNewSale() {
    // Navigate to new sale page
  }

  onProducts() {
    // Navigate to products page
  }

  onCustomers() {
    // Navigate to customers page
  }

  onHistory() {
    // Navigate to history page
  }

  onSettings() {
    // Navigate to settings page
  }
}