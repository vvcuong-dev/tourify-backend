import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderDetailResponse } from './responses/order-detail.response';
import { PaginatedResponse } from '../../common/responses/paginated.response';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { PERMISSIONS } from '../../constants/permission.constant';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @RequirePermissions([PERMISSIONS.ORDER.LIST])
  @ApiOperation({ summary: 'List orders with filters' })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully.',
    type: PaginatedResponse,
  })
  findAll(@Query() query: QueryOrderDto) {
    return this.orderService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions([PERMISSIONS.ORDER.VIEW_DETAIL])
  @ApiOperation({ summary: 'Get order detail by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully.',
    type: OrderDetailResponse,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions([PERMISSIONS.ORDER.UPDATE_STATUS])
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully.',
    type: OrderDetailResponse,
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, dto);
  }
}
