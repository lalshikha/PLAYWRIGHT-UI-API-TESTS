// step-definitions/common/visualValidationSteps.ts  (use your actual filename)
import { Then } from '../../fixtures/Fixtures';
import { saucedemoUrl } from '../../utils/testData';
import { asLocatorKey } from '../../utils/asLocatorKey';

Then(
  'visual validation passes for {string} element',
  async ({ commonPage }, locatorKey: string) => {
    await commonPage.assertVisualElement(locatorKey);
  }
);

Then(
  'visual validation passes for {string} page',
  async ({ commonPage }, pageName: string) => {
    await commonPage.assertVisualPage(pageName);
  }
);
