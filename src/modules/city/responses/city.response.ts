import { City } from '../../../generated/prisma/client';

export class CityResponse {
  id!: number;
  name!: string;

  constructor(city: City) {
    this.id = city.id;
    this.name = city.name;
  }
}
