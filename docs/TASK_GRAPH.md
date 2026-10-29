# FairShift Master Task Graph

Status (29 October 2026): Phases 0–1 are verified. Local implementation for Phases 2–5 and deployment preparation is present. The public GitHub repository is verified on `main`. A static migration/security review resolved two least-privilege workflow defects with a forward-only migration. Supabase/RLS and end-to-end behavior are not verified; Cloud Run, LinkedIn, and submission remain incomplete. Hosted/external steps need Supabase and GCP account access.

## Status legend

| Status | Meaning |
|---|---|
| `Verified complete` | Acceptance criteria met and evidence recorded. |
| `Implemented, awaiting verification` | Code/schema exists; required checks have not passed yet. |
| `In progress` | Work has started and remains actionable. |
| `Pending` | Authorized but not started; dependencies may remain. |
| `Blocked` | A specific external account, credential, or user decision prevents that task. |
| `Not started` | Not yet actionable or not yet designed in detail. |

## Owners

- **Orchestrator:** architecture, integration, final review, gate reports.
- **Specialist Aâ€“E:** read-only audits (repository/architecture, security, QA, accessibility/product, deployment/submission).
- **Implementation:** primary orchestrator (no parallel file edits were delegated in Phase 1).
- **Reviewer:** independent read-only review of the final diff.

## Dependency-aware graph

```text
P0 audits â”€â”€> P1 foundation â”€â”€> Gate 1 â”€â”€> P2 auth/RLS â”€â”€> Gate 2
                                      â””â”€â”€> P3 workflows â”€â”€> Gate 3
                                                         â””â”€â”€> P4 fairness/industries â”€â”€> Gate 4
                                                                                    â””â”€â”€> P5 hardening â”€â”€> Gate 5
                                                                                                       â””â”€â”€> P6 deploy/submit â”€â”€> Gate 6
```

Phase 2 and Phase 3 can overlap only after shared types, membership model, and migration ownership are agreed. Phase 6 cannot begin until Gates 2â€“5 are honestly complete.

## Phase 0 â€” Repository and documentation audit

| ID | Task | Owner | Depends on | Acceptance / verification | Status |
|---|---|---|---|---|---|
| P0-01 | Inventory workspace and verify scaffold | Specialist A | â€” | Actual files, routes, dependencies, and build artifacts identified | Done |
| P0-02 | Read all project instructions and specs | Orchestrator | â€” | 13 docs + `AGENTS.md` + `README.md` read; conflicts recorded | Done |
| P0-03 | Independent architecture audit | Specialist A | P0-01 | Findings cite file paths; no edits | Done |
| P0-04 | Security/Supabase review | Specialist B | P0-02 | Trust boundaries, env, cookies, RLS risks identified | Done |
| P0-05 | QA/testing review | Specialist C | P0-01 | Commands, coverage gaps, test-stack recommendation | Done |
| P0-06 | Accessibility/product review | Specialist D | P0-02 | Landing-page defects and highest-value journey identified | Done |
| P0-07 | Deployment/submission review | Specialist E | P0-02 | Cloud Run, env, repository-size, and evidence gaps identified | Done |
| P0-08 | Reconcile findings and fix the plan | Orchestrator | P0-03â€¦P0-07 | Accepted/rejected recommendations recorded in Phase 1 report | Done |

## Phase 1 â€” Foundation and production build

| ID | Task | Owner | Depends on | Acceptance / verification | Status |
|---|---|---|---|---|---|
| P1-01 | Fix browser public-env inlining | Implementation | P0-08 | Literal `NEXT_PUBLIC_*` reads; temporary client build contained the URL; temp page removed | Done |
| P1-02 | Validate public Supabase configuration | Implementation | P1-01 | Missing/invalid/non-HTTPS URL and service-role key cases throw safe errors; valid localhost case returns config | Done |
| P1-03 | Harden Supabase clients | Implementation | P1-01 | Browser singleton; server-only `next/headers` boundary; production `Secure`/`lax` cookies; build passes | Done |
| P1-04 | Add safe security headers | Implementation | P0-08 | `nosniff`, `DENY`, referrer, permissions, production HSTS; `poweredByHeader` disabled; live headers verified | Done |
| P1-05 | Add liveness endpoint | Implementation | P0-08 | `GET /api/health` returns 200 JSON; no DB/secrets; verified against `npm start` | Done |
| P1-06 | Improve shell accessibility | Implementation | P0-06 | Skip link, correct landmarks, focus styles, larger type/contrast, named hero illustration with decorative drawing details hidden; structural HTML checks pass | Done |
| P1-07 | Runtime and repository hygiene | Implementation | P0-08 | `engines` >=20.9, `.nvmrc` 22, Supabase temp ignores, unused template assets removed, lockfile consistent | Done |
| P1-08 | Update documentation and evidence | Orchestrator | P1-01â€¦P1-07 | README, deployment/env guidance, Phase 1 report, task graph updated | Done |
| P1-09 | Run Phase 1 verification | Orchestrator | P1-01â€¦P1-07 | `lint`, `typecheck`, `build`, health check, env checks, client-inline check; results recorded | Done |
| P1-10 | Independent final review of Phase 1 state | Reviewer | P1-09 | Read-only review; findings and limits documented in the Phase 1 report | Done |

