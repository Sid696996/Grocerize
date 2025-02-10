import { Observable } from '@nativescript/core';
import { SocialShare } from 'nativescript-social-share';
import { generatePDF } from '../../utils/pdfGenerator';
import { formatCurrency } from '../../utils/formatters';
import { database } from '../../database/database';

interface BillItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  formattedPrice: string;
}

interface Customer {
  name: string;
  phone: string;
  email: string;
}

export class BillGenerationViewModel extends Observable {
  private billItems: BillItem[] = [];
  private subtotal: number = 0;
  private tax: number = 0;
  private total: number = 0;

  constructor(params: { items: BillItem[] }) {
    super();
    this.billItems = params.items;
    this.calculateTotals();
    
    this.set('customer', {
      name: '',
      phone: '',
      email: ''
    });
  }

  private calculateTotals() {
    this.subtotal = this.billItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    this.tax = this.subtotal * 0.18; // 18% GST
    this.total = this.subtotal + this.tax;

    this.set('formattedSubtotal', formatCurrency(this.subtotal));
    this.set('formattedTax', formatCurrency(this.tax));
    this.set('formattedTotal', formatCurrency(this.total));
  }

  async generatePDF() {
    try {
      const pdfPath = await generatePDF({
        items: this.billItems,
        customer: this.get('customer'),
        subtotal: this.subtotal,
        tax: this.tax,
        total: this.total
      });

      return pdfPath;
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }

  async sendToCustomer() {
    const customer = this.get('customer');
    if (!customer.email && !customer.phone) {
      // Show error message
      return;
    }

    try {
      const pdfPath = await this.generatePDF();
      
      // Save transaction to database
      await this.saveTransaction();

      // Send PDF to customer
      if (customer.email) {
        // Implement email sending
      }
      if (customer.phone) {
        // Implement SMS sending
      }
    } catch (error) {
      console.error('Error sending to customer:', error);
    }
  }

  private async saveTransaction() {
    try {
      // Save customer if new
      const customerId = await this.saveCustomer();

      // Save transaction
      const result = await database.execSQL(
        `INSERT INTO transactions (
          customer_id, total_amount, payment_method, status
        ) VALUES (?, ?, ?, ?)`,
        [customerId, this.total, 'pending', 'created']
      );

      const transactionId = result.insertId;

      // Save transaction items
      for (const item of this.billItems) {
        await database.execSQL(
          `INSERT INTO transaction_items (
            transaction_id, product_id, quantity, price_at_time
          ) VALUES (?, ?, ?, ?)`,
          [transactionId, item.id, item.quantity, item.price]
        );
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  }

  private async saveCustomer(): Promise<number> {
    const customer = this.get('customer');
    try {
      const result = await database.execSQL(
        `INSERT INTO customers (name, phone, email)
         VALUES (?, ?, ?)`,
        [customer.name, customer.phone, customer.email]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error saving customer:', error);
      throw error;
    }
  }

  shareBill() {
    this.generatePDF().then(pdfPath => {
      if (pdfPath) {
        SocialShare.shareFile(pdfPath);
      }
    });
  }
}