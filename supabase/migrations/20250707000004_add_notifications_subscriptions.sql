-- Add notifications and subscriptions system
-- Migration: 20250707000004-add-notifications-subscriptions.sql

-- Create notification types enum
CREATE TYPE public.notification_type AS ENUM (
  'post_reply',
  'post_mention',
  'reply_mention',
  'post_like',
  'reply_like',
  'post_saved',
  'category_subscription',
  'moderation_action',
  'warning_issued',
  'content_approved',
  'content_rejected',
  'daily_digest',
  'weekly_digest'
);

-- Create notification priority enum
CREATE TYPE public.notification_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Create subscription frequency enum
CREATE TYPE public.subscription_frequency AS ENUM (
  'instant',
  'hourly',
  'daily',
  'weekly',
  'never'
);

-- Create user_notifications table
CREATE TABLE public.user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional data like post_id, reply_id, etc.
  priority public.notification_priority DEFAULT 'medium',
  read_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index for performance
  CONSTRAINT user_notifications_user_read_idx UNIQUE (user_id, id, read_at)
);

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL, -- 'category', 'user', 'tag', etc.
  target_id TEXT NOT NULL, -- category_id, user_id, tag_name, etc.
  frequency public.subscription_frequency DEFAULT 'instant',
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique subscriptions per user
  CONSTRAINT user_subscriptions_unique UNIQUE (user_id, subscription_type, target_id)
);

-- Create notification_settings table
CREATE TABLE public.notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  in_app_notifications BOOLEAN DEFAULT true,
  daily_digest BOOLEAN DEFAULT false,
  weekly_digest BOOLEAN DEFAULT false,
  mention_notifications BOOLEAN DEFAULT true,
  reply_notifications BOOLEAN DEFAULT true,
  like_notifications BOOLEAN DEFAULT true,
  moderation_notifications BOOLEAN DEFAULT true,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_templates table for customizable messages
