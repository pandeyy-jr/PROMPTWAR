-- Worker reports rely on database defaults for reporter_id and state. This
-- forward-only grant permits the severity column added in the prior migration
-- without allowing workers to set ownership or management-controlled fields.
grant insert (organization_id, site_id, category, severity, description)
  on public.safety_reports to authenticated;
