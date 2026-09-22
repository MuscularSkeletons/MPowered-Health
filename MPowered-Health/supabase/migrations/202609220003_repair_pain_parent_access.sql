-- Allows signed-in users to save My Pain under their own Assessment parent.
-- Run this in Supabase SQL Editor; starting Expo does not apply database migrations.
-- Existing answers are preserved, and row-level security stays enabled.
begin;

alter table public."Assessment" enable row level security;
alter table public.pain_assessment enable row level security;

drop policy if exists "assessment owner insert" on public."Assessment";
create policy "assessment owner insert" on public."Assessment"
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "assessment owner read" on public."Assessment";
create policy "assessment owner read" on public."Assessment"
  for select to authenticated using ((select auth.uid()) = user_id);

-- The app removes the empty parent if saving the questionnaire fails.
drop policy if exists "assessment owner delete" on public."Assessment";
create policy "assessment owner delete" on public."Assessment"
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Pain records inherit ownership through the parent; they have no user_id column.
drop policy if exists "pain assessment owner insert" on public.pain_assessment;
create policy "pain assessment owner insert" on public.pain_assessment
  for insert to authenticated with check (exists (
    select 1 from public."Assessment" a
    where a.assessment_id = pain_assessment.assessment_id
      and a.user_id = (select auth.uid())
  ));

drop policy if exists "pain assessment owner read" on public.pain_assessment;
create policy "pain assessment owner read" on public.pain_assessment
  for select to authenticated using (exists (
    select 1 from public."Assessment" a
    where a.assessment_id = pain_assessment.assessment_id
      and a.user_id = (select auth.uid())
  ));

grant insert, select, delete on public."Assessment" to authenticated;
grant insert, select on public.pain_assessment to authenticated;
commit;
