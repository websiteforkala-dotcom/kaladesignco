-- Seed data for Kala Design Co
-- This file contains sample data to populate the database

-- Insert sample contact forms
INSERT INTO contact_forms (name, email, phone, service, message, status) VALUES
('Sarah Johnson', 'sarah.johnson@email.com', '+1 (555) 123-4567', 'Residential Design', 'I''m interested in redesigning my living room and kitchen. Looking for a modern, minimalist approach with natural materials.', 'new'),
('Michael Chen', 'm.chen@company.com', '+1 (555) 987-6543', 'Commercial Design', 'We need to redesign our office space for 50 employees. Looking for a collaborative, modern workspace design.', 'new'),
('Emma Rodriguez', 'emma.r@gmail.com', NULL, 'Consultation', 'I''d like a consultation for my new apartment. Need help with space planning and color schemes.', 'new'),
('David Kim', 'david.kim@startup.com', '+1 (555) 456-7890', 'Commercial Design', 'Looking to design a modern tech startup office. Need flexible spaces and creative zones.', 'new'),
('Lisa Thompson', 'lisa.t@gmail.com', '+1 (555) 321-0987', 'Residential Design', 'Complete home renovation needed. 3-bedroom house, modern style with sustainable materials.', 'read'),
('James Wilson', 'james.wilson@corp.com', '+1 (555) 654-3210', 'Renovation', 'Office renovation project. Need to modernize our traditional office space.', 'replied');

-- Update site settings
UPDATE site_settings SET
    phone = '+91 98765 43210',
    email = 'hello@kaladesignco.com',
    address = 'Design District, New Delhi, India',
    instagram = 'https://instagram.com/kaladesignco',
    linkedin = 'https://linkedin.com/company/kaladesignco',
    facebook = 'https://facebook.com/kaladesignco',
    updated_at = NOW()
WHERE id = 1;

-- Update SEO settings
UPDATE seo_settings SET
    site_title = 'Kala Design Co - Premier Interior Design Studio',
    tagline = 'Creating Beautiful Spaces That Tell Your Story',
    keywords = 'interior design, architecture, home design, commercial design, delhi, india, residential design, office design',
    meta_description = 'Award-winning interior design studio in Delhi specializing in residential and commercial spaces. Transform your space with our expert design team.',
    updated_at = NOW()
WHERE id = 1;

-- Insert sample analytics events
INSERT INTO analytics_events (event_name, event_category, event_label, page_url, page_title, user_agent) VALUES
('page_view', 'Navigation', 'Home Page', 'https://kaladesignco.com/', 'Kala Design Co - Interior Design Studio', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('page_view', 'Navigation', 'About Page', 'https://kaladesignco.com/about.html', 'About Us - Kala Design Co', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('page_view', 'Navigation', 'Services Page', 'https://kaladesignco.com/services.html', 'Services - Kala Design Co', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'),
('form_submit', 'Contact', 'Contact Form', 'https://kaladesignco.com/contact.html', 'Contact - Kala Design Co', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('button_click', 'CTA', 'Header CTA', 'https://kaladesignco.com/', 'Kala Design Co - Interior Design Studio', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('scroll', 'Engagement', '75% Scroll Depth', 'https://kaladesignco.com/work.html', 'Work - Kala Design Co', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

-- Add some sample page content updates
UPDATE page_content SET
    title = 'Kala Design Co - Premier Interior Design Studio in Delhi',
    description = 'Transform your space with award-winning interior design. Specializing in residential and commercial projects across Delhi and NCR.',
    hero_text = 'Creating Beautiful Spaces That Tell Your Story',
    main_content = 'We are a premier interior design studio based in Delhi, dedicated to creating spaces that are both beautiful and functional. Our team of expert designers works closely with clients to bring their vision to life.',
    meta_title = 'Kala Design Co - Interior Design Studio Delhi | Residential & Commercial',
    meta_description = 'Award-winning interior designers in Delhi specializing in residential and commercial spaces. Transform your home or office with our expert design team.',
    keywords = 'interior design delhi, home design, office design, residential interior design, commercial interior design',
    updated_at = NOW()
WHERE page_name = 'index.html';

UPDATE page_content SET
    title = 'About Kala Design Co - Expert Interior Designers',
    description = 'Learn about our team of expert interior designers, our design philosophy, and our commitment to creating exceptional spaces.',
    hero_text = 'We Craft Spaces That Feel Inevitable, Timeless, and Profoundly Human',
    main_content = 'Founded in 2018, Kala Design Co was born from a simple yet radical idea: that interior design is not merely about decoration, but about narration. We believe that every space holds a latent story waiting to be told.',
    meta_title = 'About Kala Design Co - Interior Design Team Delhi',
    meta_description = 'Meet our team of expert interior designers and learn about our design philosophy and approach to creating beautiful, functional spaces.',
    keywords = 'interior design team, design philosophy, about kala design co, delhi interior designers',
    updated_at = NOW()
WHERE page_name = 'about.html';

-- Insert admin user (password: kala2024)
-- Note: In production, use proper password hashing
INSERT INTO admin_users (email, password_hash, full_name, role, is_active) VALUES
('admin@kaladesignco.com', '$2b$10$rQZ8kHWKQVz8kHWKQVz8kOQVz8kHWKQVz8kHWKQVz8kHWKQVz8kH', 'Admin User', 'admin', true),
('demo@kaladesignco.com', '$2b$10$demoHashForDemoUserPasswordDemo123456789012345678901234', 'Demo User', 'editor', true)
ON CONFLICT (email) DO NOTHING;