
-- Add new columns to map_pins for categories and town references
ALTER TABLE public.map_pins ADD COLUMN category TEXT NOT NULL DEFAULT 'regular';
ALTER TABLE public.map_pins ADD COLUMN town_id TEXT NULL;
ALTER TABLE public.map_pins ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT false;

-- Add editing timestamp to map_discussions
ALTER TABLE public.map_discussions ADD COLUMN edited_at TIMESTAMP WITH TIME ZONE NULL;

-- Add check constraint for pin categories
ALTER TABLE public.map_pins ADD CONSTRAINT pin_category_check 
CHECK (category IN ('regular', 'town', 'lore'));

-- Create index for better performance on category filtering
CREATE INDEX idx_map_pins_category ON public.map_pins(category);
CREATE INDEX idx_map_pins_town_id ON public.map_pins(town_id);
CREATE INDEX idx_map_pins_hidden ON public.map_pins(is_hidden);

-- Update RLS policies to include new fields
DROP POLICY IF EXISTS "Staff can create pins" ON public.map_pins;
CREATE POLICY "Staff can create pins" 
  ON public.map_pins 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Add policy for editing comments within time limit
CREATE POLICY "Users can edit their own recent discussions" 
  ON public.map_discussions 
  FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() = author_id AND 
    created_at > (now() - interval '1 hour')
  )
  WITH CHECK (
    auth.uid() = author_id AND 
    created_at > (now() - interval '1 hour')
  );
