/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  // Note: removed @vitejs/plugin-react import to avoid type issues during Next build in CI.
  // Add it back when running local vite-based tests if necessary.
  plugins: [tsconfigPaths() as any],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
  },
})
