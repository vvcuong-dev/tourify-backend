import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CartDetailResponse } from './responses/cart-detail.response';
import { CartItemInputDto } from './dto/cart-item-input.dto';
import { TourStatus } from '../../generated/prisma/enums';
import { CartItemResponse } from './responses/cart-item.response';
import moment from 'moment';
import { DATE_FORMAT } from '../../constants/date-format.constant';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCartDetail(items: CartItemInputDto[]): Promise<CartDetailResponse> {
    if (items.length === 0) {
      return new CartDetailResponse([]);
    }

    const tourIds = items.map((item) => item.tourId);
    const cityIds = items.map((item) => item.cityId);

    const [tours, cities] = await Promise.all([
      this.prisma.tour.findMany({
        where: {
          id: { in: tourIds },
          status: TourStatus.ACTIVE,
          deleted: false,
        },
      }),
      this.prisma.city.findMany({ where: { id: { in: cityIds } } }),
    ]);

    const tourMap = new Map(tours.map((t) => [t.id, t]));
    const cityMap = new Map(cities.map((c) => [c.id, c]));

    const result: CartItemResponse[] = [];

    for (const item of items) {
      const tour = tourMap.get(item.tourId);
      if (!tour) continue;

      const city = cityMap.get(item.cityId);
      if (!city) continue;

      result.push(
        new CartItemResponse({
          ...item,
          tour,
          city,
          departureDateFormat: tour.departureDate
            ? moment(tour.departureDate).format(DATE_FORMAT.DEFAULT)
            : '',
        }),
      );
    }

    return new CartDetailResponse(result);
  }
}
