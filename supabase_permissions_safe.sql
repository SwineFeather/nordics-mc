-- Supabase Permissions for AI Knowledgebase and Wiki Access (Safe Version)
-- Run this in your Supabase SQL editor - this version checks for existing policies

-- 1. Enable RLS on ai_knowledgebase table
ALTER TABLE public.ai_knowledgebase ENABLE ROW LEVEL SECURITY;

-- 2. Create policy to allow public read access to ai_knowledgebase (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ai_knowledgebase' 
        AND policyname = 'Allow public read access to ai_knowledgebase'
    ) THEN
        CREATE POLICY "Allow public read access to ai_knowledgebase" ON public.ai_knowledgebase
        FOR SELECT USING (true);
    END IF;
END $$;

-- 3. Create policy to allow authenticated users to manage ai_knowledgebase (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ai_knowledgebase' 
        AND policyname = 'Allow authenticated users to manage ai_knowledgebase'
    ) THEN
        CREATE POLICY "Allow authenticated users to manage ai_knowledgebase" ON public.ai_knowledgebase
        FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 4. Create storage bucket for ai-docs if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-docs', 'ai-docs', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Create storage policy to allow public read access to ai-docs bucket (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow public read access to ai-docs bucket'
    ) THEN
        CREATE POLICY "Allow public read access to ai-docs bucket" ON storage.objects
        FOR SELECT USING (bucket_id = 'ai-docs');
    END IF;
END $$;

-- 6. Create storage policy to allow authenticated users to upload to ai-docs bucket (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow authenticated users to upload to ai-docs bucket'
    ) THEN
        CREATE POLICY "Allow authenticated users to upload to ai-docs bucket" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'ai-docs' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- 7. Create storage policy to allow authenticated users to update ai-docs files (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow authenticated users to update ai-docs bucket'
    ) THEN
        CREATE POLICY "Allow authenticated users to update ai-docs bucket" ON storage.objects
        FOR UPDATE USING (bucket_id = 'ai-docs' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- 8. Create storage policy to allow authenticated users to delete ai-docs files (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow authenticated users to delete from ai-docs bucket'
    ) THEN
        CREATE POLICY "Allow authenticated users to delete from ai-docs bucket" ON storage.objects
        FOR DELETE USING (bucket_id = 'ai-docs' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- 9. Grant necessary permissions to the anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.ai_knowledgebase TO anon, authenticated;
GRANT USAGE ON SCHEMA storage TO anon, authenticated;

-- 10. Create indexes for better performance on ai_knowledgebase (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_ai_knowledgebase_tags ON public.ai_knowledgebase USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_ai_knowledgebase_section ON public.ai_knowledgebase (section);
CREATE INDEX IF NOT EXISTS idx_ai_knowledgebase_title ON public.ai_knowledgebase (title);

-- 11. Create a function to search knowledgebase by tags and content (only if it doesn't exist)
CREATE OR REPLACE FUNCTION search_ai_knowledgebase(search_query text)
RETURNS TABLE (
  id uuid,
  title text,
  section text,
  content text,
  tags text[],
  relevance_score float
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kb.id,
    kb.title,
    kb.section,
    kb.content,
    kb.tags,
    CASE 
      WHEN search_query = ANY(kb.tags) THEN 1.0
      WHEN kb.title ILIKE '%' || search_query || '%' THEN 0.8
      WHEN kb.content ILIKE '%' || search_query || '%' THEN 0.6
      ELSE 0.1
    END as relevance_score
  FROM public.ai_knowledgebase kb
  WHERE 
    search_query = ANY(kb.tags) OR
    kb.title ILIKE '%' || search_query || '%' OR
    kb.content ILIKE '%' || search_query || '%'
  ORDER BY relevance_score DESC;
END;
$$ LANGUAGE plpgsql;

-- 12. Grant execute permission on the search function
GRANT EXECUTE ON FUNCTION search_ai_knowledgebase(text) TO anon, authenticated; 