import { Actor } from '../../../app/domain/actor.js';
import { ProjectApplication } from './project_application.js';
import { Project } from '../domain/entities/project_entity.js';
import { IProjectRepository } from '../domain/repositories/i_project_repository.js';

class InMemoryProjects extends IProjectRepository {
  readonly items: Project[] = [];

  list(ownerId: string): Promise<Project[]> {
    return Promise.resolve(this.items.filter((item) => item.ownerId === ownerId));
  }

  get(id: string): Promise<Project | null> {
    return Promise.resolve(this.items.find((item) => item.id === id) ?? null);
  }

  save(project: Project): Promise<void> {
    const index = this.items.findIndex((item) => item.id === project.id);
    if (index >= 0) this.items[index] = project;
    else this.items.push(project);
    return Promise.resolve();
  }
}

const snapshot = {
  type: 'project/Project',
  id: 'p1',
  name: '  Canvas  ',
  updatedAt: 10,
  document: {
    type: 'project/Document',
    shapes: [
      {
        type: 'project/LineShape',
        id: 'l1',
        x1: 0,
        y1: 0,
        x2: 8,
        y2: 4,
      },
    ],
  },
};

describe('ProjectApplication', () => {
  const owner = new Actor('owner', 'ada', ['user']);
  const stranger = new Actor('stranger', 'grace', ['user']);

  it('saves a snapshot the client can restore', async () => {
    const application = new ProjectApplication(new InMemoryProjects());
    const saved = await application.save(owner, 'p1', snapshot);

    expect(saved).toMatchObject({
      type: 'project/Project',
      id: 'p1',
      name: 'Canvas',
      updatedAt: 10,
      document: {
        type: 'project/Document',
        shapes: [{ id: 'l1', type: 'project/LineShape' }],
      },
    });
  });

  it('hides a project from someone who does not own it', async () => {
    const application = new ProjectApplication(new InMemoryProjects());
    await application.save(owner, 'p1', snapshot);

    await expect(application.get(stranger, 'p1')).rejects.toMatchObject({
      status: 404,
      message: 'project.err_not_found',
    });
  });

  it('lets an admin open another user project', async () => {
    const application = new ProjectApplication(new InMemoryProjects());
    await application.save(owner, 'p1', snapshot);
    const admin = new Actor('admin', 'root', ['admin']);

    await expect(application.get(admin, 'p1')).resolves.toMatchObject({
      id: 'p1',
      name: 'Canvas',
    });
  });
});
