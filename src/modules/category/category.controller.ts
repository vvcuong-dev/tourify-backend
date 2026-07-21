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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import type { RequestWithUser } from '../../common/types/request-with-user.type';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { createImageUploadOptions } from '../../utils/multer.util';
import { UPLOAD_LIMITS } from '../../constants/upload.constant';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ChangeMultiCategoryDto } from './dto/change-multi-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CategoryResponse } from './responses/category.response';
import { PaginatedResponse } from '../../common/responses/paginated.response';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('admin/categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'List categories with filters' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully.',
    type: PaginatedResponse,
  })
  findAll(@Query() query: QueryCategoryDto) {
    return this.categoryService.findAll(query);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get category tree' })
  @ApiResponse({
    status: 200,
    description: 'Category tree retrieved successfully.',
    type: CategoryResponse,
    isArray: true,
  })
  findTree() {
    return this.categoryService.findTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category detail by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully.',
    type: CategoryResponse,
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully.',
    type: CategoryResponse,
  })
  async create(@Body() dto: CreateCategoryDto, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.categoryService.create(dto, userId);
  }

  @Post(':id/image')
  @ApiOperation({ summary: 'Upload category image' })
  @ApiParam({ name: 'id', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Category image updated successfully.',
    type: CategoryResponse,
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
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
  @ApiOperation({ summary: 'Bulk update categories' })
  @ApiBody({ type: ChangeMultiCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Categories updated successfully.',
    schema: { type: 'boolean' },
  })
  changeMulti(
    @Body() dtos: ChangeMultiCategoryDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.categoryService.changeMulti(dtos, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully.',
    type: CategoryResponse,
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.categoryService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a category' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully.',
    schema: { type: 'boolean' },
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.categoryService.softDelete(id, userId);
  }
}
