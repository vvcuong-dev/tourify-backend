import { Prisma, TourStatus } from '../../../generated/prisma/client';
import { TourImageResponse } from './tour-image.response';
import { ApiProperty } from '@nestjs/swagger';

type TourWithRelations = Prisma.TourGetPayload<{
  include: { locations: true; images: true };
}>;

export class TourResponse {
  @ApiProperty({ example: 1 })
  id!: number;
  @ApiProperty({ example: 'Ha Long Bay Tour' })
  name!: string;
  @ApiProperty({ example: 'ha-long-bay-tour' })
  slug!: string;
  @ApiProperty({ example: 1 })
  categoryId!: number;
  @ApiProperty({ example: 1 })
  position!: number;
  @ApiProperty({ enum: TourStatus, example: TourStatus.ACTIVE })
  status!: TourStatus;
  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  avatar!: string | null;
  @ApiProperty({ type: () => [TourImageResponse] })
  images!: TourImageResponse[];
  @ApiProperty({ example: 1200000 })
  priceAdult!: number;
  @ApiProperty({ example: 1000000 })
  priceChildren!: number;
  @ApiProperty({ example: 200000 })
  priceBaby!: number;
  @ApiProperty({ example: 1100000 })
  priceNewAdult!: number;
  @ApiProperty({ example: 900000 })
  priceNewChildren!: number;
  @ApiProperty({ example: 150000 })
  priceNewBaby!: number;
  @ApiProperty({ example: 30 })
  stockAdult!: number;
  @ApiProperty({ example: 20 })
  stockChildren!: number;
  @ApiProperty({ example: 10 })
  stockBaby!: number;
  @ApiProperty({ example: '3 days 2 nights', nullable: true })
  time!: string | null;
  @ApiProperty({ example: 'Car', nullable: true })
  vehicle!: string | null;
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  departureDate!: Date | null;
  @ApiProperty({ example: 'Detailed information', nullable: true })
  information!: string | null;
  @ApiProperty({ type: Object })
  schedules!: unknown;
  @ApiProperty({ type: [Number], example: [1, 2] })
  cityIds!: number[];
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;

  constructor(tour: TourWithRelations) {
    this.id = tour.id;
    this.name = tour.name;
    this.slug = tour.slug;
    this.categoryId = tour.categoryId;
    this.position = tour.position;
    this.status = tour.status;
    this.avatar = tour.avatar;
    this.priceAdult = tour.priceAdult;
    this.priceChildren = tour.priceChildren;
    this.priceBaby = tour.priceBaby;
    this.priceNewAdult = tour.priceNewAdult;
    this.priceNewChildren = tour.priceNewChildren;
    this.priceNewBaby = tour.priceNewBaby;
    this.stockAdult = tour.stockAdult;
    this.stockChildren = tour.stockChildren;
    this.stockBaby = tour.stockBaby;
    this.time = tour.time;
    this.vehicle = tour.vehicle;
    this.departureDate = tour.departureDate;
    this.information = tour.information;
    this.schedules = tour.schedules;
    this.createdAt = tour.createdAt;
    this.updatedAt = tour.updatedAt;

    this.cityIds = tour.locations.map((l) => l.cityId);
    this.images = tour.images.map((img) => new TourImageResponse(img));
  }
}
