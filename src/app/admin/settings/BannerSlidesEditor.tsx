"use client";

import { useState } from "react";
import type { SlideConfig } from "@/modules/settings/schema";

interface BannerSlidesEditorProps {
  initialSlides: SlideConfig[];
}

const inputClass =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

const emptySlide: SlideConfig = {
  imageKey: null,
  headline: "",
  subheadline: "",
  ctaText: "",
  ctaUrl: "",
};

export function BannerSlidesEditor({ initialSlides }: BannerSlidesEditorProps) {
  const [slides, setSlides] = useState<SlideConfig[]>(
    initialSlides.length > 0 ? initialSlides : [{ ...emptySlide }],
  );

  function addSlide() {
    if (slides.length >= 5) return;
    setSlides((prev) => [...prev, { ...emptySlide }]);
  }

  function removeSlide(index: number) {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name="slideCount" value={slides.length} />

      {slides.map((slide, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Slide {i + 1}</span>
            {slides.length > 1 && (
              <button
                type="button"
                onClick={() => removeSlide(i)}
                className="rounded px-2 py-0.5 text-xs font-medium text-red-500 transition hover:bg-red-50 hover:text-red-700"
              >
                Remover
              </button>
            )}
          </div>

          <input
            type="hidden"
            name={`slide_${i}_imageKey`}
            value={slide.imageKey ?? ""}
          />

          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Título
              <input
                type="text"
                name={`slide_${i}_headline`}
                maxLength={120}
                defaultValue={slide.headline}
                required
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Subtítulo
              <input
                type="text"
                name={`slide_${i}_subheadline`}
                maxLength={200}
                defaultValue={slide.subheadline}
                className={inputClass}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Texto do botão
                <input
                  type="text"
                  name={`slide_${i}_ctaText`}
                  maxLength={40}
                  defaultValue={slide.ctaText}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Link do botão
                <input
                  type="text"
                  name={`slide_${i}_ctaUrl`}
                  maxLength={500}
                  defaultValue={slide.ctaUrl}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Imagem de fundo (opcional)
              <input
                type="file"
                name={`bannerImage_${i}`}
                accept="image/jpeg,image/png,image/webp,image/svg+xml,.svg"
                className="text-sm"
              />
            </label>

            {slide.imageKey && (
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" name={`removeBannerImage_${i}`} />
                Remover imagem atual
              </label>
            )}
          </div>
        </div>
      ))}

      {slides.length < 5 && (
        <button
          type="button"
          onClick={addSlide}
          className="self-start rounded-md border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
        >
          + Adicionar slide
        </button>
      )}
    </div>
  );
}
