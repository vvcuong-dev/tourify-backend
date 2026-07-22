import {
  Controller,
  Post,
  UseGuards,
  Body,
  Req,
  ParseIntPipe,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
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
import { TourService } from './tour.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateTourDto } from './dto/create-tour.dto';
import type { RequestWithUser } from '../../common/types/request-with-user.type';
import { UpdateTourDto } from './dto/update-tour.dto';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { UPLOAD_LIMITS } from '../../constants/upload.constant';
import { createImageUploadOptions } from '../../utils/multer.util';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';
import { QueryTourDto } from './dto/query-tour.dto';
import { ChangeMultiTourDto } from './dto/change-multi-tour.dto';
import { TourResponse } from './responses/tour-response';
import { PaginatedResponse } from '../../common/responses/paginated.response';

@ApiTags('Tours')
@ApiBearerAuth()
@Controller('admin/tours')
@UseGuards(JwtAuthGuard)
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Get()
  @ApiOperation({ summary: 'List tours with filters' })
  @ApiResponse({
    status: 200,
    description: 'Tours retrieved successfully.',
    type: PaginatedResponse,
  })
  async findAll(@Query() query: QueryTourDto) {
    return this.tourService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tour detail by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Tour retrieved successfully.',
    type: TourResponse,
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tourService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a tour' })
  @ApiBody({ type: CreateTourDto })
  @ApiResponse({
    status: 201,
    description: 'Tour created successfully.',
    type: TourResponse,
  })
  async create(@Body() dto: CreateTourDto, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.tourService.create(dto, userId);
  }

  @Patch('change-multi')
  @ApiOperation({ summary: 'Bulk update tours' })
  @ApiBody({ type: ChangeMultiTourDto })
  @ApiResponse({
    status: 200,
    description: 'Tours updated successfully.',
    schema: { type: 'boolean' },
  })
  async changeMulti(
    @Body() dto: ChangeMultiTourDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tourService.changeMulti(dto, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tour' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateTourDto })
  @ApiResponse({
    status: 200,
    description: 'Tour updated successfully.',
    type: TourResponse,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTourDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tourService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a tour' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Tour deleted successfully.',
    schema: { type: 'boolean' },
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.tourService.remove(id, req.user.id);
  }

  @Post(':id/avatar')
  @ApiOperation({ summary: 'Upload tour avatar' })
  @ApiParam({ name: 'id', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tour avatar updated successfully.',
    type: TourResponse,
  })
  @UseInterceptors(
    FileInterceptor('avatar', createImageUploadOptions(UPLOAD_LIMITS.AVATAR)),
  )
  async uploadAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    return this.tourService.uploadAvatar(id, file, req.user.id);
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Upload tour images' })
  @ApiParam({ name: 'id', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tour images uploaded successfully.',
    type: TourResponse,
  })
  @UseInterceptors(
    FilesInterceptor(
      'images',
      UPLOAD_LIMITS.TOUR_IMAGES.maxFilesCount,
      createImageUploadOptions(UPLOAD_LIMITS.TOUR_IMAGES),
    ),
  )
  async uploadImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.tourService.uploadImages(id, files);
  }

  @Delete(':id/images/:imageId')
  @ApiOperation({ summary: 'Delete a tour image' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'imageId', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Tour image deleted successfully.',
    schema: { type: 'boolean' },
  })
  async deleteImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.tourService.deleteImage(id, imageId);
  }
}
