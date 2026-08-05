// Shared field/button styling for the account screens (login, register,
// password recovery) so the four forms cannot drift apart.

export const inputClass =
  "rounded-[var(--radius)] border border-[var(--color-line)] bg-white/86 px-3 py-2.5 font-normal outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_16%,transparent)]";

export const primaryButtonClass =
  "mt-2 rounded-[var(--radius)] bg-[var(--color-primary)] px-5 py-3 font-bold text-white shadow-[0_14px_30px_color-mix(in_srgb,var(--color-primary)_22%,transparent)] transition hover:-translate-y-0.5 hover:opacity-95";
