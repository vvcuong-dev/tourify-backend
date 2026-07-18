import {
  Order,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
} from '../../../generated/prisma/client';

type OrderWithItemCount = Order & {
  itemCount: number;
  createdAtFormat: string;
};

export class OrderListResponse {
  id!: number;
  orderCode!: string;
  fullName!: string;
  email!: string;
  phone!: string;

  paymentMethod!: PaymentMethod;
  paymentStatus!: PaymentStatus;
  status!: OrderStatus;

  total!: number;
  itemCount!: number;

  createdAt!: Date;
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
