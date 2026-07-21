import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PaymentClientController } from './payment-client.controller';
import { PaymentClientService } from './payment-client.service';
import { ZalopayService } from './zalopay.service';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentClientController],
  providers: [PaymentClientService, ZalopayService],
})
export class PaymentModule {}
