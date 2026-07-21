import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException } from '../../common/exceptions/app.exception';
import { TOURIFY_ERROR_CODES } from '../../constants/error-code.constant';
import { PaymentStatus } from '../../generated/prisma/browser';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ZalopayService } from './zalopay.service';

@Injectable()
export class PaymentClientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly zalopayService: ZalopayService,
  ) {}

  async createZaloPayPayment(
    dto: CreatePaymentDto,
  ): Promise<{ paymentUrl: string }> {
    const order = await this.prisma.order.findFirst({
      where: { orderCode: dto.orderCode, email: dto.email, deleted: false },
    });

    if (!order) {
      throw new AppException(
        TOURIFY_ERROR_CODES.ORDER.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new AppException(
        TOURIFY_ERROR_CODES.PAYMENT.ORDER_ALREADY_PAID,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.zalopayService.createPaymentUrl(order);
    const { paymentUrl, appTransId } = JSON.parse(result) as {
      paymentUrl: string;
      appTransId: string;
    };

    await this.prisma.order.update({
      where: { id: order.id },
      data: { paymentTransactionId: appTransId },
    });

    return { paymentUrl };
  }

  async handleZaloPayCallback(
    dataStr: string,
    reqMac: string,
  ): Promise<{ return_code: number; return_message: string }> {
    const result = this.zalopayService.verifyCallback(dataStr, reqMac);

    if (!result.isValid) {
      return { return_code: -1, return_message: 'mac not equal' };
    }

    try {
      await this.prisma.order.updateMany({
        where: { paymentTransactionId: result.appTransId, deleted: false },
        data: { paymentStatus: PaymentStatus.PAID },
      });

      return { return_code: 1, return_message: 'success' };
    } catch {
      return { return_code: 0, return_message: 'update failed' };
    }
  }
}
