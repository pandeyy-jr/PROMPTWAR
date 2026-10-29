import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireRole } from "@/lib/auth/context";
import { attendanceAction, safetyReportAction } from "./actions";
import { estimateWage } from "@/lib/fairness/engine";

const money = (minor: number, currency: string) => new Intl.NumberFormat(undefined, { style: "currency", currency }).format(minor / 100);
async function WorkerContent({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { user, supabase, memberships } = await requireRole(["worker"]);
  const { error } = await searchParams;
  const siteIds = memberships.filter((m) => m.role === "worker").map((m) => m.site_id).filter((id): id is string => Boolean(id));
  if (!siteIds.length) redirect("/account/pending");
  const [{ data: shifts }, { data: reports }] = await Promise.all([
    supabase.from("shifts").select("id,title,starts_at,ends_at,hourly_rate_minor,currency,state,site_id").eq("worker_id", user.id).order("starts_at", { ascending: true }),
    supabase.from("safety_reports").select("id,category,severity,description,state,created_at,safety_events(next_state,created_at)").eq("reporter_id", user.id).order("created_at", { ascending: false }).limit(30),
  ]);
  const workerSites=memberships.filter((m)=>m.role==="worker"&&m.site_id);
  return <main className="dashboard"><p className="eyebrow">WORKER SPACE</p><h1>Your shifts, pay and safety</h1><p>Your assigned shifts and reported concerns are private to your account and authorized workplace managers.</p>
    {error && <p role="alert" className="form-error">{error}</p>}
    <section className="dash-section"><h2>Upcoming and recent shifts</h2>{shifts?.length ? <div className="record-list">{shifts.map((shift) => { const estimate=estimateWage(shift.hourly_rate_minor,shift.starts_at,shift.ends_at); return <article key={shift.id}><h3>{shift.title}</h3><p>{new Date(shift.starts_at).toLocaleString()} – {new Date(shift.ends_at).toLocaleTimeString()}</p><p><strong>{money(shift.hourly_rate_minor, shift.currency)} / hour</strong> · {shift.state.replace("_", " ")}</p>{estimate&&<p><strong>Scheduled gross estimate: {money(estimate.amountMinor,shift.currency)}</strong><br/><small>{estimate.explanation}</small></p>}{shift.state !== "completed" && <form action={attendanceAction}><input type="hidden" name="shiftId" value={shift.id}/><input type="hidden" name="action" value={shift.state === "scheduled" ? "check_in" : "check_out"}/><button className="secondary-button">{shift.state === "scheduled" ? "Check in" : "Check out"}</button></form>}</article>; })}</div> : <p>No shifts are assigned yet.</p>}</section>
    <section className="dash-section"><h2>Report a workplace concern</h2><p>Share a hazard, injury, near miss or wellbeing concern with authorized workplace managers. Include only details needed to investigate. Severity is your triage estimate, not a medical or legal classification.</p>{workerSites.length>0 && <form className="report-form" action={safetyReportAction}><label>Workplace<select name="siteId" required>{workerSites.map((m)=><option key={m.site_id} value={m.site_id!}>{m.site_id}</option>)}</select></label><label>Type<select name="category"><option value="hazard">Hazard</option><option value="injury">Injury</option><option value="near_miss">Near miss</option><option value="wellbeing">Wellbeing</option></select></label><label>Severity<select name="severity" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label><label>What happened?<textarea name="description" required minLength={10} maxLength={3000} rows={4}/></label><button className="primary-link">Submit report</button></form>}</section>
    <section className="dash-section"><h2>Your reports and follow-up</h2>{reports?.length ? <div className="record-list">{reports.map((r) => <article key={r.id}><strong>{r.category.replace("_", " ")} · {r.severity} · {r.state}</strong><p>{r.description}</p><small>Reported {new Date(r.created_at).toLocaleString()}</small>{r.safety_events?.length>0&&<ul aria-label="Report status history">{r.safety_events.map((event,index)=><li key={index}>{event.next_state} · {new Date(event.created_at).toLocaleString()}</li>)}</ul>}</article>)}</div> : <p>No reports submitted.</p>}</section>
  </main>;
}
export default function WorkerPage(props: { searchParams: Promise<{ error?: string }> }) { return <Suspense fallback={<main className="dashboard">Loading worker dashboard…</main>}><WorkerContent {...props} /></Suspense>; }
