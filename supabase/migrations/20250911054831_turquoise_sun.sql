/*
  # Fix RLS policies for user_profiles table

  This migration addresses the "new row violates row-level security policy" error
  by properly configuring Row-Level Security policies for the user_profiles table.

  ## Changes Made
  1. Enable RLS on user_profiles table
  2. Drop all existing conflicting policies
  3. Create proper SELECT policy for authenticated users
  4. Create proper INSERT policy for authenticated users  
  5. Create proper UPDATE policy for authenticated users
  6. Create admin access policy for full management

  ## Security
  - Users can only access their own profile data
  - Admins have full access to all profiles
  - Anonymous users have no access
*/

-- Enable RLS on user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Authenticated users can delete their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin full access to user_profiles" ON public.user_profiles;

-- Create SELECT policy - allows users to read their own profile
CREATE POLICY "user_profiles_select_own"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create INSERT policy - allows users to create their own profile
CREATE POLICY "user_profiles_insert_own"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create UPDATE policy - allows users to update their own profile
CREATE POLICY "user_profiles_update_own"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create DELETE policy - allows users to delete their own profile
CREATE POLICY "user_profiles_delete_own"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create admin policy for full access
CREATE POLICY "user_profiles_admin_all"
ON public.user_profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role = 'admin'
  )
);

-- Also ensure affiliates table has proper RLS policies
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- Drop existing affiliate policies
DROP POLICY IF EXISTS "Admin full access to affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.affiliates;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.affiliates;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.affiliates;

-- Create affiliate policies
CREATE POLICY "affiliates_select_own"
ON public.affiliates
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "affiliates_insert_own"
ON public.affiliates
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "affiliates_update_own"
ON public.affiliates
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admin policy for affiliates
CREATE POLICY "affiliates_admin_all"
ON public.affiliates
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role = 'admin'
  )
);