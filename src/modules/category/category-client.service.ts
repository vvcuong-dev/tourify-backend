import { HttpStatus, Injectable } from '@nestjs/common';
import moment from 'moment';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException } from '../../common/exceptions/app.exception';
import { TOURIFY_ERROR_CODES } from '../../constants/error-code.constant';
import { CategoryStatus, TourStatus } from '../../generated/prisma/browser';
import { Category } from '../../generated/prisma/client';
import { getAllSubcategoryIds } from '../../utils/category-tree.util';
import { CategoryResponse } from './responses/category.response';
import {
  Breadcrumb,
  CategoryDetailResponse,
  TourItemResponse,
} from './responses/category-detail.response';
import { PAGE_TITLE } from '../../constants/page-title.constant';
import { DATE_FORMAT } from '../../constants/date-format.constant';

@Injectable()
export class CategoryClientService {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(slug: string): Promise<CategoryDetailResponse> {
    const category = await this.getCategoryBySlug(slug);

    const [breadcrumb, tourData] = await Promise.all([
      this.buildBreadcrumb(category),
      this.getTourListByCategory(category.id),
    ]);

    return {
      pageTitle: PAGE_TITLE.TOUR_LIST,
      breadcrumb,
      category: new CategoryResponse(category),
      tourList: tourData.tourList,
      totalTour: tourData.totalTour,
    };
  }

  private async getCategoryBySlug(slug: string): Promise<Category> {
    const category = await this.prisma.category.findFirst({
      where: { slug, deleted: false, status: CategoryStatus.ACTIVE },
    });

    if (!category) {
      throw new AppException(
        TOURIFY_ERROR_CODES.CATEGORY.CATEGORY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    return category;
  }

  private async buildBreadcrumb(category: Category): Promise<Breadcrumb> {
    const breadcrumb: Breadcrumb = {
      image: category.image,
      title: category.name,
      list: [{ link: '/', title: PAGE_TITLE.HOME }],
    };

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

    return breadcrumb;
  }

  private async getTourListByCategory(categoryId: number) {
    const allCategories = await this.prisma.category.findMany({
      where: { deleted: false },
      select: { id: true, parentId: true },
    });

    const listCategoryId = getAllSubcategoryIds(allCategories, categoryId);

    const where = {
      categoryId: { in: listCategoryId },
      deleted: false,
      status: TourStatus.ACTIVE,
    };

    const [totalTour, tourList] = await Promise.all([
      this.prisma.tour.count({ where }),
      this.prisma.tour.findMany({
        where,
        orderBy: { position: 'asc' },
        take: 8,
      }),
    ]);

    const tourListFormatted = tourList.map(
      (item) =>
        new TourItemResponse({
          ...item,
          departureDateFormat: item.departureDate
            ? moment(item.departureDate).format(DATE_FORMAT.DEFAULT)
            : '',
        }),
    );

    return { totalTour, tourList: tourListFormatted };
  }
}