> P1-10 is complete. The report records review findings and verification limits. The subsequent execution directive authorizes Phases 2â€“6.

## Phase 2 â€” Authentication and authorization (local implementation present; hosted tests blocked)

| ID | Task | Owner | Depends on | Acceptance / verification | Status |
|---|---|---|---|---|---|
| P2-01 | Configure hosted Supabase project and local stack | Orchestrator + user | Gate 1, credentials | Project URL, publishable key, redirect URLs, and local DB test runtime available; no secret committed | Blocked |
| P2-02 | Design membership/role model | Orchestrator | Gate 1 | Multi-site memberships; worker-only self-signup; privileged roles provisioned out of band | Implemented |
| P2-03 | Auth migrations, profile provisioning, RLS | Implementation | P2-02 | Ordered migrations, safe profile trigger, no client membership writes, site-scoped policies | Implemented, unverified against Postgres |
| P2-04 | Auth callback and session refresh | Implementation | P2-02 | Next.js 16 `proxy.ts` refreshes SSR cookies; protected data uses verified identity | Implemented |
| P2-05 | Route guards and role-aware shells | Implementation | P2-03, P2-04 | Membership checked server-side; unauthorized users sent to pending-access page | Implemented |
| P2-06 | Sign-in/sign-out UX and errors | Implementation | P2-04 | Accessible forms, generic errors, sign-out action | Implemented |
| P2-07 | Auth/RLS test suite | Implementation | P2-03â€¦P2-06 | Real anonymous, cross-tenant, self-promotion and expiry tests require Supabase/Postgres, unavailable here | Blocked |
| **G2** | **Gate 2 review** | Orchestrator | P2-07 | Offline implementation exists; hosted auth/RLS evidence remains blocked | Implemented, externally unverified |

## Phase 3 â€” Core workforce workflows (local implementation present; DB tests blocked)

| ID | Task | Owner | Depends on | Acceptance / verification | Status |
|---|---|---|---|---|---|
| P3-01 | Shift schema and management operations | Implementation | Gate 2 offline acceptance | Constraints, site/worker scope, indexes, manager-only operations | Implemented, DB unverified |
| P3-02 | Worker shift view | Implementation | P3-01 | Own shifts, rate, scheduled estimate and state | Implemented, DB unverified |
| P3-03 | Attendance state machine | Implementation | P3-01 | Atomic check-in/out transitions reject duplicates and wrong worker | Implemented, DB unverified |
| P3-04 | Wage rules and transparent calculation | Implementation | P3-01, P3-03 | Integer minor units, reproducible estimate; payroll/overtime not claimed | Implemented, unit tested |
| P3-05 | Safety reporting and status history | Implementation | P3-01 | Reporter ownership, bounded input, append-only events, worker-visible status; severity grant added forward-only | Implemented, DB unverified |
| P3-06 | Management review dashboards | Implementation | P3-03â€¦P3-05 | Site-scoped roster and report transitions with actor/time | Implemented, DB unverified |
| P3-07 | Persistence and authorization integration tests | Implementation | P3-02â€¦P3-06 | Real journeys require unavailable Supabase/Postgres | Blocked |
| **G3** | **Gate 3 review** | Orchestrator | P3-07 | Evidence reviewed; continue when offline acceptance passes and document external limits | Pending |

## Phase 4 â€” Fairness Engine and industry configurations (local implementation present)

| ID | Task | Owner | Depends on | Acceptance / verification | Status |
|---|---|---|---|---|---|
| P4-01 | Deterministic rule engine and config | Implementation | Gate 3 offline acceptance | Long shift, rest gap, hazard thresholds are explicit review settings, not legal claims | Implemented |
| P4-02 | Alert contract and review UI | Implementation | P4-01 | Reason, evidence, severity and follow-up shown to management; no worker score | Implemented |
| P4-03 | Factory and college configurations | Implementation | P4-01 | Configured long-shift/rest thresholds differ by industry | Implemented |
| P4-04 | Boundary and explanation tests | Implementation | P4-01â€¦P4-03 | Unit tests cover config distinction, hazard/rest prompts and wage rounding | Implemented, unit tested |
| **G4** | **Gate 4 review** | Orchestrator | P4-04 | Rules and industry modes exist; unit tests passed in `npm run verify` | Locally verified |

