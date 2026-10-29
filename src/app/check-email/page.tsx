import Link from "next/link";

export default function CheckEmailPage() {
  return <main className="dashboard"><p className="eyebrow">ACCOUNT CREATED</p><h1>Check your email</h1><p>If email confirmation is enabled for this Supabase project, follow the confirmation link before signing in. After sign-in, a workplace administrator must add your membership before you can use the worker dashboard.</p><Link href="/sign-in">Continue to sign in →</Link></main>;
}
