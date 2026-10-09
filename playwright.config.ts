import { defineConfig } from '@playwright/test';
export default defineConfig({
  snapshotPathTemplate: '{testDir}/visual-baselines/{arg}{ext}',
  updateSnapshots: process.env.XTRIP_VISUAL_CANDIDATES === 'true' ? 'all' : 'none',
  testDir: './e2e',
  projects: [
    {
      name: 'session-real',
      testMatch: '**/session-real.spec.ts',
      use: { trace: 'off', screenshot: 'off', video: 'off' },
    },
    {
      name: 'foundation',
      outputDir: 'test-results/foundation',
      testIgnore: [
        '**/api-client-real.spec.ts',
        '**/session-real.spec.ts',
        '**/quality-visual.spec.ts',
      ],
    },
    { name: 'visual', outputDir: 'test-results/visual', testMatch: '**/quality-visual.spec.ts' },
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
        command: process.argv.includes('--project=session-real')
          ? 'node --env-file=.env.session-test build'
          : 'node test/fixtures/session-api.server.ts',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: false,
        env: { HOST: '127.0.0.1', PORT: '4173' },
      },
});
