import { City, Tour } from '../../../generated/prisma/client';
import { CartItemInputDto } from '../dto/cart-item-input.dto';
import { PassengerType } from '../../../common/enums/passenger-type.enum';
import { ApiProperty } from '@nestjs/swagger';

type CartItemInput = CartItemInputDto & {
  tour: Tour;
  city: City;
  departureDateFormat: string;
};

export class CartItemResponse {
  @ApiProperty({ example: 1 })
  tourId!: number;
  @ApiProperty({ example: 'Ha Long Bay Tour' })
  name!: string;
  @ApiProperty({ example: 'ha-long-bay-tour' })
  slug!: string;
  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  avatar!: string | null;

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

  @ApiProperty({ example: 10 })
  stockAdult!: number;
  @ApiProperty({ example: 8 })
  stockChildren!: number;
  @ApiProperty({ example: 5 })
  stockBaby!: number;

  @ApiProperty({ example: 2 })
  quantityAdult!: number;
  @ApiProperty({ example: 1 })
  quantityChildren!: number;
  @ApiProperty({ example: 0 })
  quantityBaby!: number;

  @ApiProperty({ example: 1 })
  cityId!: number;
  @ApiProperty({ example: 'Ha Noi' })
  cityName!: string;

  @ApiProperty({ example: 2600000 })
  subtotal!: number;

  @ApiProperty({ example: true })
  isStockValid!: boolean;
  @ApiProperty({ type: [String], example: ['ADULT'] })
  stockExceeded!: PassengerType[];

  constructor(item: CartItemInput) {
    this.tourId = item.tour.id;
    this.name = item.tour.name;
    this.slug = item.tour.slug;
    this.avatar = item.tour.avatar;

    this.departureDate = item.tour.departureDate;
    this.departureDateFormat = item.departureDateFormat;

    this.priceNewAdult = item.tour.priceNewAdult;
    this.priceNewChildren = item.tour.priceNewChildren;
    this.priceNewBaby = item.tour.priceNewBaby;

    this.stockAdult = item.tour.stockAdult;
    this.stockChildren = item.tour.stockChildren;
    this.stockBaby = item.tour.stockBaby;

    this.quantityAdult = item.quantityAdult;
    this.quantityChildren = item.quantityChildren;
    this.quantityBaby = item.quantityBaby;

    this.cityId = item.city.id;
    this.cityName = item.city.name;

    this.subtotal =
      item.tour.priceNewAdult * item.quantityAdult +
      item.tour.priceNewChildren * item.quantityChildren +
      item.tour.priceNewBaby * item.quantityBaby;

    const exceeded: PassengerType[] = [];
    if (item.quantityAdult > item.tour.stockAdult) {
      exceeded.push(PassengerType.ADULT);
    }
    if (item.quantityChildren > item.tour.stockChildren) {
      exceeded.push(PassengerType.CHILDREN);
    }
    if (item.quantityBaby > item.tour.stockBaby) {
      exceeded.push(PassengerType.BABY);
    }

    this.isStockValid = exceeded.length === 0;
    this.stockExceeded = exceeded;
  }
}
