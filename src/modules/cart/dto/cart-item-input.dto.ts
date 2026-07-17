import { Type } from 'class-transformer';
import { IsInt, Min, ValidateNested } from 'class-validator';
import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

export class CartItemInputDto {
  @IsInt()
  tourId!: number;

  @IsInt()
  cityId!: number;

  @IsInt()
  @Min(0, { message: TOURIFY_ERROR_CODES.CART.QUANTITY_ADULT_MIN })
  quantityAdult!: number;

  @IsInt()
  @Min(0, { message: TOURIFY_ERROR_CODES.CART.QUANTITY_CHILDREN_MIN })
  quantityChildren!: number;

  @IsInt()
  @Min(0, { message: TOURIFY_ERROR_CODES.CART.QUANTITY_BABY_MIN })
  quantityBaby!: number;
}

export class CartDetailRequestDto {
  @ValidateNested({ each: true })
  @Type(() => CartItemInputDto)
  items!: CartItemInputDto[];
}
