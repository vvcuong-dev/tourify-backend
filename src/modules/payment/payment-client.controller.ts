import { Body, Controller, Post } from '@nestjs/common';
import { PaymentClientService } from './payment-client.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payment')
export class PaymentClientController {
  constructor(private readonly paymentClientService: PaymentClientService) {}

  @Post('zalopay/create')
  createZaloPayPayment(@Body() dto: CreatePaymentDto) {
    return this.paymentClientService.createZaloPayPayment(dto);
  }

  @Post('zalopay/callback')
  handleZaloPayCallback(@Body() body: { data: string; mac: string }) {
    return this.paymentClientService.handleZaloPayCallback(body.data, body.mac);
  }
}
