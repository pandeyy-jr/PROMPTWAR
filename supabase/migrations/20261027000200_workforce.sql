-- Workforce records and atomic, tenant-scoped transitions.
create type public.attendance_state as enum ('scheduled', 'checked_in', 'completed');
create type public.safety_state as enum ('open', 'reviewing', 'resolved');

create table public.shifts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  site_id uuid not null, worker_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  starts_at timestamptz not null, ends_at timestamptz not null check (ends_at > starts_at and extract(epoch from ends_at - starts_at) <= 86400),
  hourly_rate_minor bigint not null check (hourly_rate_minor between 1 and 100000000), currency char(3) not null default 'INR' check (currency in ('INR','USD','EUR','GBP','CAD','AUD','SGD','JPY')),
  state public.attendance_state not null default 'scheduled', created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  foreign key (site_id, organization_id) references public.sites(id, organization_id) on delete cascade
);
create index shifts_worker_start on public.shifts(worker_id, starts_at desc);
create index shifts_site_start on public.shifts(organization_id, site_id, starts_at desc);

create table public.attendance_events (
  id uuid primary key default gen_random_uuid(), shift_id uuid not null references public.shifts(id) on delete cascade,
  actor_id uuid not null references public.profiles(id), action text not null check (action in ('check_in','check_out')),
  occurred_at timestamptz not null default now(), unique(shift_id, action)
);

create table public.safety_reports (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  site_id uuid not null, reporter_id uuid not null default auth.uid() references public.profiles(id),
  category text not null check (category in ('hazard','injury','near_miss','wellbeing')),
  description text not null check (char_length(description) between 10 and 3000 and char_length(trim(description)) >= 10),
  state public.safety_state not null default 'open', created_at timestamptz not null default now(),
  foreign key (site_id, organization_id) references public.sites(id, organization_id) on delete cascade
);
create index safety_site_created on public.safety_reports(organization_id, site_id, created_at desc);
create table public.safety_events (
  id uuid primary key default gen_random_uuid(), report_id uuid not null references public.safety_reports(id) on delete cascade,
  actor_id uuid not null references public.profiles(id), previous_state public.safety_state, next_state public.safety_state not null,
  created_at timestamptz not null default now()
);
create table private.safety_review_notes (
  id uuid primary key default gen_random_uuid(), report_id uuid not null references public.safety_reports(id) on delete cascade,
  actor_id uuid not null references public.profiles(id), note text not null check(char_length(note)<=1000), created_at timestamptz not null default now()
);
revoke all on private.safety_review_notes from public, anon, authenticated;

alter table public.shifts enable row level security;
alter table public.attendance_events enable row level security;
alter table public.safety_reports enable row level security;
alter table public.safety_events enable row level security;
revoke all on public.shifts, public.attendance_events, public.safety_reports, public.safety_events from anon, authenticated;
grant select on public.shifts, public.attendance_events, public.safety_reports, public.safety_events to authenticated;
grant insert (organization_id, site_id, worker_id, title, starts_at, ends_at, hourly_rate_minor, currency) on public.shifts to authenticated;
grant update (worker_id, title, starts_at, ends_at, hourly_rate_minor, currency) on public.shifts to authenticated;
grant insert (organization_id, site_id, category, description) on public.safety_reports to authenticated;

create policy shifts_select_scope on public.shifts for select to authenticated using (
  (worker_id = (select auth.uid()) and exists(select 1 from public.memberships m where m.user_id=shifts.worker_id and m.organization_id=shifts.organization_id and m.site_id=shifts.site_id and m.role='worker' and m.active))
  or (select private.has_site_role(organization_id,site_id,array['employer','admin']::public.app_role[]))
);
create policy shifts_insert_scope on public.shifts for insert to authenticated with check (
  created_by=(select auth.uid())
  and (select private.has_site_role(organization_id,site_id,array['employer','admin']::public.app_role[]))
  and exists (select 1 from public.memberships m where m.user_id=worker_id and m.organization_id=shifts.organization_id and m.site_id=shifts.site_id and m.role='worker' and m.active)
);
create policy shifts_update_scope on public.shifts for update to authenticated using (
  (select private.has_site_role(organization_id,site_id,array['employer','admin']::public.app_role[]))
) with check (
  (select private.has_site_role(organization_id,site_id,array['employer','admin']::public.app_role[]))
  and exists (select 1 from public.memberships m where m.user_id=worker_id and m.organization_id=shifts.organization_id and m.site_id=shifts.site_id and m.role='worker' and m.active)
);
create policy attendance_select_scope on public.attendance_events for select to authenticated using (
 exists(select 1 from public.shifts s where s.id=shift_id and (s.worker_id=(select auth.uid()) or (select private.has_site_role(s.organization_id,s.site_id,array['employer','admin']::public.app_role[]))))
);
create policy safety_select_scope on public.safety_reports for select to authenticated using (
 reporter_id=(select auth.uid()) or (select private.has_site_role(organization_id,site_id,array['employer','admin']::public.app_role[]))
);
create policy safety_insert_scope on public.safety_reports for insert to authenticated with check (
  reporter_id=(select auth.uid()) and state='open' and (select private.has_site_role(organization_id,site_id,array['worker']::public.app_role[]))
);
create policy safety_events_select_scope on public.safety_events for select to authenticated using (
 exists(select 1 from public.safety_reports r where r.id=report_id and (r.reporter_id=(select auth.uid()) or (select private.has_site_role(r.organization_id,r.site_id,array['employer','admin']::public.app_role[]))))
);

