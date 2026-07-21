import { IsEmail, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  orderCode!: string;

  @IsEmail()
  email!: string;
}
