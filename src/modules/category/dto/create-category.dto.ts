import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';
import { CategoryStatus } from '../../../generated/prisma/browser';

export class CreateCategoryDto {
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.CATEGORY.NAME_REQUIRED })
  @IsString()
  name!: string;

  @IsOptional()
  @IsInt()
  parentId?: number;

  @IsOptional()
  @IsInt()
  position?: number;

  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus = CategoryStatus.ACTIVE;

  @IsOptional()
  @IsString()
  description?: string;
}
