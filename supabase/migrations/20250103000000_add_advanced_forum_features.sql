-- Advanced Forum Features Migration
-- This migration adds version history, collaboration, and analytics features

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Forum Post Versions Table
CREATE TABLE IF NOT EXISTS forum_post_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    post_type TEXT DEFAULT 'discussion',
    version_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    change_summary TEXT,
    
    -- Ensure unique version numbers per post
    UNIQUE(post_id, version_number)
);

-- Forum Post Collaborations Table
CREATE TABLE IF NOT EXISTS forum_post_collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('viewer', 'editor', 'admin')),
    invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    
    -- Ensure unique collaborations per post-user pair
    UNIQUE(post_id, user_id)
);

-- Forum Post Analytics Table
CREATE TABLE IF NOT EXISTS forum_post_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE UNIQUE,
    view_count INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    time_spent_reading INTEGER DEFAULT 0, -- in seconds
    scroll_depth INTEGER DEFAULT 0, -- percentage
    engagement_score DECIMAL(3,2) DEFAULT 0.00,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Post View Tracking Table
CREATE TABLE IF NOT EXISTS forum_post_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_spent INTEGER DEFAULT 0, -- in seconds
    scroll_depth INTEGER DEFAULT 0, -- percentage
    
    -- Track unique views per user per session
    UNIQUE(post_id, user_id, session_id)
);

-- Forum Post Engagement Tracking Table
CREATE TABLE IF NOT EXISTS forum_post_engagement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    engagement_type TEXT NOT NULL CHECK (engagement_type IN ('like', 'dislike', 'share', 'bookmark', 'comment', 'view')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate engagements of same type by same user
    UNIQUE(post_id, user_id, engagement_type)
);

-- Add new columns to existing forum_posts table
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS featured_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS canonical_url TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'discussion';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_post_versions_post_id ON forum_post_versions(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_versions_created_by ON forum_post_versions(created_by);
CREATE INDEX IF NOT EXISTS idx_forum_post_versions_created_at ON forum_post_versions(created_at);

CREATE INDEX IF NOT EXISTS idx_forum_post_collaborations_post_id ON forum_post_collaborations(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_collaborations_user_id ON forum_post_collaborations(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_collaborations_status ON forum_post_collaborations(status);

CREATE INDEX IF NOT EXISTS idx_forum_post_analytics_post_id ON forum_post_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_analytics_engagement_score ON forum_post_analytics(engagement_score);

CREATE INDEX IF NOT EXISTS idx_forum_post_views_post_id ON forum_post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_views_user_id ON forum_post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_views_viewed_at ON forum_post_views(viewed_at);

CREATE INDEX IF NOT EXISTS idx_forum_post_engagement_post_id ON forum_post_engagement(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_engagement_user_id ON forum_post_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_engagement_type ON forum_post_engagement(engagement_type);

-- Create RLS policies for security
ALTER TABLE forum_post_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_engagement ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_post_versions
CREATE POLICY "Users can view versions of posts" ON forum_post_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM forum_posts fp
            WHERE fp.id = forum_post_versions.post_id
        )
    );

CREATE POLICY "Post authors can create versions" ON forum_post_versions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM forum_posts fp
            WHERE fp.id = forum_post_versions.post_id
            AND fp.author_id = auth.uid()
        )
    );

-- RLS Policies for forum_post_collaborations
CREATE POLICY "Users can view collaborations for posts they own or collaborate on" ON forum_post_collaborations
    FOR SELECT USING (
        user_id = auth.uid() OR
        invited_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM forum_posts fp
            WHERE fp.id = forum_post_collaborations.post_id
            AND fp.author_id = auth.uid()
        )
    );

CREATE POLICY "Post authors can invite collaborators" ON forum_post_collaborations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM forum_posts fp
            WHERE fp.id = forum_post_collaborations.post_id
            AND fp.author_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own collaboration status" ON forum_post_collaborations
    FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for forum_post_analytics
CREATE POLICY "Post authors can view their post analytics" ON forum_post_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM forum_posts fp
            WHERE fp.id = forum_post_analytics.post_id
            AND fp.author_id = auth.uid()
        )
    );

CREATE POLICY "System can update analytics" ON forum_post_analytics
    FOR UPDATE USING (true);

