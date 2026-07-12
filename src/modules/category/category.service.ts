import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponse } from '../../common/types/category.response';
import { TOURIFY_ERROR_CODES } from '../../constants/error-code.constant';
import { AppException } from '../../exceptions/app.exception';
import { generateUniqueSlug } from '../../utils/slug.util';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CLOUDINARY_FOLDERS } from '../../constants/cloudinary.constant';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
        avatar: uploaded.secure_url,
        avatarPublicId: uploaded.public_id,
      },
    });

    if (category.avatarPublicId) {
      await this.cloudinaryService
        .deleteImage(category.avatarPublicId as string)
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
      slug = await generateUniqueSlug(this.prisma.category, dto.name);
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
}
