import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

export class LoginDto {
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
