import Link from "next/link";
import { Suspense } from "react";
import { signIn } from "@/app/auth-actions";

async function SignInContent({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="auth-page"><section className="auth-card" aria-labelledby="auth-title"><p className="eyebrow">FAIRSHIFT ACCOUNT</p><h1 id="auth-title">Welcome back</h1><p>Sign in to view your shifts and workplace updates.</p>
    {error && <p role="alert" className="form-error">{error}</p>}
    <form action={signIn}><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} /></label><label>Password<input name="password" type="password" autoComplete="current-password" required minLength={8} maxLength={128} /></label><button className="primary-link" type="submit">Sign in <span aria-hidden="true">→</span></button></form>
    <p>New to FairShift? <Link href="/sign-up">Create a worker account</Link></p>
  </section></main>;
}
export default function SignInPage(props: { searchParams: Promise<{ error?: string }> }) { return <Suspense fallback={<main className="auth-page">Loading sign in…</main>}><SignInContent {...props} /></Suspense>; }
