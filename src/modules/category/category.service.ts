import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponse } from '../../common/types/category.response';
import { TOURIFY_ERROR_CODES } from '../../constants/error-code.constant';
import { AppException } from '../../exceptions/app.exception';
import { generateUniqueSlug } from '../../utils/slug.util';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateCategoryDto,
    userId: number,
  ): Promise<CategoryResponse> {
    const { name, parentId, status, description } = dto;
    if (parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId, deleted: false },
      });

      if (!parent) {
        throw new AppException(
          TOURIFY_ERROR_CODES.CATEGORY.PARENT_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    let position = dto.position;

    if (!position) {
      const totalRecord = await this.prisma.category.count();
      position = totalRecord + 1;
    }

    const slug = await generateUniqueSlug(this.prisma.category, name);

    try {
      const category = await this.prisma.category.create({
        data: {
          name: name,
          slug: slug,
          parentId: parentId,
          position: position,
          status: status,
          description: description,
          createdBy: userId,
        },
      });

      return new CategoryResponse(category);
    } catch {
      throw new AppException(
        TOURIFY_ERROR_CODES.CATEGORY.CREATE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
