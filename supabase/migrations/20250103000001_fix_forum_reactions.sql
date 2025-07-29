-- Ensure forum_post_reactions table exists with proper structure
CREATE TABLE IF NOT EXISTS forum_post_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE forum_post_reactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view reactions" ON forum_post_reactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add reactions" ON forum_post_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON forum_post_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_post_reactions_post_id ON forum_post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_reactions_user_id ON forum_post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_reactions_emoji ON forum_post_reactions(emoji);

-- Grant necessary permissions
GRANT SELECT, INSERT, DELETE ON forum_post_reactions TO authenticated;
GRANT SELECT ON forum_post_reactions TO anon; 