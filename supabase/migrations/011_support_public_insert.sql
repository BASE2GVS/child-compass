-- Allow public support submissions (contact forms without login)

drop policy if exists "Users can insert own tickets" on public.support_tickets;

create policy "Support ticket insert" on public.support_tickets
  for insert with check (user_id is null or user_id = auth.uid());
