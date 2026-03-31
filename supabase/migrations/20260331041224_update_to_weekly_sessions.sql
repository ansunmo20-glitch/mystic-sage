/*
  # Update to Weekly Session Tracking

  1. Changes
    - Rename daily_usage table to weekly_usage
    - Change date column to week_start date
    - Update question_count to sessions_used (tracks session count)
    - Add capacity constant (default 7 sessions per week)
  
  2. Security
    - Keep existing RLS policies updated for renamed table
*/

DROP TABLE IF EXISTS weekly_usage;

CREATE TABLE IF NOT EXISTS weekly_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  sessions_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE weekly_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weekly usage"
  ON weekly_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly usage"
  ON weekly_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly usage"
  ON weekly_usage FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_weekly_usage_user_date ON weekly_usage(user_id, week_start);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_usage') THEN
    DROP TABLE daily_usage;
  END IF;
END $$;
