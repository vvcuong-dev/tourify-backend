import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderClientService } from './order-client.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDetailResponse } from './responses/order-detail.response';

@ApiTags('Orders')
@Controller('orders')
export class OrderClientController {
  constructor(private readonly orderClientService: OrderClientService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully.',
    type: OrderDetailResponse,
  })
  create(@Body() dto: CreateOrderDto) {
    return this.orderClientService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get order by order code and email' })
  @ApiQuery({ name: 'orderCode', type: String })
  @ApiQuery({ name: 'email', type: String })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully.',
    type: OrderDetailResponse,
  })
  findByCodeAndEmail(
    @Query('orderCode') orderCode: string,
    @Query('email') email: string,
  ) {
    return this.orderClientService.findByCodeAndEmail({ orderCode, email });
  }
}
