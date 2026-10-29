# Demo and Hackathon Submission

Status: the local implementation and public GitHub repository are verified, but no live Supabase integration, Cloud Run URL, LinkedIn post, or submission dashboard status has been verified. See [submission readiness](SUBMISSION_READINESS.md) for the current evidence.

## End-to-end demonstration plan

1. Sign in as a worker and identify the active factory or college site.
2. Review an assigned shift with its explicit wage rate, currency, hours, and estimated calculation.
3. Check in and out; refresh and show the persisted attendance and wage details.
4. Submit a safety report and show its confirmation and worker-visible status.
5. Sign in as an authorized employer/admin; review the relevant persisted records, inspect a transparent discrepancy/attendance/safety alert, and update report status with a traceable follow-up.
6. Return to the worker view and show the update. Repeat with the other industry configuration.

Use seeded demo data only in a clearly marked non-production demo environment. Do not use real worker wage or complaint data in public screenshots. Do not claim a workflow that has not been implemented and verified.

## Official requirement verification

| Requirement | Evidence required before marking complete |
|---|---|
| At least three genuinely working features | End-to-end evidence of three persistent workflows, not screenshots or static cards |
| Worker and employer/admin interfaces | Role-separated working journeys and authorization tests |
| Two or more industries | Factory and college acceptance scenarios both pass |
| SDG 8 relevance and real-world impact | Product explanation tied to decent work and actual transparent/safety workflows |
| Inclusion and accessibility | Mobile, keyboard, focus, contrast, labels/statuses, and readability checks recorded |
| Secure, clean, testable implementation | Lint/type/test/build results plus RLS and role-isolation evidence |
| Google Cloud Run | Actual live service URL and successful smoke/critical-journey verification |
| Public GitHub repository | Public repository checked; clone URL ends exactly in `.git` |
| Exactly one branch | Remote branch listing at submission time shows exactly one branch |
| Initial size strictly below 10 MB | Measured submitted repository contents/history according to submission guide; value is `< 10 MB` |
| Public LinkedIn post | Actual public post URL and visibility verified; content describes only the real solution |
| Submission dashboard | Final status inspected and recorded; do not infer from local completion |

## Repository checks

Before publishing, review tracked and untracked files, remove no user data without authorization, exclude secrets, `.env.local`, build output, dependencies, caches, database dumps, and unnecessary binaries. Verify public access, clone via the URL ending in `.git`, branch count is exactly one, and initial size is strictly below 10 MB. Do not initialize publishing or push before contents and constraints have been reviewed.

Because judging is reported to be fully AI-based, keep the README, Phase report, task graph, commands, and limitations self-contained and machine-readable. A reviewer should be able to verify what is real without a live human walkthrough.

## LinkedIn project post

Prepare a concise, truthful explanation of the problem, implemented features, factory/college scenarios, safeguards, and what was learned. Do not claim impact metrics, customer adoption, live deployment, or AI/ML behavior without evidence. The post must be public. Publishing is an external action and must follow user authorization and the applicable submission process.

## Final checklist

- [ ] Acceptance evidence is complete and current.
- [ ] Cloud Run URL is live and verified.
- [ ] Public repository clone URL ends in `.git`.
- [ ] Exactly one repository branch exists.
- [ ] Initial repository is strictly below 10 MB.
- [ ] No secrets or generated artifacts are published.
- [ ] Public LinkedIn post is live and accurately describes the product.
- [ ] Submission dashboard status is checked and recorded.

Related: [implementation stages](IMPLEMENTATION_PLAN.md), [deployment](DEPLOYMENT.md), [QA](TESTING_QA.md).
