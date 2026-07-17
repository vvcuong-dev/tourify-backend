import { CartItemResponse } from './cart-item.response';

export class CartDetailResponse {
  items!: CartItemResponse[];
  totalAmount!: number;
  hasInvalidStock!: boolean;

  constructor(items: CartItemResponse[]) {
    this.items = items;
    this.totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    this.hasInvalidStock = items.some((item) => !item.isStockValid);
  }
}
