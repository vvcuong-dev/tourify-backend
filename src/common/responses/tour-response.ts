import { Prisma } from '../../generated/prisma/client';
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
  schedules!: any;
  cityIds!: number[];
  createdAt!: Date;
  updatedAt!: Date;

  constructor(tour: TourWithRelations) {
    const { locations, images, ...rest } = tour;
    Object.assign(this, rest);

    this.cityIds = locations ? locations.map((l) => l.cityId) : [];
    this.images = images
      ? [...images].map((img) => new TourImageResponse(img))
      : [];
  }
}
