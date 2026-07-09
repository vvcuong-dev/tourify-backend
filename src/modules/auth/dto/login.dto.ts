import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

const { USER } = TOURIFY_ERROR_CODES;

export class LoginDto {
  @IsEmail({}, { message: USER.EMAIL_INVALID })
  @IsNotEmpty({ message: USER.EMAIL_REQUIRED })
  email!: string;

  @MaxLength(72, { message: USER.PASSWORD_TOO_LONG })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    { message: USER.PASSWORD_TOO_WEAK },
  )
  @IsNotEmpty({ message: USER.PASSWORD_REQUIRED })
  password!: string;
}
