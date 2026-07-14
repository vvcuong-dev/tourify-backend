import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';
import { TourStatus } from '../../../generated/prisma/browser';
import { ScheduleItemDto } from './schedule-item.dto';

export class CreateTourDto {
  @IsString()
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.TOUR.TOUR_NAME_REQUIRED })
  name!: string;

  @IsNotEmpty()
  @IsInt()
  categoryId!: number;

  @IsOptional()
  @IsInt()
  position?: number;

  @IsOptional()
  @IsEnum(TourStatus)
  status?: TourStatus;

  @IsOptional() @Type(() => Number) @IsInt() priceAdult?: number;
  @IsOptional() @Type(() => Number) @IsInt() priceChildren?: number;
  @IsOptional() @Type(() => Number) @IsInt() priceBaby?: number;
  @IsOptional() @Type(() => Number) @IsInt() priceNewAdult?: number;
  @IsOptional() @Type(() => Number) @IsInt() priceNewChildren?: number;
  @IsOptional() @Type(() => Number) @IsInt() priceNewBaby?: number;

  @IsOptional() @Type(() => Number) @IsInt() stockAdult?: number;
  @IsOptional() @Type(() => Number) @IsInt() stockChildren?: number;
  @IsOptional() @Type(() => Number) @IsInt() stockBaby?: number;

  @IsOptional() @IsString() time?: string;
  @IsOptional() @IsString() vehicle?: string;
  @IsOptional() @IsDateString() departureDate?: string;
  @IsOptional() @IsString() information?: string;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  cityIds?: number[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleItemDto)
  schedules?: ScheduleItemDto[];
}
