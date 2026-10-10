SET local check_function_bodies = off;

CREATE ROLE "prisma" WITH NOSUPERUSER INHERIT NOCREATEROLE CREATEDB LOGIN NOREPLICATION BYPASSRLS;

GRANT "prisma" TO "postgres" WITH ADMIN OPTION;

CREATE TABLE "public"."Health Conditions" (
  "health_condition_id" uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "formal_diagnosis"    text,
  "pain_type"           text,
  "other_condition"     text,
  "user_id"             uuid                     NOT NULL,
  CONSTRAINT "Health Conditions_pkey" PRIMARY KEY (health_condition_id)
);

ALTER TABLE "public"."Health Conditions"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."movement_assessment" (
  "movement_assessment_id" uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"             timestamp with time zone NOT NULL DEFAULT now(),
  "movement_score"         smallint                 NOT NULL,
  "standing_impact"        text                     NOT NULL,
  "lifting_impact"         text                     NOT NULL,
  "sitting_impact"         text                     NOT NULL,
  "walking_impact"         text                     NOT NULL,
  "active_hour"            text                     NOT NULL,
  "movement_reflection"    text,
  "assessment_id"          uuid                     NOT NULL,
  "general_impacts"        jsonb[]                  NOT NULL,
  "impac_level"            text                     NOT NULL,
  CONSTRAINT "movement_assessment_pkey" PRIMARY KEY (movement_assessment_id)
);

ALTER TABLE "public"."movement_assessment"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."pain_assessment" (
  "pain_assessment_id"      uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"              timestamp with time zone NOT NULL DEFAULT now(),
  "pain_score"              smallint                 NOT NULL,
  "worst_pain"              smallint                 NOT NULL,
  "mildest_pain"            smallint                 NOT NULL,
  "average_pain"            smallint                 NOT NULL,
  "current_pain"            smallint                 NOT NULL,
  "pain_location"           jsonb[]                  NOT NULL,
  "pain_characteristics"    text                     NOT NULL,
  "pain_reflection"         text,
  "assessment_id"           uuid                     NOT NULL,
  CONSTRAINT "pain_assessment_pkey" PRIMARY KEY (pain_assessment_id)
);

ALTER TABLE "public"."pain_assessment"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."personal_care_assessment" (
  "personal_assmt_id"   uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "activities_impact"   jsonb[]                  NOT NULL,
  "personal_care_score" text                     NOT NULL,
  "sleeping_impact"     text                     NOT NULL,
  "care_score"          smallint                 NOT NULL,
  "care_reflection"     text,
  "assessment_id"       uuid                     NOT NULL,
  "impac_level"         text                     NOT NULL,
  CONSTRAINT "personal_care_assessment_pkey" PRIMARY KEY (personal_assmt_id)
);

ALTER TABLE "public"."personal_care_assessment"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."social_health_assessment" (
  "social_health_assmt_id" uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"             timestamp with time zone NOT NULL DEFAULT now(),
  "social_score"           smallint                 NOT NULL,
  "social_life"            text                     NOT NULL,
  "travelling"             text                     NOT NULL,
  "mood_impact"            smallint                 NOT NULL,
  "relation_impact"        smallint                 NOT NULL,
  "enjoyment_impact"       smallint                 NOT NULL,
  "general_mood"           text                     NOT NULL,
  "assessment_id"          uuid                     NOT NULL,
  "mood_trigger"           text                     NOT NULL,
  "impac_level"            text                     NOT NULL,
  CONSTRAINT "social_health_assessment_pkey" PRIMARY KEY (social_health_assmt_id)
);

ALTER TABLE "public"."social_health_assessment"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."Appointment" (
  "appointment_id"    uuid                        NOT NULL DEFAULT gen_random_uuid(),
  "created_at"        timestamp with time zone    NOT NULL DEFAULT now(),
  "date"              timestamp without time zone NOT NULL,
  "doctor_name"       text                        NOT NULL,
  "recording_consent" boolean,
  "user_id"           uuid                        NOT NULL,
  CONSTRAINT "Appointment_pkey" PRIMARY KEY (appointment_id)
);

