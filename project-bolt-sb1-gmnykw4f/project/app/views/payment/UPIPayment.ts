import { Observable } from '@nativescript/core';
import { QRGenerator } from 'nativescript-qr-generator';
import { SocialShare } from 'nativescript-social-share';
import { formatCurrency } from '../../utils/formatters';

export class UPIPaymentViewModel extends Observable {
  private qrGenerator: QRGenerator;
  private amount: number;
  private merchantUpiId: string;
  private transactionRef: string;

  constructor(params: { amount: number, merchantUpiId: string }) {
    super();
    this.amount = params.amount;
    this.merchantUpiId = params.merchantUpiId;
    this.transactionRef = Date.now().toString();
    this.qrGenerator = new QRGenerator();

    this.generateQRCode();
  }

  get formattedAmount(): string {
    return formatCurrency(this.amount);
  }

  private async generateQRCode() {
    try {
      // Generate UPI payment URL
      const upiUrl = `upi://pay?pa=${this.merchantUpiId}&pn=POS%20Payment&am=${this.amount}&tr=${this.transactionRef}&cu=INR`;
      
      // Generate QR code
      const qrImage = await this.qrGenerator.generate({
        content: upiUrl,
        width: 300,
        height: 300
      });

      this.set('qrCodeImage', qrImage);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  onSaveQR() {
    // Implementation for saving QR code to gallery
  }

  onShareQR() {
    SocialShare.shareImage(this.get('qrCodeImage'));
  }

  onCheckStatus() {
    // Implementation for checking payment status
  }

  onCancel() {
    // Implementation for canceling payment
  }
}