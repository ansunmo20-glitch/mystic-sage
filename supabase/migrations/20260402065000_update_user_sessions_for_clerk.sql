/*
  # Update user sessions table for Clerk authentication

  1. Changes
    - Remove foreign key constraint to auth.users since we're using Clerk
    - Update user_id column to accept text type for Clerk user IDs
    - Drop existing RLS policies that reference auth.uid()
    - Disable RLS since authentication is handled by Clerk

  2. Important Notes
    - This migration removes the dependency on Supabase Auth
    - User IDs will now be Clerk user IDs (text format)
    - Session tracking remains in Supabase database
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own session data" ON user_sessions;
DROP POLICY IF EXISTS "Users can create own session data" ON user_sessions;
DROP POLICY IF EXISTS "Users can update own session data" ON user_sessions;

-- Drop the table and recreate without auth.users reference
DROP TABLE IF EXISTS user_sessions;

CREATE TABLE user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  email text NOT NULL,
  sessions_used integer DEFAULT 0 NOT NULL,
  week_start_date date NOT NULL,
  last_session_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups by user_id
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

-- Create unique constraint to ensure one record per user
CREATE UNIQUE INDEX idx_user_sessions_user_id_unique ON user_sessions(user_id);

-- Disable RLS since Clerk handles authentication
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;

-- Function to update updated_at timestamp (recreate)
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