import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { HttpStatus } from '@nestjs/common';
import { UserService } from '../modules/user/user.service';
import { jwtConfig } from '../configs/jwt.config';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { UserStatus } from '../generated/prisma/browser';
import { AppException } from '../exceptions/app.exception';
import { TOURIFY_ERROR_CODES } from '../constants/error-code.constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.accessSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findById(payload.sub);

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new AppException(
        TOURIFY_ERROR_CODES.AUTH.INVALID_CREDENTIALS,
        HttpStatus.UNAUTHORIZED,
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
