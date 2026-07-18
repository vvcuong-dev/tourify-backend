import { HttpStatus, Injectable } from '@nestjs/common';
import moment from 'moment';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException } from '../../common/exceptions/app.exception';
import { TOURIFY_ERROR_CODES } from '../../constants/error-code.constant';
import {
  PaymentStatus,
  OrderStatus,
  TourStatus,
} from '../../generated/prisma/browser';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDetailResponse } from './responses/order-detail.response';
import { generateOrderCode } from '../../utils/order-code.util';
import { OrderItemData } from './types/order-item-data.type';
import { DATE_FORMAT } from '../../constants/date-format.constant';
import { FindOrderDto } from './dto/find-order.dto';

@Injectable()
export class OrderClientService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto): Promise<OrderDetailResponse> {
    const order = await this.prisma.$transaction(async (tx) => {
      // 1. Validate & khoá dữ liệu tour trong transaction
      const tourIds = dto.items.map((i) => i.tourId);
      const cityIds = dto.items.map((i) => i.cityId);

      const [tours, cities] = await Promise.all([
        tx.tour.findMany({
          where: {
            id: { in: tourIds },
            status: TourStatus.ACTIVE,
            deleted: false,
          },
        }),
        tx.city.findMany({ where: { id: { in: cityIds } } }),
      ]);

      const tourMap = new Map(tours.map((t) => [t.id, t]));
      const cityMap = new Map(cities.map((c) => [c.id, c]));

      const orderItemsData: OrderItemData[] = [];

      for (const item of dto.items) {
        const tour = tourMap.get(item.tourId);
        if (!tour) {
          throw new AppException(
            TOURIFY_ERROR_CODES.ORDER.TOUR_NOT_AVAILABLE,
            HttpStatus.BAD_REQUEST,
          );
        }

        const city = cityMap.get(item.cityId);
        if (!city) {
          throw new AppException(
            TOURIFY_ERROR_CODES.ORDER.CITY_NOT_FOUND,
            HttpStatus.BAD_REQUEST,
          );
        }

        if (
          tour.stockAdult < item.quantityAdult ||
          tour.stockChildren < item.quantityChildren ||
          tour.stockBaby < item.quantityBaby
        ) {
          throw new AppException(
            TOURIFY_ERROR_CODES.ORDER.TOUR_OUT_OF_STOCK,
            HttpStatus.BAD_REQUEST,
          );
        }

        orderItemsData.push({
          tourId: tour.id,
          cityId: city.id,
          name: tour.name,
          avatar: tour.avatar,
          slug: tour.slug,
          departureDate: tour.departureDate,
          priceNewAdult: tour.priceNewAdult,
          priceNewChildren: tour.priceNewChildren,
          priceNewBaby: tour.priceNewBaby,
          quantityAdult: item.quantityAdult,
          quantityChildren: item.quantityChildren,
          quantityBaby: item.quantityBaby,
        });

        // 2. Trừ tồn kho ngay trong transaction
        await tx.tour.update({
          where: { id: tour.id },
          data: {
            stockAdult: { decrement: item.quantityAdult },
            stockChildren: { decrement: item.quantityChildren },
            stockBaby: { decrement: item.quantityBaby },
          },
        });
      }

      // 3. Tính tiền
      const subTotal = orderItemsData.reduce(
        (sum, i) =>
          sum +
          i.priceNewAdult * i.quantityAdult +
          i.priceNewChildren * i.quantityChildren +
          i.priceNewBaby * i.quantityBaby,
        0,
      );
      const discount = 0;
      const total = subTotal - discount;

      // 4. Generate orderCode unique (retry tối đa 5 lần)
      let orderCode = generateOrderCode();
      for (let i = 0; i < 5; i++) {
        const exists = await tx.order.findUnique({ where: { orderCode } });
        if (!exists) break;
        orderCode = generateOrderCode();
      }

      // 5. Tạo order + orderItems
      const created = await tx.order.create({
        data: {
          orderCode,
          fullName: dto.fullName,
          email: dto.email,
          phone: dto.phone,
          note: dto.note,
          paymentMethod: dto.paymentMethod,
          paymentStatus: PaymentStatus.UNPAID,
          status: OrderStatus.INITIAL,
          subTotal,
          discount,
          total,
          items: { create: orderItemsData },
        },
        include: { items: { include: { city: true } } },
      });

      return created;
    });

    // TODO: gửi email xác nhận đơn hàng (sau khi transaction thành công)
    // await this.mailService.sendOrderConfirmation(order.email, order);

    return new OrderDetailResponse({
      ...order,
      createdAtFormat: moment(order.createdAt).format(DATE_FORMAT.DATETIME),
      items: order.items.map((i) => ({
        ...i,
        departureDateFormat: i.departureDate
          ? moment(i.departureDate).format(DATE_FORMAT.DEFAULT)
          : '',
      })),
    });
  }

  async findByCodeAndEmail(dto: FindOrderDto): Promise<OrderDetailResponse> {
    const order = await this.prisma.order.findFirst({
      where: { orderCode: dto.orderCode, email: dto.email },
      include: { items: { include: { city: true } } },
    });

    if (!order) {
      throw new AppException(
        TOURIFY_ERROR_CODES.ORDER.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    return new OrderDetailResponse({
      ...order,
      createdAtFormat: moment(order.createdAt).format(DATE_FORMAT.DATETIME),
      items: order.items.map((i) => ({
        ...i,
        departureDateFormat: i.departureDate
          ? moment(i.departureDate).format(DATE_FORMAT.DEFAULT)
          : '',
      })),
    });
  }
}
