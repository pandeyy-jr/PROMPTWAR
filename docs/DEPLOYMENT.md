# Google Cloud Run and Supabase Deployment Plan

Status: local container preparation is implemented; deployment is pending. No Cloud Run service, Supabase project connection, production secrets, or live URL is currently configured. Cloud Run is the mandatory final application host.

## Planned topology

Deploy the Next.js application as one containerized Cloud Run service. Supabase Auth and PostgreSQL are managed external services. Store no durable data on the container filesystem or in process memory. Use the Cloud Run service identity and secret integration with least privilege.

## Configuration

Local development uses ignored `.env.local` and the placeholder `.env.example`. Production requires at minimum:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

These are public client configuration values, not secrets. Next.js inlines literal `NEXT_PUBLIC_*` references into the browser bundle **at build time**, so the values must be available for the image build as well as at runtime for server rendering. Supplying them only as Cloud Run runtime variables is not sufficient for browser code. See [DECISIONS.md](DECISIONS.md) ADR-002.

Set non-secret public values through the image build configuration and Cloud Run environment variables. Store any server-only secret in Secret Manager; never bake a service-role key into an image, source file, or `NEXT_PUBLIC_*` variable. Configure the Supabase auth site URL and redirect allowlists for the actual deployed host. Keep development, test, and production projects/data separate.

## Build, startup, and port

Use the repository lockfile for reproducible dependency install. Build a production Next.js artifact inside the container, run the production server as the container entry point, and listen on the port supplied by Cloud Run (`PORT`, typically 8080) on `0.0.0.0`. The current `npm start` script uses Next's production server and honors the platform port; a standalone multi-stage image is planned for Phase 6.

The baseline runtime is Node 22 (`.nvmrc`) and `package.json` requires Node 20.9 or later. A multi-stage standalone `Dockerfile` and non-root port-8080 runtime are present. Do not run the development server in production. Docker image build has not been verified in this environment.

Provide the shallow liveness path `GET /api/health`. It returns a small JSON response and deliberately does not query Supabase, so it proves process liveness rather than database readiness. Add a separate, authenticated readiness check only when a monitored database dependency justifies it.

## Database, health, and operations

Apply versioned SQL migrations through a controlled process before enabling workflows that require new schema. Verify Supabase connectivity without logging credentials. Cloud Run instances are ephemeral; PostgreSQL is the durable source of truth. Configure database connection use for serverless scaling and avoid exhausting the Supabase connection pool.

Provide a minimal health check that verifies app readiness without exposing secrets or private data. Review structured logs for sensitive content. Set suitable scaling, timeout, concurrency, region, and resource limits based on actual demo needs and budget.

## Deployment verification checklist

- [ ] Production build succeeds from a clean lockfile install.
- [ ] Image starts under Cloud Run's `PORT` and serves `/api/health`.
- [ ] Public Supabase values are available at image build and runtime; no secret is in the image, repository, or browser bundle.
- [ ] Auth callback/redirect works on the actual Cloud Run host.
- [ ] Database migrations and RLS are applied and tested in the intended project.
- [ ] Worker and management critical journeys pass against production-like data.
- [ ] Logs and errors do not disclose credentials or private reports.
- [ ] The actual live Cloud Run URL and verification evidence are recorded.

The unchecked items are not achievable in Phase 1 and must not be reported as complete. Never claim deployment success from a Dockerfile, deploy command, or build alone. Account, project, billing, permissions, secrets, and live smoke-test steps remain pending until evidence exists. See [SECURITY.md](SECURITY.md) and [submission requirements](DEMO_AND_SUBMISSION.md).
