/**
 * Smoke-test the production bundle at desktop and mobile viewport sizes.
 * @packageDocumentation
 */

import { expect, test } from '@playwright/test';
import { APP_VERSION } from '../../src/appVersion';

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
]) {
  test(`foundation at ${viewport.width}px`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page).toHaveTitle('Dripperz — Source foundation');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Dripperz' }),
    ).toBeVisible();
    await expect(page.getByTestId('app-version')).toHaveText(APP_VERSION);
    expect(pageErrors).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
