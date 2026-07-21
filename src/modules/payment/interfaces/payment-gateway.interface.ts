import { Order } from '../../../generated/prisma/client';

export interface PaymentGateway {
  createPaymentUrl(order: Order): Promise<string>;
}
