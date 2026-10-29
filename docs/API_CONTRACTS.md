# Application Data and API Contracts

Status: contracts for implemented server actions and server-rendered workflows. The only HTTP route handler is the shallow `GET /api/health`; authentication and workforce operations use validated Next.js server actions and session-scoped Supabase queries/RPCs. These paths have not been exercised against a connected Supabase project.

## Contract conventions

- Parse and validate all input on the server before database operations. Treat all browser-provided IDs, roles, organization IDs, totals, and statuses as untrusted.
- Resolve the authenticated user from the Supabase session on the server. Reject unauthenticated operations with `UNAUTHENTICATED`; reject disallowed role/ownership with `FORBIDDEN` without leaking record existence.
- Use ISO 8601 timestamps with explicit timezone; persist instants as UTC. Use explicit currency codes and decimal-safe arithmetic for money; never rely on binary floating point for authoritative wage totals.
- Return only fields needed by the caller. Worker results must be scoped to the authenticated worker; management reads must be scoped to authorized organization/site.
- Use stable status enums, documented validation messages, and idempotency or state checks for repeated attendance mutations.
- Paginate potentially large management lists with a bounded page size and deterministic ordering. Avoid unbounded workforce/report reads.

## Response and error shape

Server actions may use this typed result convention:

```ts
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; fieldErrors?: Record<string, string[]> } };
```

Expected codes include `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, and `INTERNAL`. Messages must be safe to display. Do not return raw SQL/provider errors or secret values.

## Core workflow contracts

### Liveness (implemented)

`GET /api/health` returns `200` with `{"status":"ok","service":"fairshift"}` and `Cache-Control: no-store`. It does not authenticate, query the database, or expose configuration. It is a process-liveness check, not a readiness check.

### View own shifts (implemented)

`getMyShifts({ from?, to?, cursor?, limit? })` requires an authenticated worker; server derives worker identity from session and returns only that worker's assigned shifts, pay terms, and attendance state. Caller may not supply a target worker ID.

### Attendance check-in/check-out (implemented)

`recordAttendance({ shiftId, action, occurredAt? })`, where action is `check_in` or `check_out`. Server verifies session, worker assignment, shift state/time policy, and current attendance state. The server derives worker ID and validates timestamps; client-supplied totals are ignored. Conflicting repeated transitions return `CONFLICT`.

### Submit a safety report (implemented)

`submitSafetyReport({ siteId, category, severity, description })`. Implemented by a validated server action. Requires authenticated worker and authorized site relationship. Validate bounded description and enum fields; derive reporter ID and initial status server-side. Severity is reporter-selected triage, not medical/legal assessment. State clearly who may review it.

### Update report status (management, implemented)

`updateSafetyReportStatus({ reportId, status, note? })`. Requires authorized employer/admin role and site scope. Validate legal state transitions, append an actor/time status event atomically, and return minimal updated status. Workers cannot call this operation to change management status.

### Wage preview (scheduled estimate implemented)

`calculateShiftPay({ shiftId })` uses server-authorized shift/attendance data and the effective configured wage rule. Return currency, rate/rule reference, regular/overtime hours, estimated total, and calculation explanation. Mark estimate versus finalized record explicitly. Ignore any client-supplied rate or total.

## Authorization matrix

| Operation | Worker | Employer/admin |
|---|---|---|
| Read personal shifts/attendance/pay | Own records only | Authorized site/organization scope as needed |
| Record attendance | Own assigned eligible shift | Management changes only if explicitly audited and specified |
| Submit safety report | Own identity; allowed site | Not as another reporter |
| Read report/status | Own report and worker-visible fields | Authorized site review scope |
| Update report status | No | Authorized site and permitted transition |
| Change role/membership | No | Trusted explicit administrative workflow only |

Database RLS must independently enforce these boundaries. See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) and [SECURITY.md](SECURITY.md).
