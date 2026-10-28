import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { DomainError } from '../domain/domain_error.js';
import { I18n, resolveLanguage } from '../i18n/i18n.js';

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly i18n: I18n) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const language = resolveLanguage(request.headers['accept-language']);

    if (exception instanceof DomainError) {
      response.status(exception.status).json({
        code: exception.status,
        message: this.i18n.translateMessage(exception.message, language),
        data: null,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.status(status).json({
        code: status,
        message: this.i18n.translateMessage(exceptionMessage(exception), language),
        data: null,
      });
      return;
    }

    this.logger.error(exception);
    response.status(500).json({
      code: 500,
      message: this.i18n.translate('common.server_error', language),
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
