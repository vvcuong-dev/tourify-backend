import { Controller, Post, Req, Body, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import type { RequestWithUser } from '../../common/types/request-with-user.type';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('category')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.categoryService.create(dto, userId);
  }
}
