/*
  # Add user_id to affiliates table

  1. Changes
    - Add `user_id` column to `affiliates` table
    - Add foreign key constraint to `auth.users`
    - Add unique constraint to ensure one affiliate per user
    - Update RLS policies to work with user_id

  2. Security
    - Update RLS policies to use user_id for access control
    - Ensure affiliates can only access their own data
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

-- Add foreign key constraint to auth.users
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

-- Add unique constraint to ensure one affiliate per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'affiliates_user_id_key'
  ) THEN
    ALTER TABLE affiliates 
    ADD CONSTRAINT affiliates_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Update RLS policies to use user_id
DROP POLICY IF EXISTS "Allow admin full access to affiliates" ON affiliates;
DROP POLICY IF EXISTS "Allow read access to affiliates" ON affiliates;

-- Create new RLS policies
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

-- Allow admins full access (assuming you have admin users)
CREATE POLICY "Admin full access to affiliates"
  ON affiliates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );