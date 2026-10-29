import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "./env";

type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>;

let browserClient: BrowserSupabaseClient | null = null;

/**
 * Returns one browser client per tab. Reusing the client avoids multiple auth
 * listeners and duplicate token-refresh loops when several components mount.
 */
export function createSupabaseBrowserClient(): BrowserSupabaseClient {
  if (!browserClient) {
    const { url, publishableKey } = getSupabasePublicConfig();
    browserClient = createBrowserClient(url, publishableKey);
  }

  return browserClient;
}
