// step-definitions/ui/registerSteps.ts
import { When } from '../../fixtures/Fixtures';
import { DataUtils } from '../../utils/dataUtils';

When('user enters random registration data', async ({ page }) => {
  const email = DataUtils.email();
  const pwd = DataUtils.randomAlphaNum(12);

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(pwd);
});
