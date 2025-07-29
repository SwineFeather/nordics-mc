-- Wiki Collaboration System Migration
-- Migration: 20250709000000-add-wiki-collaboration.sql

-- Create wiki comments table
CREATE TABLE public.wiki_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.wiki_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_moderated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create wiki suggested edits table
CREATE TABLE public.wiki_suggested_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT, -- Explanation of the suggested changes
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'merged')),
  review_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create wiki edit sessions table for conflict detection
CREATE TABLE public.wiki_edit_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,st 
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create wiki collaboration notifications table
CREATE TABLE public.wiki_collaboration_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'page_edited',
    'comment_added',
    'comment_replied',
    'suggested_edit_submitted',
    'suggested_edit_reviewed',
    'edit_conflict',
    'page_published',
    'page_review_requested'
  )),
  page_id UUID REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.wiki_comments(id) ON DELETE CASCADE,
  suggested_edit_id UUID REFERENCES public.wiki_suggested_edits(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional context data
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create wiki page subscriptions table
CREATE TABLE public.wiki_page_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  page_id UUID REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  notification_types TEXT[] DEFAULT ARRAY['page_edited', 'comment_added', 'suggested_edit_submitted'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Ensure unique subscriptions per user per page
  UNIQUE(user_id, page_id)
);

-- Create indexes for better performance
CREATE INDEX idx_wiki_comments_page_id ON public.wiki_comments(page_id);
CREATE INDEX idx_wiki_comments_parent_id ON public.wiki_comments(parent_id);
CREATE INDEX idx_wiki_comments_author_id ON public.wiki_comments(author_id);
CREATE INDEX idx_wiki_comments_created_at ON public.wiki_comments(created_at);

CREATE INDEX idx_wiki_suggested_edits_page_id ON public.wiki_suggested_edits(page_id);
CREATE INDEX idx_wiki_suggested_edits_author_id ON public.wiki_suggested_edits(author_id);
CREATE INDEX idx_wiki_suggested_edits_status ON public.wiki_suggested_edits(status);
CREATE INDEX idx_wiki_suggested_edits_created_at ON public.wiki_suggested_edits(created_at);

CREATE INDEX idx_wiki_edit_sessions_page_id ON public.wiki_edit_sessions(page_id);
CREATE INDEX idx_wiki_edit_sessions_user_id ON public.wiki_edit_sessions(user_id);
CREATE INDEX idx_wiki_edit_sessions_last_activity ON public.wiki_edit_sessions(last_activity);

CREATE INDEX idx_wiki_collaboration_notifications_user_id ON public.wiki_collaboration_notifications(user_id);
CREATE INDEX idx_wiki_collaboration_notifications_is_read ON public.wiki_collaboration_notifications(is_read);
CREATE INDEX idx_wiki_collaboration_notifications_created_at ON public.wiki_collaboration_notifications(created_at);

CREATE INDEX idx_wiki_page_subscriptions_user_id ON public.wiki_page_subscriptions(user_id);
CREATE INDEX idx_wiki_page_subscriptions_page_id ON public.wiki_page_subscriptions(page_id);

-- Enable Row Level Security
ALTER TABLE public.wiki_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_suggested_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_edit_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_collaboration_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_page_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wiki_comments
CREATE POLICY "Anyone can view non-moderated comments" 
  ON public.wiki_comments FOR SELECT 
  USING (is_moderated = false OR auth.uid() = author_id);

CREATE POLICY "Authenticated users can create comments" 
  ON public.wiki_comments FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" 
  ON public.wiki_comments FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.wiki_comments FOR DELETE 
  TO authenticated 
  USING (auth.uid() = author_id);

CREATE POLICY "Moderators can moderate comments" 
  ON public.wiki_comments FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- RLS Policies for wiki_suggested_edits
CREATE POLICY "Anyone can view suggested edits for published pages" 
  ON public.wiki_suggested_edits FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create suggested edits" 
  ON public.wiki_suggested_edits FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Moderators can review suggested edits" 
  ON public.wiki_suggested_edits FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Moderators can delete suggested edits" 
  ON public.wiki_suggested_edits FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- RLS Policies for wiki_edit_sessions
CREATE POLICY "Users can manage their own edit sessions" 
  ON public.wiki_edit_sessions FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view active edit sessions for pages they're editing" 
  ON public.wiki_edit_sessions FOR SELECT 
  TO authenticated 
  USING (is_active = true);

-- RLS Policies for wiki_collaboration_notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.wiki_collaboration_notifications FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.wiki_collaboration_notifications FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
  ON public.wiki_collaboration_notifications FOR INSERT 
  WITH CHECK (true);

-- RLS Policies for wiki_page_subscriptions
CREATE POLICY "Users can manage their own subscriptions" 
  ON public.wiki_page_subscriptions FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wiki_comments_updated_at
  BEFORE UPDATE ON public.wiki_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER update_wiki_suggested_edits_updated_at
  BEFORE UPDATE ON public.wiki_suggested_edits
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

-- Functions for collaboration features

-- Function to create collaboration notification
CREATE OR REPLACE FUNCTION public.create_wiki_collaboration_notification(
  user_id_param UUID,
  notification_type_param TEXT,
  page_id_param UUID,
  actor_id_param UUID,
  title_param TEXT,
  message_param TEXT,
  data_param JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.wiki_collaboration_notifications (
    user_id, notification_type, page_id, actor_id, title, message, data
  ) VALUES (
    user_id_param, notification_type_param, page_id_param, actor_id_param, title_param, message_param, data_param
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify page subscribers
CREATE OR REPLACE FUNCTION public.notify_page_subscribers(
  page_id_param UUID,
  notification_type_param TEXT,
  actor_id_param UUID,
  title_param TEXT,
  message_param TEXT,
  data_param JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  subscriber RECORD;
BEGIN
  FOR subscriber IN 
    SELECT user_id, notification_types 
    FROM public.wiki_page_subscriptions 
    WHERE page_id = page_id_param
  LOOP
    -- Check if user is subscribed to this notification type
    IF notification_type_param = ANY(subscriber.notification_types) THEN
      -- Don't notify the actor themselves
      IF subscriber.user_id != actor_id_param THEN
        PERFORM public.create_wiki_collaboration_notification(
          subscriber.user_id,
          notification_type_param,
          page_id_param,
          actor_id_param,
          title_param,
          message_param,
          data_param
        );
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired edit sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_edit_sessions()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.wiki_edit_sessions 
  WHERE last_activity < NOW() - INTERVAL '30 minutes' 
  OR is_active = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for edit conflicts
CREATE OR REPLACE FUNCTION public.check_edit_conflicts(page_id_param UUID, user_id_param UUID)
RETURNS TABLE(conflict_user_id UUID, conflict_user_name TEXT, last_activity TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wes.user_id,
    p.full_name,
    wes.last_activity
  FROM public.wiki_edit_sessions wes
  JOIN public.profiles p ON p.id = wes.user_id
  WHERE wes.page_id = page_id_param 
    AND wes.user_id != user_id_param 
    AND wes.is_active = true
    AND wes.last_activity > NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Session cleanup can be handled by the application layer
-- or manually triggered when needed using: SELECT public.cleanup_expired_edit_sessions();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.wiki_comments TO authenticated;
GRANT ALL ON public.wiki_suggested_edits TO authenticated;
GRANT ALL ON public.wiki_edit_sessions TO authenticated;
GRANT ALL ON public.wiki_collaboration_notifications TO authenticated;
GRANT ALL ON public.wiki_page_subscriptions TO authenticated; 