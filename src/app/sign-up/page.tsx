import Link from "next/link";
import { Suspense } from "react";
import { signUp } from "@/app/auth-actions";

async function SignUpContent({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="auth-page"><section className="auth-card" aria-labelledby="auth-title"><p className="eyebrow">JOIN FAIRSHIFT</p><h1 id="auth-title">Create your account</h1><p>Worker registration only. An employer or administrator must invite you to a workplace.</p>
    {error && <p role="alert" className="form-error">{error}</p>}
    <form action={signUp}><label>Your name<input name="displayName" autoComplete="name" required minLength={1} maxLength={100} /></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} /></label><label>Password<input name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} /></label><button className="primary-link" type="submit">Create account <span aria-hidden="true">→</span></button></form>
    <p>Already registered? <Link href="/sign-in">Sign in</Link></p>
  </section></main>;
}
export default function SignUpPage(props: { searchParams: Promise<{ error?: string }> }) { return <Suspense fallback={<main className="auth-page">Loading sign up…</main>}><SignUpContent {...props} /></Suspense>; }
