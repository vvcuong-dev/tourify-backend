import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderClientController } from './order-client.controller';
import { OrderClientService } from './order-client.service';
import { PermissionModule } from '../permission/permission.module';

@Module({
  controllers: [OrderController, OrderClientController],
  providers: [OrderService, OrderClientService],
  imports: [PermissionModule],
})
export class OrderModule {}