-- RLS Policies for forum_post_views
CREATE POLICY "Users can view their own view history" ON forum_post_views
    FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can create view records" ON forum_post_views
    FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- RLS Policies for forum_post_engagement
CREATE POLICY "Users can view engagement on posts" ON forum_post_engagement
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM forum_posts fp
            WHERE fp.id = forum_post_engagement.post_id
        )
    );

CREATE POLICY "Users can create their own engagement" ON forum_post_engagement
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own engagement" ON forum_post_engagement
    FOR UPDATE USING (user_id = auth.uid());

-- Create functions for analytics updates
CREATE OR REPLACE FUNCTION update_post_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update analytics when engagement is added
    INSERT INTO forum_post_analytics (post_id, engagement_score, last_updated)
    VALUES (NEW.post_id, 
            (SELECT COALESCE(AVG(
                CASE 
                    WHEN engagement_type = 'like' THEN 1.0
                    WHEN engagement_type = 'dislike' THEN -0.5
                    WHEN engagement_type = 'share' THEN 2.0
                    WHEN engagement_type = 'bookmark' THEN 1.5
                    WHEN engagement_type = 'comment' THEN 1.0
                    WHEN engagement_type = 'view' THEN 0.1
                    ELSE 0.0
                END
            ), 0.0)
            FROM forum_post_engagement 
            WHERE post_id = NEW.post_id),
            NOW())
    ON CONFLICT (post_id) 
    DO UPDATE SET 
        engagement_score = EXCLUDED.engagement_score,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for analytics updates
CREATE TRIGGER trigger_update_post_analytics
    AFTER INSERT OR UPDATE OR DELETE ON forum_post_engagement
    FOR EACH ROW
    EXECUTE FUNCTION update_post_analytics();

-- Create function to track post views
CREATE OR REPLACE FUNCTION track_post_view()
RETURNS TRIGGER AS $$
BEGIN
    -- Update view count in analytics
    INSERT INTO forum_post_analytics (post_id, view_count, last_updated)
    VALUES (NEW.post_id, 1, NOW())
    ON CONFLICT (post_id) 
    DO UPDATE SET 
        view_count = forum_post_analytics.view_count + 1,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for view tracking
CREATE TRIGGER trigger_track_post_view
    AFTER INSERT ON forum_post_views
    FOR EACH ROW
    EXECUTE FUNCTION track_post_view();

-- Create function to increment edit count
CREATE OR REPLACE FUNCTION increment_edit_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment edit count when post is updated
    UPDATE forum_posts 
    SET edit_count = edit_count + 1,
        last_edited_by = auth.uid()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for edit count
CREATE TRIGGER trigger_increment_edit_count
    AFTER UPDATE ON forum_posts
    FOR EACH ROW
    EXECUTE FUNCTION increment_edit_count();

-- Insert sample data for testing
INSERT INTO forum_post_analytics (post_id, view_count, unique_viewers, engagement_score)
SELECT id, 0, 0, 0.0
FROM forum_posts
WHERE id NOT IN (SELECT post_id FROM forum_post_analytics);

-- Create view for post statistics
CREATE OR REPLACE VIEW forum_post_stats AS
SELECT 
    fp.id,
    fp.title,
    fp.author_id,
    fp.created_at,
    fp.updated_at,
    fp.edit_count,
    fp.is_featured,
    COALESCE(fpa.view_count, 0) as view_count,
    COALESCE(fpa.unique_viewers, 0) as unique_viewers,
    COALESCE(fpa.engagement_score, 0.0) as engagement_score,
    COALESCE(fpa.time_spent_reading, 0) as time_spent_reading,
    (SELECT COUNT(*) FROM forum_post_versions fpv WHERE fpv.post_id = fp.id) as version_count,
    (SELECT COUNT(*) FROM forum_post_collaborations fpc WHERE fpc.post_id = fp.id AND fpc.status = 'accepted') as collaborator_count
FROM forum_posts fp
LEFT JOIN forum_post_analytics fpa ON fp.id = fpa.post_id;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON forum_post_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON forum_post_collaborations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON forum_post_analytics TO authenticated;
GRANT SELECT, INSERT ON forum_post_views TO authenticated;
GRANT SELECT, INSERT, UPDATE ON forum_post_engagement TO authenticated;
GRANT SELECT ON forum_post_stats TO authenticated; 