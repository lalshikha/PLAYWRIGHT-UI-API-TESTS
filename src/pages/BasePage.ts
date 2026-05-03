import { Page, Locator, expect } from '@playwright/test';
import logger from '../utils/logger';
import { compareWithBaseline, VisualCompareOptions } from '../utils/visualCompare';
import { L, type LocatorKey, type LocatorDef } from '../config/config_locators';

type PageShotOptions = Parameters<Page['screenshot']>[0];
type LocatorShotOptions = Parameters<Locator['screenshot']>[0];

export default abstract class BasePage {
  protected readonly page: Page;
  protected readonly logger = logger;

  constructor(page: Page) {
    this.page = page;
    this.logger.info(`${this.constructor.name} initialized`);
  }

  // --------------------------
  // Locator helpers
  // --------------------------

  protected byId(id: string): Locator {
    return this.page.locator(`#${id}`);
  }

  protected byDataTest(value: string): Locator {
    return this.page.locator(`[data-test="${value}"]`);
  }

  protected byTitle(title: string | RegExp): Locator {
    return this.page.getByTitle(title);
  }

  protected byText(text: string | RegExp, exact?: boolean): Locator {
    return this.page.getByText(text, exact !== undefined ? { exact } : undefined);
  }

  protected byRole(
    role: Parameters<Page['getByRole']>[0],
    name?: string | RegExp
  ): Locator {
    return this.page.getByRole(role, name ? { name } : undefined);
  }

  protected resolveRawLocator(raw: string): Locator {
    if (raw.startsWith('css:')) {
      return this.page.locator(raw.replace(/^css:/, ''));
    }

    if (raw.startsWith('id:')) {
      return this.byId(raw.replace(/^id:/, ''));
    }

    if (raw.startsWith('title:')) {
      return this.byTitle(raw.replace(/^title:/, ''));
    }

    if (raw.startsWith('text:')) {
      return this.byText(raw.replace(/^text:/, ''), true);
    }

    if (raw.startsWith('role:')) {
      const value = raw.replace(/^role:/, '');
      const [rolePart, ...nameParts] = value.split('|');
      const role = rolePart?.trim() as Parameters<Page['getByRole']>[0];
      const name = nameParts.join('|').trim();

      if (!role) {
        throw new Error(`Invalid role locator: ${raw}`);
      }

      return this.byRole(role, name || undefined);
    }

    return this.byDataTest(raw);
  }

  protected getLocatorCandidates(key: LocatorKey): string[] {
    const def: LocatorDef = L[key];

    if (typeof def === 'string') {
      return [def];
    }

    return [def.primary, ...(def.fallbacks ?? [])];
  }

  /** Returns the primary locator only. */
  protected getByKey(key: LocatorKey): Locator {
    const [primary] = this.getLocatorCandidates(key);
    return this.resolveRawLocator(primary);
  }

  /**
   * Use in steps when you want a Locator without exposing selectors.
   * For keys with fallbacks, this returns the primary locator only.
   */
  public $(key: LocatorKey): Locator {
    return this.getByKey(key);
  }

