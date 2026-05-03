// src/step-definitions/ui/flakyDemoSteps.ts
import { When, Then } from '../../fixtures/Fixtures';
import { asLocatorKey } from '../../utils/asLocatorKey';

function parseKeys(csv: string) {
  return csv.split(',').map(k => asLocatorKey(k.trim()));
}