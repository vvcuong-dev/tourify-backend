import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  BadRequestException,
  ValidationError,
  HttpStatus,
} from '@nestjs/common';
import { AppModule } from './app.module';
import { appConfig } from './configs/app.config';
import { TOURIFY_ERROR_CODES } from './constants/error-code.constant';
import { MulterExceptionFilter } from './exceptions/multer.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new MulterExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors = validationErrors.map((error) => ({
          field: error.property,
          errorCode: Object.values(error.constraints || {})[0],
        }));

        return new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: TOURIFY_ERROR_CODES.COMMON.VALIDATION_ERROR,
          message: TOURIFY_ERROR_CODES.COMMON.VALIDATION_ERROR,
          errors,
        });
      },
    }),
  );

  await app.listen(appConfig.port);
}
void bootstrap();
