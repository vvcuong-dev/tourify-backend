import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
  imports: [CloudinaryModule],
})
export class CategoryModule {}
