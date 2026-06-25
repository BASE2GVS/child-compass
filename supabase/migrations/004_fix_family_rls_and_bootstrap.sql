-- Fix onboarding bootstrap RLS for first-family creation.
-- Goals:
-- 1) Authenticated users can create their own first family.
-- 2) Creator is recorded as owner.
-- 3) Membership row is auto-created.
-- 4) Access remains isolated to user's own families.

-- Track explicit family owner.
alter table families
  add column if not exists created_by uuid references auth.users(id) on delete set null;

-- Backfill owner from oldest known membership where possible.
with ranked_members as (
  select
    fm.family_id,
    fm.user_id,
    row_number() over (partition by fm.family_id order by fm.created_at asc nulls last) as rn
  from family_members fm
  where fm.user_id is not null
)
update families f
set created_by = rm.user_id
from ranked_members rm
where f.id = rm.family_id
  and rm.rn = 1
  and f.created_by is null;

alter table families
  alter column created_by set default auth.uid();

-- Keep a strict role model that includes explicit ownership.
alter table family_members drop constraint if exists family_members_role_check;
alter table family_members add constraint family_members_role_check
  check (role in ('owner', 'parent', 'caregiver', 'admin'));

-- Bootstrap membership when a family is created.
create or replace function bootstrap_family_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is null then
    raise exception 'created_by must be set for new families';
  end if;

  insert into family_members (family_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict (family_id, user_id) do update set role = excluded.role;

  return new;
end;
$$;

drop trigger if exists families_bootstrap_owner on families;
create trigger families_bootstrap_owner
after insert on families
for each row execute function bootstrap_family_owner_membership();

-- Replace policies with stricter ownership-aware versions.
drop policy if exists "Members can view their families" on families;
drop policy if exists "Authenticated users can create families" on families;
drop policy if exists "Members can update their families" on families;

create policy "Members can view their families" on families
  for select using (
    id in (select get_user_family_ids())
    or created_by = auth.uid()
  );

create policy "Authenticated users can create own first family" on families
  for insert with check (
    auth.uid() is not null
    and created_by = auth.uid()
    and not exists (
      select 1 from families f where f.created_by = auth.uid()
    )
  );

create policy "Members can update their families" on families
  for update using (id in (select get_user_family_ids()))
  with check (id in (select get_user_family_ids()));

-- Tighten family_members insert policy to avoid arbitrary self-joins.
drop policy if exists "Users can insert own membership" on family_members;
create policy "Users can insert own membership" on family_members
  for insert with check (
    (
      user_id = auth.uid()
      and family_id in (select get_user_family_ids())
    )
    or (
      invited_email is not null
      and family_id in (select get_user_family_ids())
    )
  );
