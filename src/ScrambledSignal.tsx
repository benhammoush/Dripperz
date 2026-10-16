/**
 * Decorative cycling glyphs with stable accessible text and visibility-aware CSS playback.
 * @packageDocumentation
 */

import { useEffect, useRef } from 'react';

/** Stable meaning and visual size for a synthetic glitch, not withheld information. */
interface ScrambledSignalProps {
  label: string;
  multiline?: boolean;
}

/**
 * Cycle synthetic characters without changing or repeatedly announcing the semantic text.
 * @param props - Accessible label and optional paragraph-sized visual treatment.
 * @returns Stable screen-reader text alongside inaccessible decorative glyphs.
 */
export function ScrambledSignal(props: ScrambledSignalProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const region = ref.current;
    if (!region || !('IntersectionObserver' in window)) return;
    let inView = false;

    /** Keep generated CSS text still outside the viewport or in a hidden tab. */
    function updateVisibility() {
      if (region) region.dataset.active = String(inView && !document.hidden);
    }

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      updateVisibility();
    });
    observer.observe(region);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', updateVisibility);
      region.dataset.active = 'false';
    };
  }, []);

  return (
    <>
      <span className="sr-only">{props.label}</span>
      <span
        ref={ref}
        className={`scrambled-signal${props.multiline ? ' scrambled-signal--multiline' : ''}`}
        data-active="false"
        aria-hidden="true"
      />
    </>
  );
}
