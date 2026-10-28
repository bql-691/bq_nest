import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
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
    SecurityModule,
    ProjectModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
