import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import moment from 'moment';
import { AppException } from '../../common/exceptions/app.exception';
import { TOURIFY_ERROR_CODES } from '../../constants/error-code.constant';
import { zalopayConfig } from '../../configs/zalopay.config';
import { Order } from '../../generated/prisma/client';
import { PaymentGateway } from './interfaces/payment-gateway.interface';
import { ZaloPayCallbackResult } from './interfaces/zalo-pay-callback-result.interface';
import { ZaloPayCreateResponse } from './interfaces/zalo-pay-create.response';

@Injectable()
export class ZalopayService implements PaymentGateway {
  private readonly logger = new Logger(ZalopayService.name);

  async createPaymentUrl(order: Order): Promise<string> {
    const embedData = {
      redirecturl: `${zalopayConfig.domainWebsite}/orders/payment-result?orderCode=${order.orderCode}&email=${order.email}`,
    };

    const items = [{}];
    const transId = Math.floor(Math.random() * 1000000);
    const appTransId = `${moment().format('YYMMDD')}_${transId}`;

    const orderPayload = {
      app_id: zalopayConfig.appId,
      app_trans_id: appTransId,
      app_user: `${order.phone}-${order.id}`,
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embedData),
      amount: order.total,
      description: `Thanh toán đơn hàng ${order.orderCode}`,
      bank_code: '',
      callback_url: `${zalopayConfig.domainWebsite}/api/payment/zalopay/callback`,
    };

    const macData = [
      zalopayConfig.appId,
      orderPayload.app_trans_id,
      orderPayload.app_user,
      orderPayload.amount,
      orderPayload.app_time,
      orderPayload.embed_data,
      orderPayload.item,
    ].join('|');

    const mac = CryptoJS.HmacSHA256(macData, zalopayConfig.key1).toString();

    try {
      const response = await axios.post<ZaloPayCreateResponse>(
        zalopayConfig.endpoint,
        null,
        {
          params: { ...orderPayload, mac },
        },
      );

      if (response.data.return_code !== 1) {
        this.logger.error(
          `ZaloPay create failed: ${response.data.return_message}`,
        );
        throw new AppException(
          TOURIFY_ERROR_CODES.PAYMENT.CREATE_PAYMENT_FAILED,
          HttpStatus.BAD_GATEWAY,
        );
      }

      // Trả kèm appTransId để service lưu lại vào Order
      return JSON.stringify({
        paymentUrl: response.data.order_url,
        appTransId,
      });
    } catch (error) {
      this.logger.error('ZaloPay create payment error', error);
      throw new AppException(
        TOURIFY_ERROR_CODES.PAYMENT.CREATE_PAYMENT_FAILED,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  verifyCallback(dataStr: string, reqMac: string): ZaloPayCallbackResult {
    const mac = CryptoJS.HmacSHA256(dataStr, zalopayConfig.key2).toString();

    if (reqMac !== mac) {
      return { isValid: false };
    }

    const data = JSON.parse(dataStr) as { app_trans_id: string };
    return { isValid: true, appTransId: data.app_trans_id };
  }
}
