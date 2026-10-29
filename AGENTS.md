# FairShift Agent Instructions

## Product and non-negotiable requirements

FairShift is a decent-work platform aligned with UN SDG 8 for workers and employer/administrator teams. Factories and colleges are required industry configurations. The finished product must provide at least three genuinely working, persistent features; accessible worker and employer/admin interfaces; secure role-based access; meaningful tests; and a verified Google Cloud Run deployment. Submission also requires a public GitHub repository whose clone URL ends in `.git`, exactly one branch, initial repository size strictly below 10 MB, and a truthful public LinkedIn project post. See [the project specification](docs/PROJECT_SPEC.md) and [submission checklist](docs/DEMO_AND_SUBMISSION.md).

## Locked architecture

- Next.js App Router and TypeScript.
- Supabase Auth and Supabase PostgreSQL with version-controlled SQL migrations and Row Level Security (RLS).
- Cloud Run is the mandatory final host.
- Keep the application simple and deployable as one service. Do not substitute Firebase, SQLite-only production storage, Vercel, or Netlify without documenting a genuine blocker and obtaining approval.
- Never commit credentials. Never expose a Supabase service-role key to browser code.

## Before changing code

1. Inspect the existing files, project state, and applicable instructions before editing. Preserve unrelated user work.
2. Read the relevant specification before modifying that area: [architecture](docs/ARCHITECTURE.md), [database](docs/DATABASE_SCHEMA.md), [security](docs/SECURITY.md), [API contracts](docs/API_CONTRACTS.md), [UX/accessibility](docs/UX_ACCESSIBILITY.md), [Fairness Engine](docs/FAIRNESS_ENGINE.md), [QA](docs/TESTING_QA.md), or [deployment](docs/DEPLOYMENT.md).
3. Check [decisions](docs/DECISIONS.md) and [implementation gates](docs/IMPLEMENTATION_PLAN.md). Continue through stages explicitly authorized by the current user instruction. At each gate, record results and proceed when locally verifiable acceptance criteria pass; stop only for a genuine blocker or an action requiring explicit approval (for example, destructive changes, paid services, significant architecture changes, credential exposure, external publication, or submission attempts).
4. Implement incrementally. Prefer existing platform capabilities and avoid dependencies that do not materially improve the working product.

## Code conventions

- Use strict TypeScript, descriptive names, small cohesive modules, and explicit domain types.
- Keep validation and authorization on trusted server paths. Keep UI components focused on presentation and user interaction.
- Put schema changes in ordered SQL migrations; do not rely on manual-only database edits.
- Use accessible semantic HTML, labeled controls, visible focus, clear status messages, and responsive layouts. A control that looks actionable must work.
- Keep industry-specific behavior configurable; share common workflow logic between factories and colleges.

## Security and responsible decision support

- Enforce authorization in server-side code and RLS; UI hiding is not access control.
- Workers may only access their own private records. Workers cannot grant themselves elevated roles.
- Validate and constrain all untrusted input. Avoid logging credentials, tokens, private wage data, or sensitive complaint details.
- Treat Fairness Engine alerts as explainable prompts for human review. Never create opaque worker rankings or automated punitive employment decisions. Do not invent statutory limits or claim an untrained system is machine learning.
- For the complete threat model and privacy rules, follow [SECURITY.md](docs/SECURITY.md) and [FAIRNESS_ENGINE.md](docs/FAIRNESS_ENGINE.md).

## Verification and claims

- Run the relevant lint, type, test, database/RLS, and production-build checks defined by [TESTING_QA.md](docs/TESTING_QA.md) before claiming a change is verified. Run only checks appropriate to the approved stage and report commands and results accurately.
- Do not fabricate test results, live database connectivity, deployment status, repository state, screenshots, URLs, or user feedback.
- Do not add fake workflows, placeholder controls presented as functional, hard-coded secrets, fake administrator accounts, or misleading AI/ML claims.
- If a required check is blocked, state the exact blocker and what remains unverified.
- Do not treat missing external credentials as a reason to abandon independent local work; complete code, migrations, tests, and preparation that can be verified safely, then identify the exact external setup still required.

## Documentation maintenance

Keep relevant documentation accurate when behavior or architecture changes. Mark planned work as planned. Update setup, API, database, security, UX, testing, deployment, industry, and submission documentation when affected. Resolve or document conflicts with the precedence in [DECISIONS.md](docs/DECISIONS.md); ask for approval before any significant architectural deviation.
