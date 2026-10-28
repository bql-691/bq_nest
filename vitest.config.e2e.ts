import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    fileParallelism: false,
    hookTimeout: 30000,
    testTimeout: 30000,
    env: {
      DATABASE_URL: 'file:./prisma/e2e.db',
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '1h',
      CORS_ORIGIN: 'http://localhost:5173',
    },
  },
});
