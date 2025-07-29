
-- Create nations table
CREATE TABLE public.nations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  capital TEXT NOT NULL,
  leader TEXT NOT NULL,
  population INTEGER NOT NULL DEFAULT 0,
  bank TEXT NOT NULL,
  daily_upkeep TEXT NOT NULL,
  founded TEXT NOT NULL,
  lore TEXT NOT NULL,
  government TEXT NOT NULL,
  motto TEXT NOT NULL,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  history TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create towns table
CREATE TABLE public.towns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  mayor TEXT NOT NULL,
  population INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  founded TEXT NOT NULL,
  nation_id UUID REFERENCES public.nations(id) ON DELETE SET NULL,
  is_independent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.towns ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Nations are publicly readable" 
  ON public.nations 
  FOR SELECT 
  USING (true);

CREATE POLICY "Towns are publicly readable" 
  ON public.towns 
  FOR SELECT 
  USING (true);

-- Add image_url field to nations table for nation leader uploaded images
-- Migration: 20250128000000_add_nation_image_field.sql

-- Add the image_url column to the nations table
ALTER TABLE public.nations 
ADD COLUMN image_url TEXT;

-- Add a comment to explain the field
COMMENT ON COLUMN public.nations.image_url IS 'URL to the nation image uploaded by the nation leader. Should be a direct link to an image hosted externally (e.g., Discord, Imgur, etc.)';

-- Create an index for better performance when querying by image_url
CREATE INDEX IF NOT EXISTS idx_nations_image_url ON public.nations(image_url);

-- Update RLS policies to allow nation leaders to update their own nation's image
-- First, drop the existing policy
DROP POLICY IF EXISTS "Staff can manage nations" ON public.nations;

