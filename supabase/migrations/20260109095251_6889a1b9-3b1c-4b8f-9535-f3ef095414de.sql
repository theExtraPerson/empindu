-- Assign admin role to admin@empindu.com user
-- First, delete any existing role for this user to avoid conflicts
DELETE FROM public.user_roles WHERE user_id = 'c979fc0a-f4a8-4d24-b080-ceee050e7910';

-- Insert admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('c979fc0a-f4a8-4d24-b080-ceee050e7910', 'admin'::app_role);