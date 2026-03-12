
-- Fix security definer view by setting security_invoker
ALTER VIEW public.public_profiles SET (security_invoker = on);
