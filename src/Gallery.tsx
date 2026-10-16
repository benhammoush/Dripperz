/**
 * A synchronized local-artwork carousel with manual keyboard controls and opt-in autoplay.
 * @packageDocumentation
 */

import { useEffect, useRef, useState } from 'react';
import type { GallerySlide } from './showcaseContent';
import { ScrambledSignal } from './ScrambledSignal';

/** Configuration for one independently controlled, nonempty local gallery. */
interface GalleryProps {
  id: string;
  title: string;
  slides: readonly GallerySlide[];
  intervalMs: number;
}

/**
 * Keep one selected slide for artwork and description; never change keyboard focus automatically.
 * @param props - Unique accessible identity, nonempty ordered slides and autoplay interval.
 * @returns The local gallery, manual controls, image fallback and optional slideshow control.
 */
export function Gallery(props: GalleryProps) {
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [failedSrc, setFailedSrc] = useState('');
  const regionRef = useRef<HTMLDivElement>(null);
  const slide = props.slides[index]!;
  const count = props.slides.length;

  useEffect(() => {
    const region = regionRef.current;
    if (!autoplay || !region || !('IntersectionObserver' in window)) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    let hasFocus = region.contains(document.activeElement);
    let timer: ReturnType<typeof setInterval> | undefined;

    /** Recreate at most one timer, only when the gallery is safe to advance. */
    function updateTimer() {
      clearInterval(timer);
      timer = undefined;
      if (
        inView &&
        !document.hidden &&
        !media.matches &&
        !region?.matches(':hover') &&
        !hasFocus
      ) {
        timer = setInterval(
          () => setIndex((current) => (current + 1) % count),
          props.intervalMs,
        );
      }
      if (region) region.dataset.playing = String(timer !== undefined);
    }

    /**
     * Track the next focus owner because activeElement may still be stale during focusout.
     * @param event - Native focus transition within or out of the gallery.
     */
    function updateFocus(event: FocusEvent) {
      hasFocus =
        event.type === 'focusin' ||
        (event.relatedTarget instanceof Node &&
          !!region?.contains(event.relatedTarget));
      updateTimer();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? false;
        region.dataset.visible = String(inView);
        updateTimer();
      },
      { threshold: 0.25 },
    );
    observer.observe(region);
    const events = ['mouseenter', 'mouseleave'] as const;
    for (const event of events) region.addEventListener(event, updateTimer);
    region.addEventListener('focusin', updateFocus);
    region.addEventListener('focusout', updateFocus);
    document.addEventListener('visibilitychange', updateTimer);
    media.addEventListener('change', updateTimer);
    return () => {
      clearInterval(timer);
      region.dataset.playing = 'false';
      region.dataset.visible = 'false';
      observer.disconnect();
      for (const event of events)
        region.removeEventListener(event, updateTimer);
      region.removeEventListener('focusin', updateFocus);
      region.removeEventListener('focusout', updateFocus);
      document.removeEventListener('visibilitychange', updateTimer);
      media.removeEventListener('change', updateTimer);
    };
  }, [autoplay, count, props.intervalMs]);

  /**
   * Navigate with wraparound and stop autoplay after a deliberate visitor selection.
   * @param offset - Signed number of slides to move from the current selection.
   */
  function move(offset: number) {
    setAutoplay(false);
    setIndex((current) => (current + offset + count) % count);
  }

  return (
    <div
      className="gallery"
      data-playing="false"
      data-visible="false"
      ref={regionRef}
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={`${props.id}-heading`}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          move(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}
    >
      <div className="gallery-heading">
        <h3 id={`${props.id}-heading`}>{props.title}</h3>
        <span>
          {index + 1} / {count}
        </span>
      </div>
      <figure aria-live={autoplay ? 'off' : 'polite'} aria-atomic="true">
        <div className="gallery-artwork">
          {failedSrc === slide.src ? (
            <div
              className="artwork-unavailable"
              role="img"
              aria-label={`${slide.alt}. Artwork unavailable.`}
            >
              Artwork unavailable
            </div>
          ) : (
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              width="1000"
              height="1000"
              loading="lazy"
              decoding="async"
              onError={() => setFailedSrc(slide.src)}
            />
          )}
        </div>
        <figcaption>
          <p className="eyebrow">
            {props.id === 'characters'
              ? 'Fictional character archive'
              : 'Original collection artwork'}
          </p>
          <h4>
            {slide.scrambled ? (
              <ScrambledSignal label={slide.title} />
            ) : (
              slide.title
            )}
          </h4>
          <p>
            {slide.scrambled ? (
              <ScrambledSignal label={slide.description} multiline />
            ) : (
              slide.description
            )}
          </p>
        </figcaption>
      </figure>
      <div className="gallery-controls">
        <button type="button" onClick={() => move(-1)}>
          ← Previous
        </button>
        <button type="button" onClick={() => move(1)}>
          Next →
        </button>
        <button
          type="button"
          aria-pressed={autoplay}
          onClick={() => setAutoplay(!autoplay)}
        >
          {autoplay ? 'Pause slideshow' : 'Play slideshow'}
        </button>
      </div>
      <p className="gallery-hint">
        Left / Right to explore · Slideshow pauses on focus, hover and reduced
        motion.
      </p>
    </div>
  );
}
