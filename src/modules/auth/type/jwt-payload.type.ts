export interface JwtPayload {
  sub: number;
  email: string;
  jti?: string;
}

export interface GeneratedToken {
  token: string;
  jti: string;
}
