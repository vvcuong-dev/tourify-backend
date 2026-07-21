import {
  Order,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
} from '../../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

type OrderWithItemCount = Order & {
  itemCount: number;
  createdAtFormat: string;
};

export class OrderListResponse {
  @ApiProperty({ example: 1 })
  id!: number;
  @ApiProperty({ example: 'ORD123456' })
  orderCode!: string;
  @ApiProperty({ example: 'Nguyen Van A' })
  fullName!: string;
  @ApiProperty({ example: 'user@example.com' })
  email!: string;
  @ApiProperty({ example: '0901234567' })
  phone!: string;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod!: PaymentMethod;
  @ApiProperty({ enum: PaymentStatus })
  paymentStatus!: PaymentStatus;
  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiProperty({ example: 5000000 })
  total!: number;
  @ApiProperty({ example: 3 })
  itemCount!: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
  @ApiProperty({ example: '2026-07-21 10:00:00' })
  createdAtFormat!: string;

  constructor(order: OrderWithItemCount) {
    this.id = order.id;
    this.orderCode = order.orderCode;
    this.fullName = order.fullName;
    this.email = order.email;
    this.phone = order.phone;
    this.paymentMethod = order.paymentMethod;
    this.paymentStatus = order.paymentStatus;
    this.status = order.status;
    this.total = order.total;
    this.itemCount = order.itemCount;
    this.createdAt = order.createdAt;
    this.createdAtFormat = order.createdAtFormat;
  }
}
