"use client";

import { useState, useEffect, useCallback } from "react";
import type { BannerConfig } from "@/modules/settings/schema";

interface HeroBannerProps {
  banner: BannerConfig;
}

const AUTOPLAY_INTERVAL_MS = 5500;

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={direction === "left" ? "M12.5 4.5 7 10l5.5 5.5" : "M7.5 4.5 13 10l-5.5 5.5"} />
    </svg>
  );
}

const controlButtonClass =
  "grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 focus-visible:outline-2 focus-visible:outline-white";

export function HeroBanner({ banner }: HeroBannerProps) {
  const { enabled, slides } = banner;
  const [active, setActive] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const goTo = useCallback((index: number) => {
    setActive(index);
    setResetKey((k) => k + 1);
  }, []);

  const next = useCallback(() => {
    setActive((i) => (i + 1) % slides.length);
    setResetKey((k) => k + 1);
  }, [slides.length]);

  const prev = useCallback(() => {
    setActive((i) => (i - 1 + slides.length) % slides.length);
    setResetKey((k) => k + 1);
  }, [slides.length]);

  // Autoplay stops while the visitor is reading (pointer over the banner or
  // keyboard focus inside it) and never starts for reduced-motion users.
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || isPaused || prefersReducedMotion) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [slides.length, resetKey, isPaused, prefersReducedMotion]);

  if (!enabled || slides.length === 0) return null;

  return (
    <section
      aria-labelledby="hero-heading"
      aria-roledescription="carrossel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsPaused(false);
      }}
      className="relative isolate min-h-[480px] overflow-hidden bg-[var(--color-primary)] text-white sm:min-h-[540px]"
    >
      {/* Per-slide background images */}
      {slides.map((s, i) =>
        s.imageKey ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={s.imageKey}
            alt=""
            aria-hidden
            className={`absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-700 ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : null
      )}

      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,color-mix(in_srgb,var(--color-primary)_80%,transparent)_0%,color-mix(in_srgb,var(--color-primary)_55%,transparent)_54%,color-mix(in_srgb,var(--color-accent)_40%,transparent)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,.30),rgba(0,0,0,.08)_46%,rgba(0,0,0,.28))]"
      />

      {/* Slide content layers */}
      {slides.map((slide, i) => (
        <div
          key={i}
          aria-hidden={i !== active}
          className={`absolute inset-x-0 top-0 grid min-h-[480px] content-center px-4 pb-20 pt-12 transition-opacity duration-500 sm:min-h-[540px] sm:pb-24 sm:pt-16 ${
            i === active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
          }`}
        >
          <div className="mx-auto w-full max-w-6xl">
            <div className="max-w-3xl">
              <h1
                {...(i === 0 ? { id: "hero-heading" } : {})}
                className="text-balance text-4xl font-bold leading-[1.04] tracking-tight sm:text-6xl"
              >
                {slide.headline}
              </h1>
              {slide.subheadline && (
                <p className="mt-5 max-w-2xl text-pretty text-base leading-8 text-white/86 sm:text-lg">
                  {slide.subheadline}
                </p>
              )}
              {slide.ctaText && (
                <a
                  href={slide.ctaUrl || "#listagens"}
                  tabIndex={i === active ? undefined : -1}
                  className="mt-8 inline-flex items-center justify-center rounded-[var(--radius)] bg-white px-6 py-3 text-sm font-bold text-[var(--color-primary)] shadow-[0_18px_40px_rgba(0,0,0,.22)] transition hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,white_88%,var(--color-accent))]"
                >
                  {slide.ctaText}
                </a>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Controls sit in one row under the copy, aligned with it, so they never
          cover the headline on narrow screens. */}
      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-5 z-20 px-4 sm:bottom-7">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <button type="button" onClick={prev} aria-label="Slide anterior" className={controlButtonClass}>
              <ChevronIcon direction="left" />
            </button>
            <div className="flex items-center gap-1" aria-label="Escolher slide" role="group">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === active ? "true" : undefined}
                  aria-label={`Slide ${i + 1} de ${slides.length}`}
                  className="group grid h-6 place-items-center px-1"
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-300 ${
                      i === active ? "w-6 bg-white" : "w-2 bg-white/45 group-hover:bg-white/75"
                    }`}
                  />
                </button>
              ))}
            </div>
            <button type="button" onClick={next} aria-label="Próximo slide" className={controlButtonClass}>
              <ChevronIcon direction="right" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
