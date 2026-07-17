import { OrderItem } from '../../../generated/prisma/client';

type OrderItemWithFormat = OrderItem & { departureDateFormat: string };

export class OrderItemResponse {
  tourId!: number;
  name!: string;
  slug!: string;
  avatar!: string | null;

  cityId!: number;

  departureDate!: Date | null;
  departureDateFormat!: string;

  priceNewAdult!: number;
  priceNewChildren!: number;
  priceNewBaby!: number;

  quantityAdult!: number;
  quantityChildren!: number;
  quantityBaby!: number;

  subtotal!: number;

  constructor(item: OrderItemWithFormat) {
    this.tourId = item.tourId;
    this.name = item.name;
    this.slug = item.slug;
    this.avatar = item.avatar;
    this.cityId = item.cityId;
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
