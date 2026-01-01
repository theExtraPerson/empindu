-- Add admin policies for products management
CREATE POLICY "Admins can view all products" 
ON public.products 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all products" 
ON public.products 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all products" 
ON public.products 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Add admin policies for user_roles insert
CREATE POLICY "Admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));