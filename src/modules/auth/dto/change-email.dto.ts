import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

export class ChangeEmailDto {
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.USER.EMAIL_REQUIRED })
  @IsEmail({}, { message: TOURIFY_ERROR_CODES.USER.EMAIL_INVALID })
  newEmail!: string;

  @IsString()
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.USER.PASSWORD_REQUIRED })
  password!: string;
}
