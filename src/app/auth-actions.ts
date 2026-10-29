"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const credentials = z.object({ email: z.string().trim().email().max(254), password: z.string().min(8).max(128) });

export async function signIn(formData: FormData) {
  const parsed = credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) redirect("/sign-in?error=Check%20your%20email%20and%20password");
  let supabase;
  try { supabase = await createSupabaseServerClient(); } catch { redirect("/sign-in?error=Authentication%20is%20not%20configured"); }
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect("/sign-in?error=Sign%20in%20failed");
  redirect("/account");
}

export async function signUp(formData: FormData) {
  const parsed = credentials.extend({ displayName: z.string().trim().min(1).max(100) }).safeParse({
    email: formData.get("email"), password: formData.get("password"), displayName: formData.get("displayName"),
  });
  if (!parsed.success) redirect("/sign-up?error=Check%20the%20form%20fields");
  let supabase;
  try { supabase = await createSupabaseServerClient(); } catch { redirect("/sign-up?error=Authentication%20is%20not%20configured"); }
  const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { display_name: parsed.data.displayName } },
    });
  if (error) redirect("/sign-up?error=Account%20could%20not%20be%20created");
  redirect("/check-email");
}

export async function signOut() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } finally {
    redirect("/sign-in");
  }
}
