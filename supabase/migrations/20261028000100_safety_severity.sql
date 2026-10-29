-- Capture worker-selected severity for privacy-limited safety triage.
alter table public.safety_reports
  add column severity text not null default 'medium'
  check (severity in ('low', 'medium', 'high', 'critical'));

create index safety_site_severity_state
  on public.safety_reports(site_id, severity, state, created_at desc);

comment on column public.safety_reports.severity is
  'Reporter-selected triage severity; not a legal or medical classification.';
