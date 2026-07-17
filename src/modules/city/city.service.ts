import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CityResponse } from './responses/city.response';

@Injectable()
export class CityService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CityResponse[]> {
    const cities = await this.prisma.city.findMany();
    return cities.map((c) => new CityResponse(c));
  }
}
