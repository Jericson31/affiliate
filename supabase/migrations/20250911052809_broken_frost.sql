/*
  # Fix RLS policies for user_profiles and affiliates tables

  1. Security Updates
    - Drop existing restrictive policies on user_profiles table
    - Create proper INSERT policy for authenticated users on user_profiles
    - Create proper SELECT policy for authenticated users on user_profiles
    - Drop existing restrictive policies on affiliates table  
    - Create proper INSERT policy for authenticated users on affiliates
    - Create proper SELECT policy for authenticated users on affiliates

  2. Changes
    - Allow authenticated users to insert their own profile records
    - Allow authenticated users to select their own profile records
    - Allow authenticated users to insert their own affiliate records
    - Allow authenticated users to select their own affiliate records
*/

-- Fix user_profiles table policies
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create proper policies for user_profiles
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix affiliates table policies
DROP POLICY IF EXISTS "Users can insert own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Users can read own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Users can update own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Admin full access to affiliates" ON affiliates;

-- Create proper policies for affiliates
CREATE POLICY "Users can insert own affiliate data"
  ON affiliates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own affiliate data"
  ON affiliates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate data"
  ON affiliates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Keep admin access policy for affiliates
CREATE POLICY "Admin full access to affiliates"
  ON affiliates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );