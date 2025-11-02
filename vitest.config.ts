import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    environmentMatchGlobs: [
      ['**/*.node.test.ts', 'node'],
      ['**/*.node.test.tsx', 'node'],
    ],
  },
  resolve: {
    alias: [
      { find: '@prisma/client/runtime/library', replacement: path.resolve(__dirname, './test/mocks/prisma-runtime.ts') },
      { find: '@prisma/client', replacement: path.resolve(__dirname, './test/mocks/prisma-client.ts') },
      { find: '@/lib', replacement: path.resolve(__dirname, './lib') },
      { find: '@/components', replacement: path.resolve(__dirname, './src/components') },
      { find: '@/app', replacement: path.resolve(__dirname, './src/app') },
      { find: 'dotenv', replacement: path.resolve(__dirname, './test/mocks/dotenv.ts') },
      { find: 'prom-client', replacement: path.resolve(__dirname, './test/mocks/prom-client.ts') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
})
