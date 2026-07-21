import { Tour } from '../../../generated/prisma/client';
import { CategoryResponse } from './category.response';
import { ApiProperty } from '@nestjs/swagger';

export class BreadcrumbItem {
  @ApiProperty({ example: '/categories/beach-tour' })
  link!: string;
  @ApiProperty({ example: 'Beach Tour' })
  title!: string;
}

export class Breadcrumb {
  @ApiProperty({ example: 'https://example.com/image.jpg', nullable: true })
  image!: string | null;
  @ApiProperty({ example: 'Beach Tour' })
  title!: string;
  @ApiProperty({ type: () => [BreadcrumbItem] })
  list!: BreadcrumbItem[];
}

type TourWithFormat = Tour & { departureDateFormat: string };

export class TourItemResponse {
  @ApiProperty({ example: 1 })
  id!: number;
  @ApiProperty({ example: 'Ha Long Bay Tour' })
  name!: string;
  @ApiProperty({ example: 'ha-long-bay-tour' })
  slug!: string;
  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  avatar!: string | null;
  @ApiProperty({ example: 1200000 })
  priceAdult!: number;
  @ApiProperty({ example: 1000000 })
  priceNewAdult!: number;
  @ApiProperty({ example: '3 days 2 nights', nullable: true })
  time!: string | null;
  @ApiProperty({ example: 'Car', nullable: true })
  vehicle!: string | null;
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  departureDate!: Date | null;
  @ApiProperty({ example: '01/07/2026' })
  departureDateFormat!: string;
  @ApiProperty({ example: 5 })
  ratingStars!: number;
  @ApiProperty({ example: 5 })
  ratingTotal!: number;

  constructor(tour: TourWithFormat) {
    this.id = tour.id;
    this.name = tour.name;
    this.slug = tour.slug;
    this.avatar = tour.avatar;

    this.priceAdult = tour.priceAdult;
    this.priceNewAdult = tour.priceNewAdult;

    this.time = tour.time;
    this.vehicle = tour.vehicle;

    this.departureDate = tour.departureDate;
    this.departureDateFormat = tour.departureDateFormat;

    this.ratingStars = 5;
    this.ratingTotal = 5;
  }
}

export class CategoryDetailResponse {
  @ApiProperty({ example: 'Tour List' })
  pageTitle!: string;
  @ApiProperty({ type: () => Breadcrumb })
  breadcrumb!: Breadcrumb;
  @ApiProperty({ type: () => CategoryResponse })
  category!: CategoryResponse;
  @ApiProperty({ type: () => [TourItemResponse] })
  tourList!: TourItemResponse[];
  @ApiProperty({ example: 12 })
  totalTour!: number;
}
