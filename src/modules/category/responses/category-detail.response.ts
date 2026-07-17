import { City, Tour } from '../../../generated/prisma/client';
import { CategoryResponse } from './category.response';

export class BreadcrumbItem {
  link!: string;
  title!: string;
}

export class Breadcrumb {
  image!: string | null;
  title!: string;
  list!: BreadcrumbItem[];
}

type TourWithFormat = Tour & { departureDateFormat: string };

export class TourItemResponse {
  id!: number;
  name!: string;
  slug!: string;
  avatar!: string | null;
  priceAdult!: number;
  priceNewAdult!: number;
  time!: string | null;
  vehicle!: string | null;
  departureDate!: Date | null;
  departureDateFormat!: string;
  ratingStars!: number;
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

export class CityResponse {
  id!: number;
  name!: string;

  constructor(city: City) {
    this.id = city.id;
    this.name = city.name;
  }
}

export class CategoryDetailResponse {
  pageTitle!: string;
  breadcrumb!: Breadcrumb;
  category!: CategoryResponse;
  tourList!: TourItemResponse[];
  totalTour!: number;
  cityList!: CityResponse[];
}
