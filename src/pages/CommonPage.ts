import { Locator } from '@playwright/test';
import BasePage from './BasePage';
import { asLocatorKey } from '../utils/asLocatorKey';

function ensurePng(name: string): string {
  return name.toLowerCase().endsWith('.png') ? name : `${name}.png`;
}

export default class CommonPage extends BasePage {
  async assertVisualPage(pageName: string): Promise<void> {
    const key = pageName.trim().toLowerCase();
    const snapshot = ensurePng(`pageUnderTest_${key}`);
    await this.assertPageScreenshot(snapshot);
  }

  async assertVisualElement(locatorKeyText: string): Promise<void> {
    const locatorKey = asLocatorKey(locatorKeyText);
    const snapshot = ensurePng(`elementUnderTest_${String(locatorKey).toLowerCase()}`);
    const locator: Locator = await this.getWorkingLocatorByKey(locatorKey);

    await this.assertElementScreenshot(locator, snapshot);
  }
}
