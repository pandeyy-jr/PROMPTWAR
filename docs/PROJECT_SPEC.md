# FairShift Product Specification

Status: product requirements. Local app routes implement authentication entry points, worker and management workflows, migrations/RLS source, and fairness review prompts. The hosted Supabase project and Cloud Run service are not configured, so persisted end-to-end behavior, RLS enforcement, and deployment remain unverified.

## Purpose and users

FairShift supports decent work and economic growth (UN SDG 8) by making shifts, attendance, wage calculations, and safety follow-up easier to understand. Primary users are workers and employer/administrator staff. Workflows must serve both factories and colleges; see [industry scenarios](INDUSTRY_USE_CASES.md).

Workers need accessible personal records and a trustworthy reporting channel. Employers/admins need tools to coordinate shifts, review records, and respond to hazards without unnecessary exposure to private data.

## MVP functional requirements

1. **Identity and roles:** Supabase Auth sign-in/sign-out; server-verified worker or employer/admin role; safe profile provisioning; no self-promotion. Details: [SECURITY.md](SECURITY.md).
2. **Worker portal:** authenticated workers see only their own profile, shifts, attendance, wage details, and safety reports. They can view shifts, check in/out under the configured workflow, submit a hazard with severity and description, and see report status updates.
3. **Management portal:** authorized employer/admin users manage shifts and attendance; review persisted wage summaries and possible discrepancies; filter and update safety reports with status history; see workforce summaries from database records.
4. **Transparent wages:** show the applicable configured rate, recorded hours, calculation, currency, and estimate/record status. Never imply a number is a legally mandated rate unless law has been reviewed and configured by an accountable party.
5. **Fairness Engine:** deterministic, explainable alerts for potential wage errors, overtime, inconsistent attendance, configured excessive-hours/repeated-shift indicators, and unresolved high-severity safety incidents. Alerts support human review only; see [FAIRNESS_ENGINE.md](FAIRNESS_ENGINE.md).
6. **Persistence and authorization:** important records survive refresh and are protected by server-side authorization and PostgreSQL RLS.
7. **Industry configuration:** the same core workflows work for factories and colleges with meaningful site/shift/hazard examples.

At least three features must be end-to-end functional, persisted, and verified before calling the hackathon acceptance criterion complete. A screen or static mockup alone does not count.

## Non-functional requirements

- Mobile-first, usable on basic smartphones and by people with limited technical literacy.
- Keyboard operable, visible focus, meaningful labels and messages, readable contrast, and responsive data views. See [UX_ACCESSIBILITY.md](UX_ACCESSIBILITY.md).
- Strict TypeScript, clean and understandable modules, input validation, minimal dependency set, and meaningful automated tests.
- No secrets in source control or browser bundles. RLS and tested role boundaries protect private records.
- Deployable to Google Cloud Run with production configuration supplied securely.
- Efficient enough for a hackathon MVP; no microservices or unnecessary AI infrastructure.

## MVP boundaries

In scope: authenticated roles, shifts, attendance, configurable wage calculations, safety reporting and status tracking, workforce summaries, explainable rule alerts, factories and colleges, and deployment/submission verification.

Out of scope unless separately approved: payroll disbursement, legal/compliance certification, biometric tracking, worker ranking, automated discipline, predictive employee scoring, anonymous two-way case management without a privacy model, native mobile apps, and trained ML claims.

## Measurable acceptance criteria

- A worker can complete the supported shift, attendance, wage-view, and report journeys; their persisted results remain after refresh.
- A second worker cannot read or mutate the first worker's private records, including through direct server/API/database access.
- A worker cannot change their own role or create an administrator.
- Authorized management can review actual persisted records and update a safety report with traceable status.
- Wage arithmetic and each alert's rule/evidence/reason/severity/follow-up match deterministic tests.
- Factory and college scenarios each pass the same core workflow acceptance tests with industry-appropriate configuration.
- Critical forms and navigation pass keyboard and mobile checks; relevant accessibility checks and test gates pass.
- Cloud Run deployment is live and verified before claiming deployment complete.
- Public GitHub clone URL ends in `.git`, repository has exactly one branch, and initial repository size is strictly below 10 MB; a public LinkedIn project post is verified.

## References

- [Architecture](ARCHITECTURE.md)
- [API contracts](API_CONTRACTS.md)
- [Testing and QA](TESTING_QA.md)
- [Demo and submission](DEMO_AND_SUBMISSION.md)
