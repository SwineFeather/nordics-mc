
-- Drop the existing map_comments table to rebuild with new structure
DROP TABLE IF EXISTS public.map_comments;

-- Create enhanced map_pins table for staff-only pins
CREATE TABLE public.map_pins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  map_date TEXT NOT NULL,
  x_position NUMERIC NOT NULL,
  y_position NUMERIC NOT NULL,
  icon TEXT NOT NULL DEFAULT 'pin',
  color TEXT NOT NULL DEFAULT '#ef4444',
  title TEXT,
  description TEXT,
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create map_discussions table for forum-style comments
CREATE TABLE public.map_discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  map_date TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  parent_id UUID REFERENCES public.map_discussions(id),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_moderated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security for map_pins
ALTER TABLE public.map_pins ENABLE ROW LEVEL SECURITY;

-- Policy for viewing pins - everyone can see them
CREATE POLICY "Anyone can view pins" 
  ON public.map_pins 
  FOR SELECT 
  USING (true);

-- Policy for creating pins - only staff (admin/moderator) can create
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

-- Policy for updating pins - only staff can update
CREATE POLICY "Staff can update pins" 
  ON public.map_pins 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Policy for deleting pins - only staff can delete
CREATE POLICY "Staff can delete pins" 
  ON public.map_pins 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Add Row Level Security for map_discussions
ALTER TABLE public.map_discussions ENABLE ROW LEVEL SECURITY;

-- Policy for viewing discussions - everyone can see non-moderated ones
CREATE POLICY "Anyone can view non-moderated discussions" 
  ON public.map_discussions 
  FOR SELECT 
  USING (is_moderated = false OR auth.uid() = author_id);

-- Policy for creating discussions - authenticated users only
CREATE POLICY "Authenticated users can create discussions" 
  ON public.map_discussions 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Policy for updating own discussions
CREATE POLICY "Users can update their own discussions" 
  ON public.map_discussions 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Policy for deleting discussions - own or staff
CREATE POLICY "Users can delete own discussions or staff can delete any" 
  ON public.map_discussions 
  FOR DELETE 
  TO authenticated
  USING (
    auth.uid() = author_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_map_pins_updated_at
  BEFORE UPDATE ON public.map_pins
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER update_map_discussions_updated_at
  BEFORE UPDATE ON public.map_discussions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

-- Create indexes for performance
CREATE INDEX idx_map_pins_map_date ON public.map_pins(map_date);
CREATE INDEX idx_map_pins_author ON public.map_pins(author_id);

CREATE INDEX idx_map_discussions_map_date ON public.map_discussions(map_date);
CREATE INDEX idx_map_discussions_author ON public.map_discussions(author_id);
CREATE INDEX idx_map_discussions_parent ON public.map_discussions(parent_id);

-- Enable realtime for both tables
ALTER TABLE public.map_pins REPLICA IDENTITY FULL;
ALTER TABLE public.map_discussions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.map_pins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.map_discussions;
