"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/context";

function localInZoneToIso(value: string, timeZone: string): string | null {
  const parts=value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if(!parts)return null;
  const target=Date.UTC(Number(parts[1]),Number(parts[2])-1,Number(parts[3]),Number(parts[4]),Number(parts[5]));
  try {
    const fmt=new Intl.DateTimeFormat("en-CA",{timeZone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"});
    let instant=target;
    for(let i=0;i<3;i++){
      const p=Object.fromEntries(fmt.formatToParts(new Date(instant)).map(x=>[x.type,x.value]));
      const represented=Date.UTC(Number(p.year),Number(p.month)-1,Number(p.day),Number(p.hour),Number(p.minute));
      instant += target-represented;
    }
    const check=Object.fromEntries(fmt.formatToParts(new Date(instant)).map(x=>[x.type,x.value]));
    if(["year","month","day","hour","minute"].some((k,i)=>check[k]!==parts[i+1]))return null;
    return new Date(instant).toISOString();
  } catch { return null; }
}

export async function createShiftAction(form: FormData) {
  const { supabase, user, memberships } = await requireRole(["employer", "admin"]);
  const parsed = z.object({ siteId:z.string().uuid(), workerId:z.string().uuid(), title:z.string().trim().min(1).max(120), startsAt:z.string(), endsAt:z.string(), timeZone:z.string().min(1).max(80), rate:z.coerce.number().int().positive().max(100000000), currency:z.enum(["INR","USD","EUR","GBP","CAD","AUD","SGD","JPY"]) }).safeParse({siteId:form.get("siteId"),workerId:form.get("workerId"),title:form.get("title"),startsAt:form.get("startsAt"),endsAt:form.get("endsAt"),timeZone:form.get("timeZone"),rate:form.get("rateMinor"),currency:form.get("currency")});
  if (!parsed.success) redirect("/management?error=Check%20shift%20details");
  const startsAt=localInZoneToIso(parsed.data.startsAt,parsed.data.timeZone), endsAt=localInZoneToIso(parsed.data.endsAt,parsed.data.timeZone);
  if(!startsAt||!endsAt||Date.parse(endsAt)<=Date.parse(startsAt)) redirect("/management?error=Invalid%20time%20or%20daylight%20saving%20gap");
  const {data: site}=await supabase.from("sites").select("id,organization_id,timezone").eq("id",parsed.data.siteId).maybeSingle();
  const authorized = site && memberships.some(
    (membership) =>
      (membership.role === "employer" || membership.role === "admin") &&
      (membership.site_id === site.id ||
        (membership.site_id === null && membership.organization_id === site.organization_id)),
  );
  if (!site||!authorized) redirect("/management?error=Site%20access%20not%20found");
  if(site.timezone!==parsed.data.timeZone) redirect("/management?error=Choose%20the%20selected%20site%20time%20zone");
  const { error } = await supabase.from("shifts").insert({ organization_id:site.organization_id,site_id:parsed.data.siteId,worker_id:parsed.data.workerId,title:parsed.data.title,starts_at:startsAt,ends_at:endsAt,hourly_rate_minor:parsed.data.rate,currency:parsed.data.currency,created_by:user.id });
  if (error) redirect("/management?error=Shift%20could%20not%20be%20created");
  revalidatePath("/management");
}
export async function reviewSafetyAction(form: FormData) {
  const { supabase } = await requireRole(["employer", "admin"]);
  const id=z.string().uuid().safeParse(form.get("reportId")); const status=z.enum(["reviewing","resolved"]).safeParse(form.get("status"));
  if (!id.success || !status.success) redirect("/management?error=Invalid%20review");
  const { error } = await supabase.rpc("review_safety_report",{target_report:id.data,next_status:status.data,review_note:String(form.get("note") ?? "").slice(0,1000)});
  if (error) redirect("/management?error=Review%20could%20not%20be%20saved");
  revalidatePath("/management");
}
