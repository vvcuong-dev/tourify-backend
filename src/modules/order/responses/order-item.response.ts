import { City, OrderItem } from '../../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

type OrderItemWithFormat = OrderItem & {
  departureDateFormat: string;
  city: City;
};

export class OrderItemResponse {
  @ApiProperty({ example: 1 })
  tourId!: number;
  @ApiProperty({ example: 'Ha Long Bay Tour' })
  name!: string;
  @ApiProperty({ example: 'ha-long-bay-tour' })
  slug!: string;
  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  avatar!: string | null;

  @ApiProperty({ example: 1 })
  cityId!: number;
  @ApiProperty({ example: 'Ha Noi' })
  cityName!: string;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  departureDate!: Date | null;
  @ApiProperty({ example: '01/07/2026' })
  departureDateFormat!: string;

  @ApiProperty({ example: 1200000 })
  priceNewAdult!: number;
  @ApiProperty({ example: 900000 })
  priceNewChildren!: number;
  @ApiProperty({ example: 200000 })
  priceNewBaby!: number;

  @ApiProperty({ example: 2 })
  quantityAdult!: number;
  @ApiProperty({ example: 1 })
  quantityChildren!: number;
  @ApiProperty({ example: 0 })
  quantityBaby!: number;

  @ApiProperty({ example: 2600000 })
  subtotal!: number;

  constructor(item: OrderItemWithFormat) {
    this.tourId = item.tourId;
    this.name = item.name;
    this.slug = item.slug;
    this.avatar = item.avatar;
    this.cityId = item.cityId;
    this.cityName = item.city.name;
    this.departureDate = item.departureDate;
    this.departureDateFormat = item.departureDateFormat;
    this.priceNewAdult = item.priceNewAdult;
    this.priceNewChildren = item.priceNewChildren;
    this.priceNewBaby = item.priceNewBaby;
    this.quantityAdult = item.quantityAdult;
    this.quantityChildren = item.quantityChildren;
    this.quantityBaby = item.quantityBaby;
    this.subtotal =
      item.priceNewAdult * item.quantityAdult +
      item.priceNewChildren * item.quantityChildren +
      item.priceNewBaby * item.quantityBaby;
  }
}

export type { OrderItemWithFormat };
