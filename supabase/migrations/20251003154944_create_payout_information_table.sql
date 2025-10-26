/*
  # Create Payout Information Table

  This migration creates the payout_information table to store affiliate payment details.

  1. New Tables
    - `payout_information`
      - `id` (uuid, primary key)
      - `user_id` (uuid, unique, foreign key to auth.users)
      - `payment_processor` (text) - GCash, PayMaya, Bank Transfer, PayPal
      - `first_name` (text, not null)
      - `middle_name` (text)
      - `last_name` (text, not null)
      - `account_number` (text, not null) - Account number or e-wallet number
      - `email` (text, not null)
      - `country_code` (text, default '+63')
      - `mobile_number` (text, not null)
      - `birthdate` (date)
      - `nationality` (text)
      - `country` (text, default 'Philippines')
      - `street1` (text, not null)
      - `street2` (text)
      - `barangay` (text)
      - `city` (text, not null)
      - `province` (text, not null)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on payout_information table
    - Add policies for users to read their own payout information
    - Add policies for users to insert their own payout information
    - Add policies for users to update their own payout information
    - Add policies for admins to access all payout information

  3. Indexes
    - Create index on user_id for faster lookups

  4. Important Notes
    - Users can only have one payout information record (enforced by unique constraint on user_id)
    - All sensitive financial data is protected by RLS policies
    - Admin users have full access to all records for support purposes
*/

-- Create payout_information table
CREATE TABLE IF NOT EXISTS public.payout_information (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_processor text,
  first_name text NOT NULL DEFAULT '',
  middle_name text,
  last_name text NOT NULL DEFAULT '',
  account_number text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  country_code text DEFAULT '+63',
  mobile_number text NOT NULL DEFAULT '',
  birthdate date,
  nationality text,
  country text DEFAULT 'Philippines',
  street1 text NOT NULL DEFAULT '',
  street2 text,
  barangay text,
  city text NOT NULL DEFAULT '',
  province text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on payout_information table
ALTER TABLE public.payout_information ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payout_information
CREATE POLICY "payout_information_select_own"
ON public.payout_information
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "payout_information_insert_own"
ON public.payout_information
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payout_information_update_own"
ON public.payout_information
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payout_information_delete_own"
ON public.payout_information
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admin policy for payout_information
CREATE POLICY "payout_information_admin_all"
ON public.payout_information
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payout_information_user_id ON public.payout_information(user_id);
