import { Expose, Type } from 'class-transformer';
import { UserResponse } from '../../../common/responses/user.response';

export class LoginResponse {
  @Expose()
  @Type(() => UserResponse)
  user!: UserResponse;

  @Expose()
  accessToken!: string;

  @Expose()
  refreshToken!: string;

  constructor(partial: Partial<LoginResponse>) {
    Object.assign(this, partial);
  }
}
