-- Fix wiki_edit_sessions table RLS policies
-- Run this in your Supabase SQL Editor

-- First, check if the table exists
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'wiki_edit_sessions';

-- Check current RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'wiki_edit_sessions';

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'wiki_edit_sessions';

-- If the table doesn't exist, create it
CREATE TABLE IF NOT EXISTS public.wiki_edit_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  page_id TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Enable RLS
ALTER TABLE public.wiki_edit_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for users to see their own edit sessions
CREATE POLICY "Users can view their own edit sessions" ON public.wiki_edit_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own edit sessions
CREATE POLICY "Users can create their own edit sessions" ON public.wiki_edit_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own edit sessions
CREATE POLICY "Users can update their own edit sessions" ON public.wiki_edit_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own edit sessions
CREATE POLICY "Users can delete their own edit sessions" ON public.wiki_edit_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.wiki_edit_sessions TO authenticated;
GRANT ALL ON public.wiki_edit_sessions TO service_role;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wiki_edit_sessions_user_id ON public.wiki_edit_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_wiki_edit_sessions_page_id ON public.wiki_edit_sessions(page_id);
CREATE INDEX IF NOT EXISTS idx_wiki_edit_sessions_expires_at ON public.wiki_edit_sessions(expires_at);

-- Test the table
INSERT INTO public.wiki_edit_sessions (user_id, page_id, content)
VALUES ('00000000-0000-0000-0000-000000000000', 'test-page', 'Test content')
ON CONFLICT DO NOTHING;

-- Clean up test data
DELETE FROM public.wiki_edit_sessions WHERE page_id = 'test-page';

-- Verify the policies are working
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'wiki_edit_sessions'; 