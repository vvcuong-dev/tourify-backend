import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.AUTH.REFRESH_TOKEN_REQUIRED })
  refreshToken!: string;
}
