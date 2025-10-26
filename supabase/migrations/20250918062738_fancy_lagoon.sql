/*
  # Fix affiliates table RLS policy for INSERT operations

  1. Security Changes
    - Add INSERT policy for affiliates table to allow authenticated users to create their own affiliate records
    - This allows the sign-up process to complete successfully by creating the affiliate record after user registration

  2. Policy Details
    - Allows authenticated users to INSERT into affiliates table
    - Restricts insertion to records where user_id matches the authenticated user's ID
    - Uses auth.uid() to ensure users can only create records for themselves
*/

-- Create policy to allow authenticated users to insert their own affiliate records
CREATE POLICY "Allow authenticated users to insert own affiliate record"
  ON affiliates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);