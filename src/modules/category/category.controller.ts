import {
  Controller,
  Post,
  Req,
  Body,
  UseGuards,
  UseInterceptors,
  Param,
  UploadedFile,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import type { RequestWithUser } from '../../common/types/request-with-user.type';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { createImageUploadOptions } from '../../utils/multer.util';
import { UPLOAD_LIMITS } from '../../constants/upload.constant';
import { UpdateCategoryDto } from './dto/update-category.dto';

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
  uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoryService.updateImage(id, file);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.categoryService.update(id, dto, userId);
  }
}
