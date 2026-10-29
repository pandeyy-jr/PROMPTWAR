import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireRole } from "@/lib/auth/context";
import { createShiftAction, reviewSafetyAction } from "./actions";
import { evaluateFairness } from "@/lib/fairness/engine";

async function ManagementContent({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { supabase, memberships } = await requireRole(["employer", "admin"]); const { error } = await searchParams;
  const managementMemberships=memberships.filter((m)=>m.role==="employer"||m.role==="admin");
  const orgWideIds=[...new Set(managementMemberships.filter((m)=>!m.site_id).map((m)=>m.organization_id))];
  const {data:orgSites}=orgWideIds.length?await supabase.from("sites").select("id").in("organization_id",orgWideIds):{data:[]};
  const siteIds=[...new Set([...managementMemberships.map((m)=>m.site_id).filter((id):id is string=>Boolean(id)),...(orgSites??[]).map((site)=>site.id)])];
  if(!siteIds.length) redirect("/account/pending");
  const [{data:shifts},{data:reports},{data:workers}]=await Promise.all([
    supabase.from("shifts").select("id,title,starts_at,ends_at,hourly_rate_minor,currency,state,worker_id,site_id").in("site_id",siteIds).order("starts_at",{ascending:true}).limit(100),
    supabase.from("safety_reports").select("id,category,severity,description,state,created_at,site_id").in("site_id",siteIds).order("created_at",{ascending:false}).limit(100),
    supabase.from("memberships").select("user_id,site_id,profiles(display_name)").in("site_id",siteIds).eq("role","worker").eq("active",true),
  ]);
  const {data:reviewNotes}=await supabase.rpc("list_safety_review_notes",{target_reports:(reports??[]).map((report)=>report.id)});
  const notesByReport=new Map<string,{actor_id:string;note:string;created_at:string}[]>();
  for(const note of reviewNotes??[])notesByReport.set(note.report_id,[...(notesByReport.get(note.report_id)??[]),note]);
  const {data: siteConfigs}=await supabase.from("sites").select("id,name,industry,timezone").in("id",siteIds);
  const industryBySite=new Map((siteConfigs??[]).map((site)=>[site.id,site.industry]));
  const alerts=(shifts??[]).flatMap((shift)=>{
    const previous=(shifts??[]).filter((candidate)=>candidate.worker_id===shift.worker_id&&candidate.id!==shift.id&&Date.parse(candidate.ends_at)<=Date.parse(shift.starts_at)).sort((a,b)=>Date.parse(b.ends_at)-Date.parse(a.ends_at))[0];
    const openHighSeverity=(reports??[]).some((report)=>report.site_id===shift.site_id&&(report.severity==="high"||report.severity==="critical")&&report.state!=="resolved");
    return evaluateFairness({shiftId:shift.id,startsAt:shift.starts_at,endsAt:shift.ends_at,hourlyRateMinor:shift.hourly_rate_minor,currency:shift.currency,previousShiftEndsAt:previous?.ends_at,unresolvedHighSeveritySafetyIncident:openHighSeverity},industryBySite.get(shift.site_id)==="college"?"college":"factory").map((alert)=>({...alert,shiftTitle:shift.title,workerId:shift.worker_id,startsAt:shift.starts_at}));
  });
  return <main className="dashboard"><p className="eyebrow">WORKPLACE MANAGEMENT</p><h1>Shift and safety overview</h1><p>Records are scoped to the sites in your active employer or admin memberships.</p>{error&&<p role="alert" className="form-error">{error}</p>}
    <section className="dash-section"><h2>Create a shift</h2><form className="report-form" action={createShiftAction}><label>Site<select name="siteId" required>{(siteConfigs??[]).map((site)=><option key={site.id} value={site.id}>{site.name} · {site.timezone}</option>)}</select></label><label>Worker<select name="workerId" required>{(workers??[]).map((w)=><option key={w.user_id} value={w.user_id}>{w.profiles?.[0]?.display_name??w.user_id}</option>)}</select></label><label>Shift title<input name="title" required maxLength={120}/></label><label>Starts (site local time)<input type="datetime-local" name="startsAt" required/></label><label>Ends (site local time)<input type="datetime-local" name="endsAt" required/></label><label>Time zone<select name="timeZone" required>{(siteConfigs??[]).map((site)=><option key={site.id} value={site.timezone}>{site.name} · {site.timezone}</option>)}</select><small>Choose the time zone shown for the selected site; daylight-saving gaps are rejected.</small></label><label>Hourly rate in minor units<input type="number" name="rateMinor" min="1" max="100000000" required/><small>INR 250.00 = 25000 paise. Max supported rate: 100000000 minor units per hour.</small></label><label>Currency<select name="currency" defaultValue="INR"><option>INR</option><option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option><option>AUD</option><option>SGD</option><option>JPY</option></select></label><button className="primary-link">Publish shift</button></form></section>
    <section className="dash-section"><h2>Fairness review prompts</h2><p>Prompts support human review. Thresholds are product settings, not legal standards or worker scores.</p>{alerts.length?<div className="record-list">{alerts.map((alert,index)=><article key={`${alert.code}-${index}`}><strong>{alert.code.replaceAll("_"," ")} · {alert.severity}</strong><p>{alert.shiftTitle} · {new Date(alert.startsAt).toLocaleString()}</p><p>{alert.explanation}</p><p>{alert.evidence}</p><small>{alert.followUp}</small></article>)}</div>:<p>No shift prompts under the configured rules.</p>}</section>
    <section className="dash-section"><h2>Shift roster</h2>{shifts?.length?<div className="record-list">{shifts.map((s)=><article key={s.id}><h3>{s.title}</h3><p>Worker {s.worker_id} · {new Date(s.starts_at).toLocaleString()} · {s.state}</p><strong>{new Intl.NumberFormat(undefined,{style:"currency",currency:s.currency}).format(s.hourly_rate_minor/100)}/hour</strong></article>)}</div>:<p>No shifts recorded.</p>}</section>
    <section className="dash-section"><h2>Safety reports</h2>{reports?.length?<div className="record-list">{reports.map((r)=><article key={r.id}><strong>{r.category.replace("_"," ")} · {r.severity} · {r.state}</strong><p>{r.description}</p><small>{new Date(r.created_at).toLocaleString()}</small>{(notesByReport.get(r.id)??[]).map((note,index)=><p key={index}><small>Management note · {new Date(note.created_at).toLocaleString()}</small><br/>{note.note}</p>)}{r.state!=="resolved"&&<form className="inline-form" action={reviewSafetyAction}><input type="hidden" name="reportId" value={r.id}/><select name="status" aria-label="New report status"><option value="reviewing">Mark reviewing</option><option value="resolved">Resolve</option></select><input name="note" aria-label="Management-only review note" placeholder="Private management note" maxLength={1000}/><button className="secondary-button">Save review</button></form>}</article>)}</div>:<p>No reports to review.</p>}</section>
  </main>;
}
export default function ManagementPage(props: { searchParams: Promise<{ error?: string }> }) { return <Suspense fallback={<main className="dashboard">Loading management dashboard…</main>}><ManagementContent {...props} /></Suspense>; }
