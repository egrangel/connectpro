"use client";

import { useState, useEffect, useCallback } from "react";
import type { BannerConfig } from "@/modules/settings/schema";

interface HeroBannerProps {
  banner: BannerConfig;
}

export function HeroBanner({ banner }: HeroBannerProps) {
  const { enabled, slides } = banner;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const step = useCallback((direction: number) => {
    setActive((index) => (index + direction + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!enabled || slides.length < 2 || paused || hovered || focused) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      if (!motion.matches && !document.hidden) step(1);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [enabled, slides.length, paused, hovered, focused, step]);

  if (!enabled || slides.length === 0) return null;
  const index = active % slides.length;
  const slide = slides[index];

  return (
    <section
      aria-label="Destaques da rede"
      aria-roledescription="carrossel"
      className="directory-hero"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div className="directory-hero-copy">
        <h1 className="display-title">{slide.headline}</h1>
        {slide.subheadline && <p>{slide.subheadline}</p>}
        {slide.ctaText && (
          <a className="site-button" href={slide.ctaUrl || "#listagens"}>{slide.ctaText}</a>
        )}
        {slides.length > 1 && (
          <div className="hero-controls" role="group" aria-label="Controles do carrossel">
            <button type="button" onClick={() => step(-1)} aria-label="Destaque anterior">
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12 5-5 5 5 5" /></svg>
            </button>
            <span>{index + 1} / {slides.length}</span>
            <button type="button" onClick={() => step(1)} aria-label="Próximo destaque">
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m8 5 5 5-5 5" /></svg>
            </button>
            <button type="button" className="hero-pause" onClick={() => setPaused(!paused)}>
              {paused ? "Retomar" : "Pausar"}
            </button>
          </div>
        )}
      </div>
      {slide.imageKey && (
        <div className="directory-hero-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slide.imageKey} alt="" fetchPriority="high" />
        </div>
      )}
    </section>
  );
}
