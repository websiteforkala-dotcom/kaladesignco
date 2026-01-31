-- Create works table
CREATE TABLE IF NOT EXISTS works (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    location VARCHAR(255),
    year VARCHAR(50),
    image_url TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE works ENABLE ROW LEVEL SECURITY;

-- Policies
-- Public read access
CREATE POLICY "Public can view works" ON works FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admin can manage works" ON works FOR ALL USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_works_created_at ON works(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_works_featured ON works(featured) WHERE featured = true;
