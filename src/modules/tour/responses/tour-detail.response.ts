import { Tour } from '../../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

type TourDetailInput = Tour & { departureDateFormat: string };

export class TourDetailResponse {
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
  @ApiProperty({ example: 'Detailed information', nullable: true })
  information!: string | null;
  @ApiProperty({ type: Object })
  schedules!: unknown;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  departureDate!: Date | null;
  @ApiProperty({ example: '01/07/2026' })
  departureDateFormat!: string;

  constructor(tour: TourDetailInput) {
    this.id = tour.id;
    this.name = tour.name;
    this.slug = tour.slug;
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
    this.information = tour.information;
    this.schedules = tour.schedules;

    this.departureDate = tour.departureDate;
    this.departureDateFormat = tour.departureDateFormat;
  }
}
