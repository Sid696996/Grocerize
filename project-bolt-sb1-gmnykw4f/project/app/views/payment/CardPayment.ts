import { Observable } from '@nativescript/core';
import { Nfc } from 'nativescript-nfc';
import { formatCurrency } from '../../utils/formatters';

export class CardPaymentViewModel extends Observable {
  private nfc: Nfc;
  private amount: number;

  constructor(params: { amount: number }) {
    super();
    this.amount = params.amount;
    this.nfc = new Nfc();
    
    this.set('isProcessing', false);
    this.set('status', 'Waiting for card...');

    this.initializeNFC();
  }

  get formattedAmount(): string {
    return formatCurrency(this.amount);
  }

  private async initializeNFC() {
    try {
      await this.nfc.available();
      await this.nfc.enabled();
      
      this.startNFCListener();
    } catch (error) {
      this.set('status', 'NFC not available on this device');
      console.error('NFC error:', error);
    }
  }

  private startNFCListener() {
    this.nfc.setOnNdefDiscoveredListener((data) => {
      this.processPayment(data);
    });
  }

  private async processPayment(nfcData: any) {
    this.set('isProcessing', true);
    this.set('status', 'Processing payment...');

    try {
      // Implementation for processing card payment
      // This would integrate with your payment gateway
      
      this.set('status', 'Payment successful!');
    } catch (error) {
      this.set('status', 'Payment failed. Please try again.');
      console.error('Payment error:', error);
    } finally {
      this.set('isProcessing', false);
    }
  }

  onCancel() {
    // Implementation for canceling payment
  }
}