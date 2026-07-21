import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

export class FindOrderDto {
  @ApiProperty({ example: 'ORD123456' })
  @IsString({ message: TOURIFY_ERROR_CODES.ORDER.ORDER_CODE_INVALID })
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.ORDER.ORDER_CODE_REQUIRED })
  orderCode!: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: TOURIFY_ERROR_CODES.ORDER.INVALID_EMAIL })
  email!: string;
}
