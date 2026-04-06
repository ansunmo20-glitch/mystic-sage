/*
  # Add admin management columns to user_sessions

  1. Changes to user_sessions table
    - Add `suspended` (boolean) - Whether the user is suspended from using the service
    - Add `subscription_status` (text) - User's subscription tier (free, premium, etc.)
  
  2. Security
    - Columns have safe default values
    - Existing data remains intact
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_sessions' AND column_name = 'suspended'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN suspended boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_sessions' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN subscription_status text DEFAULT 'free' NOT NULL;
  END IF;
END $$;