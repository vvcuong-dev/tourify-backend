import { Prisma } from '../../../generated/prisma/client';
import { TourImageResponse } from './tour-image.response';

type TourWithRelations = Prisma.TourGetPayload<{
  include: { locations: true; images: true };
}>;

export class TourResponse {
  id!: number;
  name!: string;
  slug!: string;
  categoryId!: number;
  position!: number;
  status!: string;
  avatar!: string | null;
  images!: TourImageResponse[];
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
  departureDate!: Date | null;
  information!: string | null;
  schedules!: unknown;
  cityIds!: number[];
  createdAt!: Date;
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
