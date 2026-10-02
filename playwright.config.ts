import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  projects: [
    { name: 'foundation', testIgnore: '**/api-client-real.spec.ts' },
    {
      name: 'real-api',
      testMatch: '**/api-client-real.spec.ts',
      use: { trace: 'off', screenshot: 'off', video: 'off' },
    },
  ],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:4173', browserName: 'chromium', trace: 'retain-on-failure' },
  webServer: process.argv.includes('--project=real-api')
    ? undefined
    : {
        command: 'node build',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: false,
        env: { HOST: '127.0.0.1', PORT: '4173' },
      },
});
