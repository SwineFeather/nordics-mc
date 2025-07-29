-- Create town_gallery table
CREATE TABLE IF NOT EXISTS town_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  town_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  width INTEGER,
  height INTEGER,
  tags TEXT[] DEFAULT '{}',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_by_username TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance (ignore if they exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_town_gallery_town_name') THEN
    CREATE INDEX idx_town_gallery_town_name ON town_gallery(town_name);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_town_gallery_uploaded_by') THEN
    CREATE INDEX idx_town_gallery_uploaded_by ON town_gallery(uploaded_by);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_town_gallery_uploaded_at') THEN
    CREATE INDEX idx_town_gallery_uploaded_at ON town_gallery(uploaded_at DESC);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_town_gallery_tags') THEN
    CREATE INDEX idx_town_gallery_tags ON town_gallery USING GIN(tags);
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE town_gallery ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view approved town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Users can view their own town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Authorized users can upload town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Authorized users can update town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Authorized users can delete town gallery photos" ON town_gallery;

-- Create RLS policies
-- Allow anyone to view approved photos
CREATE POLICY "Anyone can view approved town gallery photos" ON town_gallery
  FOR SELECT USING (is_approved = true);

-- Allow authenticated users to view their own photos (even if not approved)
CREATE POLICY "Users can view their own town gallery photos" ON town_gallery
  FOR SELECT USING (auth.uid() = uploaded_by);

-- Allow mayors, co-mayors, and admins to upload photos
CREATE POLICY "Authorized users can upload town gallery photos" ON town_gallery
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
    OR
    EXISTS (
      SELECT 1 FROM towns t
      WHERE t.name = town_name 
      AND (
        t.mayor_name = (
          SELECT minecraft_username FROM profiles WHERE id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM jsonb_array_elements(t.residents) AS resident
          WHERE resident->>'name' = (SELECT minecraft_username FROM profiles WHERE id = auth.uid())
          AND (resident->>'is_co_mayor')::boolean = true
        )
      )
    )
    OR
    -- Temporary fallback: allow authenticated users to upload (for testing)
    auth.role() = 'authenticated'
  );

-- Allow mayors, co-mayors, and admins to update photos
CREATE POLICY "Authorized users can update town gallery photos" ON town_gallery
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
    OR
    EXISTS (
      SELECT 1 FROM towns t
      WHERE t.name = town_name 
      AND (
        t.mayor_name = (
          SELECT minecraft_username FROM profiles WHERE id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM jsonb_array_elements(t.residents) AS resident
          WHERE resident->>'name' = (SELECT minecraft_username FROM profiles WHERE id = auth.uid())
          AND (resident->>'is_co_mayor')::boolean = true
        )
      )
    )
  );

-- Allow mayors, co-mayors, and admins to delete photos
CREATE POLICY "Authorized users can delete town gallery photos" ON town_gallery
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
    OR
    EXISTS (
      SELECT 1 FROM towns t
      WHERE t.name = town_name 
      AND (
        t.mayor_name = (
          SELECT minecraft_username FROM profiles WHERE id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM jsonb_array_elements(t.residents) AS resident
          WHERE resident->>'name' = (SELECT minecraft_username FROM profiles WHERE id = auth.uid())
          AND (resident->>'is_co_mayor')::boolean = true
        )
      )
    )
  );

-- Create function to update updated_at timestamp (drop if exists)
DROP FUNCTION IF EXISTS update_town_gallery_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_town_gallery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at (drop if exists)
DROP TRIGGER IF EXISTS update_town_gallery_updated_at ON town_gallery;

CREATE TRIGGER update_town_gallery_updated_at
  BEFORE UPDATE ON town_gallery
  FOR EACH ROW
  EXECUTE FUNCTION update_town_gallery_updated_at();

-- Insert sample data only if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM town_gallery LIMIT 1) THEN
    INSERT INTO town_gallery (
      town_name, 
      title, 
      description, 
      file_path, 
      file_url, 
      file_size, 
      file_type, 
      width, 
      height, 
      tags, 
      uploaded_by_username, 
      is_approved, 
      view_count
    ) VALUES 
    (
      'Normannburg',
      'Town Hall',
      'The magnificent town hall building of Normannburg',
      '/uploads/towns/normannburg/town-hall.jpg',
      'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Town+Hall',
      1024000,
      'image/jpeg',
      800,
      600,
      ARRAY['building', 'government', 'landmark'],
      'Golli1432',
      true,
      42
    ),
    (
      'Garvia',
      'Fishing Hut',
      'Traditional fishing hut by the river',
      '/uploads/towns/garvia/fishing-hut.jpg',
      'https://via.placeholder.com/800x600/059669/FFFFFF?text=Fishing+Hut',
      880000,
      'image/jpeg',
      800,
      600,
      ARRAY['fishing', 'traditional', 'river'],
      'Garvia_Mayor',
      true,
      28
    );
  END IF;
END $$; 