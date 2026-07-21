import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { CategoryStatus } from '../../../generated/prisma/client';
import { DateRangeQueryDto } from '../../../common/dto/date-range-query.dto';
import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

export class QueryCategoryDto extends DateRangeQueryDto {
  @ApiPropertyOptional({
    enum: CategoryStatus,
    description: 'Filter by category status',
  })
  @IsOptional()
  @IsEnum(CategoryStatus, {
    message: TOURIFY_ERROR_CODES.CATEGORY.STATUS_INVALID,
  })
  status?: CategoryStatus;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter by the id of the creator',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  createdBy?: number;

  @ApiPropertyOptional({
    example: 'beach',
    description: 'Search keyword by category name',
  })
  @IsOptional()
  @IsString()
  keyword?: string;
}
