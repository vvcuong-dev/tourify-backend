import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { TourResponse } from '../../common/responses/tour-response';
import { AppException } from '../../exceptions/app.exception';
import { TOURIFY_ERROR_CODES } from '../../constants/error-code.constant';
import { generateUniqueSlug } from '../../utils/slug.util';
import { instanceToPlain } from 'class-transformer';
import { Prisma } from '../../generated/prisma/browser';

@Injectable()
export class TourService {
  constructor(private readonly prisma: PrismaService) {}

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
            locations: true,
            images: { orderBy: { position: 'asc' } },
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
}
