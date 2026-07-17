import {
  Order,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
} from '../../../generated/prisma/client';
import { OrderItemResponse, OrderItemWithFormat } from './order-item.response';

type OrderWithItems = Order & {
  items: OrderItemWithFormat[];
  createdAtFormat: string;
};

export class OrderDetailResponse {
  id!: number;
  orderCode!: string;

  fullName!: string;
  email!: string;
  phone!: string;
  note!: string | null;

  paymentMethod!: PaymentMethod;
  paymentStatus!: PaymentStatus;
  status!: OrderStatus;

  subTotal!: number;
  discount!: number;
  total!: number;

  createdAt!: Date;
  createdAtFormat!: string;

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
