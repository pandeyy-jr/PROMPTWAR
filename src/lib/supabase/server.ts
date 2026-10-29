import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicConfig } from "./env";

/**
 * Server-only Supabase client. `next/headers` makes this module unusable in a
 * client component, which keeps session cookies on the trusted server path.
 *
 * Session refresh and route protection will be centralized in Phase 2.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabasePublicConfig();
  const isProduction = process.env.NODE_ENV === "production";

  return createServerClient(url, publishableKey, {
    cookieOptions: {
      path: "/",
      sameSite: "lax",
      secure: isProduction,
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. A Route Handler or the
          // Phase 2 session-refresh path can persist refreshed cookies.
        }
      },
    },
  });
}
