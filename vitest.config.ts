import { defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing/vitest-plugin'

export default defineConfig({
  test: {
    projects: [
      {
        // Pure logic and storage, with WXT's in-memory fake of `browser.*`.
        plugins: [WxtVitest()],
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          mockReset: true,
          restoreMocks: true,
        },
      },
      {
        // Real Chromium with the built extension loaded.
        test: {
          name: 'e2e',
          include: ['tests/e2e/**/*.test.ts'],
          globalSetup: ['tests/e2e/global-setup.ts'],
          testTimeout: 30_000,
          hookTimeout: 60_000,
          fileParallelism: false,
        },
      },
    ],
  },
})
