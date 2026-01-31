-- Kala Design Co Database Schema (Clean Version)
-- This version removes the problematic function to avoid SQL syntax errors

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create contact_forms table
CREATE TABLE IF NOT EXISTS contact_forms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    service VARCHAR(100),
    message TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    facebook_url VARCHAR(255),
    instagram_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    twitter_url VARCHAR(255),
    business_hours JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- Create seo_settings table
CREATE TABLE IF NOT EXISTS seo_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    site_title VARCHAR(255),
    tagline VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    google_analytics_id VARCHAR(50),
    google_search_console VARCHAR(255),
    facebook_pixel_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- Create page_content table
CREATE TABLE IF NOT EXISTS page_content (
    id BIGSERIAL PRIMARY KEY,
    page_name VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255),
    description TEXT,
    hero_text VARCHAR(500),
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGSERIAL PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    event_label VARCHAR(100),
    event_value INTEGER,
    page_url TEXT,
    page_title VARCHAR(255),
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create images table
CREATE TABLE IF NOT EXISTS images (
    id BIGSERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    alt_text VARCHAR(255),
    folder VARCHAR(100) DEFAULT 'uploads',
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_forms_created_at ON contact_forms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_forms_status ON contact_forms(status);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_page_content_name ON page_content(page_name);

-- Enable Row Level Security (except for contact_forms which needs public access)
-- ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY; -- Disabled for public submissions
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Contact forms: RLS disabled for public access, no policies needed

-- Site settings: Admin only
CREATE POLICY "Admin can manage site settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- SEO settings: Admin only
CREATE POLICY "Admin can manage seo settings" ON seo_settings FOR ALL USING (auth.role() = 'authenticated');

-- Page content: Public can read, admin can write
CREATE POLICY "Public can read page content" ON page_content FOR SELECT USING (true);
CREATE POLICY "Admin can manage page content" ON page_content FOR ALL USING (auth.role() = 'authenticated');

-- Analytics: Public can insert, admin can read
CREATE POLICY "Public can insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read analytics" ON analytics_events FOR SELECT USING (auth.role() = 'authenticated');

-- Images: Admin only
CREATE POLICY "Admin can manage images" ON images FOR ALL USING (auth.role() = 'authenticated');

-- Admin users: Admin only
CREATE POLICY "Admin can manage users" ON admin_users FOR ALL USING (auth.role() = 'authenticated');

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Public can view images" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Admin can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin can update images" ON storage.objects FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin can delete images" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Insert default site settings
INSERT INTO site_settings (phone, email, address, facebook_url, instagram_url, linkedin_url) 
VALUES (
    '+91 98765 43210',
    'info@kaladesignco.com',
    '123 Design Street, Creative District, New Delhi, India',
    'https://facebook.com/kaladesignco',
    'https://instagram.com/kaladesignco',
    'https://linkedin.com/company/kaladesignco'
) ON CONFLICT (id) DO NOTHING;

-- Insert default SEO settings
INSERT INTO seo_settings (site_title, tagline, meta_description, meta_keywords) 
VALUES (
    'Kala Design Co - Interior Design Excellence',
    'Transforming Spaces, Creating Dreams',
    'Professional interior design services in Delhi. We create beautiful, functional spaces that reflect your personality and lifestyle.',
    'interior design, home design, office design, delhi interior designer'
) ON CONFLICT (id) DO NOTHING;

-- Insert default page content
INSERT INTO page_content (page_name, title, description, hero_text, meta_title, meta_description, meta_keywords) 
VALUES 
(
    'index.html',
    'Welcome to Kala Design Co',
    'Transform your space with our expert interior design services',
    'Creating Beautiful Spaces That Inspire',
    'Kala Design Co - Interior Design Services Delhi',
    'Professional interior design services in Delhi. Transform your home or office with our expert design solutions.',
    'interior design, home design, delhi, residential design'
),
(
    'about.html',
    'About Kala Design Co',
    'Learn about our design philosophy and team',
    'Passionate About Design Excellence',
    'About Us - Kala Design Co Interior Designers',
    'Meet our team of expert interior designers. Learn about our design philosophy and commitment to excellence.',
    'about interior designers, design team, company history'
),
(
    'services.html',
    'Our Interior Design Services',
    'Comprehensive design solutions for homes and offices',
    'Complete Design Solutions',
    'Interior Design Services - Kala Design Co',
    'Comprehensive interior design services including residential, commercial, and consultation services.',
    'interior design services, residential design, commercial design'
),
(
    'work.html',
    'Our Portfolio',
    'Explore our latest interior design projects',
    'Our Latest Projects',
    'Portfolio - Kala Design Co Interior Design Projects',
    'View our portfolio of award-winning interior design projects and transformations.',
    'interior design portfolio, projects, residential projects'
),
(
    'contact.html',
    'Contact Us - Get Your Interior Design Quote',
    'Ready to transform your space? Contact us for a consultation',
    'Let''s Create Together',
    'Contact Kala Design Co - Interior Design Consultation',
    'Contact our interior design team for your next project. Professional design services in Delhi.',
    'contact interior designer, design consultation, delhi'
)
ON CONFLICT (page_name) DO NOTHING;

-- Create admin user (replace with your actual credentials)
INSERT INTO admin_users (email, password_hash, full_name, role) 
VALUES (
    'admin@kaladesignco.com',
    'replace_with_real_bcrypt_hash',
    'Admin User',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Add some sample contact form data
INSERT INTO contact_forms (name, email, phone, service, message, status) 
VALUES 
(
    'Sarah Johnson',
    'sarah.johnson@email.com',
    '+1 (555) 123-4567',
    'Residential Design',
    'I''m interested in redesigning my living room and kitchen. Looking for a modern, minimalist approach with natural materials.',
    'new'
),
(
    'Michael Chen',
    'm.chen@company.com',
    '+1 (555) 987-6543',
    'Commercial Design',
    'We need help designing our new office space for 50 employees. Looking for a collaborative, modern workspace.',
    'new'
),
(
    'Emma Rodriguez',
    'emma.r@gmail.com',
    NULL,
    'Consultation',
    'I''d like a consultation for my new apartment. Need help with space planning and color schemes.',
    'new'
);

-- Create view for analytics dashboard
CREATE OR REPLACE VIEW analytics_dashboard AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_events,
    COUNT(DISTINCT CASE WHEN event_name = 'page_view' THEN page_url END) as unique_pages,
    COUNT(CASE WHEN event_name = 'page_view' THEN 1 END) as page_views,
    COUNT(CASE WHEN event_name = 'contact_form_submit' THEN 1 END) as form_submissions
FROM analytics_events 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Success message
SELECT 'Database schema created successfully! All tables, policies, and sample data have been set up.' as message;