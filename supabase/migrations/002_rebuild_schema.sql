-- ============================================================
-- EVS Event Portal - Canonical Supabase Schema Rebuild
-- Safe to run against a fresh project or a partially missing schema.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. ENUMS
-- ============================================================

DO $$
BEGIN
  CREATE TYPE public.event_type AS ENUM (
    'workshop',
    'seminar',
    'conference',
    'webinar',
    'competition',
    'field_visit',
    'awareness_campaign',
    'tree_plantation',
    'cleanliness_drive',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.event_status AS ENUM (
    'upcoming',
    'ongoing',
    'completed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user';

UPDATE public.profiles
SET role = 'user'
WHERE role IS NULL OR role NOT IN ('user', 'admin', 'super_admin');

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'super_admin'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_email_key'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_email_key UNIQUE (email);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  venue TEXT NOT NULL,
  theme TEXT,
  resource_person TEXT,
  resource_person_bio TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  event_type public.event_type NOT NULL DEFAULT 'other',
  expected_participants INT NOT NULL DEFAULT 0,
  actual_participants INT NOT NULL DEFAULT 0,
  flyer_url TEXT,
  flyer_path TEXT,
  status public.event_status NOT NULL DEFAULT 'upcoming',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT events_expected_participants_check CHECK (expected_participants >= 0),
  CONSTRAINT events_actual_participants_check CHECK (actual_participants >= 0)
);

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_time TIME;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS theme TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS resource_person TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS resource_person_bio TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS flyer_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS flyer_path TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  participant_email TEXT,
  participant_phone TEXT,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attended BOOLEAN NOT NULL DEFAULT FALSE,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.event_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  tag TEXT NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'event_tags_event_id_tag_key'
      AND conrelid = 'public.event_tags'::regclass
  ) THEN
    ALTER TABLE public.event_tags
      ADD CONSTRAINT event_tags_event_id_tag_key UNIQUE (event_id, tag);
  END IF;
END $$;

-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_department_id ON public.profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date DESC);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_department_id ON public.events(department_id);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tags_event_id ON public.event_tags(event_id);

-- ============================================================
-- 4. RLS HELPERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.current_profile_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.role
  FROM public.profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_department_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.department_id
  FROM public.profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role() = 'super_admin', FALSE);
$$;

CREATE OR REPLACE FUNCTION public.is_staff_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role() IN ('admin', 'super_admin'), FALSE);
$$;

GRANT EXECUTE ON FUNCTION public.current_profile_role() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_department_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff_user() TO anon, authenticated, service_role;

-- ============================================================
-- 5. TRIGGERS / FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.sync_event_status_from_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' THEN
    RETURN NEW;
  END IF;

  IF NEW.date < CURRENT_DATE THEN
    NEW.status = 'completed';
  ELSIF NEW.date = CURRENT_DATE THEN
    NEW.status = 'ongoing';
  ELSE
    NEW.status = 'upcoming';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NEW.email),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_events_updated_at ON public.events;
CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS sync_event_status_on_write ON public.events;
CREATE TRIGGER sync_event_status_on_write
  BEFORE INSERT OR UPDATE OF date, status ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_event_status_from_date();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

UPDATE public.events
SET status = CASE
  WHEN status = 'cancelled' THEN status
  WHEN date < CURRENT_DATE THEN 'completed'::public.event_status
  WHEN date = CURRENT_DATE THEN 'ongoing'::public.event_status
  ELSE 'upcoming'::public.event_status
END;

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read departments" ON public.departments;
CREATE POLICY "Public read departments"
  ON public.departments FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Super admins manage departments" ON public.departments;
CREATE POLICY "Super admins manage departments"
  ON public.departments FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
CREATE POLICY "Super admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "Super admins can insert profiles" ON public.profiles;
CREATE POLICY "Super admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Super admins can update profiles" ON public.profiles;
CREATE POLICY "Super admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Super admins can delete profiles" ON public.profiles;
CREATE POLICY "Super admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "Public can view events" ON public.events;
CREATE POLICY "Public can view events"
  ON public.events FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
CREATE POLICY "Admins can insert events"
  ON public.events FOR INSERT
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.current_profile_role() = 'admin'
      AND department_id = public.current_department_id()
    )
  );

DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events"
  ON public.events FOR UPDATE
  USING (
    public.is_super_admin()
    OR (
      public.current_profile_role() = 'admin'
      AND department_id = public.current_department_id()
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.current_profile_role() = 'admin'
      AND department_id = public.current_department_id()
    )
  );

DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events"
  ON public.events FOR DELETE
  USING (
    public.is_super_admin()
    OR (
      public.current_profile_role() = 'admin'
      AND department_id = public.current_department_id()
    )
  );

DROP POLICY IF EXISTS "Anyone can register" ON public.event_registrations;
CREATE POLICY "Anyone can register"
  ON public.event_registrations FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admins can view registrations" ON public.event_registrations;
CREATE POLICY "Admins can view registrations"
  ON public.event_registrations FOR SELECT
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = event_id
        AND public.current_profile_role() = 'admin'
        AND e.department_id = public.current_department_id()
    )
  );

