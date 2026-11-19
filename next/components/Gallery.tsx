"use client";

import { useRef, useState } from "react";

const PHOTOS = [
  { src: "/images/side.svg", alt: "Nike Pegasus 43, side profile" },
  { src: "/images/sole.svg", alt: "Nike Pegasus 43, outsole view" },
  { src: "/images/back.svg", alt: "Nike Pegasus 43, heel view" },
  { src: "/images/top.svg", alt: "Nike Pegasus 43, top view" },
  { src: "/images/on-foot.svg", alt: "Nike Pegasus 43 worn on foot" },
];

export default function Gallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Active photo = scroll position divided by one slide width, rounded.
  function onScroll() {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i >= 0 && i < PHOTOS.length) setActive(i);
  }

  return (
    <section className="gallery" aria-roledescription="carousel" aria-label="Product photos">
      <div className="gallery__track" ref={trackRef} onScroll={onScroll} tabIndex={0}>
        {PHOTOS.map((p, i) => (
          // Plain <img>: placeholders are SVG; width/height + the 4/5 box reserve space.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={p.src}
            className="gallery__slide"
            // The first photo is the expected largest-content element for the speed check
            data-testid={i === 0 ? "main-photo" : undefined}
            src={p.src}
            alt={p.alt}
            width={800}
            height={1000}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : undefined}
          />
        ))}
      </div>
      {/* Overlaid inside the photo, so the dots add no height */}
      <div className="gallery__dots" aria-hidden="true">
        {PHOTOS.map((p, i) => (
          <span key={p.src} className="dot" aria-current={i === active} />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        Photo {active + 1} of {PHOTOS.length}
      </p>
    </section>
  );
}
