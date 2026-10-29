import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Role = "worker" | "employer" | "admin";
export async function requireIdentity() {
  await connection();
  let supabase;
  try { supabase = await createSupabaseServerClient(); }
  catch { redirect("/sign-in?error=Authentication%20is%20not%20configured"); }
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/sign-in");
  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
    supabase.from("memberships").select("role, organization_id, site_id, active").eq("user_id", user.id).eq("active", true),
  ]);
  return { supabase, user, profile, memberships: memberships ?? [] };
}

export async function requireRole(roles: Role[]) {
  const context = await requireIdentity();
  if (!context.memberships.some((membership) => roles.includes(membership.role as Role))) redirect("/account/pending");
  return context;
}
