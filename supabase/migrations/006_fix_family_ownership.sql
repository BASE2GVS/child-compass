-- Fix family ownership via owner_id.
-- Live families table never had created_by. Do not reference created_by.

-- Halt if legacy rows exist; do not invent owner_id values.
do $$
declare
  existing_count integer;
begin
  select count(*) into existing_count from public.families;

  if existing_count > 0 then
    raise exception
      'Migration 006 halted: % existing families row(s) found. Assign owner_id manually for each row, then re-run.',
      existing_count;
  end if;
end $$;

alter table public.families
  add column if not exists owner_id uuid references auth.users(id);

create index if not exists idx_families_owner_id on public.families(owner_id);

-- Remove obsolete bootstrap artifacts if present from unreleased migrations.
drop trigger if exists families_bootstrap_owner on public.families;
drop function if exists bootstrap_family_owner_membership();

-- Drop created_by column if an unreleased migration added it by mistake.
alter table public.families drop column if exists created_by;

-- Allow explicit owner membership role.
alter table public.family_members drop constraint if exists family_members_role_check;
alter table public.family_members add constraint family_members_role_check
  check (role in ('owner', 'parent', 'caregiver', 'admin'));

-- families RLS: owner_id model (owner_id nullable until new families are created with owner_id).
drop policy if exists "Members can view their families" on public.families;
drop policy if exists "Authenticated users can create families" on public.families;
drop policy if exists "Authenticated users can create own first family" on public.families;
drop policy if exists "Members can update their families" on public.families;
drop policy if exists "Owners and members can view families" on public.families;
drop policy if exists "Authenticated users can create own family" on public.families;
drop policy if exists "Owners can update families" on public.families;
drop policy if exists "Owners can delete families" on public.families;

create policy "Owners and members can view families" on public.families
  for select using (
    owner_id = auth.uid()
    or id in (select get_user_family_ids())
  );

create policy "Authenticated users can create own family" on public.families
  for insert with check (
    auth.uid() is not null
    and owner_id = auth.uid()
  );

create policy "Owners can update families" on public.families
  for update using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Owners can delete families" on public.families
  for delete using (owner_id = auth.uid());

-- family_members: owner bootstrap membership + invites for existing members.
drop policy if exists "Users can insert own membership" on public.family_members;

create policy "Users can insert own membership" on public.family_members
  for insert with check (
    (
      user_id = auth.uid()
      and exists (
        select 1
        from public.families f
        where f.id = family_members.family_id
          and f.owner_id = auth.uid()
      )
    )
    or (
      invited_email is not null
      and family_id in (select get_user_family_ids())
    )
  );
