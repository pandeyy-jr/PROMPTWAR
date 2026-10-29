"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/context";

const reportSchema = z.object({ siteId: z.string().uuid(), category: z.enum(["hazard", "injury", "near_miss", "wellbeing"]), severity: z.enum(["low", "medium", "high", "critical"]), description: z.string().trim().min(10).max(3000) });
export async function attendanceAction(data: FormData) {
  const { supabase } = await requireRole(["worker"]);
  const shiftId = z.string().uuid().safeParse(data.get("shiftId"));
  const action = z.enum(["check_in", "check_out"]).safeParse(data.get("action"));
  if (!shiftId.success || !action.success) redirect("/worker?error=Invalid%20attendance%20request");
  const { error } = await supabase.rpc("record_attendance", { target_shift: shiftId.data, action_name: action.data });
  if (error) redirect("/worker?error=Attendance%20could%20not%20be%20recorded");
  revalidatePath("/worker");
}

export async function safetyReportAction(data: FormData) {
  const { supabase, memberships } = await requireRole(["worker"]);
  const parsed = reportSchema.safeParse({ siteId: data.get("siteId"), category: data.get("category"), severity: data.get("severity"), description: data.get("description") });
  if (!parsed.success) redirect("/worker?error=Check%20the%20report%20fields");
  const membership = memberships.find((item) => item.role === "worker" && item.site_id === parsed.data.siteId);
  if (!membership) redirect("/worker?error=Workplace%20access%20not%20found");
  const { error } = await supabase.from("safety_reports").insert({
    organization_id: membership.organization_id, site_id: parsed.data.siteId,
    category: parsed.data.category, severity: parsed.data.severity, description: parsed.data.description,
  });
  if (error) redirect("/worker?error=Report%20could%20not%20be%20submitted");
  revalidatePath("/worker");
}
