/*
  # Fix RLS policies for user authentication

  1. Security Updates
    - Drop existing restrictive policies that prevent user profile creation
    - Add proper INSERT policies for authenticated users to create their own profiles
    - Add proper SELECT policies for authenticated users to read their own data
    - Maintain admin access while fixing affiliate user access

  2. Tables Updated
    - `user_profiles`: Allow users to insert and select their own profiles
    - `affiliates`: Allow users to insert and select their own affiliate records

  3. Policy Changes
    - Users can insert records where auth.uid() = user_id
    - Users can select records where auth.uid() = user_id
    - Admin users maintain full access to all records
*/

-- Fix user_profiles table policies
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create new policies for user_profiles
CREATE POLICY "Enable insert for authenticated users" 
  ON user_profiles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for authenticated users" 
  ON user_profiles 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Enable update for authenticated users" 
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

-- Create new policies for affiliates
CREATE POLICY "Enable insert for authenticated users" 
  ON affiliates 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for authenticated users" 
  ON affiliates 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Enable update for authenticated users" 
  ON affiliates 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Maintain admin access
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
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );