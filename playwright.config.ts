import * as dotenv from 'dotenv';
import path from 'path';
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const ENV = process.env.ENV ?? 'dev';
const envFile = path.resolve(process.cwd(), 'env', `${ENV}.env`);
dotenv.config({ path: envFile });
console.log(`Loaded environment variables from ${envFile}`);

const RETRIES = Number(process.env.PW_RETRIES ?? (process.env.CI ? 1 : 0));

const testDir = defineBddConfig({
  features: ['src/features/**/*.feature'],
  steps: [
    'src/fixtures/Fixtures.ts',
    'src/step-definitions/**/*.{ts,js}',
    'src/hooks/**/*.{ts,js}',
  ],
  outputDir: '.features-gen',
  missingSteps: 'fail-on-gen',
});

export default defineConfig({
  testDir,
  timeout: 30 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: RETRIES,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'reports/junit-results.xml' }],
    ['./src/reporters/flaky-reporter.ts'],
  ],
  use: {
    baseURL: process.env.APP_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15 * 1000,
    navigationTimeout: 15 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
