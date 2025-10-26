/*
  # Create Initial Schema for Affiliate Dashboard

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `email` (text, unique, not null)
      - `first_name` (text)
      - `last_name` (text)
      - `phone` (text)
      - `role` (text, default 'affiliate', check constraint for 'admin' or 'affiliate')
      - `avatar_url` (text)
      - `member_since` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `affiliates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, unique, foreign key to auth.users)
      - `partnership_code` (text, unique, not null)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `leads`
      - `id` (uuid, primary key)
      - `affiliate_id` (uuid, foreign key to affiliates)
      - `name` (text, not null)
      - `email` (text, not null)
      - `phone` (text)
      - `status` (text, default 'new')
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `sales`
      - `id` (uuid, primary key)
      - `affiliate_id` (uuid, foreign key to affiliates)
      - `lead_id` (uuid, foreign key to leads)
      - `amount` (decimal, not null)
      - `commission` (decimal, not null)
      - `status` (text, default 'pending')
      - `sale_date` (timestamptz, default now())
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for admins to access all data
    - Users can only see their own profile and affiliate data
    - Affiliates can only see their own leads and sales
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  phone text,
  role text DEFAULT 'affiliate' CHECK (role IN ('admin', 'affiliate')),
  avatar_url text,
  member_since timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create affiliates table
CREATE TABLE IF NOT EXISTS public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partnership_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  amount decimal(10, 2) NOT NULL DEFAULT 0,
  commission decimal(10, 2) NOT NULL DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  sale_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "user_profiles_select_own"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_insert_own"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update_own"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_delete_own"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admin policy for user_profiles
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

-- RLS Policies for affiliates
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

-- RLS Policies for leads
CREATE POLICY "leads_select_own_affiliate"
ON public.leads
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.affiliates a
    WHERE a.id = leads.affiliate_id 
    AND a.user_id = auth.uid()
  )
);

CREATE POLICY "leads_insert_own_affiliate"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.affiliates a
    WHERE a.id = leads.affiliate_id 
    AND a.user_id = auth.uid()
  )
);

CREATE POLICY "leads_update_own_affiliate"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.affiliates a
    WHERE a.id = leads.affiliate_id 
    AND a.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.affiliates a
    WHERE a.id = leads.affiliate_id 
    AND a.user_id = auth.uid()
  )
);

-- Admin policy for leads
CREATE POLICY "leads_admin_all"
ON public.leads
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

-- RLS Policies for sales
CREATE POLICY "sales_select_own_affiliate"
ON public.sales
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.affiliates a
    WHERE a.id = sales.affiliate_id 
    AND a.user_id = auth.uid()
  )
);

CREATE POLICY "sales_insert_own_affiliate"
ON public.sales
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.affiliates a
    WHERE a.id = sales.affiliate_id 
    AND a.user_id = auth.uid()
  )
);

CREATE POLICY "sales_update_own_affiliate"
ON public.sales
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.affiliates a
    WHERE a.id = sales.affiliate_id 
    AND a.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.affiliates a
    WHERE a.id = sales.affiliate_id 
    AND a.user_id = auth.uid()
  )
);

-- Admin policy for sales
CREATE POLICY "sales_admin_all"
ON public.sales
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_partnership_code ON public.affiliates(partnership_code);
CREATE INDEX IF NOT EXISTS idx_leads_affiliate_id ON public.leads(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_sales_affiliate_id ON public.sales(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_sales_lead_id ON public.sales(lead_id);

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM public.user_profiles WHERE user_id = user_uuid;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;