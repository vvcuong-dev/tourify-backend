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
  Delete,
  Query,
  Get,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import type { RequestWithUser } from '../../common/types/request-with-user.type';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { createImageUploadOptions } from '../../utils/multer.util';
import { UPLOAD_LIMITS } from '../../constants/upload.constant';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ChangeMultiCategoryDto } from './dto/change-multi-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';

@Controller('admin/categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll(@Query() query: QueryCategoryDto) {
    return this.categoryService.findAll(query);
  }

  @Get('tree')
  findTree() {
    return this.categoryService.findTree();
  }

  @Post()
  async create(@Body() dto: CreateCategoryDto, @Req() req: RequestWithUser) {
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
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.categoryService.updateImage(id, file, userId);
  }

  @Patch('change-multi')
  changeMulti(
    @Body() dtos: ChangeMultiCategoryDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.categoryService.changeMulti(dtos, userId);
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

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.categoryService.softDelete(id, userId);
  }
}
