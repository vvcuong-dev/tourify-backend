import { Controller, Post, UseGuards, Body, Req } from '@nestjs/common';
import { TourService } from './tour.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateTourDto } from './dto/create-tour.dto';
import type { RequestWithUser } from '../../common/types/request-with-user.type';

@Controller('admin/tour')
@UseGuards(JwtAuthGuard)
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Post()
  async create(@Body() dto: CreateTourDto, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.tourService.create(dto, userId);
  }
}
