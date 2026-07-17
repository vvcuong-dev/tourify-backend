import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OrderClientService } from './order-client.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrderClientController {
  constructor(private readonly orderClientService: OrderClientService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.orderClientService.create(dto);
  }

  @Get()
  findByCodeAndEmail(
    @Query('orderCode') orderCode: string,
    @Query('email') email: string,
  ) {
    return this.orderClientService.findByCodeAndEmail({ orderCode, email });
  }
}
