import { Module } from '@nestjs/common';
import { PrismaModule } from '../../app/prisma/prisma_module.js';
import { ProjectApplication } from './application/project_application.js';
import { IProjectRepository } from './domain/repositories/i_project_repository.js';
import { PrismaProjectRepository } from './infra/persistence/prisma_project_repository.js';
import { ProjectController } from './presentation/project_controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectController],
  providers: [
    ProjectApplication,
    { provide: IProjectRepository, useClass: PrismaProjectRepository },
  ],
})
export class ProjectModule {}
