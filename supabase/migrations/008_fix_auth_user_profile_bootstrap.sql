-- Fix auth signup bootstrap for profiles.
-- Symptom: auth signup returns 500 "Database error saving new user".
-- Root cause: auth.users AFTER INSERT trigger cannot insert into public.profiles.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    emergency_contact,
    notification_preferences
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    '{}'::jsonb,
    '{
      "daily_checkin": true,
      "weekly_summary": true,
      "new_insight": true,
      "appointments": true,
      "school_reminder": true
    }'::jsonb
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        updated_at = now();

  return new;
end;
$$;

alter function public.handle_new_user() owner to postgres;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

grant usage on schema public to postgres, supabase_auth_admin;
grant insert on table public.profiles to supabase_auth_admin;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
