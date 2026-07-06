"use client";

import { useRef, useState } from "react";

interface CarouselPhoto {
  id: string;
  storageKey: string;
  altText: string | null;
}

interface PhotoCarouselProps {
  photos: CarouselPhoto[];
  title: string;
}

const SWIPE_THRESHOLD = 50;

export function PhotoCarousel({ photos, title }: PhotoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) {
      setActiveIndex((i) => (i + 1) % photos.length);
    } else {
      setActiveIndex((i) => (i - 1 + photos.length) % photos.length);
    }
  }

  if (photos.length === 0) {
    return (
      <div
        aria-hidden
        className="grid aspect-[16/9] w-full place-items-center rounded-[calc(var(--radius)+10px)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-primary)_92%,black),color-mix(in_srgb,var(--color-accent)_82%,white))] text-7xl font-bold text-white/92 shadow-[var(--shadow-soft)]"
      >
        {title.charAt(0).toUpperCase()}
      </div>
    );
  }

  const active = photos[Math.min(activeIndex, photos.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <div
        className="overflow-hidden rounded-[calc(var(--radius)+10px)] bg-[color-mix(in_srgb,var(--color-primary)_8%,white)] shadow-[var(--shadow-soft)]"
        onTouchStart={photos.length > 1 ? handleTouchStart : undefined}
        onTouchEnd={photos.length > 1 ? handleTouchEnd : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active.storageKey}
          alt={active.altText ?? title}
          className="aspect-[16/9] w-full object-cover"
        />
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Foto ${index + 1}`}
              aria-current={index === activeIndex}
              className={`shrink-0 overflow-hidden rounded-[var(--radius)] border-2 bg-white transition ${
                index === activeIndex
                  ? "border-[var(--color-primary)] shadow-sm"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.storageKey}
                alt=""
                className="h-16 w-24 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}