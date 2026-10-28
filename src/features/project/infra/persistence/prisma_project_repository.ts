import { Injectable } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { PrismaService } from '../../../../app/prisma/prisma_service.js';
import { Project, projectFromRecord } from '../../domain/entities/project_entity.js';
import { IProjectRepository } from '../../domain/repositories/i_project_repository.js';

@Injectable()
export class PrismaProjectRepository extends IProjectRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  async list(ownerId: string): Promise<Project[]> {
    const records = await this.prisma.project.findMany({
      where: { ownerId },
      orderBy: { updatedAt: 'desc' },
    });
    return records.map(projectFromRecord);
  }

  async get(id: string): Promise<Project | null> {
    const record = await this.prisma.project.findUnique({ where: { id } });
    return record ? projectFromRecord(record) : null;
  }

  async save(project: Project): Promise<void> {
    const data = {
      name: project.name,
      ownerId: project.ownerId,
      updatedAt: project.updatedAt,
      document: JSON.stringify(instanceToPlain(project.document)),
    };
    await this.prisma.project.upsert({
      where: { id: project.id },
      create: { id: project.id, ...data },
      update: data,
    });
  }
}
