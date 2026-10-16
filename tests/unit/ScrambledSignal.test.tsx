/**
 * Verify stable semantics and cleanup for the synthetic character-glitch decoration.
 * @packageDocumentation
 */

import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { ScrambledSignal } from '../../src/ScrambledSignal';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test('decorative visibility changes leave the accessible heading stable and clean up subscriptions', () => {
  let notify: IntersectionObserverCallback | undefined;
  const disconnect = vi.fn();
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn(function (callback: IntersectionObserverCallback) {
      notify = callback;
      return { observe: vi.fn(), disconnect };
    }),
  );
  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  const remove = vi.spyOn(document, 'removeEventListener');
  const { container, unmount } = render(
    <h4>
      <ScrambledSignal label="Glitching signal" />
    </h4>,
  );
  const visual = container.querySelector('.scrambled-signal')!;
  expect(visual.getAttribute('aria-hidden')).toBe('true');
  act(() =>
    notify?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ),
  );
  expect(visual.getAttribute('data-active')).toBe('true');
  hidden.mockReturnValue(true);
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(visual.getAttribute('data-active')).toBe('false');
  expect(
    screen.getByRole('heading', { name: 'Glitching signal' }),
  ).toBeInTheDocument();
  hidden.mockReturnValue(false);
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(visual.getAttribute('data-active')).toBe('true');
  unmount();
  expect(disconnect).toHaveBeenCalledOnce();
  expect(remove).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  expect(visual.getAttribute('data-active')).toBe('false');
});