ALTER TABLE "public"."Appointment"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."assessment" (
  "assessment_id" uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "date"          timestamp with time zone NOT NULL DEFAULT now(),
  "user_id"       uuid                     NOT NULL,
  "week_start"    date                     NOT NULL,
  CONSTRAINT "assessment_pkey" PRIMARY KEY (assessment_id)
);

ALTER TABLE "public"."assessment"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."Prescription" (
  "prescription_id"  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  "medicine_name"    text                     NOT NULL,
  "strength"         numeric                  NOT NULL,
  "strength_unit"    text                     NOT NULL,
  "form"             text                     NOT NULL,
  "frequency"        text                     NOT NULL,
  "number_of_repeat" smallint                 NOT NULL,
  "time_out"         time without time zone   NOT NULL,
  "user_id"          uuid                     NOT NULL,
  CONSTRAINT "Prescription_pkey" PRIMARY KEY (prescription_id)
);

ALTER TABLE "public"."Prescription"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."User" (
  "user_id"      uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
  "name"         character varying        NOT NULL,
  "phone_number" numeric                  NOT NULL,
  "birth_year"   numeric,
  "sex"          character varying,
  CONSTRAINT "User_phone_number_key" UNIQUE (phone_number),
  CONSTRAINT "User_pkey" PRIMARY KEY (user_id)
);

ALTER TABLE "public"."User"
  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
  RETURNS event_trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'pg_catalog'
  AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

ALTER TABLE "public"."movement_assessment"
  ADD CONSTRAINT "movement_assessment_assessment_id_fkey" FOREIGN KEY (assessment_id) REFERENCES public."assessment"(assessment_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."pain_assessment"
  ADD CONSTRAINT "pain_assessment_assessment_id_fkey" FOREIGN KEY (assessment_id) REFERENCES public."assessment"(assessment_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."personal_care_assessment"
  ADD CONSTRAINT "personal_care_assessment_assessment_id_fkey" FOREIGN KEY (assessment_id) REFERENCES public."assessment"(assessment_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."social_health_assessment"
  ADD CONSTRAINT "social_health_assessment_assessment_id_fkey" FOREIGN KEY (assessment_id) REFERENCES public."assessment"(assessment_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."Health Conditions"
  ADD CONSTRAINT "Health Conditions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(user_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."Appointment"
  ADD CONSTRAINT "Appointment_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(user_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."Prescription"
  ADD CONSTRAINT "Prescription_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(user_id) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE EVENT TRIGGER "ensure_rls"
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE FUNCTION "public"."rls_auto_enable"();

GRANT EXECUTE ON FUNCTION "public"."rls_auto_enable"() TO PUBLIC, "anon", "authenticated", "postgres", "prisma", "service_role";

REVOKE ALL ON SCHEMA "public" FROM "prisma";

GRANT CREATE, USAGE ON SCHEMA "public" TO "prisma";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."Health Conditions" TO "anon", "authenticated", "postgres", "prisma", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
  ON TABLE "public"."movement_assessment"
  TO "anon", "authenticated", "postgres", "prisma", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."pain_assessment" TO "anon", "authenticated", "postgres", "prisma", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
  ON TABLE "public"."personal_care_assessment"
  TO "anon", "authenticated", "postgres", "prisma", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
  ON TABLE "public"."social_health_assessment"
  TO "anon", "authenticated", "postgres", "prisma", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."Appointment" TO "anon", "authenticated", "postgres", "prisma", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."assessment" TO "anon", "authenticated", "postgres", "prisma", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."Prescription" TO "anon", "authenticated", "postgres", "prisma", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."User" TO "anon", "authenticated", "postgres", "prisma", "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT, UPDATE, USAGE ON SEQUENCES TO "prisma";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT EXECUTE ON FUNCTIONS TO "prisma";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLES TO "prisma";

