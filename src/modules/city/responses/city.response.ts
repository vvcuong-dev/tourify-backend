import { City } from '../../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CityResponse {
  @ApiProperty({ example: 1 })
  id!: number;
  @ApiProperty({ example: 'Ha Noi' })
  name!: string;

  constructor(city: City) {
    this.id = city.id;
    this.name = city.name;
  }
}
