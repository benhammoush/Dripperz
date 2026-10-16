/**
 * Decorative CSS effects with visibility-aware lifecycle control and static fallback.
 * @packageDocumentation
 */

import { useEffect, useRef, type ReactNode } from 'react';

/** Properties for the single decorative region; its content remains semantic HTML. */
interface AtmosphereProps {
  children: ReactNode;
}

/**
 * Suspend the hero's effects while hidden or offscreen; CSS separately honors reduced motion.
 * @param props - Semantic hero content, rendered above an inaccessible decorative layer.
 * @returns A static-by-default region that animates only after visibility is established.
 */
export function Atmosphere(props: AtmosphereProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const region = ref.current;
    if (!region || !('IntersectionObserver' in window)) return;
    let inView = false;

    /** Combine viewport and tab visibility without polling or scroll listeners. */
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
    <div className="atmosphere" ref={ref} data-active="false">
      <div className="matrix" aria-hidden="true">
        {Array.from({ length: 16 }, (_, index) => (
          <span
            key={index}
            style={{ '--column': index } as React.CSSProperties}
          >
            01
            <br />
            DCC
            <br />
            10
            <br />
            001
            <br />
            CYB
            <br />
            01
            <br />
            110
            <br />
            DCC
          </span>
        ))}
      </div>
      {props.children}
    </div>
  );
}
