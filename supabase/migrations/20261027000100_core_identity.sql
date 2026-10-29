-- FairShift identity and tenant foundation.
-- Apply with the Supabase CLI after configuring a project. No users or admin
-- accounts are seeded by this migration.

create type public.app_role as enum ('worker', 'employer', 'admin');
create type public.industry_kind as enum ('factory', 'college');

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  created_at timestamptz not null default now()
);

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  industry public.industry_kind not null,
  timezone text not null default 'UTC' check (char_length(timezone) between 1 and 80),
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  unique (organization_id, name)
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  site_id uuid,
  role public.app_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  constraint memberships_site_org_fk
    foreign key (site_id, organization_id)
    references public.sites (id, organization_id) on delete cascade,
  constraint worker_membership_requires_site check (role <> 'worker' or site_id is not null)
);

create unique index memberships_unique_site_role
  on public.memberships (user_id, organization_id, site_id, role)
  where site_id is not null;
create unique index memberships_unique_org_role
  on public.memberships (user_id, organization_id, role)
  where site_id is null;
create index memberships_scope_lookup
  on public.memberships (organization_id, site_id, role, active);
create index memberships_user_lookup
  on public.memberships (user_id, active);

create or replace function private.has_site_role(
  target_organization_id uuid,
  target_site_id uuid,
  allowed_roles public.app_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.memberships as membership
    where membership.user_id = (select auth.uid())
      and membership.organization_id = target_organization_id
      and (membership.site_id is null or membership.site_id = target_site_id)
      and membership.role = any (allowed_roles)
      and membership.active
  );
$function$;

create or replace function private.can_view_profile(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.memberships as viewer
    join public.memberships as subject
      on subject.organization_id = viewer.organization_id
     and (viewer.site_id is null or viewer.site_id = subject.site_id)
    where viewer.user_id = (select auth.uid())
      and viewer.role in ('employer'::public.app_role, 'admin'::public.app_role)
      and viewer.active
      and subject.user_id = target_user_id
      and subject.active
  );
$function$;

revoke all on function private.has_site_role(uuid, uuid, public.app_role[]) from public, anon;
revoke all on function private.can_view_profile(uuid) from public, anon;
grant execute on function private.has_site_role(uuid, uuid, public.app_role[]) to authenticated;
grant execute on function private.can_view_profile(uuid) to authenticated;

create or replace function private.create_profile_for_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 100), ''),
      'Worker'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;

revoke all on function private.create_profile_for_new_auth_user() from public, anon, authenticated;
create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute function private.create_profile_for_new_auth_user();

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.sites enable row level security;
alter table public.memberships enable row level security;

create policy profiles_select_self_or_manager
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select private.can_view_profile(id)));
create policy profiles_update_self
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy organizations_select_member
  on public.organizations for select to authenticated
  using (
    exists (
      select 1 from public.memberships as membership
      where membership.organization_id = organizations.id
        and membership.user_id = (select auth.uid())
        and membership.active
    )
  );

create policy sites_select_member
  on public.sites for select to authenticated
  using ((select private.has_site_role(
    organization_id,
    id,
    array['worker', 'employer', 'admin']::public.app_role[]
  )));

create policy memberships_select_self_or_manager
  on public.memberships for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.has_site_role(
      organization_id,
      site_id,
      array['employer', 'admin']::public.app_role[]
    ))
  );

revoke all on public.profiles, public.organizations, public.sites, public.memberships from anon, authenticated;
grant select on public.profiles, public.organizations, public.sites, public.memberships to authenticated;
grant update (display_name) on public.profiles to authenticated;

comment on table public.memberships is
  'Trusted tenant and site role assignments. Ordinary users receive no insert, update, or delete privilege.';
comment on function private.has_site_role(uuid, uuid, public.app_role[]) is
  'RLS helper. SECURITY DEFINER with empty search_path and caller identity from auth.uid().';
