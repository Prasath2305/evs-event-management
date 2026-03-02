-- ============================================================
-- EVS Event Portal — Complete Database Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- 1. ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE event_type AS ENUM (
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
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM (
    'upcoming',
    'ongoing',
    'completed',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- 2. DEPARTMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS departments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  code        TEXT        NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Anyone (including public portal) can read departments
DROP POLICY IF EXISTS "Public read departments" ON departments;
CREATE POLICY "Public read departments"
  ON departments FOR SELECT
  USING (true);

-- NOTE: "Super admins manage departments" policy is added AFTER profiles is created below.


-- ============================================================
-- 3. PROFILES  (linked to auth.users)
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT        NOT NULL,
  full_name       TEXT,
  role            TEXT        NOT NULL DEFAULT 'admin'
                              CHECK (role IN ('admin', 'super_admin')),
  department_id   UUID        REFERENCES departments(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Super admins can read all profiles
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
CREATE POLICY "Super admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- Super admins can insert profiles
DROP POLICY IF EXISTS "Super admins can insert profiles" ON profiles;
CREATE POLICY "Super admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- Super admins can update profiles
DROP POLICY IF EXISTS "Super admins can update profiles" ON profiles;
CREATE POLICY "Super admins can update profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- Super admins can delete profiles
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;
CREATE POLICY "Super admins can delete profiles"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- Now that profiles exists, add the departments super_admin policy
DROP POLICY IF EXISTS "Super admins manage departments" ON departments;
CREATE POLICY "Super admins manage departments"
  ON departments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );


-- ============================================================
-- 4. EVENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS events (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT          NOT NULL,
  description           TEXT,
  date                  DATE          NOT NULL,
  start_time            TIME,
  end_time              TIME,
  venue                 TEXT          NOT NULL,
  theme                 TEXT,
  resource_person       TEXT,
  resource_person_bio   TEXT,
  department_id         UUID          REFERENCES departments(id) ON DELETE SET NULL,
  event_type            event_type    NOT NULL DEFAULT 'other',
  expected_participants INT           NOT NULL DEFAULT 0,
  actual_participants   INT           NOT NULL DEFAULT 0,
  flyer_url             TEXT,
  flyer_path            TEXT,
  status                event_status  NOT NULL DEFAULT 'upcoming',
  is_featured           BOOLEAN       NOT NULL DEFAULT FALSE,
  created_by            UUID          REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public can view all events (public portal)
DROP POLICY IF EXISTS "Public can view events" ON events;
CREATE POLICY "Public can view events"
  ON events FOR SELECT
  USING (true);

-- Admins/super admins can insert events
DROP POLICY IF EXISTS "Admins can insert events" ON events;
CREATE POLICY "Admins can insert events"
  ON events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
        AND (p.role = 'super_admin' OR p.department_id = department_id)
    )
  );

-- Admins update own events; super admins update any
DROP POLICY IF EXISTS "Admins can update events" ON events;
CREATE POLICY "Admins can update events"
  ON events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND (
          p.role = 'super_admin'
          OR (p.role = 'admin' AND created_by = auth.uid())
        )
    )
  );

-- Admins delete own events; super admins delete any
DROP POLICY IF EXISTS "Admins can delete events" ON events;
CREATE POLICY "Admins can delete events"
  ON events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND (
          p.role = 'super_admin'
          OR (p.role = 'admin' AND created_by = auth.uid())
        )
    )
  );


-- ============================================================
-- 5. EVENT REGISTRATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS event_registrations (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  participant_name    TEXT        NOT NULL,
  participant_email   TEXT,
  participant_phone   TEXT,
  registration_date   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attended            BOOLEAN     NOT NULL DEFAULT FALSE,
  feedback            TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Public can register
DROP POLICY IF EXISTS "Anyone can register" ON event_registrations;
CREATE POLICY "Anyone can register"
  ON event_registrations FOR INSERT
  WITH CHECK (true);

-- Admins/super admins can read registrations
DROP POLICY IF EXISTS "Admins can view registrations" ON event_registrations;
CREATE POLICY "Admins can view registrations"
  ON event_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid()
    )
  );

