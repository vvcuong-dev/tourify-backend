import { IsNotEmpty, IsString } from 'class-validator';
import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.AUTH.REFRESH_TOKEN_REQUIRED })
  refreshToken!: string;
}
