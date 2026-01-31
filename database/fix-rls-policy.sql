-- Fix RLS policy for contact forms to allow public submissions

-- Drop the existing policy
DROP POLICY IF EXISTS "Public can insert contact forms" ON contact_forms;

-- Create a new policy that allows anyone to insert contact forms
CREATE POLICY "Anyone can insert contact forms" ON contact_forms 
FOR INSERT 
WITH CHECK (true);

-- Keep the admin policy for reading/updating/deleting
DROP POLICY IF EXISTS "Admin can manage contact forms" ON contact_forms;
CREATE POLICY "Admin can manage contact forms" ON contact_forms 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Also create a separate policy for public to insert without authentication
CREATE POLICY "Public insert contact forms" ON contact_forms 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Success message
SELECT 'Contact form RLS policies updated successfully!' as message;