import { inputClass as siteInputClass, primaryButtonClass } from "@/components/ui/form-classes";

/**
 * The listing and photo forms serve two places. Members use them on the public
 * site, which follows the admin-configured theme. Admins use them under /admin,
 * which is deliberately unthemed so a broken theme cannot break the tool that
 * fixes it (see DESIGN.md, "Unthemed Workshop"). One style map per place keeps
 * the markup shared and the two looks from leaking into each other.
 */
export type FormVariant = "site" | "admin";

interface ListingFormStyles {
  input: string;
  label: string;
  hint: string;
  counterIdle: string;
  submit: string;
  success: string;
  error: string;
}

interface PhotoFormStyles {
  guide: string;
  guideTitle: string;
  dropzone: string;
  dropzoneIcon: string;
  dropzoneTitle: string;
  dropzoneHint: string;
  selected: string;
  selectedNames: string;
  submit: string;
}

const siteBanner = "rounded-[var(--radius)] border px-4 py-3 text-sm font-semibold";

export const LISTING_FORM_STYLES: Record<FormVariant, ListingFormStyles> = {
  site: {
    input: `${siteInputClass} text-sm`,
    label: "flex flex-col gap-1.5 text-sm font-bold",
    hint: "text-xs font-normal text-[var(--color-muted)]",
    counterIdle: "text-[var(--color-muted)]",
    submit: `${primaryButtonClass} disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0`,
    success: `${siteBanner} border-emerald-200 bg-emerald-50 text-emerald-800`,
    error: `${siteBanner} border-red-200 bg-red-50 text-red-700`,
  },
  admin: {
    input:
      "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200",
    label: "flex flex-col gap-1.5 text-sm font-medium text-slate-700",
    hint: "text-xs font-normal text-slate-500",
    counterIdle: "text-slate-400",
    submit:
      "rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60",
    success: "rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700",
    error: "rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700",
  },
};

export const PHOTO_FORM_STYLES: Record<FormVariant, PhotoFormStyles> = {
  site: {
    guide:
      "rounded-[var(--radius)] border border-[var(--color-line)] bg-[var(--color-panel)] p-3 text-xs leading-5 text-[var(--color-muted)]",
    guideTitle: "font-bold text-[var(--color-text)]",
    dropzone:
      "group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[calc(var(--radius)+6px)] border-2 border-dashed border-[color-mix(in_srgb,var(--color-primary)_28%,transparent)] bg-white/80 px-4 py-8 text-center transition hover:border-[var(--color-primary)] hover:bg-white focus-within:border-[var(--color-primary)] focus-within:ring-4 focus-within:ring-[color-mix(in_srgb,var(--color-primary)_16%,transparent)]",
    dropzoneIcon: "h-8 w-8 text-[var(--color-primary)] transition group-hover:scale-105",
    dropzoneTitle: "text-sm font-bold text-[var(--color-text)]",
    dropzoneHint: "text-xs text-[var(--color-muted)]",
    selected: "text-xs text-[var(--color-muted)]",
    selectedNames: "font-semibold text-[var(--color-text)]",
    submit:
      "rounded-[var(--radius)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_26px_color-mix(in_srgb,var(--color-primary)_22%,transparent)] transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
  },
  admin: {
    guide: "rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600",
    guideTitle: "font-semibold text-slate-700",
    dropzone:
      "group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-300 bg-white px-4 py-8 text-center transition hover:border-slate-400 hover:bg-slate-50 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-200",
    dropzoneIcon: "h-8 w-8 text-slate-400 transition group-hover:text-slate-500",
    dropzoneTitle: "text-sm font-semibold text-slate-700",
    dropzoneHint: "text-xs text-slate-400",
    selected: "text-xs text-slate-500",
    selectedNames: "font-medium text-slate-700",
    submit:
      "rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50",
  },
};
