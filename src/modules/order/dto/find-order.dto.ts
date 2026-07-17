import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

export class FindOrderDto {
  @IsString({ message: TOURIFY_ERROR_CODES.ORDER.ORDER_CODE_INVALID })
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.ORDER.ORDER_CODE_REQUIRED })
  orderCode!: string;

  @IsEmail({}, { message: TOURIFY_ERROR_CODES.ORDER.INVALID_EMAIL })
  email!: string;
}
