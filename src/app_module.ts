import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { createObserveModule } from '@nestjs/observe';
import { AllExceptionsFilter } from './app/http/all_exceptions_filter.js';
import { I18nModule } from './app/i18n/i18n_module.js';
import { PrismaModule } from './app/prisma/prisma_module.js';
import { AppController } from './app_controller.js';
import { ProjectModule } from './features/project/project_module.js';
import { SecurityModule } from './features/security/security_module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'bq_nest',
    }),
    PrismaModule,
    I18nModule,
    SecurityModule,
    ProjectModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {}
