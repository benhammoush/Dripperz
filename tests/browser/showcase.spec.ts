/**
 * Exercise responsive artwork synchronization, safe autoplay and the approved historical content.
 * @packageDocumentation
 */

import { expect, test } from '@playwright/test';
import {
  CHARACTER_SLIDES,
  PUBLIC_LINKS,
  SHOWCASE_FAQ,
} from '../../src/showcaseContent';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
]) {
  test(`core showcase interaction at ${viewport.width}px`, async ({
    page,
    baseURL,
  }) => {
    const externalRequests: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).origin !== new URL(baseURL!).origin)
        externalRequests.push(request.url());
    });
    await page.setViewportSize(viewport);
    await page.goto('/');
    const portraits = page.getByRole('region', {
      name: 'Collection portraits',
    });
    await portraits.scrollIntoViewIfNeeded();
    for (let index = 0; index < 5; index += 1) {
      await expect(portraits.getByRole('img')).toBeVisible();
      await expect
        .poll(() =>
          portraits
            .getByRole('img')
            .evaluate(
              (image: HTMLImageElement) =>
                image.complete && image.naturalWidth === 1000,
            ),
        )
        .toBe(true);
      await portraits.getByRole('button', { name: /Next/ }).click();
    }
    const characters = page.getByRole('region', {
      name: 'Meet the characters',
    });
    await characters.scrollIntoViewIfNeeded();
    await characters.focus();
    for (const slide of CHARACTER_SLIDES) {
      await expect(
        characters.getByRole('heading', { name: slide.title, exact: true }),
      ).toBeVisible();
      await expect(characters.getByRole('img')).toHaveAttribute(
        'src',
        slide.src,
      );
      await expect(characters.getByRole('img')).toBeVisible();
      await expect
        .poll(() =>
          characters
            .getByRole('img')
            .evaluate(
              (image: HTMLImageElement) =>
                image.complete && image.naturalWidth === 1000,
            ),
        )
        .toBe(true);
      await expect(
        characters.getByText(slide.description, { exact: true }),
      ).toBeVisible();
      await page.keyboard.press('ArrowRight');
    }
    await expect(
      characters.getByRole('heading', { name: 'DRIP-X', exact: true }),
    ).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await expect(
      characters.getByRole('heading', { name: 'L1L-X', exact: true }),
    ).toBeVisible();
    const cybermap = page.locator('#cybermap');
    await expect(cybermap.getByRole('listitem')).toHaveCount(7);
    await expect(cybermap.getByText(/Archived roadmap/)).toBeVisible();
    for (const item of SHOWCASE_FAQ) {
      const question = page.getByText(item.question, { exact: true });
      await question.scrollIntoViewIfNeeded();
      await question.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByText(item.answer, { exact: true })).toBeVisible();
    }
    await expect(
      page.getByRole('link', { name: /Dripperz on X/ }),
    ).toHaveAttribute('href', PUBLIC_LINKS[0].href);
    await expect(page.locator('a[href^="https://"]')).toHaveCount(1);
    await expect(page.getByText(/Guillaume|AMMOUCHE/)).toHaveCount(0);
    expect(externalRequests).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test('optional autoplay pauses for hover, focus, reduced motion and offscreen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.clock.install();
  await page.goto('/');
  const gallery = page.getByRole('region', { name: 'Collection portraits' });
  const title = gallery.locator('h4');
  await gallery.scrollIntoViewIfNeeded();
  await gallery.getByRole('button', { name: 'Play slideshow' }).click();
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await page.clock.runFor(5200);
  await expect(title).toHaveText('Collection study 02');
  await gallery.hover();
  await page.clock.runFor(6000);
  await expect(title).toHaveText('Collection study 02');
  await page.mouse.move(0, 0);
  await gallery.focus();
  await page.clock.runFor(6000);
  await expect(title).toHaveText('Collection study 02');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Media emulation reaches WebKit asynchronously; observe it before ticking timers.
  await expect
    .poll(() =>
      page.evaluate(
        () => matchMedia('(prefers-reduced-motion: reduce)').matches,
      ),
    )
    .toBe(true);
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await expect(gallery).toHaveAttribute('data-playing', 'false');
  await page.clock.runFor(6000);
  await expect(title).toHaveText('Collection study 02');
  await page.locator('#faq').scrollIntoViewIfNeeded();
  // IntersectionObserver updates asynchronously, outside the mocked clock.
  await expect(gallery).toHaveAttribute('data-visible', 'false');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(gallery).toHaveAttribute('data-playing', 'false');
  await page.clock.runFor(6000);
  await expect(title).toHaveText('Collection study 02');
  await gallery.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(gallery).toHaveAttribute('data-playing', 'true');
  await page.clock.runFor(5200);
  await expect(title).toHaveText('The Creator');
  await gallery.getByRole('button', { name: /Next/ }).click();
  await expect(
    gallery.getByRole('button', { name: 'Play slideshow' }),
  ).toHaveAttribute('aria-pressed', 'false');
});

test('failed artwork does not block captions, controls or FAQ', async ({
  page,
}) => {
  await page.route('**/artwork/showcase-01.jpg', (route) => route.abort());
  await page.goto('/');
  const gallery = page.getByRole('region', { name: 'Collection portraits' });
  await gallery.scrollIntoViewIfNeeded();
  await expect(
    gallery.getByRole('img', { name: /Artwork unavailable/ }),
  ).toBeVisible();
  await gallery.getByRole('button', { name: /Next/ }).click();
  await expect(gallery.locator('h4')).toHaveText('Collection study 02');
  await expect(page.locator('#faq')).toBeVisible();
});
