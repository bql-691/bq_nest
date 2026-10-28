import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { DomainError } from '../domain/domain_error.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof DomainError) {
      response.status(exception.status).json({
        code: exception.status,
        message: exception.message,
        data: null,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.status(status).json({
        code: status,
        message: exceptionMessage(exception),
        data: null,
      });
      return;
    }

    this.logger.error(exception);
    response.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null,
    });
  }
}

function exceptionMessage(exception: HttpException): string {
  const raw = exception.getResponse();
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object' && raw && 'message' in raw) {
    const message = raw.message;
    if (Array.isArray(message)) return message.map(String).join('; ');
    if (typeof message === 'string') return message;
  }
  return exception.message;
}
