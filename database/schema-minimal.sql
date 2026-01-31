-- Minimal Supabase Schema for Kala Design Co
-- Use this if you encounter permission issues with the full schema

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
    status VARCHAR(20) DEFAULT 'new',
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
    keywords TEXT,
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
    hero_text VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGSERIAL PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(100),
    event_label VARCHAR(255),
    event_value INTEGER,
    page_url TEXT,
    page_title VARCHAR(255),
    user_agent TEXT,
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
    password_hash VARCHAR(255),
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (simplified)
-- Contact forms - allow public insert
CREATE POLICY "Allow public insert on contact_forms" ON contact_forms
    FOR INSERT WITH CHECK (true);

-- Site settings - allow public read
CREATE POLICY "Allow public read on site_settings" ON site_settings
    FOR SELECT USING (true);

-- SEO settings - allow public read
CREATE POLICY "Allow public read on seo_settings" ON seo_settings
    FOR SELECT USING (true);

-- Page content - allow public read
CREATE POLICY "Allow public read on page_content" ON page_content
    FOR SELECT USING (true);

-- Analytics - allow public insert
CREATE POLICY "Allow public insert on analytics_events" ON analytics_events
    FOR INSERT WITH CHECK (true);

-- Insert default data
INSERT INTO site_settings (phone, email, address) 
VALUES (
    '+91 98765 43210',
    'info@kaladesignco.com',
    'New Delhi, India'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO seo_settings (site_title, tagline, meta_description) 
VALUES (
    'Kala Design Co - Interior Design Studio',
    'Creating Beautiful Spaces',
    'Professional interior design services in Delhi. Transform your space with our expert design team.'
) ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Minimal schema created successfully! You can now use the admin panel.' as status;