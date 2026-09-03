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

CREATE TABLE "public"."Movement Assessment" (
  "movement_assessment_id" uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"             timestamp with time zone NOT NULL DEFAULT now(),
  "score"                  smallint                 NOT NULL,
  "standing_impact"        smallint                 NOT NULL,
  "lifting_impact"         smallint                 NOT NULL,
  "sitting_impact"         smallint                 NOT NULL,
  "walking_impact"         smallint                 NOT NULL,
  "active_hour"            smallint                 NOT NULL,
  "reflection"             text,
  "assessment_id"          uuid                     NOT NULL,
  CONSTRAINT "Movement Assessment_pkey" PRIMARY KEY (movement_assessment_id)
);

ALTER TABLE "public"."Movement Assessment"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."Pain Assessment" (
  "pain_assessment_id"      uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"              timestamp with time zone NOT NULL DEFAULT now(),
  "score"                   smallint                 NOT NULL,
  "worst_pain_evaluation"   smallint                 NOT NULL,
  "mildest_pain_evaluation" smallint                 NOT NULL,
  "average_pain_evaluation" smallint                 NOT NULL,
  "current_pain_evaluation" smallint                 NOT NULL,
  "pain_location"           text                     NOT NULL,
  "pain_characteristics"    text                     NOT NULL,
  "pain_reflection"         text,
  "assessment_id"           uuid                     NOT NULL,
  CONSTRAINT "Pain Assessment_pkey" PRIMARY KEY (pain_assessment_id)
);

ALTER TABLE "public"."Pain Assessment"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."Personal Care Assessment" (
  "personal_assmt_id"   uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "general_impact"      smallint                 NOT NULL,
  "personal_care_score" smallint                 NOT NULL,
  "sleeping_impact"     smallint                 NOT NULL,
  "score"               smallint                 NOT NULL,
  "reflection"          text,
  "assessment_id"       uuid                     NOT NULL,
  CONSTRAINT "Personal Care Assessment_pkey" PRIMARY KEY (personal_assmt_id)
);

ALTER TABLE "public"."Personal Care Assessment"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."Social Health Assessment" (
  "social_health_assmt_id" uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"             timestamp with time zone NOT NULL DEFAULT now(),
  "score"                  smallint                 NOT NULL,
  "social_life"            smallint                 NOT NULL,
  "travelling"             smallint                 NOT NULL,
  "mood_impact"            smallint                 NOT NULL,
  "relation_impact"        smallint                 NOT NULL,
  "enjoyment_impact"       smallint                 NOT NULL,
  "general_mood"           smallint                 NOT NULL,
  "assessment_id"          uuid                     NOT NULL,
  CONSTRAINT "Social Health Assessment_pkey" PRIMARY KEY (social_health_assmt_id)
);

ALTER TABLE "public"."Social Health Assessment"
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

CREATE TABLE "public"."Assessment" (
  "assessment_id" uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "date"          timestamp with time zone NOT NULL DEFAULT now(),
  "user_id"       uuid                     NOT NULL,
  "refelction"    text,
  CONSTRAINT "Assessment_pkey" PRIMARY KEY (assessment_id)
);

ALTER TABLE "public"."Assessment"
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

ALTER TABLE "public"."Movement Assessment"
  ADD CONSTRAINT "Movement Assessment_assessment_id_fkey" FOREIGN KEY (assessment_id) REFERENCES public."Assessment"(assessment_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."Pain Assessment"
  ADD CONSTRAINT "Pain Assessment_assessment_id_fkey" FOREIGN KEY (assessment_id) REFERENCES public."Assessment"(assessment_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."Personal Care Assessment"
  ADD CONSTRAINT "Personal Care Assessment_assessment_id_fkey" FOREIGN KEY (assessment_id) REFERENCES public."Assessment"(assessment_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."Social Health Assessment"
  ADD CONSTRAINT "Social Health Assessment_assessment_id_fkey" FOREIGN KEY (assessment_id) REFERENCES public."Assessment"(assessment_id) ON UPDATE CASCADE ON DELETE CASCADE;

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
  ON TABLE "public"."Movement Assessment"
  TO "anon", "authenticated", "postgres", "prisma", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."Pain Assessment" TO "anon", "authenticated", "postgres", "prisma", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
  ON TABLE "public"."Personal Care Assessment"
  TO "anon", "authenticated", "postgres", "prisma", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
  ON TABLE "public"."Social Health Assessment"
  TO "anon", "authenticated", "postgres", "prisma", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."Appointment" TO "anon", "authenticated", "postgres", "prisma", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."Assessment" TO "anon", "authenticated", "postgres", "prisma", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."Prescription" TO "anon", "authenticated", "postgres", "prisma", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."User" TO "anon", "authenticated", "postgres", "prisma", "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT, UPDATE, USAGE ON SEQUENCES TO "prisma";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT EXECUTE ON FUNCTIONS TO "prisma";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLES TO "prisma";

