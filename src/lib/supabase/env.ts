/**
 * Public Supabase configuration.
 *
 * Next.js inlines `NEXT_PUBLIC_*` values into the browser bundle only when the
 * property is read literally at build time. Do not replace these reads with
 * dynamic access such as `process.env[name]`: the browser client would receive
 * `undefined`.
 *
 * These values are public client configuration, not database authorization.
 * Row Level Security must protect every record. A service-role or secret key
 * must never appear in a `NEXT_PUBLIC_*` variable.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

function parseSupabaseUrl(rawValue: string | undefined): string {
  const value = rawValue?.trim();

  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing. Copy .env.example to .env.local and add your Supabase project URL.",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid absolute URL.");
  }

  const isLocalHost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  const isAllowedProtocol = parsed.protocol === "https:" || (parsed.protocol === "http:" && isLocalHost);

  if (!isAllowedProtocol) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must use HTTPS (HTTP is allowed only for localhost development).",
    );
  }

  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must not contain credentials, a query string, or a fragment.");
  }

  return parsed.toString().replace(/\/$/, "");
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payload: unknown = JSON.parse(atob(padded));
    return payload !== null && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function looksLikePrivilegedKey(key: string): boolean {
  if (key.startsWith("sb_secret_")) {
    return true;
  }

  if (key === "service_role") {
    return true;
  }

  return decodeJwtPayload(key)?.role === "service_role";
}

function parsePublishableKey(rawValue: string | undefined): string {
  const value = rawValue?.trim();

  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing. Add the publishable (or anon) key to your local environment.",
    );
  }

  if (looksLikePrivilegedKey(value)) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY looks like a privileged key. Use the publishable/anon key; never expose a service-role or secret key.",
    );
  }

  return value;
}

export function getSupabasePublicConfig(): SupabasePublicConfig {
  return {
    url: parseSupabaseUrl(SUPABASE_URL),
    publishableKey: parsePublishableKey(SUPABASE_PUBLISHABLE_KEY),
  };
}
