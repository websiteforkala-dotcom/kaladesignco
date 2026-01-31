-- Initial schema migration for Kala Design Co
-- This migration creates all the necessary tables and policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create contact_forms table
CREATE TABLE IF NOT EXISTS contact_forms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    service VARCHAR(100),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    instagram VARCHAR(255),
    linkedin VARCHAR(255),
    facebook VARCHAR(255),
    twitter VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- Create seo_settings table
CREATE TABLE IF NOT EXISTS seo_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    site_title VARCHAR(255),
    tagline VARCHAR(255),
    keywords TEXT,
    analytics_id VARCHAR(50),
    search_console VARCHAR(255),
    meta_description TEXT,
    og_image VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- Create page_content table
CREATE TABLE IF NOT EXISTS page_content (
    id BIGSERIAL PRIMARY KEY,
    page_name VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255),
    description TEXT,
    hero_text TEXT,
    main_content TEXT,
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
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table (for authentication)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create images table (for file management)
CREATE TABLE IF NOT EXISTS images (
    id BIGSERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    alt_text VARCHAR(255),
    folder VARCHAR(100) DEFAULT 'uploads',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_forms_created_at ON contact_forms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_forms_status ON contact_forms(status);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_page_content_name ON page_content(page_name);

-- Insert default data
INSERT INTO site_settings (id, phone, email, address, instagram, linkedin, facebook) 
VALUES (
    1, 
    '+91 98765 43210', 
    'hello@kaladesignco.com', 
    'Design District, New Delhi, India',
    'https://instagram.com/kaladesignco',
    'https://linkedin.com/company/kaladesignco',
    'https://facebook.com/kaladesignco'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO seo_settings (id, site_title, tagline, keywords, analytics_id) 
VALUES (
    1,
    'Kala Design Co - Interior Design Studio',
    'Creating Beautiful Spaces',
    'interior design, architecture, home design, commercial design, delhi, india',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Insert default page content
INSERT INTO page_content (page_name, title, description, hero_text, meta_title, meta_description, keywords) 
VALUES 
(
    'index.html',
    'Kala Design Co - Premier Interior Design Studio',
    'Transform your space with award-winning interior design',
    'Creating Beautiful Spaces That Tell Your Story',
    'Kala Design Co - Interior Design Studio Delhi',
    'Award-winning interior designers in Delhi specializing in residential and commercial spaces.',
    'interior design, delhi, residential, commercial'
),
(
    'about.html',
    'About Us - Kala Design Co Interior Designers',
    'Learn about our team of expert interior designers and our design philosophy',
    'We Craft Spaces That Feel Inevitable, Timeless, and Profoundly Human',
    'About Kala Design Co - Interior Design Team',
    'Meet our team of expert interior designers and learn about our design philosophy and approach.',
    'interior design team, design philosophy, about us'
),
(
    'services.html',
    'Interior Design Services - Residential & Commercial',
    'Comprehensive interior design services for homes and businesses',
    'Comprehensive Design Solutions',
    'Interior Design Services Delhi - Kala Design Co',
    'Professional interior design services including residential, commercial, and renovation projects.',
    'interior design services, residential design, commercial design'
),
(
    'work.html',
    'Our Portfolio - Interior Design Projects',
    'Explore our portfolio of stunning interior design projects',
    'Our Latest Work',
    'Interior Design Portfolio - Kala Design Co',
    'View our portfolio of award-winning interior design projects and transformations.',
    'interior design portfolio, projects, residential projects'
),
(
    'contact.html',
    'Contact Us - Get Your Interior Design Quote',
    'Ready to transform your space? Contact us for a consultation',
    'Let\'s Create Together',
    'Contact Kala Design Co - Interior Design Consultation',
    'Contact our interior design team for your next project. Professional design services in Delhi.',
    'contact interior designer, design consultation, delhi'
)
ON CONFLICT (page_name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_contact_forms_updated_at BEFORE UPDATE ON contact_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_settings_updated_at BEFORE UPDATE ON seo_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_content_updated_at BEFORE UPDATE ON page_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();