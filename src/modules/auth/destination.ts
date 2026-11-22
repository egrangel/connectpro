/** Authentication return paths must stay on this site. */
export function authDestination(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 2048 || !value.startsWith("/") ||
      value.startsWith("//") || /[\\\s]/.test(value)) return undefined;

  const url = new URL(value, "https://connect.invalid");
  if (url.pathname.startsWith("//")) return undefined;
  return value;
}

export function authHref(path: string, next?: string, values: Record<string, string> = {}): string {
  const params = new URLSearchParams(values);
  const destination = authDestination(next);
  if (destination) params.set("next", destination);
  return params.size ? `${path}?${params}` : path;
}

export interface LoginState {
  error?: string;
  email?: string;
}
