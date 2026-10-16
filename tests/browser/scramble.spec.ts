/**
 * Verify decorative scrambling without repeated accessible text or unsupported redaction claims.
 * @packageDocumentation
 */

import { expect, test } from '@playwright/test';

test('glitch characters cycle, pause offscreen and honor manual pause and reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const gallery = page.getByRole('region', { name: 'Meet the characters' });
  await gallery.getByRole('button', { name: /Next/ }).click();
  await expect(
    gallery.getByRole('heading', { name: 'Glitching signal', exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/were redacted in the original/)).toHaveCount(0);
  const decoration = gallery.locator('h4 .scrambled-signal');
  await decoration.scrollIntoViewIfNeeded();
  await expect(decoration).toHaveAttribute('aria-hidden', 'true');
  await expect(decoration).toHaveAttribute('data-active', 'true');
  expect(
    await decoration.evaluate(
      (element) => getComputedStyle(element, '::after').animationPlayState,
    ),
  ).toBe('running');
  const first = await decoration.evaluate(
    (element) => getComputedStyle(element, '::after').content,
  );
  await expect
    .poll(() =>
      decoration.evaluate(
        (element) => getComputedStyle(element, '::after').content,
      ),
    )
    .not.toBe(first);
  await expect(
    gallery.getByRole('heading', { name: 'Glitching signal', exact: true }),
  ).toBeVisible();
  await page.locator('#faq').scrollIntoViewIfNeeded();
  await expect(decoration).toHaveAttribute('data-active', 'false');
  expect(
    await decoration.evaluate(
      (element) => getComputedStyle(element, '::after').animationPlayState,
    ),
  ).toBe('paused');
  await page.getByRole('button', { name: 'Pause effects' }).click();
  await decoration.scrollIntoViewIfNeeded();
  await expect(decoration).toHaveAttribute('data-active', 'true');
  expect(
    await decoration.evaluate(
      (element) => getComputedStyle(element, '::after').animationPlayState,
    ),
  ).toBe('paused');
  await page.getByRole('button', { name: 'Resume effects' }).click();
  await decoration.scrollIntoViewIfNeeded();
  await expect(decoration).toHaveAttribute('data-active', 'true');
  expect(
    await decoration.evaluate(
      (element) => getComputedStyle(element, '::after').animationPlayState,
    ),
  ).toBe('running');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await decoration.evaluate(
      (element) => getComputedStyle(element, '::after').animationName,
    ),
  ).toBe('none');
  await expect(
    gallery.getByRole('heading', { name: 'Glitching signal', exact: true }),
  ).toBeVisible();
  const body = gallery.locator('p .scrambled-signal');
  await expect(body).toHaveAttribute('aria-hidden', 'true');
  for (const selector of ['h4 .scrambled-signal', 'p .scrambled-signal']) {
    expect(
      await gallery.locator(selector).evaluate((element) => {
        const style = getComputedStyle(element, '::after');
        const parent = getComputedStyle(element.parentElement!);
        return [
          'font-family',
          'font-size',
          'font-weight',
          'font-style',
          'letter-spacing',
          'line-height',
          'color',
        ].every(
          (property) =>
            style.getPropertyValue(property) ===
            parent.getPropertyValue(property),
        );
      }),
    ).toBe(true);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
