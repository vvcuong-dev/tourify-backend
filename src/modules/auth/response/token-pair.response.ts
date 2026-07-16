import { Expose } from 'class-transformer';

export class TokenPairResponse {
  @Expose()
  accessToken!: string;

  @Expose()
  refreshToken!: string;

  constructor(partial: Partial<TokenPairResponse>) {
    Object.assign(this, partial);
  }
}
