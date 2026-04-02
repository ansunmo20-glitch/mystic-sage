/*
  # Add token usage tracking to user sessions

  1. Changes
    - Add `tokens_used` column to track total tokens consumed in current session
    - Add `max_tokens` column to set the token limit per session (default 100,000)
    - Add `tokens_input` column to track input tokens
    - Add `tokens_output` column to track output tokens
    
  2. Important Notes
    - Free users get 100,000 tokens per session
    - Token usage resets with each new session (each week on Monday)
    - The usage bar will display token consumption progress
*/

-- Add token tracking columns to user_sessions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_sessions' AND column_name = 'tokens_used'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN tokens_used integer DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_sessions' AND column_name = 'max_tokens'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN max_tokens integer DEFAULT 100000 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_sessions' AND column_name = 'tokens_input'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN tokens_input integer DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_sessions' AND column_name = 'tokens_output'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN tokens_output integer DEFAULT 0 NOT NULL;
  END IF;
END $$;