const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

export function isHttpUrl(value: string): boolean {
  try {
    return HTTP_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function isSafePublicHref(value: string): boolean {
  if (value.startsWith("#")) return value.length > 1;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  return isHttpUrl(value);
}

const LOCAL_BASE_URL = "http://localhost:3000";

export interface BaseUrlEnv {
  APP_BASE_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
}

/**
 * Absolute origin used to build links that leave the app (password reset
 * e-mails). Deliberately read from configuration and never from the request
 * `Host` header, which a client controls — a poisoned host would send reset
 * links to an attacker's domain.
 */
export function resolveBaseUrl(env: BaseUrlEnv): string {
  const configured = env.APP_BASE_URL?.trim();
  if (configured && isHttpUrl(configured)) {
    return configured.replace(/\/+$/, "");
  }

  const vercelHost = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelHost) {
    return `https://${vercelHost.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  }

  return LOCAL_BASE_URL;
}