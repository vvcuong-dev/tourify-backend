import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 'ORD123456' })
  @IsString()
  orderCode!: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;
}
