import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponse } from './responses/category.response';
import { TOURIFY_ERROR_CODES } from '../../constants/error-code.constant';
import { AppException } from '../../common/exceptions/app.exception';
import { generateUniqueSlug, toSlug } from '../../utils/slug.util';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CLOUDINARY_FOLDERS } from '../../constants/cloudinary.constant';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ChangeMultiCategoryDto } from './dto/change-multi-category.dto';
import { MultiAction } from '../../common/enums/multi-action.enum';
import { CategoryStatus, Prisma } from '../../generated/prisma/browser';
import { QueryCategoryDto } from './dto/query-category.dto';
import {
  PaginatedResponse,
  PaginationMeta,
} from '../../common/responses/paginated.response';
import { buildCategoryTree } from '../../utils/category-tree.util';
import { CategoryListResponse } from './responses/category-list.response';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private buildWhereClause(query: QueryCategoryDto): Prisma.CategoryWhereInput {
    const where: Prisma.CategoryWhereInput = { deleted: false };
    if (query.status) where.status = query.status;
    if (query.createdBy) where.createdBy = query.createdBy;
    if (query.keyword) where.slug = { contains: toSlug(query.keyword) };
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }
    return where;
  }

  async findAll(
    query: QueryCategoryDto,
  ): Promise<PaginatedResponse<CategoryListResponse>> {
    const where: Prisma.CategoryWhereInput = this.buildWhereClause(query);

    const page = query.page ?? 1;
    const limit = query.limit ?? 3;

    const [totalRecord, categories] = await Promise.all([
      this.prisma.category.count({ where }),
      this.prisma.category.findMany({
        where,
        orderBy: [{ position: 'asc' }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const totalPage = Math.ceil(totalRecord / limit);
    return new PaginatedResponse(
      categories.map((c) => new CategoryListResponse(c)),
      new PaginationMeta({ page, limit, totalRecord, totalPage }),
    );
  }

  async findOne(id: number): Promise<CategoryResponse> {
    const category = await this.prisma.category.findFirst({
      where: { id: id, deleted: false },
    });

    if (!category) {
      throw new AppException(
        TOURIFY_ERROR_CODES.CATEGORY.CATEGORY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    return new CategoryResponse(category);
  }

  async findTree(): Promise<CategoryResponse[]> {
    const categories = await this.prisma.category.findMany({
      where: { deleted: false },
      orderBy: { position: 'asc' },
    });

    const responses: CategoryResponse[] = categories.map(
      (c) => new CategoryResponse(c),
    );

    return buildCategoryTree<CategoryResponse>(responses);
  }

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

  async updateImage(
    id: number,
    file: Express.Multer.File,
    userId: number,
  ): Promise<CategoryResponse> {
    const category = await this.prisma.category.findFirst({
      where: { id: id, deleted: false },
    });

    if (!category) {
      throw new AppException(
        TOURIFY_ERROR_CODES.CATEGORY.CATEGORY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const uploaded = await this.cloudinaryService.uploadImage(
      file,
      CLOUDINARY_FOLDERS.CATEGORIES,
    );

    const updated = await this.prisma.category.update({
      where: { id: id },
      data: {
        image: uploaded.secure_url,
        imagePublicId: uploaded.public_id,
        updatedBy: userId,
      },
    });

    if (category.imagePublicId) {
      await this.cloudinaryService
        .deleteImage(category.imagePublicId)
        .catch((error: Error) => {
          this.logger.error(
            `Failed to delete old category avatar: ${error.message}`,
          );
        });
    }

    return new CategoryResponse(updated);
  }

  async update(
    id: number,
    dto: UpdateCategoryDto,
    userId: number,
  ): Promise<CategoryResponse> {
    const category = await this.prisma.category.findFirst({
      where: { id: id, deleted: false },
    });

    if (!category) {
      throw new AppException(
        TOURIFY_ERROR_CODES.CATEGORY.CATEGORY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (dto.parentId === id) {
      throw new AppException(
        TOURIFY_ERROR_CODES.CATEGORY.INVALID_PARENT,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.parentId) {
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

    let slug: string | undefined;
    if (dto.name && dto.name !== category.name) {
      slug = await generateUniqueSlug(this.prisma.category, dto.name, id);
    }

    const updated = await this.prisma.category.update({
      where: { id: id },
      data: {
        ...dto,
        slug: slug,
        updatedBy: userId,
      },
    });

    return new CategoryResponse(updated);
  }

  async softDelete(id: number, userId: number): Promise<boolean> {
    const category = await this.prisma.category.findFirst({
      where: { id: id, deleted: false },
    });

    if (!category) {
      throw new AppException(
        TOURIFY_ERROR_CODES.CATEGORY.CATEGORY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const hasChildren = await this.prisma.category.findFirst({
      where: { parentId: id, deleted: false },
    });

    if (hasChildren) {
      throw new AppException(
        TOURIFY_ERROR_CODES.CATEGORY.CATEGORY_HAS_CHILDREN,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.category.update({
      where: { id: id },
      data: {
        deleted: true,
        deletedBy: userId,
      },
    });

    return true;
  }

  async changeMulti(
    dto: ChangeMultiCategoryDto,
    userId: number,
  ): Promise<boolean> {
    const { option, ids } = dto;

    switch (option) {
      case MultiAction.ACTIVE:
      case MultiAction.INACTIVE:
        await this.prisma.category.updateMany({
          where: { id: { in: ids }, deleted: false },
          data: {
            status:
              option === MultiAction.ACTIVE
                ? CategoryStatus.ACTIVE
                : CategoryStatus.INACTIVE,
            updatedBy: userId,
          },
        });
        break;
      case MultiAction.DELETE: {
        const orphanChild = await this.prisma.category.findFirst({
          where: {
            parentId: { in: ids },
            deleted: false,
            id: { notIn: ids },
          },
        });
        if (orphanChild) {
          throw new AppException(
            TOURIFY_ERROR_CODES.CATEGORY.CATEGORY_HAS_CHILDREN,
            HttpStatus.BAD_REQUEST,
          );
        }

        await this.prisma.category.updateMany({
          where: { id: { in: ids }, deleted: false },
          data: {
            deleted: true,
            deletedBy: userId,
          },
        });
        break;
      }
    }
    return true;
  }
}
