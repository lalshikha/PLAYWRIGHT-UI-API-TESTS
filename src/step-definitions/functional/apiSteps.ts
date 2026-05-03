// step-definitions/functional/apiSteps.ts
import { Given } from '../../fixtures/Fixtures';

Given('API service validates {word} login', async ({ apiService }, userType: string) => {
  await apiService.validateSiteIsReachable();
});