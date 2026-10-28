import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { configureApp } from '../src/app/http/configure_app.js';
import { PrismaService } from '../src/app/prisma/prisma_service.js';
import { AppModule } from '../src/app_module.js';

const snapshot = {
  type: 'project/Project',
  id: 'p1',
  name: 'Canvas',
  updatedAt: 10,
  document: { type: 'project/Document', shapes: [] },
};

describe('auth and projects (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    rmSync('prisma/e2e.db', { force: true });
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: 'file:./prisma/e2e.db' },
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  beforeEach(async () => {
    const prisma = app.get(PrismaService);
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers, logs in, and saves a project snapshot', async () => {
    const server = app.getHttpServer();

    await request(server)
      .post('/auth/register')
      .send({
        username: 'ada',
        password: 'secret1',
        confirmPassword: 'secret1',
      })
      .expect(200);

    const login = await request(server)
      .post('/auth/login')
      .send({ username: 'ada', password: 'secret1' })
      .expect(200);
    expect(login.body).toMatchObject({
      code: 200,
      data: { user: { username: 'ada', roles: ['user'] } },
    });
    const token = login.body.data.token as string;

    const saved = await request(server)
      .put('/projects/p1')
      .set('Authorization', `Bearer ${token}`)
      .send(snapshot)
      .expect(200);
    expect(saved.body.data).toMatchObject({
      type: 'project/Project',
      id: 'p1',
      name: 'Canvas',
    });

    const listed = await request(server)
      .get('/projects')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(listed.body.data).toHaveLength(1);

    await request(server).get('/projects/p1').expect(401);

    const loaded = await request(server)
      .get('/projects/p1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(loaded.body.data.document).toEqual(snapshot.document);
  });

  it('returns the business message when login fails', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'ada', password: 'secret1' })
      .expect(401);

    expect(response.body).toEqual({
      code: 401,
      message: '用户名或密码错误',
      data: null,
    });
  });
});
