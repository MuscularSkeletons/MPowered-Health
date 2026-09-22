-- My Pain uses Assessment.user_id for ownership through its assessment_id link.
-- No additional user_id column is needed on pain_assessment.
alter table public.pain_assessment enable row level security;

drop policy if exists "pain assessment owner insert" on public.pain_assessment;
create policy "pain assessment owner insert"
  on public.pain_assessment for insert to authenticated
  with check (exists (
    select 1 from public."Assessment" a
    where a.assessment_id = pain_assessment.assessment_id
      and a.user_id = (select auth.uid())
  ));

drop policy if exists "pain assessment owner read" on public.pain_assessment;
create policy "pain assessment owner read"
  on public.pain_assessment for select to authenticated
  using (exists (
    select 1 from public."Assessment" a
    where a.assessment_id = pain_assessment.assessment_id
      and a.user_id = (select auth.uid())
  ));

grant insert, select on public.pain_assessment to authenticated;
