-- Create forum_notifications table for tracking unread replies
CREATE TABLE IF NOT EXISTS forum_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
  reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('reply', 'reaction', 'mention')),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id, reply_id, notification_type)
);

-- Enable RLS
ALTER TABLE forum_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own forum notifications" ON forum_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own forum notifications" ON forum_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forum notifications" ON forum_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forum notifications" ON forum_notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_notifications_user_id ON forum_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_notifications_post_id ON forum_notifications(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_notifications_read_at ON forum_notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_forum_notifications_type ON forum_notifications(notification_type);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON forum_notifications TO authenticated; 