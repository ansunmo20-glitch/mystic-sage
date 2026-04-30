/*
  # Create diary_entries table

  Uses TEXT user_id (Clerk) — consistent with user_sessions.
  RLS disabled: auth is handled by Clerk, user_id filter enforced in queries.
*/

CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id TEXT,
  date DATE NOT NULL,
  content TEXT,
  emotion_before TEXT,
  emotion_after TEXT,
  sage_message TEXT,
  original_chat JSONB,
  bg_color TEXT DEFAULT '#faf6ef',
  theme TEXT DEFAULT 'default',
  character TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS diary_user_date_idx ON diary_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS diary_session_idx ON diary_entries(session_id);

ALTER TABLE diary_entries DISABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION update_diary_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_diary_entries_updated_at ON diary_entries;
CREATE TRIGGER update_diary_entries_updated_at
  BEFORE UPDATE ON diary_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_diary_entries_updated_at();
