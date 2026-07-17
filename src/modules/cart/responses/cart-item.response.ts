import { City, Tour } from '../../../generated/prisma/client';
import { CartItemInputDto } from '../dto/cart-item-input.dto';
import { PassengerType } from '../../../common/enums/passenger-type.enum';

type CartItemInput = CartItemInputDto & {
  tour: Tour;
  city: City;
  departureDateFormat: string;
};

export class CartItemResponse {
  tourId!: number;
  name!: string;
  slug!: string;
  avatar!: string | null;

  departureDate!: Date | null;
  departureDateFormat!: string;

  priceNewAdult!: number;
  priceNewChildren!: number;
  priceNewBaby!: number;

  stockAdult!: number;
  stockChildren!: number;
  stockBaby!: number;

  quantityAdult!: number;
  quantityChildren!: number;
  quantityBaby!: number;

  cityId!: number;
  cityName!: string;

  subtotal!: number;

  isStockValid!: boolean;
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
