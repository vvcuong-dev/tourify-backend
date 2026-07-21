import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CartDetailRequestDto } from './dto/cart-item-input.dto';
import { CartDetailResponse } from './responses/cart-detail.response';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('detail')
  @ApiOperation({ summary: 'Get cart detail and price summary' })
  @ApiBody({ type: CartDetailRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Cart detail calculated successfully.',
    type: CartDetailResponse,
  })
  getCartDetail(@Body() dto: CartDetailRequestDto) {
    return this.cartService.getCartDetail(dto.items);
  }
}
