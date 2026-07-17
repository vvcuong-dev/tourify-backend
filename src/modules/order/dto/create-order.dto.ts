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
import { PaymentMethod } from '../../../generated/prisma/browser';
import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

export class OrderItemInputDto {
  @IsInt()
  tourId!: number;

  @IsInt()
  cityId!: number;

  @IsInt()
  @Min(0)
  quantityAdult!: number;

  @IsInt()
  @Min(0)
  quantityChildren!: number;

  @IsInt()
  @Min(0)
  quantityBaby!: number;
}

export class CreateOrderDto {
  @IsString({ message: TOURIFY_ERROR_CODES.ORDER.FULL_NAME_INVALID })
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.ORDER.FULL_NAME_REQUIRED })
  fullName!: string;

  @IsEmail({}, { message: TOURIFY_ERROR_CODES.ORDER.EMAIL_INVALID })
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.ORDER.EMAIL_REQUIRED })
  email!: string;

  @IsString({ message: TOURIFY_ERROR_CODES.ORDER.PHONE_INVALID })
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.ORDER.PHONE_REQUIRED })
  phone!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsArray()
  @ArrayNotEmpty({
    message: TOURIFY_ERROR_CODES.ORDER.TOUR_MUST_HAVE_AT_LEAST_ONE_ITEM,
  })
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items!: OrderItemInputDto[];
}
