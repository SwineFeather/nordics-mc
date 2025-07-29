
-- Create forum system tables
CREATE TABLE forum_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  slug text UNIQUE NOT NULL,
  icon text DEFAULT 'message-square',
  color text DEFAULT '#3b82f6',
  order_index integer DEFAULT 0,
  is_moderator_only boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category_id uuid REFERENCES forum_categories(id) ON DELETE CASCADE,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  post_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES forum_replies(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE forum_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES forum_categories(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, category_id)
);

-- Insert default forum categories
INSERT INTO forum_categories (name, description, slug, icon, color, order_index, is_moderator_only) VALUES
('Towns Forum', 'Discuss town matters and coordinate with fellow citizens', 'towns', 'building', '#10b981', 1, false),
('News & Announcements', 'Latest server news and important announcements', 'news', 'newspaper', '#059669', 2, true),
('Events', 'Community events, competitions, and activities', 'events', 'calendar', '#f59e0b', 3, false),
('Discussions', 'General chat and community discussions', 'discussions', 'message-square', '#6366f1', 4, false),
('Questions & Help', 'Get help with commands, gameplay, and server features', 'questions', 'help-circle', '#eab308', 5, false),
('Server Ideas', 'Suggest new features and improvements for the server', 'suggestions', 'lightbulb', '#ec4899', 6, false),
('Patch Notes', 'Server updates, bug fixes, and new features', 'patches', 'wrench', '#8b5cf6', 7, true);

-- Enable RLS
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for forum_categories (readable by all, writable by moderators+)
CREATE POLICY "Forum categories are viewable by everyone" ON forum_categories FOR SELECT USING (true);
CREATE POLICY "Only moderators can manage categories" ON forum_categories FOR ALL USING (has_role_or_higher('moderator'::app_role));

-- Create policies for forum_posts
CREATE POLICY "Forum posts are viewable by everyone" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON forum_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can edit own posts or moderators can edit all" ON forum_posts FOR UPDATE USING (
  author_id = auth.uid() OR has_role_or_higher('moderator'::app_role)
);
CREATE POLICY "Users can delete own posts or moderators can delete all" ON forum_posts FOR DELETE USING (
  author_id = auth.uid() OR has_role_or_higher('moderator'::app_role)
);

-- Create policies for forum_replies
CREATE POLICY "Forum replies are viewable by everyone" ON forum_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON forum_replies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can edit own replies or moderators can edit all" ON forum_replies FOR UPDATE USING (
  author_id = auth.uid() OR has_role_or_higher('moderator'::app_role)
);
CREATE POLICY "Users can delete own replies or moderators can delete all" ON forum_replies FOR DELETE USING (
  author_id = auth.uid() OR has_role_or_higher('moderator'::app_role)
);

-- Create policies for forum_subscriptions
CREATE POLICY "Users can view own subscriptions" ON forum_subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own subscriptions" ON forum_subscriptions FOR ALL USING (user_id = auth.uid());

-- Create triggers for updated_at
CREATE TRIGGER update_forum_categories_updated_at BEFORE UPDATE ON forum_categories FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
