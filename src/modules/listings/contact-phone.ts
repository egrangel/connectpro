const brazilianNationalNumber = /^[1-9]\d(?:[2-5]\d{7}|9\d{8})$/;

/** Accepts Brazilian numbers with a DDD and international numbers with a +. */
export function normalizeContactPhone(value: string | null | undefined): string | null {
  const input = value?.trim();
  if (!input || !/^\+?[\d ().-]+$/.test(input)) return null;

  const digits = input.replace(/\D/g, "");
  if (!input.startsWith("+") && brazilianNationalNumber.test(digits)) return "55" + digits;
  if (digits.startsWith("55") && brazilianNationalNumber.test(digits.slice(2))) return digits;
  if (input.startsWith("+") && !digits.startsWith("55") && /^[1-9]\d{7,14}$/.test(digits)) return digits;
  return null;
}
