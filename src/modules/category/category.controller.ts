import {
  Controller,
  Post,
  Req,
  Body,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
  Param,
  UploadedFile,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import type { RequestWithUser } from '../../common/types/request-with-user.type';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { createImageUploadOptions } from '../../utils/multer.util';
import { UPLOAD_LIMITS } from '../../constants/upload.constant';

@Controller('category')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.categoryService.create(dto, userId);
  }

  @Post(':id/image')
  @UseInterceptors(
    FileInterceptor(
      'image',
      createImageUploadOptions(UPLOAD_LIMITS.CATEGORY_IMAGE),
    ),
  )
  uploadAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoryService.updateImage(id, file);
  }
}
