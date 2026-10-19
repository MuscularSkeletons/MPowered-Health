-- 1. USER PROFILE

alter table public."user" enable row level security;

drop policy if exists user_select_own on public."user";
drop policy if exists user_insert_own on public."user";
drop policy if exists user_update_own on public."user";
drop policy if exists user_delete_own on public."user";

create policy user_select_own
on public."user" for select to authenticated
using ((select auth.uid()) = user_id);

create policy user_insert_own
on public."user" for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy user_update_own
on public."user" for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy user_delete_own
on public."user" for delete to authenticated
using ((select auth.uid()) = user_id);


-- 2. ASSESSMENT

alter table public.assessment enable row level security;

drop policy if exists assessment_select_own on public.assessment;
drop policy if exists assessment_insert_own on public.assessment;
drop policy if exists assessment_update_own on public.assessment;
drop policy if exists assessment_delete_own on public.assessment;

create policy assessment_select_own
on public.assessment for select to authenticated
using ((select auth.uid()) = user_id);

create policy assessment_insert_own
on public.assessment for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy assessment_update_own
on public.assessment for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy assessment_delete_own
on public.assessment for delete to authenticated
using ((select auth.uid()) = user_id);


-- 3. PAIN ASSESSMENT

alter table public.pain_assessment enable row level security;

drop policy if exists pain_assessment_select_own on public.pain_assessment;
drop policy if exists pain_assessment_insert_own on public.pain_assessment;
drop policy if exists pain_assessment_update_own on public.pain_assessment;
drop policy if exists pain_assessment_delete_own on public.pain_assessment;

