import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { configureApp } from './app/http/configure_app.js';
import { AppModule, ObserveInstrument } from './app_module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  configureApp(app);
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
