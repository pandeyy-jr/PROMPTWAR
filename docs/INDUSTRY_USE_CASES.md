# Industry Use Cases

Status: required configurations for shared workflows. The same worker, shift, attendance, safety-report, and management code supports both site industry values. Factory and college scenarios are acceptance fixtures, not live customer deployments; database-backed journeys remain unverified.

## Shared model

Both industries use the same identity, organization/site, shift, attendance, wage-rule, safety-report, and review workflows. Industry/site configuration supplies labels, work patterns, hazard categories, and explicitly chosen operational thresholds. Do not fork authorization or wage logic by industry.

## Factories

**Scenario:** A production worker reviews an assigned day or night shift, sees the configured hourly rate and estimated earnings, checks in and out, and reports a machine-guard or PPE hazard. A supervisor reviews attendance and wage calculations, responds to the report, and records a status update visible to the reporter.

Possible configured shift patterns: production day/night, maintenance, packing, and rotating shifts. Possible hazard categories: machine guarding, PPE, chemical exposure, blocked exit, heat, and electrical risk. These categories are examples; an organization must configure local reporting and response policy.

**Acceptance tests:** worker only sees own assigned factory shifts/pay/reports; attendance is tied to the shift and persists; configured rate calculation is reproducible; supervisor access is site-scoped; report status history records reviewer and time; an unresolved high-severity report can produce a transparent review alert.

## Colleges

**Scenario:** A campus facilities, dining, security, or maintenance worker views a campus shift and pay terms, records attendance, and reports a wet-floor, electrical, equipment, or blocked-access hazard. An authorized campus operations administrator reviews the record and tracks response status.

Possible shift types: facilities, dining, campus security, event support, and library operations. Possible hazards: wet floor, exposed wiring, broken equipment, blocked accessible route, food-service hazard, or unsafe event setup. Configure appropriate visibility so a report is shared only with the worker and authorized campus reviewers.

**Acceptance tests:** college site configuration uses the same shift/attendance/report contracts; configured roles cannot read a different site's data; college-specific categories and thresholds are configuration only; report updates are visible to the reporter; cross-site access is denied.

## Cross-industry verification

- Run the same core workflow tests against a factory site and a college site.
- Verify labels/categories and shift examples differ where useful while common persistence and access behavior remains the same.
- Verify no industry's sample rate or overtime/rest threshold is presented as law or applied without explicit configuration.
- Demonstrate worker and authorized manager perspectives for both settings, including a status/error/empty state.

Related: [product requirements](PROJECT_SPEC.md), [Fairness Engine](FAIRNESS_ENGINE.md), [database model](DATABASE_SCHEMA.md), [demo plan](DEMO_AND_SUBMISSION.md).
