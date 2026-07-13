import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CategoryStatus } from '../../../generated/prisma/browser';
import { DateRangeQueryDto } from '../../../common/dto/date-range-query.dto';

export class QueryCategoryDto extends DateRangeQueryDto {
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  createdBy?: number;

  @IsOptional()
  @IsString()
  keyword?: string;
}
