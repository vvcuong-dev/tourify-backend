import { Module } from '@nestjs/common';
import { TourService } from './tour.service';
import { TourController } from './tour.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
@Module({
  controllers: [TourController],
  providers: [TourService],
  imports: [CloudinaryModule],
})
export class TourModule {}
