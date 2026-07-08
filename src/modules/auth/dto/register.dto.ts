import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

export class RegisterDto {
  @MinLength(5, { message: TOURIFY_ERROR_CODES.USER.NAME_TOO_SHORT })
  @MaxLength(50, { message: TOURIFY_ERROR_CODES.USER.NAME_TOO_LONG })
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.USER.NAME_REQUIRED })
  name!: string;

  @IsEmail({}, { message: TOURIFY_ERROR_CODES.USER.EMAIL_INVALID })
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.USER.EMAIL_REQUIRED })
  email!: string;

  @MaxLength(72, { message: TOURIFY_ERROR_CODES.USER.PASSWORD_TOO_LONG })
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
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.USER.PASSWORD_REQUIRED })
  password!: string;
}
