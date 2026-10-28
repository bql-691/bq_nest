import { Module } from '@nestjs/common';
import { PrismaService } from './prisma_service.js';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
