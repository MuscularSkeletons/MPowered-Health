-- Deny-by-default: nothing in this table is readable or writable until a policy below explicitly allows it.
alter table "User" enable row level security;

-- A user can view their own profile row, and nobody else's. Without this, "Edit Profile" and every screen 
-- that reads name/sex/birth year would either show nothing or leak another user's profile.
create policy "user_select_own"
on "User" for select
using (auth.uid() = user_id);

-- A user can update only their own row (e.g. "Edit Profile" user story). `using` controls which existing 
-- rows can be targeted, `with check` re-validates the row after editing, so a user can't sneak a change to
--  someone else's user_id in.
create policy "user_update_own"
on "User" for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Executes once, at registration. `with check` guarantees the new row's user_id matches the account being 
-- created, so nobody can register a profile under someone else's id.
create policy "user_insert_own"
on "User" for insert
with check (auth.uid() = user_id);

-- A delete request can only ever remove the requester's own profile, and never anyone else's.
create policy "user_delete_own"
on "User" for delete
using (auth.uid() = user_id);


-- "Health Conditions" holds formal diagnosis, pain type, and other-condition free text. 
alter table "Health Conditions" enable row level security;

-- Powers "Edit Health Info" and any screen reading formal diagnosis/pain type/other condition data.
create policy "health_conditions_select_own"
on "Health Conditions" for select
using (auth.uid() = user_id);

-- Executes when a user first enters their health information during onboarding.
create policy "health_conditions_insert_own"
on "Health Conditions" for insert
with check (auth.uid() = user_id);

-- Backs the "Edit Health Info" story. with check stops an edit from reassigning the row to a different user_id.
create policy "health_conditions_update_own"
on "Health Conditions" for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Required for account deletion to actually clear diagnosis/condition data, not just the User row itself.
create policy "health_conditions_delete_own"
on "Health Conditions" for delete
using (auth.uid() = user_id);


alter table "Assessment" enable row level security;

-- Powers "History", "Check Pain History", and the homescreen progress bar, which all query assessments 
-- by date range for the current user only. Without this, a user's weekly pain data would be queryable 
-- by anyone who knew or guessed an assessment_id.
create policy "assessment_select_own"
on "Assessment" for select
using (auth.uid() = user_id);

-- Executes each time a user submits any of the five weekly assessments to guarantee the new assessment 
-- row is stamped with the submitter's own user_id, not a random one passed from the client.
create policy "assessment_insert_own"
on "Assessment" for insert
with check (auth.uid() = user_id);

-- Covers editing the optional weekly reflection text attached to an assessment. Both `using` and 
-- `with check` are needed: using restricts which assessment can be touched, with check stops the edit 
-- from reassigning it to a different user_id.
create policy "assessment_update_own"
on "Assessment" for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- When a user's Assessment rows are removed, their sub-assessment rows should go with them, letting the 
-- deletion request go through, scoped to the requester.
create policy "assessment_delete_own"
on "Assessment" for delete
using (auth.uid() = user_id);


alter table "Pain Assessment" enable row level security;

-- Join-based equivalent of `auth.uid() = user_id` (an ownership check via the parent row) to power pain 
-- history/graphs and the pain trend on the homescreen.
create policy "pain_assessment_select_own"
on "Pain Assessment" for select
using (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Pain Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
);

-- Executes when a pain assessment is submitted, preventing attaching data to another user's assessment record.
create policy "pain_assessment_insert_own"
on "Pain Assessment" for insert
with check (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Pain Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
);

-- Pain assessments aren't user-editable after submission per the acceptance criteria ("previous answers are not 
-- saved" if you restart), but this policy exists for any backend correction path (e.g. help/support tooling) and 
-- stays scoped to the record's owner.
create policy "pain_assessment_update_own"
on "Pain Assessment" for update
using (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Pain Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Pain Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
);

-- Required for account deletion to actually fully clear data, not just the related tables.
create policy "pain_assessment_delete_own"
on "Pain Assessment" for delete
using (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Pain Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
);


alter table "Social Health Assessment" enable row level security;

-- Ownership check via the parent Assessment row.
create policy "social_health_select_own"
on "Social Health Assessment" for select
using (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Social Health Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
);

-- Executes when a social health assessment is submitted, preventing attaching data to another user's assessment record.
create policy "social_health_insert_own"
on "Social Health Assessment" for insert
with check (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Social Health Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
);

-- Assessments aren't user-editable after submission per the acceptance criteria, but this policy 
-- exists for any backend correction path and stays scoped to the record's owner.
create policy "social_health_update_own"
on "Social Health Assessment" for update
using (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Social Health Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Social Health Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
);