create policy pain_assessment_select_own
on public.pain_assessment for select to authenticated
using (
  exists (
    select 1
    from public.assessment a
    where a.assessment_id = pain_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);

create policy pain_assessment_insert_own
on public.pain_assessment for insert to authenticated
with check (
  assessment_id is not null
  and exists (
    select 1
    from public.assessment a
    where a.assessment_id = pain_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);

create policy pain_assessment_update_own
on public.pain_assessment for update to authenticated
using (
  exists (
    select 1
    from public.assessment a
    where a.assessment_id = pain_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
)
with check (
  assessment_id is not null
  and exists (
    select 1
    from public.assessment a
    where a.assessment_id = pain_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);

create policy pain_assessment_delete_own
on public.pain_assessment for delete to authenticated
using (
  exists (
    select 1
    from public.assessment a
    where a.assessment_id = pain_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);


-- 4. MOVEMENT ASSESSMENT

alter table public.movement_assessment enable row level security;

drop policy if exists movement_select_own on public.movement_assessment;
drop policy if exists movement_insert_own on public.movement_assessment;
drop policy if exists movement_update_own on public.movement_assessment;
drop policy if exists movement_delete_own on public.movement_assessment;

create policy movement_select_own
on public.movement_assessment for select to authenticated
using (
  exists (
    select 1 from public.assessment a
    where a.assessment_id = movement_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);

create policy movement_insert_own
on public.movement_assessment for insert to authenticated
with check (
  assessment_id is not null
  and exists (
    select 1 from public.assessment a
    where a.assessment_id = movement_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);

create policy movement_update_own
on public.movement_assessment for update to authenticated
using (
  exists (
    select 1 from public.assessment a
    where a.assessment_id = movement_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
)
with check (
  assessment_id is not null
  and exists (
    select 1 from public.assessment a
    where a.assessment_id = movement_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);

create policy movement_delete_own
on public.movement_assessment for delete to authenticated
using (
  exists (
    select 1 from public.assessment a
    where a.assessment_id = movement_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);


-- 5. PERSONAL CARE ASSESSMENT

alter table public.personal_care_assessment enable row level security;

drop policy if exists personal_care_select_own on public.personal_care_assessment;
drop policy if exists personal_care_insert_own on public.personal_care_assessment;
drop policy if exists personal_care_update_own on public.personal_care_assessment;
drop policy if exists personal_care_delete_own on public.personal_care_assessment;

create policy personal_care_select_own
on public.personal_care_assessment for select to authenticated
using (
  exists (
    select 1 from public.assessment a
    where a.assessment_id = personal_care_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);

create policy personal_care_insert_own
on public.personal_care_assessment for insert to authenticated
with check (
  assessment_id is not null
  and exists (
    select 1 from public.assessment a
    where a.assessment_id = personal_care_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);

create policy personal_care_update_own
on public.personal_care_assessment for update to authenticated
using (
  exists (
    select 1 from public.assessment a
    where a.assessment_id = personal_care_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
)
with check (
  assessment_id is not null
  and exists (
    select 1 from public.assessment a
    where a.assessment_id = personal_care_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);

create policy personal_care_delete_own
on public.personal_care_assessment for delete to authenticated
using (
  exists (
    select 1 from public.assessment a
    where a.assessment_id = personal_care_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);


-- 6. SOCIAL HEALTH ASSESSMENT

alter table public.social_health_assessment enable row level security;

drop policy if exists social_health_select_own on public.social_health_assessment;
drop policy if exists social_health_insert_own on public.social_health_assessment;
drop policy if exists social_health_update_own on public.social_health_assessment;
drop policy if exists social_health_delete_own on public.social_health_assessment;

create policy social_health_select_own
on public.social_health_assessment for select to authenticated
using (
  exists (
    select 1 from public.assessment a
    where a.assessment_id = social_health_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);

create policy social_health_insert_own
on public.social_health_assessment for insert to authenticated
with check (
  assessment_id is not null
  and exists (
    select 1 from public.assessment a
    where a.assessment_id = social_health_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);

create policy social_health_update_own
on public.social_health_assessment for update to authenticated
using (
  exists (
    select 1 from public.assessment a
    where a.assessment_id = social_health_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
)
with check (
  assessment_id is not null
  and exists (
    select 1 from public.assessment a
    where a.assessment_id = social_health_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);

create policy social_health_delete_own
on public.social_health_assessment for delete to authenticated
using (
  exists (
    select 1 from public.assessment a
    where a.assessment_id = social_health_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);


-- 7. MANAGEMENT ASSESSMENT

alter table public.management_assessment enable row level security;

drop policy if exists management_select_own on public.management_assessment;
drop policy if exists management_insert_own on public.management_assessment;
drop policy if exists management_update_own on public.management_assessment;
drop policy if exists management_delete_own on public.management_assessment;

create policy management_select_own
on public.management_assessment for select to authenticated
using (
  exists (
    select 1 from public.assessment a
    where a.assessment_id = management_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);

create policy management_insert_own
on public.management_assessment for insert to authenticated
with check (
  assessment_id is not null
  and exists (
    select 1 from public.assessment a
    where a.assessment_id = management_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);

create policy management_update_own
on public.management_assessment for update to authenticated
using (
  exists (
    select 1 from public.assessment a
    where a.assessment_id = management_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
)
with check (
  assessment_id is not null
  and exists (
    select 1 from public.assessment a
    where a.assessment_id = management_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);

create policy management_delete_own
on public.management_assessment for delete to authenticated
using (
  exists (
    select 1 from public.assessment a
    where a.assessment_id = management_assessment.assessment_id
      and a.user_id = (select auth.uid())
  )
);


-- 8. PRESCRIPTION

alter table public.prescription enable row level security;

drop policy if exists prescription_select_own on public.prescription;
drop policy if exists prescription_insert_own on public.prescription;
drop policy if exists prescription_update_own on public.prescription;
drop policy if exists prescription_delete_own on public.prescription;

create policy prescription_select_own
on public.prescription for select to authenticated
using ((select auth.uid()) = user_id);

create policy prescription_insert_own
on public.prescription for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy prescription_update_own
on public.prescription for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy prescription_delete_own
on public.prescription for delete to authenticated
using ((select auth.uid()) = user_id);


-- 9. QUESTION

alter table public.question enable row level security;

drop policy if exists question_select_own on public.question;
drop policy if exists question_insert_own on public.question;
drop policy if exists question_update_own on public.question;
drop policy if exists question_delete_own on public.question;

create policy question_select_own
on public.question for select to authenticated
using ((select auth.uid()) = user_id);

create policy question_insert_own
on public.question for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy question_update_own
on public.question for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy question_delete_own
on public.question for delete to authenticated
using ((select auth.uid()) = user_id);


-- 10. DELETE REQUEST

alter table public.delete_request enable row level security;

drop policy if exists delete_request_select_own on public.delete_request;
drop policy if exists delete_request_insert_own on public.delete_request;

create policy delete_request_select_own
on public.delete_request for select to authenticated
using ((select auth.uid()) = user_id);

create policy delete_request_insert_own
on public.delete_request for insert to authenticated
with check ((select auth.uid()) = user_id);


-- 11. INDEXING

create index if not exists idx_assessment_user_id
  on public.assessment(user_id);

create index if not exists idx_pain_assessment_assessment_id
  on public.pain_assessment(assessment_id);

create index if not exists idx_movement_assessment_assessment_id
  on public.movement_assessment(assessment_id);

create index if not exists idx_personal_care_assessment_assessment_id
  on public.personal_care_assessment(assessment_id);

create index if not exists idx_social_health_assessment_assessment_id
  on public.social_health_assessment(assessment_id);

create index if not exists idx_management_assessment_assessment_id
  on public.management_assessment(assessment_id);

create index if not exists idx_prescription_user_id
  on public.prescription(user_id);

create index if not exists idx_question_user_id
  on public.question(user_id);