-- Create new policy that allows both staff and nation leaders to manage nations
-- This avoids recursion by using a simpler approach
CREATE POLICY "Staff and nation leaders can manage nations" 
  ON public.nations 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
    OR
    leader_name = (
      SELECT full_name FROM public.profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
    OR
    leader_name = (
      SELECT full_name FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage towns" 
  ON public.towns 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Insert nations data
INSERT INTO public.nations (name, type, color, description, capital, leader, population, bank, daily_upkeep, founded, lore, government, motto, specialties, history) VALUES
('Skyward Sanctum', 'Kingdom', 'text-primary', 'Communism at its finest', 'Normannburg', 'President Golli1432', 53, '€198,42', '€8,56', 'Mar 2 2025', 'The Kingdom of Skyward Sanctum stands as a beacon of communal prosperity, where resources are shared and collective growth is prioritized above individual gain. This communist paradise operates on principles of equality and mutual aid.', 'Communist Republic', 'Together We Rise', ARRAY['Resource Sharing', 'Collective Agriculture', 'Social Programs'], NULL),

('North Sea League', 'Principality', 'text-secondary', 'Unity through cooperation', 'Kingdom Of Albion', 'King of Albion Danny_boy95', 46, '€987,17', '€15,45', 'Jan 6 2025', 'Born from a desire for unity and collaboration among the towns around the North Sea. Founded on principles of transparency, mutual aid, and collective effort, standing in contrast to the secretive and individualistic older nations.', 'Cooperative League', 'Strength in Unity', ARRAY['Maritime Trade', 'Cooperative Governance', 'Cultural Exchange'], 'The Birth of North Sea League: As the server continued to grow and evolve, new towns began to emerge across southern Sweden, Denmark, and the areas surrounding the North Sea. On August 25th, the nation was officially formed with a ceremony held at the Altes Museum in Copenhagen, marking the birth of the North Sea League—a union built on community, collaboration, and mutual support.'),

('Constellation', 'County', 'text-accent', 'Bright Stars Await', 'Northstar', 'Leader Svardmastaren', 28, '€499,28', '€9,32', 'Oct 10 2023', 'The Constellation Empire was established following Garvia''s departure from the nation of Kala due to disloyalty. The nation features an eagle and stars on its flag, symbolizing all the towns within the nation.', 'Imperial Federation', 'Per Aspera Ad Astra', ARRAY['Railroad Infrastructure', 'Industrial Development', 'Architectural Excellence'], 'The Birth of the Constellation nation: The Constellation Empire was established on October 10th, 2023, following Garvia''s departure from the nation of Kala due to disloyalty. Seeking alliances elsewhere, Garvia swiftly received a response from Northstar, leading to the agreement to form a new nation to gain various bonuses, including more town plots and better connectivity between towns.'),

('Kesko Corporation', 'Corporation', 'text-orange-500', 'Exiles, rebels, and adventurers united', 'SuperAlko', 'Occypolojee', 21, 'Private', 'N/A', 'Unknown', 'The Federation of Kesko Corp is a nation made up of exiles, rebels, and adventurers. Founded by the town of Superalko, which was expelled from Finland by the nation of Kala for unknown reasons. The nation values freedom, friendship, and fun.', 'Corporate Federation', 'Freedom Through Enterprise', ARRAY['Trade Networks', 'Colonial Expansion', 'Commercial Innovation'], 'Kesko Corp expanded its territory and influence by trading with other nations and colonizing new lands. Helsinki was a town that was established around Superalko, becoming a hub of commerce and culture. The Federation of Kesko Corp is a nation of diversity, creativity, and ambition that has overcome many challenges.'),

('Aqua Union', 'Union', 'text-blue-500', 'Harmony with the waters', 'Aqua Commune', 'Unknown', 10, 'Public', 'Shared', 'Unknown', 'A peaceful alliance focused on aquatic development and sustainable living by the water. The Aqua Union represents harmony between civilization and nature, particularly the seas and rivers.', 'Democratic Union', 'Flow with Nature', ARRAY['Aquaculture', 'Sustainable Development', 'Environmental Protection'], NULL);

-- Insert towns data with nation references
WITH nation_refs AS (
  SELECT id, name FROM public.nations
)
INSERT INTO public.towns (name, mayor, population, type, status, founded, nation_id, is_independent) 
SELECT t.name, t.mayor, t.population, t.type, t.status, t.founded, n.id, false
FROM (VALUES
  -- Skyward Sanctum towns
  ('Normannburg', 'Golli1432', 36, 'Metropolis (Capital)', 'Royal City', 'Mar 2 2025', 'Skyward Sanctum'),
  ('Stockholm', 'Unknown', 7, 'Town', 'Active', 'Unknown', 'Skyward Sanctum'),
  ('Preußen', 'Unknown', 3, 'Settlement', 'Active', 'Unknown', 'Skyward Sanctum'),
  ('SuoKylä', 'Unknown', 2, 'Settlement', 'Active', 'Unknown', 'Skyward Sanctum'),
  ('Onion', 'Unknown', 4, 'Settlement', 'Active', 'Unknown', 'Skyward Sanctum'),
  ('Oulu', 'Unknown', 8, 'Town', 'Active', 'Unknown', 'Skyward Sanctum'),
  
  -- North Sea League towns
  ('Kingdom Of Albion', 'Danny_boy95', 14, 'Large Town (Capital)', 'Open', 'Jan 6 2025', 'North Sea League'),
  ('Kållandsö', 'Unknown', 10, 'Town', 'Active', 'Unknown', 'North Sea League'),
  ('Herrehus', 'Unknown', 8, 'Town', 'Active', 'Unknown', 'North Sea League'),
  ('Småstan', 'Unknown', 3, 'Settlement', 'Active', 'Unknown', 'North Sea League'),
  ('Söderhamn', 'Unknown', 3, 'Settlement', 'Active', 'Unknown', 'North Sea League'),
  ('Verenigde Provinciën', 'Unknown', 3, 'Settlement', 'Active', 'Unknown', 'North Sea League'),
  ('C.C.F.N', 'Unknown', 1, 'Settlement', 'Active', 'Jan 7 2025', 'North Sea League'),
  ('Tegridy Farms', 'Unknown', 1, 'Settlement', 'Active', 'Unknown', 'North Sea League'),
  ('Wavecrest', 'Unknown', 1, 'Settlement', 'Active', 'Unknown', 'North Sea League'),
  
  -- Constellation towns
  ('Northstar', 'Svardmastaren', 15, 'City (Capital)', 'Active', 'Oct 9 2023', 'Constellation'),
  ('Garvia', 'Unknown', 5, 'Settlement', 'Active', 'Oct 2023', 'Constellation'),
  ('Neko No Kuni', 'Unknown', 8, 'Town', 'Active', 'Unknown', 'Constellation'),
  
  -- Kesko Corporation towns
  ('SuperAlko', 'Occypolojee', 6, 'Town (Capital)', 'Active', 'Unknown', 'Kesko Corporation'),
  ('Hiiumaa', 'Unknown', 9, 'Town', 'Active', 'Unknown', 'Kesko Corporation'),
  ('Helsinki', 'Unknown', 4, 'Settlement', 'Rebuilding', 'Unknown', 'Kesko Corporation'),
  ('Siwa', 'Unknown', 2, 'Settlement', 'Active', 'Unknown', 'Kesko Corporation'),
  
  -- Aqua Union towns
  ('Aqua Commune', 'Unknown', 10, 'Commune (Capital)', 'Open', 'Unknown', 'Aqua Union')
) AS t(name, mayor, population, type, status, founded, nation_name)
LEFT JOIN nation_refs n ON n.name = t.nation_name;

-- Insert independent towns
INSERT INTO public.towns (name, mayor, population, type, status, founded, nation_id, is_independent) VALUES
('Odense', 'Unknown', 8, 'Independent Town', 'Active', 'Unknown', NULL, true),
('Sogndalsfjorden', 'Unknown', 5, 'Independent Settlement', 'Active', 'Unknown', NULL, true),
('Terraberg', 'Unknown', 1, 'Independent Settlement', 'Active', 'Unknown', NULL, true);

-- Create indexes for better performance
CREATE INDEX idx_towns_nation_id ON public.towns(nation_id);
CREATE INDEX idx_towns_is_independent ON public.towns(is_independent);
CREATE INDEX idx_nations_name ON public.nations(name);
CREATE INDEX idx_towns_name ON public.towns(name);
