/*
  # Add Suspended and Subscription Status Columns

  1. Changes
    - Add `suspended` column to user_sessions table
      - Type: boolean
      - Default: false
      - Tracks whether a user account is suspended
    
    - Add `subscription_status` column to user_sessions table
      - Type: text
      - Default: 'free'
      - Tracks user subscription tier (free, premium, etc.)

  2. Notes
    - Uses IF NOT EXISTS to prevent errors if columns already exist
    - Both columns have sensible defaults for existing records
*/

ALTER TABLE user_sessions 
ADD COLUMN IF NOT EXISTS suspended boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free';