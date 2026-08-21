/*
# Create universities and courses tables for UniFinder Nigeria

1. New Tables
- `universities`
  - id (uuid, primary key)
  - name (text, not null) — official university name
  - short_name (text) — abbreviated name e.g. UNILAG
  - state (text, not null) — Nigerian state where located
  - city (text) — city within the state
  - type (text, not null) — 'federal' | 'state' | 'private'
  - website (text) — official website URL
  - established_year (int) — year founded
  - description (text) — short description
  - last_verified (date, not null) — date info was last checked
  - created_at (timestamptz)
- `courses`
  - id (uuid, primary key)
  - university_id (uuid, FK -> universities, cascade delete)
  - name (text, not null) — course/program name
  - degree (text) — e.g. B.Sc., M.B.B.S
  - duration_years (int) — program length
  - estimated_fee_ngn (numeric) — estimated annual tuition in Naira
  - admission_requirements (text) — JAMB subject combo / O'level requirements
  - last_verified (date, not null)
  - created_at (timestamptz)

2. Security
- Enable RLS on both tables.
- Public read for anon + authenticated (no-auth app, data is intentionally shared).
- No write policies needed for v1 (data seeded server-side).

3. Indexes
- universities(state), universities(type), universities(name) for filter/search.
- courses(university_id), courses(name) for joins and course filtering.
*/

CREATE TABLE IF NOT EXISTS universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text,
  state text NOT NULL,
  city text,
  type text NOT NULL CHECK (type IN ('federal', 'state', 'private')),
  website text,
  established_year int,
  description text,
  last_verified date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name text NOT NULL,
  degree text,
  duration_years int,
  estimated_fee_ngn numeric,
  admission_requirements text,
  last_verified date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_universities_state ON universities(state);
CREATE INDEX IF NOT EXISTS idx_universities_type ON universities(type);
CREATE INDEX IF NOT EXISTS idx_universities_name ON universities(name);
CREATE INDEX IF NOT EXISTS idx_courses_university_id ON courses(university_id);
CREATE INDEX IF NOT EXISTS idx_courses_name ON courses(name);

ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_universities" ON universities;
CREATE POLICY "anon_read_universities" ON universities FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_read_courses" ON courses;
CREATE POLICY "anon_read_courses" ON courses FOR SELECT
  TO anon, authenticated USING (true);
