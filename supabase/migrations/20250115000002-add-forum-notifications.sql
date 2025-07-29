-- Add forum notification settings table
-- Migration: 20250115000002-add-forum-notifications.sql

-- Create forum_notification_settings table
CREATE TABLE IF NOT EXISTS forum_notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  reply_notifications BOOLEAN DEFAULT true,
  mention_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one settings record per user per post
  UNIQUE(user_id, post_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_notification_settings_user_id ON forum_notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_notification_settings_post_id ON forum_notification_settings(post_id);

-- Enable RLS
ALTER TABLE forum_notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notification settings" ON forum_notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notification settings" ON forum_notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" ON forum_notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification settings" ON forum_notification_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_forum_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_forum_notification_settings_updated_at
  BEFORE UPDATE ON forum_notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_forum_notification_settings_updated_at(); 