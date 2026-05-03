// utils/fallbackTracker.ts
import { test } from '@playwright/test';

export type FallbackRecovery = {
  key: string;
  primary: string;
  recoveredWith: string;
  step?: string;
  at: string;
};

export function recordFallbackRecovery(event: FallbackRecovery): void {
  const info = test.info();
  const list = (info as any).__fallbackRecoveries ?? [];
  list.push(event);
  (info as any).__fallbackRecoveries = list;
}

export async function attachFallbackRecoveries(): Promise<void> {
  const info = test.info();
  const list = (info as any).__fallbackRecoveries ?? [];
  if (!list.length) return;

  await info.attach('fallback-recoveries', {
    body: Buffer.from(JSON.stringify(list, null, 2), 'utf-8'),
    contentType: 'application/json',
  });
}
