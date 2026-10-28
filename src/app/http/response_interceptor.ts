import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, type Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (isApiBody(data)) return data;
        return { code: 200, message: 'ok', data: data ?? null };
      }),
    );
  }
}

function isApiBody(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    'code' in data &&
    'data' in data &&
    typeof data.code === 'number'
  );
}
