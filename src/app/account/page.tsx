import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/auth-actions";
import { requireIdentity } from "@/lib/auth/context";

async function AccountContent() {
  const { user, profile, memberships } = await requireIdentity();
  const roles = new Set(memberships.map((item) => item.role));
  return <main className="dashboard"><p className="eyebrow">YOUR FAIRSHIFT</p><h1>Hello, {profile?.display_name ?? "worker"}</h1><p>{memberships.length ? "Your workplace access is active." : "Your account is ready. Ask your workplace administrator to add your membership."}</p>
    <nav aria-label="Your dashboards" className="dashboard-links">{roles.has("worker") && <Link href="/worker">Worker dashboard →</Link>}{(roles.has("employer") || roles.has("admin")) && <Link href="/management">Management dashboard →</Link>}</nav>
    <p className="muted">Signed in as {user.email}</p><form action={signOut}><button className="secondary-button">Sign out</button></form>
  </main>;
}
export default function AccountPage() { return <Suspense fallback={<main className="dashboard">Loading your account…</main>}><AccountContent /></Suspense>; }
