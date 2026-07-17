import { Controller, Get, Param } from '@nestjs/common';
import { CategoryClientService } from './category-client.service';

@Controller('categories')
export class CategoryClientController {
  constructor(private readonly categoryClientService: CategoryClientService) {}

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categoryClientService.findBySlug(slug);
  }
}
