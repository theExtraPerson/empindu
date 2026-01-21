-- Fix profiles table PII exposure by restricting direct access and creating a public view

-- Step 1: Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Step 2: Create restrictive policies for direct table access
-- Users can only view their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all profiles (needed for admin panel)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Step 3: Create a public view that excludes sensitive PII (phone, bio with personal info)
-- This view is safe to expose to unauthenticated users
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = on) AS
SELECT 
  user_id,
  full_name,
  avatar_url,
  location,
  craft_specialty,
  years_experience,
  is_verified,
  portfolio_url,
  created_at
FROM public.profiles;

-- Step 4: Grant SELECT access on the view to both anon and authenticated users
GRANT SELECT ON public.public_profiles TO anon, authenticated;