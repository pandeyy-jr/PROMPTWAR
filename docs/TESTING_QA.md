# Testing and Release Gates

Status: Vitest rules tests and the standard `lint`, `typecheck`, and production `build` checks are implemented. On 28 October 2026, `npm run verify` passed after fixing a malformed shift authorization expression, a report query for a nonexistent event field, and an incorrect fairness-test assertion. It ran lint, typecheck, 4 Vitest tests, and the production build. The unit suite covers factory/college thresholds, exact long-shift/rest boundaries, high-severity safety prompting, invalid inputs, and wage arithmetic. The standalone production server returned `200` for `/` and `/api/health`. Real database/RLS and browser end-to-end tests remain pending because no connected project or local database runtime is available. A successful build does not establish authorization correctness.

## Phase 1 recorded checks

On 27 October 2026 the following ran successfully on the current workspace:

- `npm run lint`
- `npm run typecheck`
- `npm run build` (Next.js 16.4.3, static `/`, `/_not-found`, and `/api/health`)
- `GET /api/health` against the production server returned `200` with `{"status":"ok","service":"fairshift"}`
- Public-config validation was exercised for a valid localhost URL, a missing URL, and a service-role-shaped key; each behaved as intended
- A temporary client component confirmed that the public Supabase URL is inlined into the browser bundle; the temporary route was removed before the final build

These checks prove the foundation, not authentication, RLS, persistence, or user journeys. See [PHASE_1_REPORT.md](PHASE_1_REPORT.md).

## Test layers

- **Unit:** wage arithmetic, validation, attendance transitions, status transitions, industry configuration, and each Fairness Engine rule.
- **Integration:** server actions with authenticated role contexts, Supabase queries, persisted reads after refresh, transaction/audit behavior, and safe error mapping.
- **Database/RLS:** real or local Supabase/PostgreSQL policy tests using anonymous, worker A, worker B, and management users across same and different organizations/sites.
- **End-to-end:** worker and management journeys on mobile-sized and desktop viewports; use seeded fixtures only in non-production test environments.
- **Accessibility/manual:** keyboard-only journeys, visible focus, form labels/errors/statuses, contrast, responsive views, touch usability, and reduced-motion behavior.

## Critical test cases

- Wage calculations for zero/invalid/negative hours, rate precision, currency, rounding, overtime boundaries, rule effective-date changes, and missing rules.
- Attendance duplicate check-in, checkout without check-in, checkout before check-in, repeated actions, wrong worker, wrong shift/site, timezone/daylight boundaries, and persistence after refresh.
- Safety report required fields, length limits, invalid severity, unauthorized site, reporter ownership, worker read visibility, permitted status transitions, status history attribution, and rejection of worker status escalation.
- RLS: anonymous denial; worker A cannot read/change/delete worker B's records; worker cannot update role/org/site; management cannot cross tenant scope; unauthorized operations do not leak record existence.
- Fairness alert boundaries and complete evidence/rule/severity/reason/follow-up explanation; verify alerts do not cause employment actions.
- Safety prompt triggers only for unresolved high/critical reports; low/medium reports do not generate the high-severity safety alert.
- Both factory and college configurations pass shared workflow tests with suitable shift and hazard fixtures.
- Empty, loading, validation, success, permission-denied, and service-error UX states remain usable and do not expose sensitive details.

## Known local commands

```bash
npm ci
npm run lint
npm run typecheck
npm run check
npm run build
npm run verify
```

Add meaningful test scripts and database/browser tooling only when implementation stage requires them. Pin deterministic fixtures and avoid tests that silently skip critical security assertions. For each release report the exact commands, exit status, failures, environment dependencies, and tests that could not run. A build passing is not evidence that authentication, RLS, or user journeys work.

## Release gates

Do not advance a stage with a known critical authorization failure, data-loss issue, incorrect wage calculation, or unsafe safety-report disclosure. Resolve it or clearly stop and obtain user direction. See [implementation stages](IMPLEMENTATION_PLAN.md), [security](SECURITY.md), and [accessibility](UX_ACCESSIBILITY.md).
