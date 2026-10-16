/**
 * Verify disclosure navigation, motion controls and local-only shell resources.
 * @packageDocumentation
 */

import { expect, test } from '@playwright/test';
import { SECTIONS } from '../../src/sections';

test('mobile disclosure supports keyboard navigation and escape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  const menu = page.getByRole('button', { name: /menu/i });
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('navigation').getByRole('link').first(),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('navigation').getByRole('link').first(),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#collection$/);
  await expect(page.locator('#collection')).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  for (const section of SECTIONS) {
    await menu.click();
    await page
      .getByRole('navigation')
      .getByRole('link', { name: section.label, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`#${section.id}$`));
    await expect(page.locator(`#${section.id}`)).toBeInViewport();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
  }
});

test('effects can pause and stop offscreen; reduced motion removes animations', async ({
  page,
}) => {
  await page.goto('/');
  const marquee = page.locator('.marquee-track');
  await expect(marquee).toHaveCSS('animation-play-state', 'running');
  await page.getByRole('button', { name: 'Pause effects' }).click();
  await expect(marquee).toHaveCSS('animation-play-state', 'paused');
  await page.getByRole('button', { name: 'Resume effects' }).click();
  await expect(marquee).toHaveCSS('animation-play-state', 'running');
  await page.locator('#faq').scrollIntoViewIfNeeded();
  await expect(page.locator('.atmosphere')).toHaveAttribute(
    'data-active',
    'false',
  );
  await expect(marquee).toHaveCSS('animation-play-state', 'paused');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(marquee).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.glitch')).toHaveCSS('animation-name', 'none');
});

test('shell assets load locally without remote integrations', async ({
  page,
  baseURL,
}) => {
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== new URL(baseURL!).origin)
      externalRequests.push(request.url());
  });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  expect(await page.evaluate(() => document.fonts.check('16px Goldman'))).toBe(
    true,
  );
  expect(
    await page
      .locator('.brand img')
      .evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
      ),
  ).toBe(true);
  await page.getByRole('link', { name: /Explore the club/ }).click();
  expect(externalRequests).toEqual([]);
});
