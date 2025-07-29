-- Create town gallery table for storing town photos
CREATE TABLE IF NOT EXISTS public.town_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_by_username TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_approved BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_town_gallery_town_name ON public.town_gallery(town_name);
CREATE INDEX IF NOT EXISTS idx_town_gallery_uploaded_by ON public.town_gallery(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_town_gallery_uploaded_at ON public.town_gallery(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_town_gallery_is_approved ON public.town_gallery(is_approved);

-- Enable RLS
ALTER TABLE public.town_gallery ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Town gallery photos are publicly readable" 
  ON public.town_gallery 
  FOR SELECT 
  USING (is_approved = true);

-- Create policies for town management (mayors, co-mayors, admins)
CREATE POLICY "Town management can manage gallery" 
  ON public.town_gallery 
  FOR ALL 
  TO authenticated
  USING (
    -- Admins can manage all galleries
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
    OR
    -- Town mayors and co-mayors can manage their town's gallery
    EXISTS (
      SELECT 1 FROM public.towns 
      WHERE name = town_gallery.town_name 
      AND (
        mayor_name = (
          SELECT minecraft_username FROM public.profiles WHERE id = auth.uid()
        )
        OR
        -- Check if user is a co-mayor (we'll implement this logic in the application)
        EXISTS (
          SELECT 1 FROM public.towns 
          WHERE name = town_gallery.town_name 
          AND residents::jsonb @> jsonb_build_array(
            jsonb_build_object('name', (SELECT minecraft_username FROM public.profiles WHERE id = auth.uid()), 'is_co_mayor', true)
          )
        )
      )
    )
  )
  WITH CHECK (
    -- Admins can manage all galleries
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
    OR
    -- Town mayors and co-mayors can manage their town's gallery
    EXISTS (
      SELECT 1 FROM public.towns 
      WHERE name = town_gallery.town_name 
      AND (
        mayor_name = (
          SELECT minecraft_username FROM public.profiles WHERE id = auth.uid()
        )
        OR
        -- Check if user is a co-mayor (we'll implement this logic in the application)
        EXISTS (
          SELECT 1 FROM public.towns 
          WHERE name = town_gallery.town_name 
          AND residents::jsonb @> jsonb_build_array(
            jsonb_build_object('name', (SELECT minecraft_username FROM public.profiles WHERE id = auth.uid()), 'is_co_mayor', true)
          )
        )
      )
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_town_gallery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_town_gallery_updated_at
  BEFORE UPDATE ON public.town_gallery
  FOR EACH ROW
  EXECUTE FUNCTION update_town_gallery_updated_at();

-- Insert some sample data for testing
INSERT INTO public.town_gallery (town_name, title, description, file_path, file_url, file_size, file_type, width, height, tags, uploaded_by_username) VALUES
('Normannburg', 'Town Hall', 'The magnificent town hall building of Normannburg', '/uploads/towns/normannburg/town-hall.jpg', 'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Town+Hall', 1024000, 'image/jpeg', 800, 600, ARRAY['building', 'government', 'landmark'], 'Golli1432'),
('Normannburg', 'Red Square', 'The central square where community events are held', '/uploads/towns/normannburg/red-square.jpg', 'https://via.placeholder.com/800x600/DC2626/FFFFFF?text=Red+Square', 950000, 'image/jpeg', 800, 600, ARRAY['square', 'community', 'events'], 'Golli1432'),
('Garvia', 'Fishing Hut', 'Traditional fishing hut by the river', '/uploads/towns/garvia/fishing-hut.jpg', 'https://via.placeholder.com/800x600/059669/FFFFFF?text=Fishing+Hut', 880000, 'image/jpeg', 800, 600, ARRAY['fishing', 'traditional', 'river'], 'Garvia_Mayor'),
('Garvia', 'Church of Garvia', 'The beautiful church that stands as a symbol of faith', '/uploads/towns/garvia/church.jpg', 'https://via.placeholder.com/800x600/7C3AED/FFFFFF?text=Church+of+Garvia', 1100000, 'image/jpeg', 800, 600, ARRAY['church', 'religion', 'architecture'], 'Garvia_Mayor')
ON CONFLICT DO NOTHING; 