import { getSiteConfig } from "@/modules/settings/service";
import { saveSettingsAction } from "./actions";

interface AdminSettingsPageProps {
  searchParams: Promise<{ error?: string; saved?: string }>;
}

const inputClass =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500";

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

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Aparência</h1>
      <p className="mt-1 text-sm text-slate-500">
        Banner, cores e identidade visual do site público.
      </p>

      {saved === "1" && (
        <p className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Configurações salvas. O site já reflete as mudanças.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <form action={saveSettingsAction} className="mt-6 flex max-w-2xl flex-col gap-8">
        <fieldset className="rounded-lg border border-slate-200 bg-white p-5">
          <legend className="px-1 text-sm font-semibold text-slate-800">Banner do topo</legend>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="bannerEnabled" defaultChecked={banner.enabled} />
              Exibir banner na página inicial
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Título
              <input type="text" name="headline" maxLength={120} defaultValue={banner.headline} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Subtítulo
              <input type="text" name="subheadline" maxLength={200} defaultValue={banner.subheadline} className={inputClass} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Texto do botão
                <input type="text" name="ctaText" maxLength={40} defaultValue={banner.ctaText} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Link do botão
                <input type="text" name="ctaUrl" maxLength={500} defaultValue={banner.ctaUrl} className={inputClass} />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Imagem de fundo (opcional)
              <input type="file" name="bannerImage" accept="image/jpeg,image/png,image/webp" className="text-sm" />
            </label>
            {banner.imageKey && (
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" name="removeBannerImage" /> Remover imagem atual
              </label>
            )}
          </div>
        </fieldset>

        <fieldset className="rounded-lg border border-slate-200 bg-white p-5">
          <legend className="px-1 text-sm font-semibold text-slate-800">Tema de cores</legend>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <ColorField name="primary" label="Primária" value={theme.primary} />
            <ColorField name="accent" label="Destaque" value={theme.accent} />
            <ColorField name="surface" label="Fundo" value={theme.surface} />
            <ColorField name="text" label="Texto" value={theme.text} />
          </div>
          <label className="mt-4 flex flex-col gap-1 text-sm font-medium text-slate-700">
            Arredondamento dos elementos
            <select name="radius" defaultValue={theme.radius} className={`${inputClass} max-w-48`}>
              <option value="none">Reto</option>
              <option value="sm">Sutil</option>
              <option value="md">Médio</option>
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
              Texto do rodapé
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
          Salvar configurações
        </button>
      </form>
    </div>
  );
}
