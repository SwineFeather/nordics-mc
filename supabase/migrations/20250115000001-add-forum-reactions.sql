-- Add forum post reactions table
-- Migration: 20250115000001-add-forum-reactions.sql

-- Create forum_post_reactions table
CREATE TABLE IF NOT EXISTS forum_post_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one reaction per user per post per emoji
  UNIQUE(post_id, user_id, emoji)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_post_reactions_post_id ON forum_post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_reactions_user_id ON forum_post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_reactions_emoji ON forum_post_reactions(emoji);

-- Enable RLS
ALTER TABLE forum_post_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all reactions" ON forum_post_reactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reactions" ON forum_post_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions" ON forum_post_reactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON forum_post_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_forum_post_reactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_forum_post_reactions_updated_at
  BEFORE UPDATE ON forum_post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_forum_post_reactions_updated_at(); 