import {
  IsOptional,
  IsPhoneNumber,
  MaxLength,
  MinLength,
} from 'class-validator';

import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

export class UpdateProfileDto {
  @IsOptional()
  @MinLength(5, { message: TOURIFY_ERROR_CODES.USER.NAME_TOO_SHORT })
  @MaxLength(50, { message: TOURIFY_ERROR_CODES.USER.NAME_TOO_LONG })
  name?: string;

  @IsOptional()
  @IsPhoneNumber('VN', { message: TOURIFY_ERROR_CODES.USER.PHONE_INVALID })
  phone?: string;

  @IsOptional()
  avatar?: string;
}
