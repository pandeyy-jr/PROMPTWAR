# Submission Readiness

**Status as of 29 October 2026:** local source and GitHub publication are ready; live Supabase and Cloud Run evidence is still required before submission.

| Requirement | Status | Evidence or blocker |
|---|---|---|
| Public GitHub repository | Complete | `https://github.com/pandeyy-jr/PROMPTWAR` |
| Clone URL ends in `.git` | Complete | `https://github.com/pandeyy-jr/PROMPTWAR.git` |
| Exactly one branch | Complete at last verification | Remote `main` was the only branch. Recheck immediately before submission. |
| Initial repository below 10 MB | Complete at last verification | 55 tracked files and 464,997 bytes of tree blobs. |
| Local code verification | Complete | `npm run verify` passed on 29 October 2026. |
| Three persistent features | Blocked | Requires live worker/manager journeys against Supabase. |
| Factory and college workflows | Blocked | Requires live acceptance journeys for both site configurations. |
| RLS and role isolation | Blocked | Requires authenticated multi-user database tests. |
| Accessibility evidence | Incomplete | Formal keyboard, mobile, focus, and contrast review remains. |
| Cloud Run deployment | Blocked | Docker, GCP project access, billing, and `gcloud` are unavailable. |
| Public LinkedIn post | Pending | Publish only after real deployment/features are verified. |
| Submission dashboard | Pending | Requires all preceding evidence and explicit submission action. |

## Judge demo sequence

1. Show a confirmed worker at a factory site viewing a shift and scheduled wage estimate.
2. Check in/out, refresh, and show persisted attendance.
3. Submit a safety report and show its worker-visible status.
4. Sign in as the authorized manager, show the site-scoped report and Fairness Engine prompt, then update its status.
5. Return to the worker view and show the status history.
6. Repeat the core workflow with a college site.

Do not use real worker data in public demonstrations. See [Phase 2 report](PHASE_2_REPORT.md) for the current integration blockers.
