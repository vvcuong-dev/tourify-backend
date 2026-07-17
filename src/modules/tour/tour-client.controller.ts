import { Controller, Get, Param, Query } from '@nestjs/common';
import { TourClientService } from './tour-client.service';
import { SearchTourDto } from './dto/search-tour.dto';

@Controller('tours')
export class TourClientController {
  constructor(private readonly tourClientService: TourClientService) {}

  @Get('search')
  search(@Query() query: SearchTourDto) {
    return this.tourClientService.search(query);
  }

  @Get(':slug')
  findDetailBySlug(@Param('slug') slug: string) {
    return this.tourClientService.findDetailBySlug(slug);
  }
}
