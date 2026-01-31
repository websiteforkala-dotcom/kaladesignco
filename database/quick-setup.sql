-- Quick Setup SQL for Supabase Dashboard
-- Copy and paste this into the Supabase SQL Editor to create all tables

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_forms_created_at ON contact_forms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_forms_status ON contact_forms(status);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_page_content_name ON page_content(page_name);

-- Insert default data for site_settings
INSERT INTO site_settings (id, phone, email, address, facebook_url, instagram_url, linkedin_url, twitter_url)
VALUES (1, '+91 98765 43210', 'info@kaladesignco.com', 'Design District, New Delhi, India', 
        'https://facebook.com/kaladesignco', 'https://instagram.com/kaladesignco', 
        'https://linkedin.com/company/kaladesignco', '')
ON CONFLICT (id) DO NOTHING;

-- Insert default data for seo_settings
INSERT INTO seo_settings (id, site_title, tagline, meta_description, meta_keywords)
VALUES (1, 'Kala Design Co - Interior Design Excellence', 'Transforming Spaces, Creating Dreams',
        'Professional interior design services in Delhi. We create beautiful, functional spaces that reflect your personality and lifestyle.',
        'interior design, home design, office design, delhi interior designer')
ON CONFLICT (id) DO NOTHING;

-- Insert default page content
INSERT INTO page_content (page_name, title, description, hero_text, meta_title, meta_description, meta_keywords)
VALUES 
    ('index.html', 'Kala Design Co - Premier Interior Design Studio', 
     'Transform your space with award-winning interior design', 
     'Creating Beautiful Spaces That Tell Your Story',
     'Kala Design Co - Interior Design Studio Delhi',
     'Award-winning interior designers in Delhi specializing in residential and commercial spaces.',
     'interior design, delhi, residential, commercial'),
    ('about.html', 'About Us - Kala Design Co', 
     'Learn about our design philosophy and team', 
     'Passionate About Design Excellence',
     'About Kala Design Co - Interior Design Team',
     'Meet our experienced interior design team in Delhi. Learn about our design philosophy and approach.',
     'interior design team, about us, design philosophy'),
    ('services.html', 'Our Services - Kala Design Co', 
     'Comprehensive interior design services', 
     'Complete Interior Design Solutions',
     'Interior Design Services - Kala Design Co',
     'Complete interior design services including residential, commercial, and consultation services in Delhi.',
     'interior design services, residential design, commercial design'),
    ('work.html', 'Our Work - Kala Design Co', 
     'Explore our portfolio of completed projects', 
     'Showcasing Our Design Excellence',
     'Portfolio - Kala Design Co Projects',
     'View our portfolio of completed interior design projects in Delhi. Residential and commercial spaces.',
     'interior design portfolio, projects, delhi interiors'),
    ('contact.html', 'Contact Us - Kala Design Co', 
     'Get in touch for your interior design needs', 
     'Let\'s Create Something Beautiful Together',
     'Contact Kala Design Co - Interior Designers Delhi',
     'Contact our interior design team in Delhi. Get a quote for your residential or commercial project.',
     'contact interior designer, delhi design consultation')
ON CONFLICT (page_name) DO NOTHING;

-- Disable RLS for contact_forms to allow public submissions
ALTER TABLE contact_forms DISABLE ROW LEVEL SECURITY;

-- Enable RLS for other tables (admin only)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Public can read site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public can read seo settings" ON seo_settings FOR SELECT USING (true);
CREATE POLICY "Public can read page content" ON page_content FOR SELECT USING (true);

-- Create RLS policies for authenticated users (admin)
CREATE POLICY "Authenticated can manage site settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage seo settings" ON seo_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage page content" ON page_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage analytics" ON analytics_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage images" ON images FOR ALL USING (auth.role() = 'authenticated');

-- Allow public to insert analytics events
CREATE POLICY "Public can insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);