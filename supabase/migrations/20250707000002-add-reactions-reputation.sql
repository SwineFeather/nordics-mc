-- Add user engagement features: reactions, reputation, leaderboard
-- Migration: 20250707000002-add-reactions-reputation.sql

-- Create reaction types enum
CREATE TYPE public.reaction_type AS ENUM (
  'like',
  'love',
  'laugh',
  'wow',
  'sad',
  'angry',
  'helpful',
  'insightful'
);

-- Create forum_reactions table
CREATE TABLE public.forum_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  reaction_type public.reaction_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure user can only react to either a post OR a reply, not both
  CONSTRAINT reaction_target_check CHECK (
    (post_id IS NOT NULL AND reply_id IS NULL) OR 
    (post_id IS NULL AND reply_id IS NOT NULL)
  ),
  
  -- Ensure user can only have one reaction per post/reply
  UNIQUE(user_id, post_id, reaction_type),
  UNIQUE(user_id, reply_id, reaction_type)
);

-- Create user_reputation table
CREATE TABLE public.user_reputation (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  reputation_points INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  badges_earned TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reputation_events table to log reputation changes
CREATE TABLE public.reputation_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  points_change INTEGER NOT NULL,
  description TEXT,
  related_post_id UUID REFERENCES public.forum_posts(id) ON DELETE SET NULL,
  related_reply_id UUID REFERENCES public.forum_replies(id) ON DELETE SET NULL,
  related_reaction_id UUID REFERENCES public.forum_reactions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS forum_reactions_post_id_idx ON public.forum_reactions(post_id);
CREATE INDEX IF NOT EXISTS forum_reactions_reply_id_idx ON public.forum_reactions(reply_id);
CREATE INDEX IF NOT EXISTS forum_reactions_user_id_idx ON public.forum_reactions(user_id);
CREATE INDEX IF NOT EXISTS forum_reactions_type_idx ON public.forum_reactions(reaction_type);
CREATE INDEX IF NOT EXISTS user_reputation_points_idx ON public.user_reputation(reputation_points DESC);
CREATE INDEX IF NOT EXISTS user_reputation_level_idx ON public.user_reputation(level DESC);
CREATE INDEX IF NOT EXISTS reputation_events_user_id_idx ON public.reputation_events(user_id);
CREATE INDEX IF NOT EXISTS reputation_events_created_at_idx ON public.reputation_events(created_at DESC);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER forum_reactions_updated_at
  BEFORE UPDATE ON public.forum_reactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER user_reputation_updated_at
  BEFORE UPDATE ON public.user_reputation
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to calculate user level based on reputation points
CREATE OR REPLACE FUNCTION public.calculate_user_level(reputation_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(reputation_points / 100) + 1);
END;
$$ LANGUAGE plpgsql;

-- Function to update user reputation and level
CREATE OR REPLACE FUNCTION public.update_user_reputation(
  target_user_id UUID,
  points_change INTEGER,
  event_type TEXT,
  event_description TEXT DEFAULT NULL,
  related_post_id UUID DEFAULT NULL,
  related_reply_id UUID DEFAULT NULL,
  related_reaction_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  new_points INTEGER;
  new_level INTEGER;
BEGIN
  -- Insert or update user reputation
  INSERT INTO public.user_reputation (user_id, reputation_points, level)
  VALUES (target_user_id, points_change, public.calculate_user_level(points_change))
  ON CONFLICT (user_id) DO UPDATE SET
    reputation_points = user_reputation.reputation_points + points_change,
    level = public.calculate_user_level(user_reputation.reputation_points + points_change),
    updated_at = NOW();
  
  -- Log the reputation event
  INSERT INTO public.reputation_events (
    user_id, event_type, points_change, description,
    related_post_id, related_reply_id, related_reaction_id
  ) VALUES (
    target_user_id, event_type, points_change, event_description,
    related_post_id, related_reply_id, related_reaction_id
  );
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for forum_reactions
ALTER TABLE public.forum_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all reactions" ON public.forum_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own reactions" ON public.forum_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions" ON public.forum_reactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON public.forum_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_reputation
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all reputation" ON public.user_reputation
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own reputation" ON public.user_reputation
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for reputation_events
ALTER TABLE public.reputation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reputation events" ON public.reputation_events
  FOR SELECT USING (true);

CREATE POLICY "System can insert reputation events" ON public.reputation_events
  FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_reactions TO authenticated;
GRANT SELECT, UPDATE ON public.user_reputation TO authenticated;
GRANT SELECT, INSERT ON public.reputation_events TO authenticated; 