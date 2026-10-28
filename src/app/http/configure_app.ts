import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './response_interceptor.js';

export function configureApp(app: INestApplication): void {
  const origin = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  app.enableCors({ origin, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      // 登录快照里的 $modelType 没有写在 DTO 上，whitelist 会去掉它。
      // 不要开启 forbidNonWhitelisted，否则这个多余字段会变成 400。
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
}