create or replace function public.record_attendance(target_shift uuid, action_name text)
returns public.attendance_events language plpgsql security definer set search_path = '' as $function$
declare s public.shifts; e public.attendance_events;
begin
  select * into s from public.shifts where id=target_shift for update;
  if not found or s.worker_id <> (select auth.uid()) or not exists(select 1 from public.memberships m where m.user_id=s.worker_id and m.organization_id=s.organization_id and m.site_id=s.site_id and m.role='worker' and m.active) then raise exception 'Shift unavailable'; end if;
  if action_name='check_in' and s.state='scheduled' then
    update public.shifts set state='checked_in' where id=s.id;
  elsif action_name='check_out' and s.state='checked_in' then
    update public.shifts set state='completed' where id=s.id;
  else raise exception 'Attendance transition is not allowed'; end if;
  insert into public.attendance_events(shift_id,actor_id,action) values(s.id,(select auth.uid()),action_name) returning * into e;
  return e;
end;
$function$;
revoke all on function public.record_attendance(uuid,text) from public, anon;
grant execute on function public.record_attendance(uuid,text) to authenticated;

create or replace function public.review_safety_report(target_report uuid, next_status public.safety_state, review_note text default null)
returns public.safety_reports language plpgsql security definer set search_path = '' as $function$
declare r public.safety_reports; old_status public.safety_state;
begin
  select * into r from public.safety_reports where id=target_report for update;
  if not found or not (select private.has_site_role(r.organization_id,r.site_id,array['employer','admin']::public.app_role[])) then raise exception 'Report unavailable'; end if;
  if next_status not in ('reviewing','resolved') or r.state='resolved' or r.state=next_status then raise exception 'Safety transition is not allowed'; end if;
  old_status := r.state;
  update public.safety_reports set state=next_status where id=r.id returning * into r;
  insert into public.safety_events(report_id,actor_id,previous_state,next_state) values(r.id,(select auth.uid()),old_status,next_status);
  if nullif(trim(review_note),'') is not null then
    insert into private.safety_review_notes(report_id,actor_id,note) values(r.id,(select auth.uid()),left(review_note,1000));
  end if;
  return r;
end;
$function$;
revoke all on function public.review_safety_report(uuid,public.safety_state,text) from public, anon;
grant execute on function public.review_safety_report(uuid,public.safety_state,text) to authenticated;

create or replace function public.list_safety_review_notes(target_reports uuid[])
returns table(report_id uuid, actor_id uuid, note text, created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $function$
begin
  if exists(select 1 from public.safety_reports r where r.id=any(target_reports) and not (select private.has_site_role(r.organization_id,r.site_id,array['employer','admin']::public.app_role[]))) then raise exception 'Report unavailable'; end if;
  return query select n.report_id,n.actor_id,n.note,n.created_at from private.safety_review_notes n where n.report_id=any(target_reports) order by n.created_at;
end;
$function$;
revoke all on function public.list_safety_review_notes(uuid[]) from public, anon;
grant execute on function public.list_safety_review_notes(uuid[]) to authenticated;

comment on table public.shifts is 'Assigned shift and wage snapshot; rates are integer minor currency units.';
comment on table public.attendance_events is 'One check-in and one check-out event per shift; written by atomic RPC only.';
comment on table public.safety_events is 'Append-only status history; transitions are written by review_safety_report.';
