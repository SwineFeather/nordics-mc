
-- Create table for map comments
CREATE TABLE public.map_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  map_date TEXT NOT NULL,
  x_position NUMERIC NOT NULL,
  y_position NUMERIC NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  parent_id UUID REFERENCES public.map_comments(id),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_moderated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.map_comments ENABLE ROW LEVEL SECURITY;

-- Policy for viewing comments - everyone can see non-moderated comments
CREATE POLICY "Anyone can view non-moderated comments" 
  ON public.map_comments 
  FOR SELECT 
  USING (is_moderated = false OR auth.uid() = author_id);

-- Policy for creating comments - authenticated users only
CREATE POLICY "Authenticated users can create comments" 
  ON public.map_comments 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Policy for updating own comments
CREATE POLICY "Users can update their own comments" 
  ON public.map_comments 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Policy for deleting own comments
CREATE POLICY "Users can delete their own comments" 
  ON public.map_comments 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = author_id);

-- Add trigger for updated_at
CREATE TRIGGER update_map_comments_updated_at
  BEFORE UPDATE ON public.map_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

-- Create indexes for performance
CREATE INDEX idx_map_comments_map_date ON public.map_comments(map_date);
CREATE INDEX idx_map_comments_position ON public.map_comments(x_position, y_position);
CREATE INDEX idx_map_comments_author ON public.map_comments(author_id);
CREATE INDEX idx_map_comments_parent ON public.map_comments(parent_id);
