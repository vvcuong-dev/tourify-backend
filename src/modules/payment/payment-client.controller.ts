import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentClientService } from './payment-client.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('Payments')
@Controller('payment')
export class PaymentClientController {
  constructor(private readonly paymentClientService: PaymentClientService) {}

  @Post('zalopay/create')
  @ApiOperation({ summary: 'Create ZaloPay payment URL' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 200,
    description: 'Payment URL created successfully.',
    schema: {
      type: 'object',
      properties: {
        paymentUrl: { type: 'string' },
      },
    },
  })
  createZaloPayPayment(@Body() dto: CreatePaymentDto) {
    return this.paymentClientService.createZaloPayPayment(dto);
  }

  @Post('zalopay/callback')
  @ApiOperation({ summary: 'Handle ZaloPay callback' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: { type: 'string' },
        mac: { type: 'string' },
      },
      required: ['data', 'mac'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Callback processed successfully.',
    schema: {
      type: 'object',
      properties: {
        return_code: { type: 'number' },
        return_message: { type: 'string' },
      },
    },
  })
  handleZaloPayCallback(@Body() body: { data: string; mac: string }) {
    return this.paymentClientService.handleZaloPayCallback(body.data, body.mac);
  }
}