## Phase 5 â€” Security, accessibility, and testing (local baseline present; review pending)

| ID | Task | Owner | Depends on | Acceptance / verification | Status |
|---|---|---|---|---|---|
| P5-01 | Security review and hardening | Reviewer + Implementation | Gate 4 | Static security review and production dependency audit complete; live RLS/session/rate-limit checks remain blocked | In progress |
| P5-02 | Accessibility audit and fixes | Reviewer + Implementation | Gate 4 | Keyboard, focus, contrast, labels, live regions, mobile/reflow, reduced motion verified | Pending |
| P5-03 | Full test layers | Implementation | Gate 4 | Unit, integration, real/local RLS, and critical E2E journeys pass or external block is explicit | Pending |
| P5-04 | CI and dependency review | Implementation | P5-03 | CI runs lint/typecheck/test/build from lockfile | Implemented |
| P5-05 | Production build verification | Orchestrator | P5-01â€¦P5-04 | Local verification recorded; hosted integration remains blocked | In progress |
| **G5** | **Gate 5 review** | Orchestrator | P5-05 | Evidence reviewed; continue into safe deployment preparation; external deploy remains gated | Pending |

## Phase 6 â€” Deployment and submission (container preparation implemented; external actions blocked)

| ID | Task | Owner | Depends on | Acceptance / verification | Status |
|---|---|---|---|---|---|
| P6-01 | Standalone container and ignores | Implementation | Gate 5 | Multi-stage Dockerfile, standalone output, `.dockerignore`, non-root port 8080 | Implemented; Docker build unavailable |
| P6-02 | Deploy to Cloud Run | Orchestrator + user | P6-01, GCP access/approval | Live service URL; secrets least-privilege; HSTS/HTTPS; logs safe | Blocked |
| P6-03 | Production Supabase setup | Orchestrator + user | P2-01, P6-02 | Migrations applied; redirect URLs match host; RLS verified in production-like data | Blocked |
| P6-04 | Live smoke and critical journeys | Orchestrator | P6-02, P6-03 | Health, auth, worker and manager journeys verified at the real URL | Pending |
| P6-05 | GitHub repository verification | Orchestrator + user | P6-04, explicit publishing authorization | Public clone URL ends `.git`; one remote `main` branch and 464,997-byte tree verified | Complete |
| P6-06 | Demo, README, LinkedIn post | Orchestrator + user | P6-04, LinkedIn publication authorization | Truthful public post and reviewer-ready README/demo verified | Blocked |
| P6-07 | Submission dashboard | User | P6-05, P6-06, explicit submission-attempt authorization | Final status inspected and recorded; no inference from local completion | Blocked |
| **G6** | **Gate 6 review** | Orchestrator | P6-07 | All submission evidence verified; no submission attempt without explicit authorization | Pending |

## Critical path and current blockers

1. **Supabase project access (P2-01):** live Auth/RLS verification needs a project URL, publishable key, redirect configuration, and local DB tooling or a hosted test project. The official CLI currently has no access token or linked project; see [Phase 2 report](PHASE_2_REPORT.md).
2. **Cloud Run/GCP access (P6-02):** mandatory host; deployment cannot be claimed from a Dockerfile alone. Current environment lacks Docker and `gcloud`.
3. **LinkedIn authorization (P6-06):** public project publication remains pending until live feature/deployment claims are verified.
4. **Cloud Run/GCP tooling:** Docker and `gcloud` are unavailable in the current environment.

## AI-review readiness (project constraint)

The user reports that judging is fully AI-based. To support that:

- Every phase report must be self-contained: commands, results, exact file paths, and honest limitations.
- The README must explain what is real versus planned without requiring a human walkthrough.
- The final deployed URL, repository, and tests must be independently checkable.
- No claim may depend on verbal context that is absent from the repository.

## Related documents

- [Phase 1 report](PHASE_1_REPORT.md)
- [Implementation plan](IMPLEMENTATION_PLAN.md)
- [Testing and QA](TESTING_QA.md)
- [Security](SECURITY.md)
- [Deployment](DEPLOYMENT.md)
- [Demo and submission](DEMO_AND_SUBMISSION.md)
