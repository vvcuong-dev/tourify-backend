import {
  Order,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
} from '../../../generated/prisma/client';
import { OrderItemResponse, OrderItemWithFormat } from './order-item.response';
import { ApiProperty } from '@nestjs/swagger';

type OrderWithItems = Order & {
  items: OrderItemWithFormat[];
  createdAtFormat: string;
};

export class OrderDetailResponse {
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
  @ApiProperty({ example: 'Please call before arrival', nullable: true })
  note!: string | null;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod!: PaymentMethod;
  @ApiProperty({ enum: PaymentStatus })
  paymentStatus!: PaymentStatus;
  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiProperty({ example: 5000000 })
  subTotal!: number;
  @ApiProperty({ example: 0 })
  discount!: number;
  @ApiProperty({ example: 5000000 })
  total!: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
  @ApiProperty({ example: '2026-07-21 10:00:00' })
  createdAtFormat!: string;

  @ApiProperty({ type: () => [OrderItemResponse] })
  items!: OrderItemResponse[];

  constructor(order: OrderWithItems) {
    this.id = order.id;
    this.orderCode = order.orderCode;
    this.fullName = order.fullName;
    this.email = order.email;
    this.phone = order.phone;
    this.note = order.note;
    this.paymentMethod = order.paymentMethod;
    this.paymentStatus = order.paymentStatus;
    this.status = order.status;
    this.subTotal = order.subTotal;
    this.discount = order.discount;
    this.total = order.total;
    this.createdAt = order.createdAt;
    this.createdAtFormat = order.createdAtFormat;
    this.items = order.items.map((i) => new OrderItemResponse(i));
  }
}