-- Admins/super admins can update registrations (e.g. mark attended)
DROP POLICY IF EXISTS "Admins can update registrations" ON event_registrations;
CREATE POLICY "Admins can update registrations"
  ON event_registrations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid()
    )
  );


-- ============================================================
-- 6. EVENT TAGS
-- ============================================================

CREATE TABLE IF NOT EXISTS event_tags (
  id        UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  UUID  NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  tag       TEXT  NOT NULL
);

ALTER TABLE event_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view tags" ON event_tags;
CREATE POLICY "Public can view tags"
  ON event_tags FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage tags" ON event_tags;
CREATE POLICY "Admins can manage tags"
  ON event_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
    )
  );


-- ============================================================
-- 7. VIEWS
-- ============================================================

CREATE OR REPLACE VIEW monthly_event_stats AS
SELECT
  TO_CHAR(date, 'YYYY-MM') AS month,
  COUNT(*)                 AS total_events,
  SUM(actual_participants) AS total_participants,
  AVG(actual_participants) AS avg_participants
FROM events
GROUP BY TO_CHAR(date, 'YYYY-MM')
ORDER BY month DESC;

CREATE OR REPLACE VIEW department_event_stats AS
SELECT
  d.name           AS department_name,
  COUNT(e.id)      AS total_events,
  SUM(e.actual_participants) AS total_participants
FROM departments d
LEFT JOIN events e ON e.department_id = d.id
GROUP BY d.id, d.name
ORDER BY total_events DESC;


-- ============================================================
-- 8. FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at on events
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON events;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile row when a new auth user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- 9. STORAGE BUCKET  (event flyer images)
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-flyers',
  'event-flyers',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Public read
DROP POLICY IF EXISTS "Public read event flyers" ON storage.objects;
CREATE POLICY "Public read event flyers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-flyers');

-- Authenticated users (admins) can upload
DROP POLICY IF EXISTS "Admins can upload flyers" ON storage.objects;
CREATE POLICY "Admins can upload flyers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'event-flyers'
    AND auth.role() = 'authenticated'
  );

-- Authenticated users can update/delete their uploads
DROP POLICY IF EXISTS "Admins can update flyers" ON storage.objects;
CREATE POLICY "Admins can update flyers"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'event-flyers'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Admins can delete flyers" ON storage.objects;
CREATE POLICY "Admins can delete flyers"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'event-flyers'
    AND auth.role() = 'authenticated'
  );


-- ============================================================
-- 10. SEED: SAMPLE DEPARTMENTS
-- ============================================================

INSERT INTO departments (name, code) VALUES
  ('Department of Environmental Science',        'EVS'),
  ('Department of Botany',                       'BOT'),
  ('Department of Zoology',                      'ZOO'),
  ('Department of Chemistry',                    'CHE'),
  ('Department of Physics',                      'PHY'),
  ('Department of Computer Science',             'CSC'),
  ('Department of Geography',                    'GEO'),
  ('Department of Civil Engineering',            'CVL'),
  ('Department of Biotechnology',                'BIO'),
  ('Department of Agriculture',                  'AGR')
ON CONFLICT (code) DO NOTHING;


-- ============================================================
-- 11. BACKFILL: create profiles for any existing auth users
--     (trigger only fires for NEW users going forward)
-- ============================================================

INSERT INTO profiles (id, email, full_name, role)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email),
  COALESCE(raw_user_meta_data->>'role', 'admin')
FROM auth.users
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 12. PROMOTE YOUR SUPER ADMIN
--     Run this block separately, replacing the email:
-- ============================================================
--
--   UPDATE profiles
--   SET role = 'super_admin'
--   WHERE email = 'your-email@example.com';
--
