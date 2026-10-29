import { requireIdentity } from "@/lib/auth/context";
import { signOut } from "@/app/auth-actions";
import { Suspense } from "react";

async function PendingContent() {
  const { profile } = await requireIdentity();
  return <main className="dashboard"><p className="eyebrow">WORKPLACE ACCESS</p><h1>Account ready, {profile?.display_name ?? "worker"}</h1><p>Your account has no active workplace membership yet. Contact your workplace administrator to be added. Self-registration cannot grant employer or admin access.</p><form action={signOut}><button className="secondary-button">Sign out</button></form></main>;
}
export default function PendingPage() { return <Suspense fallback={<main className="dashboard">Loading account…</main>}><PendingContent /></Suspense>; }
