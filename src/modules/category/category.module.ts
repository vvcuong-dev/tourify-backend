import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { CategoryClientController } from './category-client.controller';
import { CategoryClientService } from './category-client.service';

@Module({
  controllers: [CategoryController, CategoryClientController],
  providers: [CategoryService, CategoryClientService],
  imports: [CloudinaryModule],
})
export class CategoryModule {}
