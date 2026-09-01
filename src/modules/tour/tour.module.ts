import { Module } from '@nestjs/common';
import { TourService } from './tour.service';
import { TourController } from './tour.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { TourClientController } from './tour-client.controller';
import { TourClientService } from './tour-client.service';
import { PermissionModule } from '../permission/permission.module';
@Module({
  controllers: [TourController, TourClientController],
  providers: [TourService, TourClientService],
  imports: [CloudinaryModule, PermissionModule],
})
export class TourModule {}
