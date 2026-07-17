import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderClientController } from './order-client.controller';
import { OrderClientService } from './order-client.service';

@Module({
  controllers: [OrderController, OrderClientController],
  providers: [OrderService, OrderClientService],
})
export class OrderModule {}
