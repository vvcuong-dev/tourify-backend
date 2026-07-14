import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';
import { AppException } from './app.exception';

@Catch(BadRequestException)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message;

    const isMulterError = /unexpected field|file too large|limit/i.test(
      message,
    );

    if (!isMulterError) {
      throw exception;
    }

    const appException = new AppException(message, HttpStatus.BAD_REQUEST);

    response.status(appException.getStatus()).json(appException.getResponse());
  }
}
