import { Expose, Type } from 'class-transformer';
import { UserResponse } from '../../../common/responses/user.response';
import { TokenPairResponse } from '../../../common/responses/token-pair.response';

export class LoginResponse {
  @Expose()
  @Type(() => UserResponse)
  user!: UserResponse;

  @Type(() => TokenPairResponse)
  tokens!: TokenPairResponse;

  constructor(partial: Partial<LoginResponse>) {
    Object.assign(this, partial);
  }
}
