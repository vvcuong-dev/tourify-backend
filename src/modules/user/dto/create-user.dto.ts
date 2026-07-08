import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

import { UserStatus } from '../../../generated/prisma/client';
import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

export class CreateUserDto {
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.USER.NAME_REQUIRED })
  @MinLength(5, { message: TOURIFY_ERROR_CODES.USER.NAME_TOO_SHORT })
  @MaxLength(50, { message: TOURIFY_ERROR_CODES.USER.NAME_TOO_LONG })
  name!: string;

  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.USER.EMAIL_REQUIRED })
  @IsEmail({}, { message: TOURIFY_ERROR_CODES.USER.EMAIL_INVALID })
  email!: string;

  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.USER.PASSWORD_REQUIRED })
  @MaxLength(50, { message: TOURIFY_ERROR_CODES.USER.PASSWORD_TOO_LONG })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    { message: TOURIFY_ERROR_CODES.USER.PASSWORD_TOO_WEAK },
  )
  password!: string;

  @IsOptional()
  @IsEnum(UserStatus, { message: TOURIFY_ERROR_CODES.USER.STATUS_INVALID })
  status?: UserStatus = UserStatus.PENDING;

  @IsOptional()
  avatar?: string;

  @IsOptional()
  @IsPhoneNumber('VN', { message: TOURIFY_ERROR_CODES.USER.PHONE_INVALID })
  phone?: string;
}