-- Required for account deletion to actually fully clear data, not just the related tables.
create policy "social_health_delete_own"
on "Social Health Assessment" for delete
using (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Social Health Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
);


alter table "Personal Care Assessment" enable row level security;

-- Ownership check via the parent Assessment row.
create policy "personal_care_select_own"
on "Personal Care Assessment" for select
using (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Personal Care Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
);

-- Executes when a personal care assessment is submitted, preventing attaching data to another user's assessment record.
create policy "personal_care_insert_own"
on "Personal Care Assessment" for insert
with check (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Personal Care Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
);

-- Scoped edit path, consistent with the other sub-assessment tables.
create policy "personal_care_update_own"
on "Personal Care Assessment" for update
using (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Personal Care Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Personal Care Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
);

-- Required for account deletion to actually fully clear data, not just the related tables.
create policy "personal_care_delete_own"
on "Personal Care Assessment" for delete
using (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Personal Care Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
);


alter table "Movement Assessment" enable row level security;

-- Ownership check via the parent Assessment row.
create policy "movement_select_own"
on "Movement Assessment" for select
using (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Movement Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
);

-- Executes when a movement assessment is submitted, preventing attaching data to another user's assessment record.
create policy "movement_insert_own"
on "Movement Assessment" for insert
with check (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Movement Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
);

-- Scoped edit path, consistent with the other sub-assessment tables.
create policy "movement_update_own"
on "Movement Assessment" for update
using (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Movement Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Movement Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
);

-- Required for account deletion to actually fully clear data, not just the related tables.
create policy "movement_delete_own"
on "Movement Assessment" for delete
using (
  exists (
    select 1 from "Assessment"
    where "Assessment".assessment_id = "Movement Assessment".assessment_id
      and "Assessment".user_id = auth.uid()
  )
);


alter table "Prescription" enable row level security;

-- Powers the prescription list screen - without this, a user_id guessed/leaked elsewhere could 
-- be used to read someone else's medication list.
create policy "prescription_select_own"
on "Prescription" for select
using (auth.uid() = user_id);

-- Executes on "Add Prescription", signing the new row with the creating user's id.
create policy "prescription_insert_own"
on "Prescription" for insert
with check (auth.uid() = user_id);

-- Backs the "Edit Prescription" story (updating strength/frequency). with check stops an 
-- edit from reassigning a different user_id.
create policy "prescription_update_own"
on "Prescription" for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Scoped delete, for the "Remove Prescription" story and account-deletion cleanup.
create policy "prescription_delete_own"
on "Prescription" for delete
using (auth.uid() = user_id);


alter table "Appointment" enable row level security;

-- Backs "Care Planner" and "view appointment plan". Also protects recording_consent 
-- (a doctor's legal consent to be recorded), which shouldn't be readable or alterable by anyone other than the patient who obtained it.
create policy "appointment_select_own"
on "Appointment" for select
using (auth.uid() = user_id);

-- Executes on "Prepare for my appointment"/"Plan my appointment" and signs the new appointment with the creating user's id.
create policy "appointment_insert_own"
on "Appointment" for insert
with check (auth.uid() = user_id);

-- Backs editing appointment details before the appointment date, and recording the consent
-- signature. with check stops an edit from reassigning a different user_id.
create policy "appointment_update_own"
on "Appointment" for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Scoped delete, for account-deletion cleanup.
create policy "appointment_delete_own"
on "Appointment" for delete
using (auth.uid() = user_id);


-- Indexes on columns that carry user_id directly - RLS runs this comparison on every query against these
-- tables, so this keeps policy checks off a full table scan.
create index if not exists idx_health_conditions_user_id on "Health Conditions"(user_id);
create index if not exists idx_assessment_user_id on "Assessment"(user_id);
create index if not exists idx_prescription_user_id on "Prescription"(user_id);
create index if not exists idx_appointment_user_id on "Appointment"(user_id);

-- Foreign key columns are NOT automatically indexed (only primary keys are). Every sub-assessment
-- policy above joins back to "Assessment" via assessment_id, so without these indexes each RLS check on these
-- four tables forces a scan.
create index if not exists idx_pain_assessment_assessment_id on "Pain Assessment"(assessment_id);
create index if not exists idx_social_health_assessment_assessment_id on "Social Health Assessment"(assessment_id);
create index if not exists idx_personal_care_assessment_assessment_id on "Personal Care Assessment"(assessment_id);
create index if not exists idx_movement_assessment_assessment_id on "Movement Assessment"(assessment_id);