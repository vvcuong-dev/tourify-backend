import { Tour } from '../../../generated/prisma/client';

type TourDetailInput = Tour & { departureDateFormat: string };

export class TourDetailResponse {
  id!: number;
  name!: string;
  slug!: string;
  avatar!: string | null;

  priceAdult!: number;
  priceChildren!: number;
  priceBaby!: number;
  priceNewAdult!: number;
  priceNewChildren!: number;
  priceNewBaby!: number;

  stockAdult!: number;
  stockChildren!: number;
  stockBaby!: number;

  time!: string | null;
  vehicle!: string | null;
  information!: string | null;
  schedules!: unknown;

  departureDate!: Date | null;
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
