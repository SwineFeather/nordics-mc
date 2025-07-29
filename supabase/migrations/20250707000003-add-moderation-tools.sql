-- Add moderation tools and content management
-- Migration: 20250707000003-add-moderation-tools.sql

-- Create moderation action types enum
CREATE TYPE public.moderation_action_type AS ENUM (
  'warn',
  'delete_post',
  'delete_reply',
  'lock_post',
  'unlock_post',
  'pin_post',
  'unpin_post',
  'feature_post',
  'unfeature_post',
  'ban_user',
  'unban_user',
  'mute_user',
  'unmute_user',
  'approve_content',
  'reject_content'
);

-- Create report types enum
CREATE TYPE public.report_type AS ENUM (
  'spam',
  'inappropriate',
  'harassment',
  'hate_speech',
  'violence',
  'copyright',
  'misinformation',
  'other'
);

-- Create report status enum
CREATE TYPE public.report_status AS ENUM (
  'pending',
  'investigating',
  'resolved',
  'dismissed'
);

-- Create forum_moderation_actions table
CREATE TABLE public.forum_moderation_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type public.moderation_action_type NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  target_reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  reason TEXT,
  details TEXT,
  duration_hours INTEGER, -- For temporary actions like mutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure action targets either a user, post, or reply
  CONSTRAINT moderation_target_check CHECK (
    (target_user_id IS NOT NULL) OR 
    (target_post_id IS NOT NULL) OR 
    (target_reply_id IS NOT NULL)
  )
);

-- Create user_warnings table
CREATE TABLE public.user_warnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  warning_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create content_reports table
CREATE TABLE public.content_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  report_type public.report_type NOT NULL,
  report_status public.report_status DEFAULT 'pending',
  target_post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  target_reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  evidence TEXT,
  moderator_notes TEXT,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure report targets either a user, post, or reply
  CONSTRAINT report_target_check CHECK (
    (target_user_id IS NOT NULL) OR 
    (target_post_id IS NOT NULL) OR 
    (target_reply_id IS NOT NULL)
  )
);

-- Create moderation_queue table for flagged content
CREATE TABLE public.moderation_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'post', 'reply', 'user'
  content_id UUID NOT NULL,
  report_count INTEGER DEFAULT 1,
  first_reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high
  assigned_moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status public.report_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add moderator role to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_moderator BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS muted_until TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS forum_moderation_actions_moderator_idx ON public.forum_moderation_actions(moderator_id);
CREATE INDEX IF NOT EXISTS forum_moderation_actions_target_user_idx ON public.forum_moderation_actions(target_user_id);
CREATE INDEX IF NOT EXISTS forum_moderation_actions_target_post_idx ON public.forum_moderation_actions(target_post_id);
CREATE INDEX IF NOT EXISTS forum_moderation_actions_created_at_idx ON public.forum_moderation_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS user_warnings_user_id_idx ON public.user_warnings(user_id);
CREATE INDEX IF NOT EXISTS user_warnings_active_idx ON public.user_warnings(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS content_reports_reporter_idx ON public.content_reports(reporter_id);
CREATE INDEX IF NOT EXISTS content_reports_status_idx ON public.content_reports(report_status);
CREATE INDEX IF NOT EXISTS content_reports_created_at_idx ON public.content_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS moderation_queue_status_idx ON public.moderation_queue(status);
CREATE INDEX IF NOT EXISTS moderation_queue_priority_idx ON public.moderation_queue(priority DESC);
CREATE INDEX IF NOT EXISTS moderation_queue_assigned_idx ON public.moderation_queue(assigned_moderator_id);
CREATE INDEX IF NOT EXISTS profiles_moderator_idx ON public.profiles(is_moderator) WHERE is_moderator = true;
CREATE INDEX IF NOT EXISTS profiles_admin_idx ON public.profiles(is_admin) WHERE is_admin = true;

-- Add updated_at trigger to moderation_queue
CREATE TRIGGER moderation_queue_updated_at
  BEFORE UPDATE ON public.moderation_queue
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to add content to moderation queue
CREATE OR REPLACE FUNCTION public.add_to_moderation_queue(
  content_type_param TEXT,
  content_id_param UUID,
  report_type_param public.report_type,
  reporter_id_param UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Insert or update moderation queue entry
  INSERT INTO public.moderation_queue (content_type, content_id, report_count, last_reported_at)
  VALUES (content_type_param, content_id_param, 1, NOW())
  ON CONFLICT (content_type, content_id) DO UPDATE SET
    report_count = moderation_queue.report_count + 1,
    last_reported_at = NOW(),
    priority = CASE 
      WHEN moderation_queue.report_count + 1 >= 5 THEN 3
      WHEN moderation_queue.report_count + 1 >= 3 THEN 2
      ELSE 1
    END,
    updated_at = NOW();
  
  -- Log the report
  INSERT INTO public.content_reports (
    reporter_id, report_type, target_post_id, target_reply_id, target_user_id, reason
  ) VALUES (
    reporter_id_param, report_type_param,
    CASE WHEN content_type_param = 'post' THEN content_id_param ELSE NULL END,
    CASE WHEN content_type_param = 'reply' THEN content_id_param ELSE NULL END,
    CASE WHEN content_type_param = 'user' THEN content_id_param ELSE NULL END,
    'Reported by user'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is banned or muted
CREATE OR REPLACE FUNCTION public.is_user_restricted(user_id_param UUID)
RETURNS TABLE(is_banned BOOLEAN, is_muted BOOLEAN, banned_until TIMESTAMP WITH TIME ZONE, muted_until TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(p.banned_until > NOW(), false) as is_banned,
    COALESCE(p.muted_until > NOW(), false) as is_muted,
    p.banned_until,
    p.muted_until
  FROM public.profiles p
  WHERE p.id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for forum_moderation_actions
ALTER TABLE public.forum_moderation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderators can view all moderation actions" ON public.forum_moderation_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (is_moderator = true OR is_admin = true)
    )
  );

CREATE POLICY "Moderators can create moderation actions" ON public.forum_moderation_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (is_moderator = true OR is_admin = true)
    )
  );

-- RLS Policies for user_warnings
ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own warnings" ON public.user_warnings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Moderators can view all warnings" ON public.user_warnings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (is_moderator = true OR is_admin = true)
    )
  );

CREATE POLICY "Moderators can create warnings" ON public.user_warnings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (is_moderator = true OR is_admin = true)
    )
  );

CREATE POLICY "Users can update their own warnings" ON public.user_warnings
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for content_reports
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports" ON public.content_reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Moderators can view all reports" ON public.content_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (is_moderator = true OR is_admin = true)
    )
  );

CREATE POLICY "Users can create reports" ON public.content_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Moderators can update reports" ON public.content_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (is_moderator = true OR is_admin = true)
    )
  );

-- RLS Policies for moderation_queue
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderators can view moderation queue" ON public.moderation_queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (is_moderator = true OR is_admin = true)
    )
  );

CREATE POLICY "Moderators can update moderation queue" ON public.moderation_queue
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (is_moderator = true OR is_admin = true)
    )
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.forum_moderation_actions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_warnings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.content_reports TO authenticated;
GRANT SELECT, UPDATE ON public.moderation_queue TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated; 