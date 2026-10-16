/**
 * Check visibility subscriptions, static fallback and cleanup independently of rendering engines.
 * @packageDocumentation
 */

import { act, render } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { Atmosphere } from '../../src/Atmosphere';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test('visibility changes pause the decoration and unmount releases its resources', () => {
  let notify: IntersectionObserverCallback | undefined;
  const disconnect = vi.fn();
  const observe = vi.fn();
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn(function (callback: IntersectionObserverCallback) {
      notify = callback;
      return { observe, disconnect };
    }),
  );
  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  const remove = vi.spyOn(document, 'removeEventListener');
  const { container, unmount } = render(<Atmosphere>Test hero</Atmosphere>);
  const region = container.firstElementChild!;
  expect(observe).toHaveBeenCalledWith(region);
  expect(region.getAttribute('data-active')).toBe('false');
  act(() =>
    notify?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ),
  );
  expect(region.getAttribute('data-active')).toBe('true');
  hidden.mockReturnValue(true);
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(region.getAttribute('data-active')).toBe('false');
  hidden.mockReturnValue(false);
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(region.getAttribute('data-active')).toBe('true');
  unmount();
  expect(disconnect).toHaveBeenCalledOnce();
  expect(remove).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  expect(region.getAttribute('data-active')).toBe('false');
});

test('an unavailable observer leaves usable content and static decoration', () => {
  const { container } = render(<Atmosphere>Static hero</Atmosphere>);
  expect(container.textContent).toContain('Static hero');
  expect(container.firstElementChild?.getAttribute('data-active')).toBe(
    'false',
  );
});
