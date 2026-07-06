"use client";

import { useState, useEffect, useCallback } from "react";
import type { BannerConfig } from "@/modules/settings/schema";

interface HeroBannerProps {
  banner: BannerConfig;
}

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

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 5500);
    return () => clearInterval(id);
  }, [slides.length, resetKey]);

  if (!enabled || slides.length === 0) return null;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate min-h-[420px] overflow-hidden bg-[var(--color-primary)] text-white sm:min-h-[500px]"
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
          className={`absolute inset-x-0 top-0 grid min-h-[420px] content-center px-4 py-14 transition-opacity duration-500 sm:min-h-[500px] sm:py-18 ${
            i === active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
          }`}
        >
          <div className="mx-auto w-full max-w-6xl">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex rounded-full border border-white/25 bg-white/12 px-3 py-1 text-xs font-semibold uppercase text-white/85 shadow-sm backdrop-blur">
                Rede de profissionais confiaveis
              </p>
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

      {/* Prev / next arrows + dot indicators */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Slide anterior"
            className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-2xl text-white backdrop-blur-sm transition hover:bg-black/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Próximo slide"
            className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-2xl text-white backdrop-blur-sm transition hover:bg-black/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            ›
          </button>
          <div
            role="tablist"
            aria-label="Slides do banner"
            className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2"
          >
            {slides.map((_, i) => (
              <button
                key={i}
                role="tab"
                type="button"
                onClick={() => goTo(i)}
                aria-selected={i === active}
                aria-label={`Slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === active
                    ? "w-6 bg-white"
                    : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
