import { Body, Controller, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartDetailRequestDto } from './dto/cart-item-input.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('detail')
  getCartDetail(@Body() dto: CartDetailRequestDto) {
    return this.cartService.getCartDetail(dto.items);
  }
}
