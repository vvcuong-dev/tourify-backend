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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';
import { TourStatus } from '../../../generated/prisma/browser';
import { ScheduleItemDto } from './schedule-item.dto';

export class CreateTourDto {
  @ApiProperty({ example: 'Ha Long Bay Tour' })
  @IsString()
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.TOUR.TOUR_NAME_REQUIRED })
  name!: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  categoryId!: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  position?: number;

  @ApiPropertyOptional({ enum: TourStatus })
  @IsOptional()
  @IsEnum(TourStatus)
  status?: TourStatus;

  @ApiPropertyOptional({ example: 1200000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priceAdult?: number;
  @ApiPropertyOptional({ example: 1000000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priceChildren?: number;
  @ApiPropertyOptional({ example: 200000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priceBaby?: number;
  @ApiPropertyOptional({ example: 1100000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priceNewAdult?: number;
  @ApiPropertyOptional({ example: 900000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priceNewChildren?: number;
  @ApiPropertyOptional({ example: 150000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priceNewBaby?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  stockAdult?: number;
  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  stockChildren?: number;
  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  stockBaby?: number;

  @ApiPropertyOptional({ example: '3 days 2 nights' })
  @IsOptional()
  @IsString()
  time?: string;
  @ApiPropertyOptional({ example: 'Car' })
  @IsOptional()
  @IsString()
  vehicle?: string;
  @ApiPropertyOptional({ example: '2026-08-01' })
  @IsOptional()
  @IsDateString()
  departureDate?: string;
  @ApiPropertyOptional({ example: 'Detailed itinerary information' })
  @IsOptional()
  @IsString()
  information?: string;

  @ApiPropertyOptional({ type: [Number], example: [1, 2] })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  cityIds?: number[];

  @ApiPropertyOptional({ type: () => [ScheduleItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleItemDto)
  schedules?: ScheduleItemDto[];
}
