# Fairness Engine: Explainable Decision Support

Status: deterministic rules engine and management review prompts are implemented locally and covered by unit tests. Factory and college currently have configured operational thresholds in code. No trained machine-learning model exists or is claimed; the rules have not been verified against live database records.

## Principles

Alerts are prompts for a qualified human to review records and context. They must not automatically alter employment, wages, eligibility, scheduling, discipline, or termination. Do not rank workers, infer intent, or conceal rule logic. Rules operate on authorized, relevant records and explicitly configured thresholds.

## Required rule families

| Rule | Trigger (configuration-dependent) | Evidence to show | Human follow-up |
|---|---|---|---|
| Potential wage discrepancy | Recomputed amount from recorded eligible hours and effective wage rule differs from stored amount beyond configured rounding/tolerance | Rule version, rate, currency, hours, components, stored and recomputed totals | Verify attendance, effective rule, adjustments, and correction process |
| Overtime indicator | Recorded hours exceed an explicitly configured threshold for the applicable rule period | Dates, hours, threshold source/configuration, calculation | Review schedule and pay treatment; do not assert legal compliance |
| Attendance inconsistency | Missing check-in/out, duplicate transition, impossible ordering, or attendance conflicting with shift assignment | Shift, event timestamps/status, expected sequence | Confirm with worker and manager; correct source record with audit trail |
| Fatigue/excessive-hours indicator | Configured hours in a defined rolling period or repeated-shift/rest pattern exceeds a clearly named operational threshold | Window, included shifts/hours, configured threshold and timezone | Human scheduling/safety review; no automatic worker penalty |
| Unresolved high-severity safety incident | A report with worker-selected `high` or `critical` severity remains unresolved | Report ID, reporter-selected severity, status, site, privacy-limited description | Prompt designated safety reviewer to assess and record response |

## Alert contract

Each alert includes a stable rule ID/version, subject record IDs, supporting data and time window, rule/threshold applied and its configuration source, concise reason, severity, generated timestamp, and suggested human follow-up. Include uncertainty or missing data when relevant. Do not expose unrelated worker data to a viewer.

## Configuration and safety

- Rates, rounding, overtime thresholds, fatigue windows, severity mapping, and response intervals must be explicitly configured by an accountable organization; defaults must not be presented as legal requirements. Current severity labels are reporter-selected triage values and are not medical or legal classifications.
- Preserve enough configuration/version evidence to reproduce why an alert fired.
- Handle missing/invalid inputs as a data-quality alert or no-result, never as a confident conclusion.
- De-duplicate repeated alerts or group them without hiding evidence; allow reviewers to record disposition and rationale where appropriate.
- Provide tests for threshold boundaries, timezone boundaries, rounding, missing records, duplicates, and non-punitive output.

Related: [API contracts](API_CONTRACTS.md), [industry use cases](INDUSTRY_USE_CASES.md), [testing strategy](TESTING_QA.md).
