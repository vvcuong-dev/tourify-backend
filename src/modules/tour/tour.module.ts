import { Module } from '@nestjs/common';
import { TourService } from './tour.service';
import { TourController } from './tour.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { TourClientController } from './tour-client.controller';
import { TourClientService } from './tour-client.service';
@Module({
  controllers: [TourController, TourClientController],
  providers: [TourService, TourClientService],
  imports: [CloudinaryModule],
})
export class TourModule {}
