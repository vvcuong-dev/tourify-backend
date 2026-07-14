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
} from '@nestjs/common';
import { TourService } from './tour.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateTourDto } from './dto/create-tour.dto';
import type { RequestWithUser } from '../../common/types/request-with-user.type';
import { UpdateTourDto } from './dto/update-tour.dto';

@Controller('admin/tour')
@UseGuards(JwtAuthGuard)
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Post()
  async create(@Body() dto: CreateTourDto, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.tourService.create(dto, userId);
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
}
