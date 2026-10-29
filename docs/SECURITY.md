# Security Requirements and Threat Model

Status: local implementation present; hosted verification pending. Authentication actions, server identity checks, Next.js session refresh, tenant/site migrations, RLS policies, and security-definer transition RPCs exist in source. No connected Supabase project or real RLS test has been run; treat the policies as unverified until database tests pass.

## Assets and threats

Protect credentials and sessions; worker identity, wages, attendance, and reports; organization records; and integrity of roles, shifts, and safety status. Consider stolen sessions, unauthenticated requests, cross-worker/tenant access, role escalation, forged client fields, injection, brute force, private complaint leakage, and unsafe production configuration.

## Authentication and authorization

- Use real Supabase Auth. Validate identity/session on trusted server paths; do not authorize from client state alone.
- Apply least privilege and deny by default. Every read and mutation checks role, organization/site membership, record ownership, and operation-specific rules.
- Enforce sensitive access in PostgreSQL RLS as well as server code. UI hiding is not a security boundary.
- A worker may not change their own role, organization, or access grants. Role/membership changes require an authorized, audited administrative path.
- Workers may access only their own private wage, attendance, and complaint records, subject to explicitly modeled organization response access.
- Worker-visible safety history contains status changes only. Optional management review notes are stored in a private schema and returned only through a manager-checked RPC.
- Keep management access scoped to authorized organizations/sites; do not assume all administrators are globally trusted.

## Keys, sessions, and server/client boundaries

- Supabase URL and publishable/anonymous key may be in intended browser configuration only with RLS enabled and correctly tested.
- **Never expose the Supabase service-role key in browser code, client components, source maps, logs, or any `NEXT_PUBLIC_` variable.** Keep privileged keys server-only and use Cloud Run secret configuration if a justified operation needs one.
- Never hard-code credentials or create a default/fake administrator. Ignore local `.env` files and commit placeholders only.
- Use supported `@supabase/ssr` session handling, secure cookie settings in production, HTTPS, and appropriate CSRF protections for state-changing requests.
- Separate client modules from server-only utilities; add server-only guards where appropriate.

## Inputs, injection, and errors

- Validate every untrusted server action/request with schemas, length and range limits, enum allowlists, and ownership checks. Repeat critical invariants in database constraints.
- Use parameterized database operations; do not assemble SQL from untrusted strings. Escape/encode rendered user text using framework defaults; do not use unsafe HTML rendering without review.
- Return minimal, stable error messages. Do not disclose whether a private record exists to an unauthorized caller. Keep detailed diagnostics in protected logs without secret or complaint payloads.
- Rate-limit or otherwise protect sign-in and abuse-prone reporting endpoints as the deployment needs dictate.

## Privacy and logging

- Collect only data needed for the workflow. Define retention and access expectations before adding sensitive fields.
- Do not log passwords, auth tokens/cookies, service keys, full wage details, or private hazard/complaint narratives. Prefer record IDs and coarse error metadata.
- Worker reports should not be advertised as anonymous unless identity isolation and operational behavior actually guarantee it. Explain who can see a report before submission.
- Keep audit history for sensitive management/status changes while minimizing sensitive note contents.

## File uploads (only if introduced)

No upload feature is currently required. If added, obtain approval and define allowed types/size, content scanning, private bucket policies, signed URL expiry, metadata validation, malware risks, retention, and uploader/reader authorization before implementation. Never make sensitive evidence publicly readable by default.

## Production configuration and release

Use Cloud Run managed secrets/environment configuration, least-privilege service identity, HTTPS, non-debug production mode, and restricted CORS/redirect URLs. Rotate exposed credentials and remove them from history if any leak occurs. Verify RLS with adversarial role tests and review actual deployment configuration before claiming secure release.

Related: [database/RLS specification](DATABASE_SCHEMA.md), [API contracts](API_CONTRACTS.md), [deployment](DEPLOYMENT.md), [QA](TESTING_QA.md).
