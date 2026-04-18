/*
  # Add Admin Settings and Announcements Tables

  ## New Tables

  ### admin_settings
  - `id` (uuid, primary key)
  - `key` (text, unique) — setting identifier (e.g. 'welcome_tokens', 'service_status')
  - `value` (text) — setting value as text (parsed on read)
  - `updated_at` (timestamptz)

  ### announcements
  - `id` (uuid, primary key)
  - `message` (text) — broadcast message text
  - `active` (boolean) — whether this announcement is currently shown
  - `created_at` (timestamptz)

  ## Seed Data
  - Default welcome_tokens = 10000
  - Default service_status = 'online'

  ## Security
  - RLS enabled on both tables
  - anon role can SELECT (needed so the frontend can read service status / announcements)
  - No INSERT/UPDATE/DELETE from anon — those go through service role in edge functions
*/

CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read admin settings"
  ON admin_settings FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO admin_settings (key, value)
  VALUES ('welcome_tokens', '10000'), ('service_status', 'online')
  ON CONFLICT (key) DO NOTHING;


CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active announcements"
  ON announcements FOR SELECT
  TO anon, authenticated
  USING (true);
