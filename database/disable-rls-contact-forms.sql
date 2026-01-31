-- Temporarily disable RLS for contact_forms to allow public submissions
-- This is a common approach for contact forms that need public access

-- Disable RLS on contact_forms table
ALTER TABLE contact_forms DISABLE ROW LEVEL SECURITY;

-- Alternatively, if you want to keep RLS enabled but allow all operations:
-- DROP ALL existing policies first
-- DROP POLICY IF EXISTS "Anyone can insert contact forms" ON contact_forms;
-- DROP POLICY IF EXISTS "Public insert contact forms" ON contact_forms;
-- DROP POLICY IF EXISTS "Admin can manage contact forms" ON contact_forms;
-- DROP POLICY IF EXISTS "Public can insert contact forms" ON contact_forms;

-- CREATE POLICY "Allow all operations on contact_forms" ON contact_forms FOR ALL USING (true) WITH CHECK (true);

-- Success message
SELECT 'Contact forms RLS disabled - public submissions now allowed!' as message;