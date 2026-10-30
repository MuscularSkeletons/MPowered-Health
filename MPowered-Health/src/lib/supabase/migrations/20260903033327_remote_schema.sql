SET LOCAL check_function_bodies = off;

-- ROLE

CREATE ROLE "prisma"
  WITH NOSUPERUSER INHERIT NOCREATEROLE CREATEDB
  LOGIN NOREPLICATION BYPASSRLS;

GRANT "prisma" TO "postgres" WITH ADMIN OPTION;


-- USER PROFILE

CREATE TABLE public."user" (
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name character varying NOT NULL,
  birth_year numeric,
  sex USER-DEFINED,
  onboarding_complete boolean,
  formal_diagnosis boolean,
  other_condition text,
  pain_conditions ARRAY,
  CONSTRAINT user_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);


-- ASSESSMENT

CREATE TABLE public.assessment (
  assessment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  date timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid,
  week_start date NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT assessment_pkey PRIMARY KEY (assessment_id),
  CONSTRAINT assessment_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public."user"(user_id)
    ON DELETE CASCADE
);


-- PAIN ASSESSMENT

CREATE TABLE public.pain_assessment (
  pain_assessment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  worst_pain smallint NOT NULL,
  mildest_pain smallint NOT NULL,
  average_pain smallint NOT NULL,
  current_pain smallint NOT NULL,
  pain_location ARRAY NOT NULL,
  pain_characteristics ARRAY NOT NULL,
  assessment_id uuid UNIQUE,
  CONSTRAINT pain_assessment_pkey PRIMARY KEY (pain_assessment_id),
  CONSTRAINT pain_assessment_assessment_id_fkey
    FOREIGN KEY (assessment_id)
    REFERENCES public.assessment(assessment_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);


-- MOVEMENT ASSESSMENT

CREATE TABLE public.movement_assessment (
  movement_assessment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  movement_reflection text,
  assessment_id uuid UNIQUE,
  standing_impact text NOT NULL,
  lifting_impact text NOT NULL,
  sitting_impact text NOT NULL,
  walking_impact text NOT NULL,
  active_hour text NOT NULL,
  general_impacts ARRAY NOT NULL,
  impact_level text NOT NULL,
  CONSTRAINT movement_assessment_pkey PRIMARY KEY (movement_assessment_id),
  CONSTRAINT movement_assessment_assessment_id_fkey
    FOREIGN KEY (assessment_id)
    REFERENCES public.assessment(assessment_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);


-- PERSONAL CARE ASSESSMENT

CREATE TABLE public.personal_care_assessment (
  personal_assmt_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  care_reflection text,
  assessment_id uuid UNIQUE,
  activities_impact ARRAY NOT NULL,
  personal_care_impact text NOT NULL,
  sleeping_impact text NOT NULL,
  impact_level text NOT NULL,
  CONSTRAINT personal_care_assessment_pkey PRIMARY KEY (personal_assmt_id),
  CONSTRAINT personal_care_assessment_assessment_id_fkey
    FOREIGN KEY (assessment_id)
    REFERENCES public.assessment(assessment_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);


-- SOCIAL HEALTH ASSESSMENT

CREATE TABLE public.social_health_assessment (
  social_health_assmt_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  mood_impact smallint NOT NULL,
  relation_impact smallint NOT NULL,
  enjoyment_impact smallint NOT NULL,
  assessment_id uuid UNIQUE,
  social_life text NOT NULL,
  travelling text NOT NULL,
  general_mood text NOT NULL,
  mood_trigger text,
  impact_level text NOT NULL,
  CONSTRAINT social_health_assessment_pkey PRIMARY KEY (social_health_assmt_id),
  CONSTRAINT social_health_assessment_assessment_id_fkey
    FOREIGN KEY (assessment_id)
    REFERENCES public.assessment(assessment_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);


-- MANAGEMENT ASSESSMENT

CREATE TABLE public.management_assessment (
  management_assessment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  otc_medication text,
  emotion_strategies text,
  assessment_id uuid UNIQUE,
  medication ARRAY,
  exercise_frequency text NOT NULL,
  CONSTRAINT management_assessment_pkey PRIMARY KEY (management_assessment_id),
  CONSTRAINT management_assessment_assessment_id_fkey
    FOREIGN KEY (assessment_id)
    REFERENCES public.assessment(assessment_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);


-- PRESCRIPTIONS

CREATE TABLE public.prescription (
  prescription_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  medicine_name text NOT NULL,
  strength numeric NOT NULL,
  strength_unit text NOT NULL,
  form text NOT NULL,
  frequency text NOT NULL,
  number_of_repeat smallint NOT NULL,
  user_id uuid NOT NULL,
  CONSTRAINT prescription_pkey PRIMARY KEY (prescription_id),
  CONSTRAINT prescription_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public."user"(user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);


-- QUESTIONS

CREATE TABLE public.question (
  question_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  question text NOT NULL,
  answer text,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT question_pkey PRIMARY KEY (question_id),
  CONSTRAINT question_user_profile_fkey
    FOREIGN KEY (user_id)
    REFERENCES public."user"(user_id)
    ON DELETE CASCADE,
  CONSTRAINT question_auth_user_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);


-- DELETE REQUEST

CREATE TABLE public.delete_request (
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT delete_request_pkey PRIMARY KEY (user_id),
  CONSTRAINT delete_request_auth_user_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE,
  CONSTRAINT delete_request_user_profile_fkey
    FOREIGN KEY (user_id)
    REFERENCES public."user"(user_id)
    ON DELETE CASCADE
);


-- ROW LEVEL SECURITY
-- NOTE: Policies defined separately

ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pain_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movement_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_care_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_health_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.management_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delete_request ENABLE ROW LEVEL SECURITY;


-- AUTOMATIC RLS FOR FUTURE TABLES 

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
    WHERE command_tag IN (
      'CREATE TABLE',
      'CREATE TABLE AS',
      'SELECT INTO'
    )
      AND object_type IN ('table', 'partitioned table')
  LOOP
    IF cmd.schema_name = 'public' THEN
      BEGIN
        EXECUTE format(
          'ALTER TABLE IF EXISTS %s ENABLE ROW LEVEL SECURITY',
          cmd.object_identity
        );

        RAISE LOG
          'rls_auto_enable: enabled RLS on %',
          cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG
            'rls_auto_enable: failed to enable RLS on %',
            cmd.object_identity;
      END;
    END IF;
  END LOOP;
END;
$function$;


-- TABLE GRANTS

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
ON TABLE public.user
TO anon, authenticated, postgres, prisma, service_role;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
ON TABLE public.assessment
TO anon, authenticated, postgres, prisma, service_role;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
ON TABLE public.pain_assessment
TO anon, authenticated, postgres, prisma, service_role;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
ON TABLE public.movement_assessment
TO anon, authenticated, postgres, prisma, service_role;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
ON TABLE public.personal_care_assessment
TO anon, authenticated, postgres, prisma, service_role;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
ON TABLE public.social_health_assessment
TO anon, authenticated, postgres, prisma, service_role;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
ON TABLE public.management_assessment
TO anon, authenticated, postgres, prisma, service_role;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
ON TABLE public.prescription
TO anon, authenticated, postgres, prisma, service_role;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
ON TABLE public.question
TO anon, authenticated, postgres, prisma, service_role;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
ON TABLE public.delete_request
TO anon, authenticated, postgres, prisma, service_role;


-- PRISMA SCHEMA ACCESS

REVOKE ALL ON SCHEMA public FROM prisma;

GRANT CREATE, USAGE ON SCHEMA public TO prisma;


-- DEFAULT PRIVILEGES FOR FUTURE OBJECTS

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT SELECT, UPDATE, USAGE ON SEQUENCES TO prisma;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT EXECUTE ON FUNCTIONS TO prisma;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
ON TABLES TO prisma;
