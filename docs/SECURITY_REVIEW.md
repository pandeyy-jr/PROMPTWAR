# Security Review

**Review date:** 29 October 2026
**Method:** static source and SQL migration review, dependency audit, local build/test verification. No remote Supabase data or credentials were accessed.

## Confirmed safeguards

- Server actions derive identity from Supabase Auth and validate untrusted form fields with Zod.
- Membership roles are stored separately from user-editable profile data. Auth metadata can create a display name only; it cannot grant a role.
- Ordinary authenticated users have no grants to insert, update, or delete memberships.
- Worker-facing ownership and management site scope are enforced in application checks and RLS policies.
- Attendance and safety transitions use restricted `SECURITY DEFINER` functions with caller authorization checks and `search_path = ''`.
- Private management notes live in the `private` schema and are returned only by a manager-scoped RPC.
- The public Supabase configuration validator rejects recognizable privileged key forms. No local environment file is present, and `.env*` is ignored except for placeholders in `.env.example`.
- CSP, frame denial, no-sniff, referrer, permissions, and production HSTS headers are configured.
- `npm audit --omit=dev --json` reported zero production dependency vulnerabilities on 29 October 2026.

## Resolved finding

**Workflow authorization failure — resolved locally.** The worker safety-report action supplied `reporter_id`, and the manager shift action supplied `created_by`, despite database grants intentionally excluding those fields. This would cause legitimate requests to fail. The actions now use database defaults derived from `auth.uid()`. A forward-only migration grants `severity` without granting worker control over reporter, state, or management fields.

## Remaining verification limits

- RLS policies have not been exercised using anonymous, worker A, worker B, manager, and cross-tenant sessions against PostgreSQL.
- Auth redirect, token refresh, CSRF/origin behavior, and Supabase rate limiting have not been tested against a live host.
- Application-level rate limiting is not implemented; evaluate Supabase Auth limits and Cloud Run protections before production exposure.
- CSP includes `'unsafe-inline'` for Next.js runtime compatibility. Reassess nonce or hash support when the production deployment is available.
- No browser-assisted accessibility review or end-to-end workflow test has run with real data.

## Release decision

The static review found no source credential leak or obvious self-promotion path. Live RLS and multi-user authorization tests remain a release blocker until a verified Supabase project is linked and tested.
