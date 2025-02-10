import { ReactNode } from 'react';

export type Unit = 'kg' | 'g' | 'l' | 'ml' | 'pcs';

export interface PriceHistory {
  id: string;
  itemId: string;
  purchasePrice: number;
  sellingPrice: number;
  date: string;
  reason?: string;
}

export interface Item {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  sellingPrice: number;
  purchasePrice: number;
  barcode: string;
  category?: string;
  image?: string;
  minMargin: number;
  reorderPoint: number;
  priceHistory: PriceHistory[];
  lastUpdated: string;
}

export interface BillItem extends Item {
  billQuantity: number;
  originalPrice: number;
  overriddenPrice?: number;
  overriddenBy?: string;
  profitMargin: number;
}

export interface Customer {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  preferredContact?: 'email' | 'sms' | 'both';
}

export interface Bill {
  id: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  totalProfit: number;
  profitMargin: number;
  date: string;
  customer?: Customer;
  paymentMethod: 'cash' | 'card' | 'upi';
  status: 'pending' | 'completed' | 'cancelled';
  invoiceNumber: string;
  notes?: string;
  priceOverrides?: {
    itemId: string;
    originalPrice: number;
    overriddenPrice: number;
    authorizedBy: string;
    reason: string;
  }[];
}

export interface ProfitAnalytics {
  totalProfit: number;
  averageMargin: number;
  topPerformers: {
    item: Item;
    profit: number;
    margin: number;
  }[];
  bottomPerformers: {
    item: Item;
    profit: number;
    margin: number;
  }[];
  profitTrend: {
    date: string;
    profit: number;
    margin: number;
  }[];
  categoryPerformance: {
    category: string;
    profit: number;
    margin: number;
    itemCount: number;
  }[];
}

export interface InventoryValue {
  date: string;
  totalValue: number;
  byCategory: {
    category: string;
    value: number;
  }[];
}

export interface PriceAlert {
  id: string;
  itemId: string;
  type: 'margin' | 'price' | 'stock';
  severity: 'low' | 'medium' | 'high';
  message: string;
  date: string;
  acknowledged: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      position: 'top' | 'bottom' | 'left' | 'right';
      display: boolean;
    };
    title: {
      display: boolean;
      text: string;
    };
  };
  scales?: {
    y?: {
      beginAtZero?: boolean;
      title?: {
        display: boolean;
        text: string;
      };
    };
    x?: {
      title?: {
        display: boolean;
        text: string;
      };
    };
  };
}

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}