DROP POLICY IF EXISTS "Admins can update registrations" ON public.event_registrations;
CREATE POLICY "Admins can update registrations"
  ON public.event_registrations FOR UPDATE
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = event_id
        AND public.current_profile_role() = 'admin'
        AND e.department_id = public.current_department_id()
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = event_id
        AND public.current_profile_role() = 'admin'
        AND e.department_id = public.current_department_id()
    )
  );

DROP POLICY IF EXISTS "Admins can delete registrations" ON public.event_registrations;
CREATE POLICY "Admins can delete registrations"
  ON public.event_registrations FOR DELETE
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = event_id
        AND public.current_profile_role() = 'admin'
        AND e.department_id = public.current_department_id()
    )
  );

DROP POLICY IF EXISTS "Public can view tags" ON public.event_tags;
CREATE POLICY "Public can view tags"
  ON public.event_tags FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Admins can insert tags" ON public.event_tags;
CREATE POLICY "Admins can insert tags"
  ON public.event_tags FOR INSERT
  WITH CHECK (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = event_id
        AND public.current_profile_role() = 'admin'
        AND e.department_id = public.current_department_id()
    )
  );

DROP POLICY IF EXISTS "Admins can update tags" ON public.event_tags;
CREATE POLICY "Admins can update tags"
  ON public.event_tags FOR UPDATE
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = event_id
        AND public.current_profile_role() = 'admin'
        AND e.department_id = public.current_department_id()
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = event_id
        AND public.current_profile_role() = 'admin'
        AND e.department_id = public.current_department_id()
    )
  );

DROP POLICY IF EXISTS "Admins can delete tags" ON public.event_tags;
CREATE POLICY "Admins can delete tags"
  ON public.event_tags FOR DELETE
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = event_id
        AND public.current_profile_role() = 'admin'
        AND e.department_id = public.current_department_id()
    )
  );

-- ============================================================
-- 7. ANALYTICS VIEWS
-- ============================================================

CREATE OR REPLACE VIEW public.monthly_event_stats AS
SELECT
  TO_CHAR(e.date, 'YYYY-MM') AS month,
  COUNT(*)::BIGINT AS total_events,
  COALESCE(SUM(e.actual_participants), 0)::BIGINT AS total_participants,
  COALESCE(AVG(e.actual_participants), 0)::NUMERIC AS avg_participants
FROM public.events e
GROUP BY TO_CHAR(e.date, 'YYYY-MM')
ORDER BY month DESC;

CREATE OR REPLACE VIEW public.department_event_stats AS
SELECT
  d.name AS department_name,
  COUNT(e.id)::BIGINT AS total_events,
  COALESCE(SUM(e.actual_participants), 0)::BIGINT AS total_participants
FROM public.departments d
LEFT JOIN public.events e ON e.department_id = d.id
GROUP BY d.id, d.name
ORDER BY total_events DESC, d.name ASC;

-- ============================================================
-- 8. STORAGE
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  TRUE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-flyers',
  'event-flyers',
  TRUE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read event media" ON storage.objects;
CREATE POLICY "Public read event media"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('event-images', 'event-flyers'));

DROP POLICY IF EXISTS "Admins can upload event media" ON storage.objects;
CREATE POLICY "Admins can upload event media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('event-images', 'event-flyers')
    AND auth.role() = 'authenticated'
    AND public.is_staff_user()
  );

DROP POLICY IF EXISTS "Admins can update event media" ON storage.objects;
CREATE POLICY "Admins can update event media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id IN ('event-images', 'event-flyers')
    AND auth.role() = 'authenticated'
    AND public.is_staff_user()
  );

DROP POLICY IF EXISTS "Admins can delete event media" ON storage.objects;
CREATE POLICY "Admins can delete event media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id IN ('event-images', 'event-flyers')
    AND auth.role() = 'authenticated'
    AND public.is_staff_user()
  );

-- ============================================================
-- 9. SEED DATA
-- ============================================================

INSERT INTO public.departments (name, code) VALUES
  ('Department of Environmental Science', 'EVS'),
  ('Department of Botany', 'BOT'),
  ('Department of Zoology', 'ZOO'),
  ('Department of Chemistry', 'CHE'),
  ('Department of Physics', 'PHY'),
  ('Department of Computer Science', 'CSC'),
  ('Department of Geography', 'GEO'),
  ('Department of Civil Engineering', 'CVL'),
  ('Department of Biotechnology', 'BIO'),
  ('Department of Agriculture', 'AGR')
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name;

INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  u.email,
  COALESCE(NULLIF(u.raw_user_meta_data->>'full_name', ''), u.email),
  'user'
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles p
SET email = u.email,
    full_name = COALESCE(p.full_name, NULLIF(u.raw_user_meta_data->>'full_name', ''), u.email)
FROM auth.users u
WHERE p.id = u.id
  AND (p.email IS DISTINCT FROM u.email OR p.full_name IS NULL);

-- ============================================================
-- 10. SUPER ADMIN PROMOTION
-- Run after your auth user exists:
--
-- UPDATE public.profiles
-- SET role = 'super_admin'
-- WHERE LOWER(email) = LOWER('superadmin@gmail.com');
-- ============================================================