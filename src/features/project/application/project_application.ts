import { Injectable } from '@nestjs/common';
import type { Actor } from '../../../app/domain/actor.js';
import { DomainError } from '../../../app/domain/domain_error.js';
import { plainProject, projectFromClient } from '../domain/entities/project_entity.js';
import { IProjectRepository } from '../domain/repositories/i_project_repository.js';

@Injectable()
export class ProjectApplication {
  constructor(private projects: IProjectRepository) {}

  async list(actor: Actor): Promise<Record<string, unknown>[]> {
    const projects = await this.projects.list(actor.id);
    return projects.map((project) => plainProject(project));
  }

  async get(actor: Actor, id: string): Promise<Record<string, unknown>> {
    const project = await this.projects.get(id);
    if (!project) throw new DomainError(404, 'project.err_not_found');
    project.assertAccessible(actor);
    return plainProject(project);
  }

  async save(actor: Actor, id: string, raw: unknown): Promise<Record<string, unknown>> {
    const existing = await this.projects.get(id);
    if (existing) existing.assertAccessible(actor);
    const project = await projectFromClient(id, raw, existing?.ownerId ?? actor.id);
    await this.projects.save(project);
    return plainProject(project);
  }
}
