import { CartItemResponse } from './cart-item.response';
import { ApiProperty } from '@nestjs/swagger';

export class CartDetailResponse {
  @ApiProperty({ type: () => [CartItemResponse] })
  items!: CartItemResponse[];

  @ApiProperty({ example: 2600000 })
  totalAmount!: number;

  @ApiProperty({ example: false })
  hasInvalidStock!: boolean;

  constructor(items: CartItemResponse[]) {
    this.items = items;
    this.totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    this.hasInvalidStock = items.some((item) => !item.isStockValid);
  }
}
