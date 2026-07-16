import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { TOURIFY_ERROR_CODES } from '../../constants/error-code.constant';
import { comparePassword, hashPassword } from '../../utils/password.util';
import { UserStatus } from '../../generated/prisma/browser';
import { LoginDto } from './dto/login.dto';
import { TokenService } from '../token/token.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { LoginResponse } from './response/login.response';
import { UserResponse } from '../user/responses/user.response';
import { UserService } from '../user/user.service';
import { RedisService } from '../redis/redis.service';
import { CACHE, TTL } from '../../constants/cache.constant';
import { JwtPayload } from './type/jwt-payload.type';
import { TokenPairResponse } from './response/token-pair.response';
import { RefreshTokenResponse } from './response/refresh-token.response';
import { CacheService } from '../redis/cache.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly cacheService: CacheService,
  ) {}

  private get redis() {
    return this.redisService.getClient();
  }

  async register(dto: RegisterDto): Promise<UserResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new AppException(
        TOURIFY_ERROR_CODES.USER.EMAIL_ALREADY_EXISTS,
        HttpStatus.CONFLICT,
      );
    }

    const hashedPassword = await hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        status: UserStatus.PENDING,
      },
    });
    return new UserResponse(user);
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.userService.findByEmail(dto.email);

    const isValidPassword =
      user && (await comparePassword(dto.password, user.password));

    if (!isValidPassword) {
      throw new AppException(
        TOURIFY_ERROR_CODES.AUTH.INVALID_CREDENTIALS,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppException(
        TOURIFY_ERROR_CODES.AUTH.ACCOUNT_NOT_ACTIVE,
        HttpStatus.FORBIDDEN,
      );
    }

    const { token: accessToken } = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
    });

    const { token: refreshToken, jti: refreshJti } =
      this.tokenService.generateRefreshToken({
        sub: user.id,
        email: user.email,
      });

    await this.redis.set(
      CACHE.AUTH._KEY.REFRESH_TOKEN(user.id, refreshJti),
      refreshToken,
      {
        EX: TTL.WEEK, // 7 days
      },
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    return new LoginResponse({
      user: new UserResponse(result),
      tokens: new TokenPairResponse({ accessToken, refreshToken }),
    });
  }

  async refreshToken(token: RefreshTokenDto): Promise<RefreshTokenResponse> {
    let decoded: JwtPayload;
    try {
      decoded = this.tokenService.verifyRefreshToken(token.refreshToken);
    } catch {
      throw new AppException(
        TOURIFY_ERROR_CODES.AUTH.INVALID_REFRESH_TOKEN,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!decoded.jti) {
      throw new AppException(
        TOURIFY_ERROR_CODES.AUTH.INVALID_REFRESH_TOKEN,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const oldKey = CACHE.AUTH._KEY.REFRESH_TOKEN(decoded.sub, decoded.jti);
    const exists = await this.redis.get(oldKey);
    if (!exists) {
      throw new AppException(
        TOURIFY_ERROR_CODES.AUTH.INVALID_REFRESH_TOKEN,
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.cacheService.delete(oldKey);
    const user = await this.userService.findById(decoded.sub);
    if (!user) {
      throw new AppException(
        TOURIFY_ERROR_CODES.USER.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const { token: newAccessToken } = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
    });

    const { token: newRefreshToken, jti: newJti } =
      this.tokenService.generateRefreshToken({
        sub: user.id,
        email: user.email,
      });

    await this.redis.set(
      CACHE.AUTH._KEY.REFRESH_TOKEN(user.id, newJti),
      newRefreshToken,
      {
        EX: TTL.WEEK, // 7 days
      },
    );

    return new RefreshTokenResponse({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  }

  async changePassword(
    userId: number,
    dto: ChangePasswordDto,
  ): Promise<boolean> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new AppException(
        TOURIFY_ERROR_CODES.USER.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const isMatch = await comparePassword(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new AppException(
        TOURIFY_ERROR_CODES.AUTH.OLD_PASSWORD_INCORRECT,
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedNewPassword = await hashPassword(dto.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return true;
  }

  async changeEmail(userId: number, dto: ChangeEmailDto): Promise<boolean> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new AppException(
        TOURIFY_ERROR_CODES.USER.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const isMatch = await comparePassword(dto.password, user.password);
    if (!isMatch) {
      throw new AppException(
        TOURIFY_ERROR_CODES.AUTH.PASSWORD_INCORRECT,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.newEmail === user.email) {
      throw new AppException(
        TOURIFY_ERROR_CODES.USER.EMAIL_SAME_AS_OLD,
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this.userService.findByEmail(dto.newEmail);
    if (existing) {
      throw new AppException(
        TOURIFY_ERROR_CODES.USER.EMAIL_ALREADY_EXISTS,
        HttpStatus.CONFLICT,
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { email: dto.newEmail },
    });

    return true;
  }
  async logout(userId: number, accessToken: string): Promise<boolean> {
    const decoded = this.tokenService.decode(accessToken);
    if (!decoded.jti || !decoded.exp) {
      throw new AppException(
        TOURIFY_ERROR_CODES.AUTH.INVALID_ACCESS_TOKEN,
        HttpStatus.BAD_REQUEST,
      );
    }

    const ttlRemaining = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttlRemaining <= 0) {
      throw new AppException(
        TOURIFY_ERROR_CODES.AUTH.INVALID_ACCESS_TOKEN,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Add the access token's jti to the blacklist with the remaining TTL
    await this.redis.set(
      CACHE.AUTH._KEY.BLACKLIST(decoded.jti),
      String(userId),
      { EX: ttlRemaining },
    );

    // Invalidate all refresh tokens for the user
    await this.cacheService.deleteByPattern(
      CACHE.AUTH._PATTERN.ALL_REFRESH_TOKENS(userId),
    );

    return true;
  }
}
