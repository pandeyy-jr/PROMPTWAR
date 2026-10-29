# Trusted workspace bootstrap

Run only in the Supabase SQL Editor as a trusted project owner after applying every migration. The app intentionally has no public route for granting employer/admin roles. Self-signup creates a profile only.

## Create an organization, first site, and organization admin

1. Register the designated administrator using `/sign-up` and complete email confirmation.
2. Replace the example email, organization/site names, industry, and time zone in the block below. Choose `factory` or `college`.
3. Review the values, then run the block in the project's SQL Editor.

```sql
do $$
declare
  target_user uuid;
  target_org uuid;
begin
  select id into target_user
  from auth.users
  where lower(email) = lower('admin@example.org')
    and email_confirmed_at is not null;

  if target_user is null then
    raise exception 'No confirmed account found for the configured admin email';
  end if;

  insert into public.organizations(name)
  values ('Example Organization')
  returning id into target_org;

  insert into public.sites(organization_id, name, industry, timezone)
  values (target_org, 'Main Site', 'factory', 'Asia/Kolkata');

  insert into public.memberships(user_id, organization_id, site_id, role, active)
  values (target_user, target_org, null, 'admin', true);
end $$;
```

The SQL editor's database owner identity performs this trusted action. The example creates a site-wide organization admin, not an application-level secret or password. Do not expose owner or service-role credentials to the app.

## Add a worker

The worker must register and confirm their email first. As a trusted database operator, identify the confirmed `auth.users.id`, the organization's `id`, and the intended site's `id`, then insert exactly one active membership:

```sql
insert into public.memberships(user_id, organization_id, site_id, role, active)
select u.id, s.organization_id, s.id, 'worker', true
from auth.users u
join public.sites s on s.id = 'REPLACE-WITH-SITE-UUID'::uuid
where lower(u.email) = lower('worker@example.org')
  and u.email_confirmed_at is not null;
```

Confirm the inserted row's user, organization, site, and `worker` role before sharing access. For a site manager, use role `employer` and the exact site ID. For an organization-wide manager, use role `employer` or `admin` with `site_id = null`. Ordinary browser users cannot insert/update/delete memberships.

This manual bootstrap path has not been executed in a connected project. Apply and adversarially test RLS before inviting real users.
