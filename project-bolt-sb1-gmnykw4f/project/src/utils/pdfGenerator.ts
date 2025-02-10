import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Bill } from '../types';
import { formatCurrency } from './formatters';

export const generatePDF = (bill: Bill): string => {
  const doc = new jsPDF();

  // Add header with logo
  doc.setFontSize(24);
  doc.setTextColor(59, 130, 246); // Blue color
  doc.text('Grocerize', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Invoice', 105, 30, { align: 'center' });

  // Add bill details
  doc.setFontSize(10);
  doc.text(`Invoice No: ${bill.id.slice(0, 8)}`, 15, 40);
  doc.text(`Date: ${new Date(bill.date).toLocaleDateString()}`, 15, 45);
  doc.text(`Payment Method: ${bill.paymentMethod?.toUpperCase() || 'CASH'}`, 15, 50);

  // Add customer details if available
  let yPos = 60;
  if (bill.customer && (bill.customer.name || bill.customer.phone)) {
    doc.setFont(undefined, 'bold');
    doc.text('Customer Details:', 15, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 5;
    
    if (bill.customer.name) {
      doc.text(`Name: ${bill.customer.name}`, 15, yPos);
      yPos += 5;
    }
    if (bill.customer.phone) {
      doc.text(`Phone: ${bill.customer.phone}`, 15, yPos);
      yPos += 5;
    }
    yPos += 5;
  }

  // Add items table
  const tableData = bill.items.map(item => [
    item.name,
    `${item.billQuantity} ${item.unit}`,
    formatCurrency(item.sellingPrice),
    formatCurrency(item.sellingPrice * item.billQuantity)
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Item', 'Quantity', 'Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });

  // Add summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Add line items
  doc.text(`Subtotal:`, 140, finalY);
  doc.text(formatCurrency(bill.subtotal), 170, finalY, { align: 'right' });
  
  if (bill.discount > 0) {
    doc.text(`Discount:`, 140, finalY + 5);
    doc.text(`-${formatCurrency(bill.discount)}`, 170, finalY + 5, { align: 'right' });
  }
  
  // Add total with background
  doc.setFillColor(59, 130, 246);
  doc.rect(135, finalY + 8, 60, 8, 'F');
  doc.setTextColor(255);
  doc.setFont(undefined, 'bold');
  doc.text('Total:', 140, finalY + 14);
  doc.text(formatCurrency(bill.total), 170, finalY + 14, { align: 'right' });

  // Add footer
  doc.setTextColor(0);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  doc.text('Thank you for shopping with us!', 105, 280, { align: 'center' });
  doc.text('This is a computer generated invoice.', 105, 285, { align: 'center' });

  return doc.output('datauristring');
};