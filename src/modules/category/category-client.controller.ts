import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoryClientService } from './category-client.service';
import { CategoryDetailResponse } from './responses/category-detail.response';

@ApiTags('Categories')
@Controller('categories')
export class CategoryClientController {
  constructor(private readonly categoryClientService: CategoryClientService) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Get category detail by slug' })
  @ApiParam({ name: 'slug', type: String })
  @ApiResponse({
    status: 200,
    description: 'Category detail retrieved successfully.',
    type: CategoryDetailResponse,
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoryClientService.findBySlug(slug);
  }
}
