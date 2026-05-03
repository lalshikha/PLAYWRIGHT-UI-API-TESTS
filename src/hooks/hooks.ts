import fs from 'fs';
import path from 'path';
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures/Fixtures';
import logger from '../utils/logger';

const { BeforeAll, AfterAll, Before, After, BeforeStep, AfterStep } = createBdd(test);

const HOOKS_ARTIFACTS_DIR = path.resolve(process.cwd(), 'test-results', 'hooks');
const LOG_ALL_BROWSER_CONSOLE = process.env.HOOK_LOG_ALL_CONSOLE === 'true';
const LOG_STEP_HOOKS = process.env.HOOK_LOG_STEPS === 'true';

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function safeFileName(value: string): string {
  return value.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').replace(/\s+/g, '_');
}

BeforeAll(async ({ $workerInfo }) => {
  ensureDir(HOOKS_ARTIFACTS_DIR);
  logger.info(`=== BeforeAll | worker ${$workerInfo.workerIndex} started ===`);
});

AfterAll(async ({ $workerInfo }) => {
  logger.info(`=== AfterAll | worker ${$workerInfo.workerIndex} finished ===`);
});

Before(async ({ page, $testInfo, $tags }) => {
  logger.info(`=== Before Scenario === ${$testInfo.title}`);
  logger.info(`Tags: ${($tags ?? []).join(', ') || 'No tags'}`);

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();

    if (LOG_ALL_BROWSER_CONSOLE) {
      logger.info(`[BrowserConsole][${type}] ${text}`);
      return;
    }

    if (type === 'error') {
      logger.error(`[BrowserConsole][${type}] ${text}`);
      return;
    }

    if (type === 'warning') {
      logger.warn(`[BrowserConsole][${type}] ${text}`);
    }
  });

  page.on('pageerror', error => {
    logger.error(`[PageError] ${error.message}`);
  });
});

After(async ({ page, $testInfo, $tags }) => {
  const failed = $testInfo.status !== $testInfo.expectedStatus;

  logger.info(`=== After Scenario === ${$testInfo.title}`);
  logger.info(`Status: ${$testInfo.status}`);
  logger.info(`Tags: ${($tags ?? []).join(', ') || 'No tags'}`);

  if (!failed) return;

  ensureDir(HOOKS_ARTIFACTS_DIR);

  const fileName = `${safeFileName($testInfo.title)}.png`;
  const screenshotPath = path.join(HOOKS_ARTIFACTS_DIR, fileName);

  try {
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    await $testInfo.attach('failure-screenshot', {
      path: screenshotPath,
      contentType: 'image/png',
    });

    logger.error(`Failure screenshot attached: ${screenshotPath}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to capture failure screenshot: ${message}`);
  }
});

BeforeStep(async ({ $step, $testInfo }) => {
  if (!LOG_STEP_HOOKS) return;
  logger.info(`--- BeforeStep --- ${$step.title} | Scenario: ${$testInfo.title}`);
});

AfterStep(async ({ $step, $testInfo }) => {
  if (!LOG_STEP_HOOKS) return;
  logger.info(`--- AfterStep --- ${$step.title} | Scenario: ${$testInfo.title}`);
});
