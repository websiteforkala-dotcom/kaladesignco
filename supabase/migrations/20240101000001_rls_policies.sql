-- Row Level Security policies for Kala Design Co
-- This migration sets up all RLS policies for secure data access

-- Enable Row Level Security on all tables
ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Contact forms policies
-- Allow public to insert contact forms (for website contact form)
CREATE POLICY "Allow public insert on contact_forms" ON contact_forms
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow authenticated users (admins) full access to contact forms
CREATE POLICY "Allow admin full access to contact_forms" ON contact_forms
    FOR ALL TO authenticated
    USING (true);

-- Site settings policies
-- Only authenticated users (admins) can access site settings
CREATE POLICY "Allow admin full access to site_settings" ON site_settings
    FOR ALL TO authenticated
    USING (true);

-- SEO settings policies
-- Only authenticated users (admins) can access SEO settings
CREATE POLICY "Allow admin full access to seo_settings" ON seo_settings
    FOR ALL TO authenticated
    USING (true);

-- Page content policies
-- Allow public to read page content (for website display)
CREATE POLICY "Allow public read on page_content" ON page_content
    FOR SELECT TO anon
    USING (true);

-- Allow authenticated users (admins) full access to page content
CREATE POLICY "Allow admin full access to page_content" ON page_content
    FOR ALL TO authenticated
    USING (true);

-- Analytics events policies
-- Allow public to insert analytics events (for website tracking)
CREATE POLICY "Allow public insert on analytics_events" ON analytics_events
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow authenticated users (admins) to read analytics events
CREATE POLICY "Allow admin read on analytics_events" ON analytics_events
    FOR SELECT TO authenticated
    USING (true);

-- Images policies
-- Only authenticated users (admins) can manage images
CREATE POLICY "Allow admin full access to images" ON images
    FOR ALL TO authenticated
    USING (true);

-- Admin users policies
-- Only authenticated users can read admin user data (for profile management)
CREATE POLICY "Allow admin read own profile" ON admin_users
    FOR SELECT TO authenticated
    USING (auth.uid()::text = id::text);

-- Allow authenticated users to update their own profile
CREATE POLICY "Allow admin update own profile" ON admin_users
    FOR UPDATE TO authenticated
    USING (auth.uid()::text = id::text);

-- Create storage bucket for images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for images bucket
CREATE POLICY "Allow public read access to images" ON storage.objects
    FOR SELECT TO anon
    USING (bucket_id = 'images');

CREATE POLICY "Allow admin upload to images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'images');

CREATE POLICY "Allow admin update images" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'images');

CREATE POLICY "Allow admin delete images" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'images');

-- Create view for analytics dashboard
CREATE OR REPLACE VIEW analytics_dashboard AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_events,
    COUNT(DISTINCT user_agent) as unique_visitors,
    COUNT(CASE WHEN event_name = 'page_view' THEN 1 END) as page_views,
    COUNT(CASE WHEN event_name = 'form_submit' THEN 1 END) as form_submissions
FROM analytics_events 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Grant access to the analytics dashboard view
GRANT SELECT ON analytics_dashboard TO authenticated;
GRANT SELECT ON analytics_dashboard TO anon;