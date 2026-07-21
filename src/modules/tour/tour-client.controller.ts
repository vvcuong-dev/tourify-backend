import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { TourClientService } from './tour-client.service';
import { SearchTourDto } from './dto/search-tour.dto';
import { TourDetailResponse } from './responses/tour-detail.response';
import { TourItemResponse } from '../category/responses/category-detail.response';
import { CityResponse } from '../city/responses/city.response';

@ApiTags('Tours')
@ApiExtraModels(TourItemResponse, CityResponse, TourDetailResponse)
@Controller('tours')
export class TourClientController {
  constructor(private readonly tourClientService: TourClientService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search tours for the public site' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        pageTitle: { type: 'string' },
        tourList: {
          type: 'array',
          items: { $ref: getSchemaPath(TourItemResponse) },
        },
        totalTour: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        cityList: {
          type: 'array',
          items: { $ref: getSchemaPath(CityResponse) },
        },
      },
    },
  })
  search(@Query() query: SearchTourDto) {
    return this.tourClientService.search(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get tour detail by slug' })
  @ApiParam({ name: 'slug', type: String })
  @ApiResponse({
    status: 200,
    description: 'Tour detail retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        pageTitle: { type: 'string' },
        breadcrumb: { type: 'object' },
        tourDetail: { allOf: [{ $ref: getSchemaPath(TourDetailResponse) }] },
        cityList: {
          type: 'array',
          items: { $ref: getSchemaPath(CityResponse) },
        },
      },
    },
  })
  findDetailBySlug(@Param('slug') slug: string) {
    return this.tourClientService.findDetailBySlug(slug);
  }
}
