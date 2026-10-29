# FairShift

FairShift is a Prompt Wars 2026 project aligned with **UN Sustainable Development Goal 8: Decent Work and Economic Growth**. It supports workers and workplace management teams in factories and colleges with clearer shifts, transparent wage rates, attendance records, and workplace safety follow-up.

> **Implementation status (28 October 2026):** Local authentication flows, membership-based access checks, worker and management workflows, SQL migrations/RLS policies, deterministic Fairness Engine rules, unit tests, CI, and a Cloud Run container configuration are implemented. `npm run verify` passes locally, and the production server returned `200` for `/` and `/api/health`. This workspace is **not connected to a Supabase project**: migrations/RLS, real user journeys, Docker build, and Cloud Run deployment have not been verified. No fake users or records are seeded.

## Features

- **Worker interface:** see assigned shifts and hourly rate, check in/out, report a hazard/injury/near miss/wellbeing concern, and review report status.
- **Employer/admin interface:** create site shifts, see the roster, and record safety report follow-up. Access is limited to active manager memberships.
- **Transparent pay:** shifts store rate snapshots in integer minor currency units; helper estimates scheduled pay and explains its calculation. It is not a payroll record and excludes overtime/deductions.
- **Fairness Engine:** deterministic configured prompts for long shifts, short rest gaps, and unresolved hazards. Factory and college thresholds differ; alerts prompt human review and never score or penalize workers.
- **Access and persistence design:** Supabase Auth and PostgreSQL with site-scoped RLS, worker-only self-registration, and atomic RPCs for attendance and safety transitions.

## Local development

Requires Node 20.9+ (Node 22 recommended) and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

PowerShell: `Copy-Item .env.example .env.local`. Add the Supabase project URL and publishable key to use auth/data routes. Without them, the public page remains available and auth routes report that auth is unconfigured. Registering an account does not grant workplace access; a trusted administrator must provision its membership. Never put a service-role key in a `NEXT_PUBLIC_` variable.

See [trusted workspace bootstrap](supabase/BOOTSTRAP.md) for the first admin, organization, site, and worker membership setup. Run the steps only as a trusted database operator.

## Verification

```bash
npm run lint
npm run typecheck
npm run test
npm run build
# or
npm run verify
```

The current unit tests cover wage estimates and fairness rule boundaries. They do **not** prove Supabase RLS or live persistence. On 28 October 2026, `npm run verify` passed: lint, typecheck, 4 Vitest tests, and the production build. The standalone production server also returned `200` for `/` and `/api/health`; health returned `{"status":"ok","service":"fairshift"}` with the configured security headers. No connected Supabase project or verified Cloud Run deployment is available in this workspace. Apply migrations in `supabase/migrations` and run real RLS and journey tests before claiming a live integration.

## Deployment

`Dockerfile` builds a Next.js standalone image for Cloud Run and runs as a non-root user on port 8080. Public Supabase values must be available at image build and runtime because Next.js inlines them in browser code. Docker/GCP deployment and hosted Supabase setup remain pending. See [Deployment](docs/DEPLOYMENT.md), [Security](docs/SECURITY.md), and the [task graph](docs/TASK_GRAPH.md).

## Industries and design notes

Factory and college use cases are described in [Industry Use Cases](docs/INDUSTRY_USE_CASES.md). For schemas and product constraints, see [Database Schema](docs/DATABASE_SCHEMA.md), [Fairness Engine](docs/FAIRNESS_ENGINE.md), and [Project Spec](docs/PROJECT_SPEC.md).
