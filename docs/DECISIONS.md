# Architecture Decisions

These decisions are locked for the project unless the user approves a documented change. User-supplied official hackathon requirements outrank this record; see the governance precedence below.

## ADR-001 — Next.js, TypeScript, Supabase, and Cloud Run

**Decision:** Build the web application with Next.js App Router and TypeScript; use Supabase Auth and PostgreSQL with RLS for identity and persisted data; deploy the final application to Google Cloud Run.

**Reason:** This gives the hackathon one coherent web application, managed identity/data services, PostgreSQL policies, and the required host while keeping the architecture small enough to implement and verify.

**Trade-offs:** Supabase account/project configuration is required for live auth/database verification. Cloud Run requires a container/startup configuration and secure runtime secrets. RLS and application-level authorization both need careful tests.

**Alternatives rejected:** Firebase, SQLite-only production persistence, Vercel, and Netlify conflict with locked project decisions and mandatory hosting. Microservices add operational cost without an MVP need.

## ADR-002 — Public Supabase configuration is build-time and non-privileged

**Decision:** Read `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` through literal property references so Next.js can inline them into the browser bundle. Validate the URL and reject keys that look like a service-role or secret key before constructing a client. Supply the same public values at image build and Cloud Run runtime.

**Reason:** Next.js only inlines statically referenced `NEXT_PUBLIC_*` values. Dynamic access such as `process.env[name]` produces an undefined browser configuration. Supplying public values only as runtime environment variables is therefore insufficient for client code.

**Consequences:** Public values are not secrets and may appear in the browser bundle. RLS remains the data boundary. A service-role key must never be placed in a `NEXT_PUBLIC_*` variable. Deployment documentation must describe the build-time requirement accurately.

## Change control

A significant deviation proposal must state the blocker and evidence, alternatives considered, effect on security/product/submission, implementation cost, and rollback implications. Do not implement the deviation until the user approves it. Do not silently weaken a hackathon requirement.

## Source-of-truth precedence

1. Official hackathon requirements supplied by the user.
2. User's locked project decisions.
3. `AGENTS.md` and detailed specifications under `docs/`.
4. Existing implementation, once present.
5. Agent recommendations.

If two higher-priority sources conflict, record the conflict and request clarification rather than guessing. Keep status language accurate: specified/planned is not implemented, and implemented is not verified until evidence exists.
