import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

const { USER } = TOURIFY_ERROR_CODES;

export class RegisterDto {
  @MinLength(5, { message: USER.NAME_TOO_SHORT })
  @MaxLength(50, { message: USER.NAME_TOO_LONG })
  @IsNotEmpty({ message: USER.NAME_REQUIRED })
  name!: string;

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
