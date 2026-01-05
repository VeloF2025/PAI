import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/**/*.test.ts',
        '**/*.d.ts',
        'vitest.config.ts'
      ]
    },
    testTimeout: 10000, // 10 seconds for MCP calls
    hookTimeout: 10000
  }
});
