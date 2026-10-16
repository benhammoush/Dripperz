/**
 * Smoke-test the production bundle at desktop and mobile viewport sizes.
 * @packageDocumentation
 */

import { expect, test } from '@playwright/test';
import { APP_VERSION } from '../../src/appVersion';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
]) {
  test(`foundation at ${viewport.width}px`, async ({ page }, testInfo) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page).toHaveTitle('Dripperz — Phase 3 showcase');
    await expect(
      page.getByRole('heading', { level: 1, name: /Dripperz.*ENTER THE/ }),
    ).toBeVisible();
    await expect(page.getByTestId('app-version')).toHaveText(APP_VERSION);
    expect(pageErrors).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath('visual-shell.png'),
      animations: 'disabled',
      fullPage: true,
    });
  });
}
