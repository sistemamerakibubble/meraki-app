import { defineConfig, mergeConfig } from 'vitest/config';
import base from './vitest.config';

export default mergeConfig(
  base,
  defineConfig({
    test: {
      environment: 'node',
      include: ['src/**/*.int.test.{ts,tsx}'],
      testTimeout: 20_000,
      hookTimeout: 30_000,
      pool: 'forks',
      poolOptions: { forks: { singleFork: true } },
    },
  }),
);