CREATE TABLE public.notification_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT UNIQUE NOT NULL,
  notification_type public.notification_type NOT NULL,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  email_subject_template TEXT,
  email_body_template TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS user_notifications_user_id_idx ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS user_notifications_read_at_idx ON public.user_notifications(read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS user_notifications_created_at_idx ON public.user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS user_notifications_type_idx ON public.user_notifications(notification_type);
CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS user_subscriptions_type_target_idx ON public.user_subscriptions(subscription_type, target_id);
CREATE INDEX IF NOT EXISTS notification_settings_user_id_idx ON public.notification_settings(user_id);
CREATE INDEX IF NOT EXISTS notification_templates_key_idx ON public.notification_templates(template_key);

-- Add updated_at triggers
CREATE TRIGGER user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER notification_templates_updated_at
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to create a notification
CREATE OR REPLACE FUNCTION public.create_notification(
  user_id_param UUID,
  notification_type_param public.notification_type,
  title_param TEXT,
  message_param TEXT,
  data_param JSONB DEFAULT NULL,
  priority_param public.notification_priority DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  user_settings RECORD;
BEGIN
  -- Check user notification settings
  SELECT * INTO user_settings FROM public.notification_settings WHERE user_id = user_id_param;
  
  -- If no settings exist, create default ones
  IF user_settings IS NULL THEN
    INSERT INTO public.notification_settings (user_id) VALUES (user_id_param);
    user_settings := (SELECT * FROM public.notification_settings WHERE user_id = user_id_param);
  END IF;
  
  -- Check if notifications are enabled for this type
  IF notification_type_param = 'post_reply' AND NOT user_settings.reply_notifications THEN
    RETURN NULL;
  END IF;
  
  IF notification_type_param = 'post_mention' OR notification_type_param = 'reply_mention' THEN
    IF NOT user_settings.mention_notifications THEN
      RETURN NULL;
    END IF;
  END IF;
  
  IF notification_type_param IN ('post_like', 'reply_like') AND NOT user_settings.like_notifications THEN
    RETURN NULL;
  END IF;
  
  IF notification_type_param LIKE '%moderation%' AND NOT user_settings.moderation_notifications THEN
    RETURN NULL;
  END IF;
  
  -- Check quiet hours
  IF user_settings.quiet_hours_start IS NOT NULL AND user_settings.quiet_hours_end IS NOT NULL THEN
    IF NOW()::time BETWEEN user_settings.quiet_hours_start AND user_settings.quiet_hours_end THEN
      -- Still create notification but mark as low priority
      priority_param := 'low';
    END IF;
  END IF;
  
  -- Create the notification
  INSERT INTO public.user_notifications (
    user_id, notification_type, title, message, data, priority
  ) VALUES (
    user_id_param, notification_type_param, title_param, message_param, data_param, priority_param
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.user_notifications 
  SET read_at = NOW() 
  WHERE id = notification_id_param AND user_id = user_id_param;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.user_notifications 
  SET read_at = NOW() 
  WHERE user_id = user_id_param AND read_at IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count 
  FROM public.user_notifications 
  WHERE user_id = user_id_param AND read_at IS NULL;
  
  RETURN count;
END;
$$ LANGUAGE plpgsql;

-- Function to subscribe to content
CREATE OR REPLACE FUNCTION public.subscribe_to_content(
  user_id_param UUID,
  subscription_type_param TEXT,
  target_id_param TEXT,
  frequency_param public.subscription_frequency DEFAULT 'instant'
)
RETURNS UUID AS $$
DECLARE
  subscription_id UUID;
BEGIN
  INSERT INTO public.user_subscriptions (
    user_id, subscription_type, target_id, frequency
  ) VALUES (
    user_id_param, subscription_type_param, target_id_param, frequency_param
  )
  ON CONFLICT (user_id, subscription_type, target_id) 
  DO UPDATE SET 
    frequency = EXCLUDED.frequency,
    updated_at = NOW()
  RETURNING id INTO subscription_id;
  
  RETURN subscription_id;
END;
$$ LANGUAGE plpgsql;

-- Function to unsubscribe from content
CREATE OR REPLACE FUNCTION public.unsubscribe_from_content(
  user_id_param UUID,
  subscription_type_param TEXT,
  target_id_param TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM public.user_subscriptions 
  WHERE user_id = user_id_param 
    AND subscription_type = subscription_type_param 
    AND target_id = target_id_param;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Insert default notification templates
INSERT INTO public.notification_templates (template_key, notification_type, title_template, message_template, email_subject_template, email_body_template) VALUES
('post_reply', 'post_reply', 'New reply to your post', '{{replier_name}} replied to your post "{{post_title}}"', 'New reply: {{post_title}}', '{{replier_name}} has replied to your post "{{post_title}}". Click here to view: {{post_url}}'),
('post_mention', 'post_mention', 'You were mentioned in a post', '{{author_name}} mentioned you in their post "{{post_title}}"', 'You were mentioned: {{post_title}}', '{{author_name}} mentioned you in their post "{{post_title}}". Click here to view: {{post_url}}'),
('reply_mention', 'reply_mention', 'You were mentioned in a reply', '{{author_name}} mentioned you in a reply to "{{post_title}}"', 'You were mentioned in a reply', '{{author_name}} mentioned you in a reply to "{{post_title}}". Click here to view: {{post_url}}'),
('post_like', 'post_like', 'Your post received a like', '{{liker_name}} liked your post "{{post_title}}"', 'New like on your post', '{{liker_name}} liked your post "{{post_title}}". Click here to view: {{post_url}}'),
('category_subscription', 'category_subscription', 'New post in {{category_name}}', '{{author_name}} posted "{{post_title}}" in {{category_name}}', 'New post in {{category_name}}', '{{author_name}} has posted "{{post_title}}" in {{category_name}}. Click here to view: {{post_url}}'),
('moderation_action', 'moderation_action', 'Moderation action taken', '{{action_type}} on your {{content_type}}', 'Moderation action: {{action_type}}', 'A moderation action ({{action_type}}) has been taken on your {{content_type}}. Reason: {{reason}}'),
('warning_issued', 'warning_issued', 'Warning issued', 'You have received a warning: {{warning_type}}', 'Warning: {{warning_type}}', 'You have received a warning: {{warning_type}}. Reason: {{reason}}. Please review our community guidelines.');

-- RLS Policies for user_notifications
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.user_notifications
  FOR INSERT WITH CHECK (true);

-- RLS Policies for user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscriptions" ON public.user_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for notification_settings
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" ON public.notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings" ON public.notification_settings
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for notification_templates
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active templates" ON public.notification_templates
  FOR SELECT USING (is_active = true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.user_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notification_settings TO authenticated;
GRANT SELECT ON public.notification_templates TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unread_notification_count TO authenticated;
GRANT EXECUTE ON FUNCTION public.subscribe_to_content TO authenticated;
GRANT EXECUTE ON FUNCTION public.unsubscribe_from_content TO authenticated; 