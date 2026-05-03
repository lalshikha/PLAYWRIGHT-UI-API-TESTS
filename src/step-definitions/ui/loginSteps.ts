// step-definitions/ui/loginSteps.ts
import { When, Then } from '../../fixtures/Fixtures';
import { saucedemoUrl } from '../../utils/testData';
import { asLocatorKey } from '../../utils/asLocatorKey';

When('user performs UI login with {string} and {string}', async ({ loginPage, td }, username: string, password: string) => {
  await loginPage.attemptLogin(td(username), td(password));
});