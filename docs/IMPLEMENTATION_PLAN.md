# Staged Implementation Plan

Work proceeds through the six gates below. The user has authorized continuation through all implementation stages. At each gate record files, behavior, commands/results, security implications, blockers, and acceptance status; proceed to the next locally actionable stage when its dependencies pass. A failed or blocked criterion remains open. Stop only for a genuine blocker or an action that requires explicit approval, including destructive operations, paid services, significant architecture changes, credential exposure, external publication, or submission attempts.

## Gate 1 — Foundation and local production build

**Status:** Foundation verification passed on 27 October 2026; independent review findings and evidence are recorded in [PHASE_1_REPORT.md](PHASE_1_REPORT.md). No Git diff was available because the workspace has no Git repository.

**Deliverables:** Next.js/TypeScript project, minimal dependencies, lint/type configuration, responsive and accessibility-oriented app shell, validated Supabase client integration approach, safe response headers, shallow health route, environment template, setup documentation.

**Acceptance:** dependencies install from lockfile; lint and typecheck pass; production build succeeds; no credentials are committed. Known commands: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run verify`. Evidence is recorded in [PHASE_1_REPORT.md](PHASE_1_REPORT.md).

**Stop if:** install/build is blocked or an architectural change is needed. No production features are implied by this gate.

## Gate 2 — Authentication and authorization

**Local status (29 October 2026):** Authentication actions, session refresh, server-side role guards, identity/membership schema, and RLS policies are implemented. Static SQL review found no ordinary membership-write path or obvious self-promotion route. Hosted auth, anonymous/cross-worker RLS checks, and real user journeys remain unverified because no Supabase project or database test runtime is connected. See [Phase 2 report](PHASE_2_REPORT.md).

**Deliverables:** real Supabase sign-in/sign-out, protected routes/server guards, profile provisioning, role-aware worker and management entry points, initial profile/org migrations and RLS policies.

**Acceptance:** unauthenticated requests are rejected where required; worker A cannot access worker B's private records; ordinary users cannot escalate roles; RLS policies are tested against authenticated and anonymous access. Requires a configured Supabase project for live tests; local policy/schema tests should still be prepared where feasible.

**Stop if:** a missing decision prevents safe local implementation. If hosted credentials are unavailable, complete offline code/migrations/tests and record live verification as blocked.

## Gate 3 — Core workforce workflows and persistence

**Local status (29 October 2026):** Shift creation/view, attendance transitions, scheduled wage estimates, safety reports/status history, and management review actions are implemented against the migrations. A forward-only migration now grants safety severity insertion, and actions rely on database-owned `auth.uid()` defaults for reporter and creator fields. Persistence and authorization behavior remain unverified against PostgreSQL/Supabase. See [Phase 2 report](PHASE_2_REPORT.md).

**Deliverables:** shift management/viewing, attendance check-in/out, explicit wage rules and transparent calculations, worker hazard reporting, management review/status history, persisted summaries.

**Acceptance:** records survive refresh; validation and errors are usable; authorization and RLS reject cross-user operations; critical journey/integration tests pass.

**Stop if:** a missing rate or authorization decision would require inventing policy. Otherwise complete locally verifiable work and label external/database verification blocked.

## Gate 4 — Fairness Engine and industry configurations

**Local status (28 October 2026):** Deterministic factory/college rules and explainable review prompts are implemented. `npm run verify` passed, including the wage and rule-boundary unit tests. Rules use configured product thresholds and do not make legal or employment decisions.

**Deliverables:** deterministic explained alerts, configurable factory/college examples, relevant filtering and sample workflows.

**Acceptance:** calculation/edge-case tests cover each rule; every alert identifies evidence, rule, reason, severity, and human follow-up; neither industry depends on a separate codebase; no legal or ML claims are invented.

**Stop if:** rule thresholds or pay interpretation lack an accountable configuration; represent them as required organization settings and never assume statutory requirements.

## Gate 5 — Security, accessibility, and testing

**Local status (29 October 2026):** CSP and security headers, input validation, CI workflow, accessible form/navigation patterns, and local lint/type/test/build checks are present. `npm audit --omit=dev --json` reported zero production vulnerabilities. Formal keyboard/contrast/reflow review, database/RLS tests, and browser journeys remain incomplete. Gate 5 is not verified complete; see [Security review](SECURITY_REVIEW.md).

**Deliverables:** hardening, keyboard/mobile/contrast review, meaningful unit/integration/RLS/end-to-end checks, resolved release-blocking defects, updated docs.

**Acceptance:** gates in [TESTING_QA.md](TESTING_QA.md), [SECURITY.md](SECURITY.md), and [UX_ACCESSIBILITY.md](UX_ACCESSIBILITY.md) pass or blocked tests are documented with exact external requirements. No claim is made for a test that was not run.

**Stop if:** high-risk access issue, critical accessibility failure, or unresolved production secret/configuration defect remains.

## Gate 6 — Deployment preparation and submission verification

**Deliverables:** Cloud Run container/deploy guide, production secrets/config, live deployment check, repository cleanup/size/branch/URL verification, LinkedIn copy/post, dashboard checklist.

**Acceptance:** app is verified at its actual Cloud Run URL; public clone URL ends `.git`; exactly one submitted branch; initial repo size is below 10 MB; public LinkedIn post and dashboard status are verified. External publishing requires user authorization where not already given.

**Stop external actions if:** cloud/account access, cost/permission, repository ownership/publication, LinkedIn authorization, or submission approval is unavailable. Complete local deployment/repository preparation first. Never claim success based on configuration files alone.
