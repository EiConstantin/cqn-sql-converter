import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node'
  },
  resolve: {
    alias: {
      '@': '/Users/constantineisinger/Documents/git/github.com/cqn-sql-converter/src'
    }
  }
});
