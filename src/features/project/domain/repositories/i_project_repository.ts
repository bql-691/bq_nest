import type { Project } from '../entities/project_entity.js';

export abstract class IProjectRepository {
  abstract list(ownerId: string): Promise<Project[]>;
  abstract get(id: string): Promise<Project | null>;
  abstract save(project: Project): Promise<void>;
}
