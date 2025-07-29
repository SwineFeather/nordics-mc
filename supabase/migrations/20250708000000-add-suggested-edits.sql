-- Create suggested edits table for wiki pages
CREATE TABLE public.suggested_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_suggested_edits_page_id ON public.suggested_edits(page_id);
CREATE INDEX idx_suggested_edits_status ON public.suggested_edits(status);
CREATE INDEX idx_suggested_edits_author_id ON public.suggested_edits(author_id);
CREATE INDEX idx_suggested_edits_reviewed_by ON public.suggested_edits(reviewed_by);

-- Enable RLS
ALTER TABLE public.suggested_edits ENABLE ROW LEVEL SECURITY;

-- Create policies for suggested edits
CREATE POLICY "Anyone can view suggested edits for published pages" 
  ON public.suggested_edits FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create suggested edits" 
  ON public.suggested_edits FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Moderators can review suggested edits" 
  ON public.suggested_edits FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Moderators can delete suggested edits" 
  ON public.suggested_edits FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Add updated_at trigger
CREATE TRIGGER set_timestamp_suggested_edits
  BEFORE UPDATE ON public.suggested_edits
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Enable realtime for suggested edits
ALTER PUBLICATION supabase_realtime ADD TABLE public.suggested_edits; 