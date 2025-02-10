import { knownFolders } from '@nativescript/core';
import { PDFGenerator } from 'nativescript-pdf-generation';
import { formatCurrency } from './formatters';

interface PDFData {
  items: any[];
  customer: any;
  subtotal: number;
  tax: number;
  total: number;
}

export async function generatePDF(data: PDFData): Promise<string> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .header { text-align: center; margin-bottom: 20px; }
          .customer-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          .total { font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Invoice</h1>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="customer-info">
          <h2>Customer Details</h2>
          <p>Name: ${data.customer.name}</p>
          <p>Phone: ${data.customer.phone}</p>
          <p>Email: ${data.customer.email}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.price)}</td>
                <td>${formatCurrency(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total">
          <p>Subtotal: ${formatCurrency(data.subtotal)}</p>
          <p>Tax (18%): ${formatCurrency(data.tax)}</p>
          <p>Total: ${formatCurrency(data.total)}</p>
        </div>
      </body>
    </html>
  `;

  try {
    const pdfGenerator = new PDFGenerator();
    const pdfPath = knownFolders.documents().path + '/invoice.pdf';
    
    await pdfGenerator.generate({
      html,
      fileName: pdfPath,
      paperSize: 'A4'
    });

    return pdfPath;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}