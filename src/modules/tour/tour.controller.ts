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
import { TourService } from './tour.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateTourDto } from './dto/create-tour.dto';
import type { RequestWithUser } from '../../common/types/request-with-user.type';
import { UpdateTourDto } from './dto/update-tour.dto';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { UPLOAD_LIMITS } from '../../constants/upload.constant';
import { createImageUploadOptions } from '../../utils/multer.util';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';
import { QueryTourDto } from './dto/query-tour.dto';
import { ChangeMultiTourDto } from './dto/change-multi-tour.dto';

@Controller('admin/tours')
@UseGuards(JwtAuthGuard)
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Get()
  async findAll(@Query() query: QueryTourDto) {
    return this.tourService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tourService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateTourDto, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.tourService.create(dto, userId);
  }

  @Patch('change-multi')
  async changeMulti(
    @Body() dto: ChangeMultiTourDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tourService.changeMulti(dto, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTourDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tourService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.tourService.remove(id, req.user.id);
  }

  @Post(':id/avatar')
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
  async deleteImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.tourService.deleteImage(id, imageId);
  }
}
