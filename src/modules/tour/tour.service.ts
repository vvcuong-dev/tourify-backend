import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { TourResponse } from '../../common/responses/tour-response';
import { AppException } from '../../exceptions/app.exception';
import { TOURIFY_ERROR_CODES } from '../../constants/error-code.constant';
import { generateUniqueSlug } from '../../utils/slug.util';
import { instanceToPlain } from 'class-transformer';
import { Prisma } from '../../generated/prisma/browser';
import { UpdateTourDto } from './dto/update-tour.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CLOUDINARY_FOLDERS } from '../../constants/cloudinary.constant';

@Injectable()
export class TourService {
  private readonly logger = new Logger(TourService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateTourDto, userId: number): Promise<TourResponse> {
    const category = await this.prisma.category.findFirst({
      where: { id: dto.categoryId, deleted: false },
    });
    if (!category) {
      throw new AppException(
        TOURIFY_ERROR_CODES.TOUR.CATEGORY_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.cityIds?.length) {
      const cityCount = await this.prisma.city.count({
        where: { id: { in: dto.cityIds } },
      });
      if (cityCount !== dto.cityIds.length) {
        throw new AppException(
          TOURIFY_ERROR_CODES.TOUR.CITY_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    let position = dto.position;
    if (!position) {
      const totalRecord = await this.prisma.tour.count();
      position = totalRecord + 1;
    }

    const slug = await generateUniqueSlug(this.prisma.tour, dto.name);
    const { cityIds, schedules, ...tourData } = dto;

    try {
      const tour = await this.prisma.$transaction(async (tx) => {
        const created = await tx.tour.create({
          data: {
            ...tourData,
            schedules: schedules
              ? (instanceToPlain(schedules) as Prisma.InputJsonValue)
              : undefined,
            slug,
            position,
            createdBy: userId,
          },
        });

        if (cityIds?.length) {
          await tx.tourLocation.createMany({
            data: cityIds.map((cityId) => ({
              tourId: created.id,
              cityId,
            })),
          });
        }

        return tx.tour.findUniqueOrThrow({
          where: { id: created.id },
          include: {
            images: true,
            locations: true,
          },
        });
      });

      return new TourResponse(tour);
    } catch {
      throw new AppException(
        TOURIFY_ERROR_CODES.TOUR.CREATE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: number,
    dto: UpdateTourDto,
    userId: number,
  ): Promise<TourResponse> {
    const tour = await this.prisma.tour.findFirst({
      where: { id, deleted: false },
    });
    if (!tour) {
      throw new AppException(
        TOURIFY_ERROR_CODES.TOUR.TOUR_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: dto.categoryId, deleted: false },
      });
      if (!category) {
        throw new AppException(
          TOURIFY_ERROR_CODES.TOUR.CATEGORY_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (dto.cityIds?.length) {
      const cityCount = await this.prisma.city.count({
        where: { id: { in: dto.cityIds } },
      });
      if (cityCount !== dto.cityIds.length) {
        throw new AppException(
          TOURIFY_ERROR_CODES.TOUR.CITY_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Chỉ regenerate slug nếu name thay đổi thật sự
    let slug: string | undefined;
    if (dto.name && dto.name !== tour.name) {
      slug = await generateUniqueSlug(this.prisma.tour, dto.name, id);
    }

    const { cityIds, schedules, ...tourData } = dto;

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        await tx.tour.update({
          where: { id },
          data: {
            ...tourData,
            ...(slug ? { slug } : {}),
            schedules: schedules
              ? (instanceToPlain(schedules) as Prisma.InputJsonValue)
              : undefined,
            updatedBy: userId,
          },
        });

        // Nếu client gửi cityIds -> replace toàn bộ locations cũ
        if (cityIds) {
          await tx.tourLocation.deleteMany({ where: { tourId: id } });
          if (cityIds.length) {
            await tx.tourLocation.createMany({
              data: cityIds.map((cityId) => ({ tourId: id, cityId })),
            });
          }
        }

        return tx.tour.findUniqueOrThrow({
          where: { id },
          include: {
            images: true,
            locations: true,
          },
        });
      });

      return new TourResponse(updated);
    } catch {
      throw new AppException(
        TOURIFY_ERROR_CODES.TOUR.TOUR_UPDATE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number, userId: number): Promise<boolean> {
    const tour = await this.prisma.tour.findFirst({
      where: { id, deleted: false },
    });

    if (!tour) {
      throw new AppException(
        TOURIFY_ERROR_CODES.TOUR.TOUR_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.tour.update({
      where: { id },
      data: {
        deleted: true,
        updatedBy: userId,
      },
    });

    return true;
  }

  async uploadAvatar(
    id: number,
    file: Express.Multer.File,
    userId: number,
  ): Promise<TourResponse> {
    const tour = await this.prisma.tour.findFirst({
      where: { id, deleted: false },
    });

    if (!tour) {
      throw new AppException(
        TOURIFY_ERROR_CODES.TOUR.TOUR_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const upload = await this.cloudinaryService.uploadImage(
      file,
      CLOUDINARY_FOLDERS.TOURS,
    );

    const updated = await this.prisma.tour.update({
      where: { id },
      data: {
        avatar: upload.secure_url,
        avatarPublicId: upload.public_id,
        updatedBy: userId,
      },
      include: {
        locations: true,
        images: true,
      },
    });

    if (tour.avatarPublicId) {
      await this.cloudinaryService
        .deleteImage(tour.avatarPublicId)
        .catch((error: Error) => {
          this.logger.error(
            `Failed to delete old tour avatar: ${error.message}`,
          );
        });
    }
    return new TourResponse(updated);
  }

  async uploadImages(
    id: number,
    files: Express.Multer.File[],
  ): Promise<TourResponse> {
    const tour = await this.prisma.tour.findFirst({
      where: { id, deleted: false },
    });

    if (!tour) {
      throw new AppException(
        TOURIFY_ERROR_CODES.TOUR.TOUR_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (!files.length) {
      throw new AppException(
        TOURIFY_ERROR_CODES.UPLOAD.IMAGES_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    const uploadImages = await this.cloudinaryService.uploadImages(
      files,
      CLOUDINARY_FOLDERS.TOURS,
    );

    await this.prisma.tourImage.createMany({
      data: uploadImages.map((img) => ({
        tourId: id,
        url: img.secure_url,
        publicId: img.public_id,
      })),
    });

    const updated = await this.prisma.tour.findUniqueOrThrow({
      where: { id },
      include: {
        locations: true,
        images: true,
      },
    });
    return new TourResponse(updated);
  }

  async deleteImage(tourId: number, imageId: number): Promise<boolean> {
    const tour = await this.prisma.tour.findFirst({
      where: { id: tourId, deleted: false },
    });

    if (!tour) {
      throw new AppException(
        TOURIFY_ERROR_CODES.TOUR.TOUR_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const image = await this.prisma.tourImage.findFirst({
      where: { id: imageId, tourId },
    });

    if (!image) {
      throw new AppException(
        TOURIFY_ERROR_CODES.TOUR.IMAGE_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.tourImage.delete({ where: { id: imageId } });

    if (image.publicId) {
      await this.cloudinaryService
        .deleteImage(image.publicId)
        .catch((error: Error) => {
          this.logger.error(
            `Failed to delete tour image from Cloudinary: ${error.message}`,
          );
        });
    }

    return true;
  }
}
