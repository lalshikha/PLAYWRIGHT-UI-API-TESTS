// utils/asLocatorKey.ts
import { L, type LocatorKey } from '../config/config_locators';

export function asLocatorKey(value: string): LocatorKey {
  const key = value.trim() as LocatorKey;
  if (!(key in L)) {
    throw new Error(`Unknown locator key "${value}". Valid keys: ${Object.keys(L).join(', ')}`);
  }
  return key;
}
