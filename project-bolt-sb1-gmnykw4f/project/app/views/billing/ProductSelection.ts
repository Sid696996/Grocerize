import { Observable } from '@nativescript/core';
import { database } from '../../database/database';
import { formatCurrency } from '../../utils/formatters';

interface Product {
  id: number;
  name: string;
  price: number;
  image_path: string;
  formattedPrice?: string;
}

export class ProductSelectionViewModel extends Observable {
  private products: Product[] = [];
  private cartItems: Map<number, number> = new Map(); // productId -> quantity

  constructor() {
    super();
    this.loadProducts();
    
    this.set('searchQuery', '');
    this.set('showCartSummary', false);
    this.set('cartItemCount', 0);
    this.set('cartTotal', formatCurrency(0));
  }

  private async loadProducts() {
    try {
      const result = await database.all('SELECT * FROM products');
      this.products = result.map(product => ({
        ...product,
        formattedPrice: formatCurrency(product.price)
      }));
      this.set('filteredProducts', this.products);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  get filteredProducts() {
    const query = this.get('searchQuery').toLowerCase();
    return this.products.filter(product => 
      product.name.toLowerCase().includes(query)
    );
  }

  onProductTap(args: any) {
    const product = args.object.bindingContext as Product;
    const currentQuantity = this.cartItems.get(product.id) || 0;
    this.cartItems.set(product.id, currentQuantity + 1);
    
    this.updateCartSummary();
  }

  private updateCartSummary() {
    let total = 0;
    let itemCount = 0;

    for (const [productId, quantity] of this.cartItems) {
      const product = this.products.find(p => p.id === productId);
      if (product) {
        total += product.price * quantity;
        itemCount += quantity;
      }
    }

    this.set('showCartSummary', itemCount > 0);
    this.set('cartItemCount', itemCount);
    this.set('cartTotal', formatCurrency(total));
  }

  showCart() {
    // Implementation for showing cart details
  }

  onCheckout() {
    // Implementation for checkout process
  }
}