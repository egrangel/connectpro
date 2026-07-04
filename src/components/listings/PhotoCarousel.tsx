"use client";

import { useState } from "react";

interface CarouselPhoto {
  id: string;
  storageKey: string;
  altText: string | null;
}

interface PhotoCarouselProps {
  photos: CarouselPhoto[];
  title: string;
}

export function PhotoCarousel({ photos, title }: PhotoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div
        aria-hidden
        className="grid aspect-[16/9] w-full place-items-center rounded-[var(--radius)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-6xl font-bold text-white/90"
      >
        {title.charAt(0).toUpperCase()}
      </div>
    );
  }

  const active = photos[Math.min(activeIndex, photos.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-[var(--radius)] bg-black/5">
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
              className={`shrink-0 overflow-hidden rounded-[var(--radius)] border-2 transition ${
                index === activeIndex
                  ? "border-[var(--color-primary)]"
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
