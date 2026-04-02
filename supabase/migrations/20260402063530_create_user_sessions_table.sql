/*
  # Create user sessions tracking table

  1. New Tables
    - `user_sessions`
      - `id` (uuid, primary key) - Unique identifier for each session record
      - `user_id` (uuid, foreign key) - References auth.users(id)
      - `email` (text) - User's email for easy reference
      - `sessions_used` (integer) - Number of sessions used in current week
      - `week_start_date` (date) - Start date of current tracking week (Monday)
      - `last_session_at` (timestamptz) - Timestamp of last session
      - `created_at` (timestamptz) - When record was created
      - `updated_at` (timestamptz) - When record was last updated

  2. Security
    - Enable RLS on `user_sessions` table
    - Add policy for users to read their own session data
    - Add policy for users to update their own session data

  3. Important Notes
    - Week starts on Monday and resets every Monday
    - Free users limited to 1 session per week
    - Session count automatically managed by application logic
*/

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  sessions_used integer DEFAULT 0 NOT NULL,
  week_start_date date NOT NULL,
  last_session_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- Create unique constraint to ensure one record per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_sessions_user_id_unique ON user_sessions(user_id);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own session data
CREATE POLICY "Users can view own session data"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own session data
CREATE POLICY "Users can create own session data"
  ON user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own session data
CREATE POLICY "Users can update own session data"
  ON user_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();