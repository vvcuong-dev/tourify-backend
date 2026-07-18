import { HttpStatus, Injectable } from '@nestjs/common';
import moment from 'moment';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException } from '../../common/exceptions/app.exception';
import { TOURIFY_ERROR_CODES } from '../../constants/error-code.constant';
import { Prisma } from '../../generated/prisma/browser';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderListResponse } from './responses/order-list.response';
import { OrderDetailResponse } from './responses/order-detail.response';
import {
  PaginatedResponse,
  PaginationMeta,
} from '../../common/responses/paginated.response';
import { DATE_FORMAT } from '../../constants/date-format.constant';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhereClause(query: QueryOrderDto): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = { deleted: false };

    if (query.status) where.status = query.status;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.paymentMethod) where.paymentMethod = query.paymentMethod;

    if (query.keyword) {
      where.OR = [
        { orderCode: { contains: query.keyword } },
        { email: { contains: query.keyword } },
        { phone: { contains: query.keyword } },
        { fullName: { contains: query.keyword } },
      ];
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    return where;
  }

  async findAll(
    query: QueryOrderDto,
  ): Promise<PaginatedResponse<OrderListResponse>> {
    const where = this.buildWhereClause(query);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [totalRecord, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { items: true } } },
      }),
    ]);

    const totalPage = Math.ceil(totalRecord / limit);

    return new PaginatedResponse(
      orders.map(
        (o) =>
          new OrderListResponse({
            ...o,
            itemCount: o._count.items,
            createdAtFormat: moment(o.createdAt).format(DATE_FORMAT.DATETIME),
          }),
      ),
      new PaginationMeta({ page, limit, totalRecord, totalPage }),
    );
  }

  async findOne(id: number): Promise<OrderDetailResponse> {
    const order = await this.prisma.order.findFirst({
      where: { id, deleted: false },
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

  async updateStatus(
    id: number,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderDetailResponse> {
    const order = await this.prisma.order.findFirst({
      where: { id, deleted: false },
    });

    if (!order) {
      throw new AppException(
        TOURIFY_ERROR_CODES.ORDER.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        paymentStatus: dto.paymentStatus,
        note: dto.note,
      },
      include: { items: { include: { city: true } } },
    });

    return new OrderDetailResponse({
      ...updated,
      createdAtFormat: moment(updated.createdAt).format(DATE_FORMAT.DATETIME),
      items: updated.items.map((i) => ({
        ...i,
        departureDateFormat: i.departureDate
          ? moment(i.departureDate).format(DATE_FORMAT.DEFAULT)
          : '',
      })),
    });
  }
}
