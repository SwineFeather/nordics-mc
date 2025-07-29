-- Update forum post creation policy to respect moderator-only categories
-- Migration: 20250115000000-update-forum-post-permissions.sql

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can create posts" ON forum_posts;

-- Create new policy that checks category permissions
CREATE POLICY "Users can create posts with proper permissions" ON forum_posts 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- Allow staff members to create posts in any category
    has_role_or_higher('moderator'::app_role) OR
    -- Allow regular users to create posts only in non-moderator categories
    EXISTS (
      SELECT 1 FROM forum_categories 
      WHERE id = category_id 
      AND is_moderator_only = false
    )
  )
); 