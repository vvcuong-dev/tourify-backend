import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../../generated/prisma/browser';
import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

export class OrderItemInputDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  tourId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  cityId!: number;

  @ApiProperty({ example: 2, minimum: 0 })
  @IsInt()
  @Min(0)
  quantityAdult!: number;

  @ApiProperty({ example: 1, minimum: 0 })
  @IsInt()
  @Min(0)
  quantityChildren!: number;

  @ApiProperty({ example: 0, minimum: 0 })
  @IsInt()
  @Min(0)
  quantityBaby!: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString({ message: TOURIFY_ERROR_CODES.ORDER.FULL_NAME_INVALID })
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.ORDER.FULL_NAME_REQUIRED })
  fullName!: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: TOURIFY_ERROR_CODES.ORDER.EMAIL_INVALID })
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.ORDER.EMAIL_REQUIRED })
  email!: string;

  @ApiProperty({ example: '0901234567' })
  @IsString({ message: TOURIFY_ERROR_CODES.ORDER.PHONE_INVALID })
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.ORDER.PHONE_REQUIRED })
  phone!: string;

  @ApiPropertyOptional({ example: 'Please call before arrival' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiProperty({ type: () => [OrderItemInputDto] })
  @IsArray()
  @ArrayNotEmpty({
    message: TOURIFY_ERROR_CODES.ORDER.TOUR_MUST_HAVE_AT_LEAST_ONE_ITEM,
  })
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items!: OrderItemInputDto[];
}
