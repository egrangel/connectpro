import { getSiteConfig } from "@/modules/settings/service";
import { RADIUS_CSS } from "@/modules/settings/schema";
import { saveSettingsAction } from "./actions";
import { BannerSlidesEditor } from "./BannerSlidesEditor";

interface AdminSettingsPageProps {
  searchParams: Promise<{ error?: string; saved?: string }>;
}

const inputClass =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

function ColorField({ name, label, value }: { name: string; label: string; value: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      <span className="flex items-center gap-2">
        <input type="color" name={name} defaultValue={value} className="h-9 w-12 cursor-pointer rounded border border-slate-300" />
        <code className="text-xs text-slate-500">{value}</code>
      </span>
    </label>
  );
}

export default async function AdminSettingsPage({ searchParams }: AdminSettingsPageProps) {
  const [{ error, saved }, config] = await Promise.all([searchParams, getSiteConfig()]);
  const { banner, theme, branding } = config;
  const firstSlide = banner.slides[0];

  const previewStyle = {
    "--preview-primary": theme.primary,
    "--preview-accent": theme.accent,
    "--preview-surface": theme.surface,
    "--preview-text": theme.text,
    "--preview-radius": RADIUS_CSS[theme.radius],
  } as React.CSSProperties;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Aparencia</h1>
      <p className="mt-1 text-sm text-slate-500">
        Banner, cores e identidade visual do site publico.
      </p>

      {saved === "1" && (
        <p className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Configuracoes salvas. O site ja reflete as mudancas.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form action={saveSettingsAction} className="flex min-w-0 flex-col gap-8">
          <fieldset className="rounded-lg border border-slate-200 bg-white p-5">
            <legend className="px-1 text-sm font-semibold text-slate-800">
              Carrossel do topo
            </legend>
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" name="bannerEnabled" defaultChecked={banner.enabled} />
                Exibir carrossel na pagina inicial
              </label>
              <BannerSlidesEditor initialSlides={banner.slides} />
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-slate-200 bg-white p-5">
            <legend className="px-1 text-sm font-semibold text-slate-800">Tema de cores</legend>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <ColorField name="primary" label="Primaria" value={theme.primary} />
              <ColorField name="accent" label="Destaque" value={theme.accent} />
              <ColorField name="surface" label="Fundo" value={theme.surface} />
              <ColorField name="text" label="Texto" value={theme.text} />
            </div>
            <label className="mt-4 flex flex-col gap-1 text-sm font-medium text-slate-700">
              Arredondamento dos elementos
              <select name="radius" defaultValue={theme.radius} className={`${inputClass} max-w-48`}>
                <option value="none">Reto</option>
                <option value="sm">Sutil</option>
                <option value="md">Medio</option>
                <option value="lg">Grande</option>
                <option value="full">Arredondado</option>
              </select>
            </label>
          </fieldset>

          <fieldset className="rounded-lg border border-slate-200 bg-white p-5">
            <legend className="px-1 text-sm font-semibold text-slate-800">Marca</legend>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Nome do site
                <input type="text" name="siteName" required maxLength={60} defaultValue={branding.siteName} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Texto do rodape
                <input type="text" name="footerText" maxLength={300} defaultValue={branding.footerText} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Logo (opcional)
                <input type="file" name="logo" accept="image/jpeg,image/png,image/webp" className="text-sm" />
              </label>
              {branding.logoKey && (
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" name="removeLogo" /> Remover logo atual
                </label>
              )}
            </div>
          </fieldset>

          <button
            type="submit"
            className="self-start rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Salvar configuracoes
          </button>
        </form>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold text-slate-800">Previa visual</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Amostra com as cores e o raio configurados. As alteracoes aparecem aqui apos salvar.
          </p>
          <div
            style={previewStyle}
            className="mt-4 overflow-hidden rounded-[var(--preview-radius)] border border-black/10 bg-[var(--preview-surface)] text-[var(--preview-text)]"
          >
            <div className="bg-[linear-gradient(135deg,var(--preview-primary),var(--preview-accent))] p-5 text-white">
              {branding.logoKey ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={branding.logoKey} alt="" className="mb-5 h-10 w-auto max-w-44 object-contain" />
              ) : (
                <p className="mb-5 text-sm font-bold">{branding.siteName}</p>
              )}
              <p className="text-xs font-bold uppercase text-white/80">
                Carrossel · {banner.slides.length}{" "}
                {banner.slides.length === 1 ? "slide" : "slides"}
              </p>
              <p className="mt-1 text-xl font-bold leading-tight">{firstSlide?.headline}</p>
              {firstSlide?.ctaText && (
                <span className="mt-4 inline-flex rounded-[var(--preview-radius)] bg-white px-3 py-2 text-xs font-bold text-[var(--preview-primary)]">
                  {firstSlide.ctaText}
                </span>
              )}
            </div>
            <div className="p-4">
              <div className="rounded-[var(--preview-radius)] border border-black/10 bg-white p-3 shadow-sm">
                <span className="rounded-full bg-[var(--preview-primary)] px-2.5 py-1 text-xs font-bold text-white">
                  Categoria
                </span>
                <p className="mt-3 font-bold">Card de profissional</p>
                <p className="mt-1 text-xs opacity-70">Exemplo de texto, avaliacao e botao.</p>
                <p className="mt-3 text-xs font-bold text-[var(--preview-primary)]">Ver profissional</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
