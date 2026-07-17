import { HttpStatus, Injectable } from '@nestjs/common';
import moment from 'moment';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException } from '../../common/exceptions/app.exception';
import { TOURIFY_ERROR_CODES } from '../../constants/error-code.constant';
import {
  CategoryStatus,
  TourStatus,
  Prisma,
} from '../../generated/prisma/browser';
import { Tour } from '../../generated/prisma/client';
import { SearchTourDto } from './dto/search-tour.dto';
import { TourDetailResponse } from './responses/tour-detail.response';
import {
  Breadcrumb,
  TourItemResponse,
} from '../category/responses/category-detail.response';
import { PAGE_TITLE } from '../../constants/page-title.constant';
import { toSlug } from '../../utils/slug.util';
import { DATE_FORMAT } from '../../constants/date-format.constant';
import { CityResponse } from '../city/responses/city.response';

@Injectable()
export class TourClientService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhereClause(query: SearchTourDto): Prisma.TourWhereInput {
    const where: Prisma.TourWhereInput = {
      status: TourStatus.ACTIVE,
      deleted: false,
    };

    if (query.keyword) {
      where.slug = { contains: toSlug(query.keyword) };
    }

    if (query.cityId) {
      where.locations = { some: { cityId: query.cityId } };
    }

    if (query.departureDate) {
      where.departureDate = new Date(query.departureDate);
    }

    if (query.stockAdult) {
      where.stockAdult = { gte: query.stockAdult };
    }

    if (query.stockChildren) {
      where.stockChildren = { gte: query.stockChildren };
    }

    if (query.stockBaby) {
      where.stockBaby = { gte: query.stockBaby };
    }

    if (query.priceMin || query.priceMax) {
      where.priceNewAdult = {};
      if (query.priceMin) where.priceNewAdult.gte = query.priceMin;
      if (query.priceMax) where.priceNewAdult.lte = query.priceMax;
    }

    return where;
  }

  async search(query: SearchTourDto) {
    const where: Prisma.TourWhereInput = this.buildWhereClause(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    const [totalTour, tourList, cityList] = await Promise.all([
      this.prisma.tour.count({ where }),
      this.prisma.tour.findMany({
        where,
        orderBy: { position: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.city.findMany(),
    ]);

    return {
      pageTitle: PAGE_TITLE.TOUR_SEARCH,
      tourList: tourList.map(
        (item) =>
          new TourItemResponse({
            ...item,
            departureDateFormat: item.departureDate
              ? moment(item.departureDate).format(DATE_FORMAT.DEFAULT)
              : '',
          }),
      ),
      totalTour,
      page,
      limit,
      cityList: cityList.map((c) => new CityResponse(c)),
    };
  }

  async findDetailBySlug(slug: string) {
    const tourDetail = await this.prisma.tour.findFirst({
      where: { slug, status: TourStatus.ACTIVE, deleted: false },
      include: { locations: { include: { city: true } } },
    });

    if (!tourDetail) {
      throw new AppException(
        TOURIFY_ERROR_CODES.TOUR.TOUR_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const breadcrumb = await this.buildTourBreadcrumb(tourDetail);

    return {
      pageTitle: PAGE_TITLE.TOUR_DETAIL,
      breadcrumb,
      tourDetail: new TourDetailResponse({
        ...tourDetail,
        departureDateFormat: tourDetail.departureDate
          ? moment(tourDetail.departureDate).format(DATE_FORMAT.DEFAULT)
          : '',
      }),
      cityList: tourDetail.locations.map((l) => new CityResponse(l.city)),
    };
  }

  private async buildTourBreadcrumb(tour: Tour): Promise<Breadcrumb> {
    const breadcrumb: Breadcrumb = {
      image: tour.avatar,
      title: tour.name,
      list: [{ link: '/', title: PAGE_TITLE.HOME }],
    };

    const category = await this.prisma.category.findFirst({
      where: {
        id: tour.categoryId,
        deleted: false,
        status: CategoryStatus.ACTIVE,
      },
    });

    if (category) {
      if (category.parentId) {
        const parentCategory = await this.prisma.category.findFirst({
          where: {
            id: category.parentId,
            deleted: false,
            status: CategoryStatus.ACTIVE,
          },
        });
        if (parentCategory) {
          breadcrumb.list.push({
            link: `/categories/${parentCategory.slug}`,
            title: parentCategory.name,
          });
        }
      }

      breadcrumb.list.push({
        link: `/categories/${category.slug}`,
        title: category.name,
      });
    }

    breadcrumb.list.push({ link: `/tours/${tour.slug}`, title: tour.name });

    return breadcrumb;
  }
}
