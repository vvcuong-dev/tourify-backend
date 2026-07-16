import { UserResponse } from '../../user/responses/user.response';
import { TokenPairResponse } from './token-pair.response';

export class LoginResponse {
  user!: UserResponse;
  tokens!: TokenPairResponse;

  constructor(user: UserResponse, tokens: TokenPairResponse) {
    this.user = user;
    this.tokens = tokens;
  }
}
