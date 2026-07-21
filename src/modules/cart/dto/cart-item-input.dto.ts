import { Type } from 'class-transformer';
import { IsInt, Min, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

export class CartItemInputDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  tourId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  cityId!: number;

  @ApiProperty({ example: 2, minimum: 0 })
  @IsInt()
  @Min(0, { message: TOURIFY_ERROR_CODES.CART.QUANTITY_ADULT_MIN })
  quantityAdult!: number;

  @ApiProperty({ example: 1, minimum: 0 })
  @IsInt()
  @Min(0, { message: TOURIFY_ERROR_CODES.CART.QUANTITY_CHILDREN_MIN })
  quantityChildren!: number;

  @ApiProperty({ example: 0, minimum: 0 })
  @IsInt()
  @Min(0, { message: TOURIFY_ERROR_CODES.CART.QUANTITY_BABY_MIN })
  quantityBaby!: number;
}

export class CartDetailRequestDto {
  @ApiProperty({ type: () => [CartItemInputDto] })
  @ValidateNested({ each: true })
  @Type(() => CartItemInputDto)
  items!: CartItemInputDto[];
}