  protected async getWorkingLocatorByKey(
    key: LocatorKey,
    timeoutPerLocator = 800
  ): Promise<Locator> {
    const candidates = this.getLocatorCandidates(key);
    const errors: string[] = [];

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const locator = this.resolveRawLocator(candidate);

      try {
        await locator.waitFor({ state: 'visible', timeout: timeoutPerLocator });

        if (i > 0) {
          this.logger.warn(
            `Fallback locator used for key "${String(key)}": "${candidate}"`
          );
        }

        return locator;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`${candidate} => ${message}`);
      }
    }

    throw new Error(
      `No locator matched for key "${String(key)}". Tried: ${errors.join(' | ')}`
    );
  }

  // --------------------------
  // Input helpers
  // --------------------------

  protected async inputInElementById(id: string, input: string, message?: string): Promise<void> {
    await this.byId(id).fill(input);
  }

  protected async inputInElementByDT(value: string, input: string, message?: string): Promise<void> {
    await this.byDataTest(value).fill(input);
  }

  public async inputInElementByKey(key: LocatorKey, input: string, message?: string): Promise<void> {
    const locator = await this.getWorkingLocatorByKey(key);
    await expect(locator, message).toBeVisible();
    await locator.fill(input);
  }

  // --------------------------
  // Click helpers
  // --------------------------

  protected async clickElementById(id: string, message?: string): Promise<void> {
    await this.byId(id).click();
  }

  protected async clickElementByDT(value: string, message?: string): Promise<void> {
    await this.byDataTest(value).click();
  }

  protected async clickElementByRole(
    role: Parameters<Page['getByRole']>[0],
    name?: string | RegExp,
    message?: string
  ): Promise<void> {
    const locator = this.byRole(role, name);
    await expect(locator, message).toBeVisible();
    await locator.click();
  }

  public async clickByKey(key: LocatorKey, message?: string): Promise<void> {
    const locator = await this.getWorkingLocatorByKey(key);
    await expect(locator, message).toBeVisible();
    await locator.click();
  }

  // --------------------------
  // Visibility asserts
  // --------------------------

  protected async assertElementByIdIsVisible(id: string, message?: string): Promise<void> {
    await expect(this.byId(id), message).toBeVisible();
  }

  protected async assertElementByDTIsVisible(value: string, message?: string): Promise<void> {
    await expect(this.byDataTest(value), message).toBeVisible();
  }

  protected async assertElementByRoleIsVisible(
    role: Parameters<Page['getByRole']>[0],
    name?: string | RegExp,
    message?: string
  ): Promise<void> {
    await expect(this.byRole(role, name), message).toBeVisible();
  }

  public async assertElementByTextIsVisible(
    text: string | RegExp,
    exact?: boolean,
    message?: string
  ): Promise<void> {
    await expect(this.byText(text, exact), message).toBeVisible();
  }

  public async assertElementByTextIsNotVisible(
    text: string | RegExp,
    exact?: boolean,
    message?: string
  ): Promise<void> {
    await expect(this.byText(text, exact), message).not.toBeVisible();
  }

  public async assertVisibleByKey(key: LocatorKey, message?: string): Promise<void> {
    const locator = await this.getWorkingLocatorByKey(key);
    await expect(locator, message).toBeVisible();
  }

  // --------------------------
  // Text asserts
  // --------------------------

  protected async assertTextMatchById(
    id: string,
    matchWith: string | RegExp,
    message?: string
  ): Promise<void> {
    await expect(this.byId(id), message).toContainText(matchWith);
  }

  protected async assertTextMatchByDT(
    key: string,
    expectedText: string | RegExp,
    message?: string
  ): Promise<void> {
    await expect(this.byDataTest(key), message).toContainText(expectedText);
  }

  protected async assertTextMatchByRole(
    role: Parameters<Page['getByRole']>[0],
    name: string | RegExp,
    expectedText: string | RegExp,
    message?: string
  ): Promise<void> {
    await expect(this.byRole(role, name), message).toContainText(expectedText);
  }

  public async assertContainsTextByKey(
    key: LocatorKey,
    expectedText: string | RegExp,
    message?: string
  ): Promise<void> {
    const locator = await this.getWorkingLocatorByKey(key);
    await expect(locator, message).toContainText(expectedText);
  }

  public async assertClickableLinkByKey(locatorKey: LocatorKey, message?: string): Promise<void> {
    const locator = await this.getWorkingLocatorByKey(locatorKey);

  await locator.scrollIntoViewIfNeeded();

  await expect(
    locator,
    message ?? `Expected "${String(locatorKey)}" to be visible`
  ).toBeVisible();

  await expect(
    locator,
    message ?? `Expected "${String(locatorKey)}" to be enabled`
  ).toBeEnabled();

  await expect(
    locator,
    message ?? `Expected "${String(locatorKey)}" to be an anchor link`
  ).toHaveJSProperty('tagName', 'A');

  await expect(
    locator,
    message ?? `Expected "${String(locatorKey)}" to have href`
  ).toHaveAttribute('href', /.+/);
}

  public async assertNotContainsTextByKey(
    key: LocatorKey,
    unexpectedText: string | RegExp,
    message?: string
  ): Promise<void> {
    const locator = await this.getWorkingLocatorByKey(key);
    await expect(locator, message).not.toContainText(unexpectedText);
  }

  public async assertClickableByKey(locatorKey: LocatorKey, message?: string): Promise<void> {
    const locator = await this.getWorkingLocatorByKey(locatorKey);
    await expect(
      locator,
      message ?? `Expected "${String(locatorKey)}" to be clickable`
    ).toBeEnabled();
  }

  public async assertNotClickableByKey(locatorKey: LocatorKey, message?: string): Promise<void> {
    const locator = await this.getWorkingLocatorByKey(locatorKey);
    // Check that element is NOT a button or link (common interactive elements)
    const tagName = await locator.evaluate((el) => el.tagName);
    const isInteractive = ['BUTTON', 'A', 'INPUT'].includes(tagName);
    
    await expect(
      isInteractive,
      message ?? `Expected "${String(locatorKey)}" to not be clickable (should not be a button, link, or input)`
    ).toBeFalsy();
  }

  // --------------------------
  // Visual compare
  // --------------------------

  protected visualDefaults(): VisualCompareOptions {
    return {
      threshold: 0.1,
      maxDiffPixels: -1,
      maxDiffPixelRatio: 0.001,
      maxSizeDiffPixels: 0,
      includeAA: false,
      alpha: 0.1,
    };
  }

  async assertPageScreenshot(
    snapshotFileName: string,
    visualOpts?: VisualCompareOptions,
    shotOpts?: PageShotOptions
  ): Promise<void> {
    const options: VisualCompareOptions = {
      ...this.visualDefaults(),
      ...(visualOpts ?? {}),
      maxDiffPixels: -1,
    };

    const screenshotOptions: PageShotOptions = {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      ...shotOpts,
    };

    const buffer = await this.page.screenshot(screenshotOptions);
    await compareWithBaseline({ screenshotBuffer: buffer, snapshotFileName, options });
  }

  async assertElementScreenshot(
    element: Locator,
    snapshotFileName: string,
    visualOpts?: VisualCompareOptions,
    shotOpts?: LocatorShotOptions
  ): Promise<void> {
    const options: VisualCompareOptions = {
      ...this.visualDefaults(),
      ...(visualOpts ?? {}),
      maxDiffPixels: -1,
    };

    await element.waitFor({ state: 'visible' });

    const screenshotOptions: LocatorShotOptions = {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      ...shotOpts,
    };

    const buffer = await element.screenshot(screenshotOptions);
    await compareWithBaseline({ screenshotBuffer: buffer, snapshotFileName, options });
  }
}
