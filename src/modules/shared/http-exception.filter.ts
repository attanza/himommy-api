// tslint:disable:no-console
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Meta2 } from './interfaces/response-parser.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const NODE_ENV = process.env.NODE_ENV;
    if (NODE_ENV === 'development') {
      Logger.log(JSON.stringify(exception));
    }

    let message: string =
      status !== HttpStatus.INTERNAL_SERVER_ERROR
        ? exception.message.message || exception.message || null
        : 'Internal Server Error';

    if (status === 401) {
      message = 'Unauthorized';
    }
    const meta: Meta2 = {
      status,
      message,
    };

    response.status(status).json({
      meta,
    });
  }
}
