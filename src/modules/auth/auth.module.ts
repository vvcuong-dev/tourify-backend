import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenModule } from '../token/token.module';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from '../../passports/jwt.strategy';
import { RedisModule } from '../redis/redis.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [PassportModule, TokenModule, UserModule, RedisModule],
  exports: [JwtStrategy],
})
export class AuthModule {}
