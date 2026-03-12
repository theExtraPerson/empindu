
-- Create business_profiles table
CREATE TABLE public.business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  business_name text NOT NULL,
  business_type text DEFAULT 'sole_proprietor',
  tax_id text,
  registration_number text,
  registration_status text DEFAULT 'unregistered',
  business_email text,
  business_phone text,
  business_address text,
  business_city text,
  business_country text DEFAULT 'Uganda',
  description text,
  is_verified boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own business profile"
  ON public.business_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Artisans can insert own business profile"
  ON public.business_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'artisan'));

CREATE POLICY "Users can update own business profile"
  ON public.business_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all business profiles"
  ON public.business_profiles FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view verified business profiles"
  ON public.business_profiles FOR SELECT
  USING (is_verified = true);

-- Auto-update updated_at
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add artisan_likes table for the like feature
CREATE TABLE public.artisan_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  artisan_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, artisan_id)
);

ALTER TABLE public.artisan_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.artisan_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert likes" ON public.artisan_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.artisan_likes FOR DELETE USING (auth.uid() = user_id);

-- Add bio to public_profiles view (recreate it)
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
  SELECT user_id, full_name, avatar_url, location, craft_specialty, 
         is_verified, years_experience, portfolio_url, created_at, bio
  FROM public.profiles;
