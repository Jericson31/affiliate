/*
  # Add user_id column to affiliates table

  1. Schema Changes
    - Add `user_id` column to `affiliates` table
    - Link affiliates to auth.users via foreign key
    - Add unique constraint to ensure one affiliate per user
    - Update RLS policies to use user_id for access control

  2. Security
    - Update RLS policies to work with user_id
    - Ensure users can only access their own affiliate data
*/

-- Add user_id column to affiliates table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'affiliates' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE affiliates ADD COLUMN user_id uuid;
  END IF;
END $$;

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'affiliates_user_id_fkey'
  ) THEN
    ALTER TABLE affiliates 
    ADD CONSTRAINT affiliates_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'affiliates_user_id_key'
  ) THEN
    ALTER TABLE affiliates 
    ADD CONSTRAINT affiliates_user_id_key 
    UNIQUE (user_id);
  END IF;
END $$;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can read own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Users can update own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Users can insert own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Admin full access to affiliates" ON affiliates;

-- Create new RLS policies using user_id
CREATE POLICY "Users can read own affiliate data"
  ON affiliates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate data"
  ON affiliates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own affiliate data"
  ON affiliates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin full access to affiliates"
  ON affiliates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );