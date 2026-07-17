import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './common/validators/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { TokenModule } from './modules/token/token.module';
import { RedisModule } from './modules/redis/redis.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { CategoryModule } from './modules/category/category.module';
import { TourModule } from './modules/tour/tour.module';
import { CityModule } from './modules/city/city.module';
import { CartModule } from './modules/cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    TokenModule,
    RedisModule,
    CloudinaryModule,
    CategoryModule,
    TourModule,
    CityModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
