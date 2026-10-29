# Database Schema Specification

Status: four versioned SQL migrations are implemented under `supabase/migrations/`; none has been applied because no Supabase project or local database runtime is connected. This describes intended source schema, not a live database.

> The implementation uses an explicit `memberships` table (user, organization, optional manager site scope, role, active flag). Membership writes are intentionally unavailable to ordinary users and must be provisioned by a trusted operator.

## Entities and relationships

Use UUID primary keys, `timestamptz` timestamps in UTC, foreign keys, and constraints appropriate to each field. Add `created_at` and `updated_at` where lifecycle tracking is useful.

| Entity | Key fields and relationships | Purpose / constraints |
|---|---|---|
| `profiles` | `id` references `auth.users.id`; display name | Role and scope are represented by separate `memberships` rows; signup metadata never sets either. |
| `organizations` | UUID id; name; active state | Tenant/workplace owner. |
| `sites` | organization id; name; `industry` (`factory`, `college`); timezone/config | Organization has sites. Industry configuration is constrained to supported values; timezone is explicit. |
| `shifts` | organization/site id; assigned worker; start/end; title; rate snapshot; currency; attendance state | Source MVP caps shifts at 24 hours and rate at 100,000,000 minor units/hour; schedule timestamps are UTC; indexes by site/start and worker/start. |
| `attendance_events` | shift id; actor profile id; action; timestamp | Unique check-in and check-out per shift; atomic attendance RPC enforces assigned worker and valid state transition. No shift-time eligibility window is currently enforced. |
| `wage_rules` | site/organization id; effective dates; currency; rate basis and amount; optional overtime multiplier/threshold explicitly configured | Positive rates, valid effective period, currency required. Avoid legal claims. Changes must be attributable and versioned/effective-dated. |
| `wage_records` (if persisted separately) | shift/attendance id; worker id; rule snapshot/version; regular/overtime hours; total; calculation status | Derived values must be reproducible; preserve the rate used for audit. Do not accept client-supplied totals as authoritative. |
| `safety_reports` | site/org id; reporter profile id; category; reporter-selected severity (`low`, `medium`, `high`, `critical`); description; current status; timestamps | Reporter owns worker-facing record. Severity is a triage estimate, not a medical or legal classification. Limit private content access to reporter and authorized management. |
| `safety_events` | report id; actor profile id; old/new status; timestamp | Append-only worker-visible status history; management notes live separately in `private.safety_review_notes` and can only be read using a manager-scoped RPC. |

The MVP stores a wage rate snapshot on each shift and computes a scheduled gross estimate in application code. There is no effective-dated wage-rule table, overtime calculation, deduction model, or persisted payroll ledger yet. The estimate is not a payroll promise or compliance determination. Supported currency codes are explicitly constrained by the migration.

Exact fields may be adapted to implementation needs while preserving ownership, auditability, constraints, and acceptance criteria. Avoid tables with no workflow justification.

## Indexes and constraints

- Index all foreign keys used in policy predicates or frequent joins (organization/site, shift, profile/reporter, reviewer).
- Index shifts by `(site_id, start_at)` and assigned worker/time; safety reports by `(site_id, status, created_at)`; attendance by `(worker_id, check_in_at)`.
- Add checks for positive configured rates, valid enum values, start/end ordering, and nonnegative duration/amounts.
- Use unique constraints to prevent duplicate profile links and duplicate attendance rows for the selected shift/worker key.
- Use database constraints rather than client-only validation for invariant rules where possible.

## Ownership and RLS requirements

- Enable RLS on every table exposed to an application role; grant only required operations.
- Worker `profiles`: worker can select their own profile and update only explicitly allowed non-role fields. Role, org, and site membership cannot be changed by the worker.
- Worker shifts/attendance/wage records: select only their own assigned records; write only permitted attendance fields for their own eligible shift. No worker can update another worker's records.
- Worker safety reports: insert with `reporter_id = auth.uid()`; read own report and status; cannot change reviewer, ownership, or management status.
- Employer/admin policies must verify organization/site membership and permitted role. Cross-tenant access is denied by default.
- Role and membership changes occur only through trusted admin pathways with auditability. Avoid policy recursion and unsafe `SECURITY DEFINER` functions; pin `search_path` and restrict execute grants if such functions are necessary.
- RLS must use verified `auth.uid()` and trusted role/membership data; never trust a role from request JSON or user-editable metadata.

## Required database/security tests

1. Anonymous sessions cannot read or mutate protected rows.
2. Worker A can read permitted own rows but cannot select, insert as, update, or delete Worker B's shift, attendance, wage, or safety data.
3. Worker cannot change own `role`, organization, or site membership or grant another user admin access.
4. Management user can access only authorized organization/site records; unauthorized tenant is denied.
5. Safety status changes create attributable history and worker visibility reflects only permitted fields.
6. Invalid shift times, duplicate attendance, negative rates, invalid currency/industry/status, and inconsistent references fail constraints.

Related: [security threat model](SECURITY.md) and [testing gates](TESTING_QA.md).
