import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';
import { CategoryStatus } from '../../../generated/prisma/client';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Beach Tour',
    description: 'The name of the category',
  })
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.CATEGORY.NAME_REQUIRED })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'The id of the parent category',
  })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Display order/position' })
  @IsOptional()
  @IsInt()
  position?: number;

  @ApiPropertyOptional({
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
    description: 'The status of the category',
  })
  @IsOptional()
  @IsEnum(CategoryStatus, {
    message: TOURIFY_ERROR_CODES.CATEGORY.STATUS_INVALID,
  })
  status?: CategoryStatus = CategoryStatus.ACTIVE;

  @ApiPropertyOptional({
    example: 'Explore the best coastal destinations',
    description: 'A short description of the category',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
