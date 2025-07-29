import { useState, useEffect, useCallback } from 'react';
import { forumPostService, PostVersion, PostCollaboration, PostAnalytics } from '@/services/forumPostService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ForumEngagement {
  likes: number;
  dislikes: number;
  shares: number;
  bookmarks: number;
  comments: number;
}

export interface UserEngagement {
  liked: boolean;
  disliked: boolean;
  bookmarked: boolean;
  shared: boolean;
}

export interface PostStats {
  view_count: number;
  unique_viewers: number;
  engagement_score: number;
  time_spent_reading: number;
  scroll_depth: number;
  version_count: number;
  collaborator_count: number;
  edit_count: number;
}

export const useAdvancedForum = (postId?: string) => {
  const [versions, setVersions] = useState<PostVersion[]>([]);
  const [collaborations, setCollaborations] = useState<PostCollaboration[]>([]);
  const [analytics, setAnalytics] = useState<PostAnalytics | null>(null);
  const [engagement, setEngagement] = useState<ForumEngagement>({
    likes: 0,
    dislikes: 0,
    shares: 0,
    bookmarks: 0,
    comments: 0
  });
  const [userEngagement, setUserEngagement] = useState<UserEngagement>({
    liked: false,
    disliked: false,
    bookmarked: false,
    shared: false
  });
  const [postStats, setPostStats] = useState<PostStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Load all post data
  const loadPostData = useCallback(async () => {
    if (!postId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [versionsData, collaborationsData, analyticsData, statsData] = await Promise.all([
        forumPostService.getPostVersions(postId),
        forumPostService.getPostCollaborations(postId),
        forumPostService.getPostAnalytics(postId),
        getPostStats(postId)
      ]);
      
      setVersions(versionsData);
      setCollaborations(collaborationsData);
      setAnalytics(analyticsData);
      setPostStats(statsData);
      
      // Load engagement data
      await loadEngagementData();
    } catch (err) {
      console.error('Error loading post data:', err);
      setError('Failed to load post data');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // Load engagement data
  const loadEngagementData = useCallback(async () => {
    if (!postId || !user) return;
    
    try {
      const { data: engagementData, error: engagementError } = await supabase
        .from('forum_post_engagement')
        .select('engagement_type')
        .eq('post_id', postId)
        .eq('user_id', user.id);
      
      if (engagementError) throw engagementError;
      
      // Count engagement types
      const engagementCounts = {
        likes: 0,
        dislikes: 0,
        shares: 0,
        bookmarks: 0,
        comments: 0
      };
      
      const userEngagementTypes = engagementData.map(e => e.engagement_type);
      
      // Get total counts for this post
      const { data: totalEngagement, error: totalError } = await supabase
        .from('forum_post_engagement')
        .select('engagement_type')
        .eq('post_id', postId);
      
      if (totalError) throw totalError;
      
      totalEngagement.forEach(e => {
        if (e.engagement_type in engagementCounts) {
          engagementCounts[e.engagement_type as keyof ForumEngagement]++;
        }
      });
      
      setEngagement(engagementCounts);
      setUserEngagement({
        liked: userEngagementTypes.includes('like'),
        disliked: userEngagementTypes.includes('dislike'),
        bookmarked: userEngagementTypes.includes('bookmark'),
        shared: userEngagementTypes.includes('share')
      });
    } catch (err) {
      console.error('Error loading engagement data:', err);
    }
  }, [postId, user]);

  // Get post statistics
  const getPostStats = useCallback(async (postId: string): Promise<PostStats | null> => {
    try {
      const { data, error } = await supabase
        .from('forum_post_stats')
        .select('*')
        .eq('id', postId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching post stats:', err);
      return null;
    }
  }, []);

  // Track post view
  const trackPostView = useCallback(async () => {
    if (!postId || !user) return;
    
    try {
      const sessionId = Math.random().toString(36).substring(7);
      
      await supabase
        .from('forum_post_views')
        .insert({
          post_id: postId,
          user_id: user.id,
          session_id: sessionId
        });
      
      await forumPostService.trackPostView(postId, user.id);
    } catch (err) {
      console.error('Error tracking post view:', err);
    }
  }, [postId, user]);

  // Update engagement
  const updateEngagement = useCallback(async (type: 'like' | 'dislike' | 'share' | 'bookmark') => {
    if (!postId || !user) return;
    
    try {
      const isCurrentlyEngaged = userEngagement[type];
      
      if (isCurrentlyEngaged) {
        // Remove engagement
        await supabase
          .from('forum_post_engagement')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('engagement_type', type);
        
        setEngagement(prev => ({
          ...prev,
          [type + 's']: Math.max(0, prev[type + 's' as keyof ForumEngagement] - 1)
        }));
        
        setUserEngagement(prev => ({
          ...prev,
          [type]: false
        }));
      } else {
        // Add engagement
        await supabase
          .from('forum_post_engagement')
          .upsert({
            post_id: postId,
            user_id: user.id,
            engagement_type: type
          });
        
        setEngagement(prev => ({
          ...prev,
          [type + 's']: prev[type + 's' as keyof ForumEngagement] + 1
        }));
        
        setUserEngagement(prev => ({
          ...prev,
          [type]: true
        }));
      }
      
      toast({
        title: isCurrentlyEngaged ? `${type} removed` : `Post ${type}d`,
        description: isCurrentlyEngaged ? `Post ${type} has been removed.` : `Post has been ${type}d successfully.`,
      });
    } catch (err) {
      console.error('Error updating engagement:', err);
      toast({
        title: "Error",
        description: "Failed to update engagement. Please try again.",
        variant: "destructive"
      });
    }
  }, [postId, user, userEngagement, toast]);

  // Create post version
  const createVersion = useCallback(async (data: {
    title: string;
    content: string;
    tags: string[];
    post_type: string;
    change_summary?: string;
  }) => {
    if (!postId || !user) return;
    
    try {
      const version = await forumPostService.createPostVersion(postId, data, user.id);
      setVersions(prev => [version, ...prev]);
      
      toast({
        title: "Version created",
        description: "A new version has been created successfully.",
      });
      
      return version;
    } catch (err) {
      console.error('Error creating version:', err);
      toast({
        title: "Error",
        description: "Failed to create version. Please try again.",
        variant: "destructive"
      });
      throw err;
    }
  }, [postId, user, toast]);

  // Restore post version
  const restoreVersion = useCallback(async (versionId: string) => {
    if (!postId || !user) return;
    
    try {
      await forumPostService.restorePostVersion(postId, versionId, user.id);
      
      toast({
        title: "Version restored",
        description: "The selected version has been restored successfully.",
      });
      
      // Reload data
      await loadPostData();
    } catch (err) {
      console.error('Error restoring version:', err);
      toast({
        title: "Error",
        description: "Failed to restore version. Please try again.",
        variant: "destructive"
      });
      throw err;
    }
  }, [postId, user, toast, loadPostData]);

  // Invite collaborator
  const inviteCollaborator = useCallback(async (userId: string, role: 'viewer' | 'editor' | 'admin') => {
    if (!postId || !user) return;
    
    try {
      const collaboration = await forumPostService.inviteCollaborator(postId, userId, role, user.id);
      setCollaborations(prev => [...prev, collaboration]);
      
      toast({
        title: "Invitation sent",
        description: "Collaboration invitation has been sent successfully.",
      });
      
      return collaboration;
    } catch (err) {
      console.error('Error inviting collaborator:', err);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive"
      });
      throw err;
    }
  }, [postId, user, toast]);

  // Accept collaboration invite
  const acceptCollaboration = useCallback(async (collaborationId: string) => {
    try {
      await forumPostService.acceptCollaborationInvite(collaborationId);
      
      setCollaborations(prev => 
        prev.map(c => 
          c.id === collaborationId 
            ? { ...c, status: 'accepted', accepted_at: new Date().toISOString() }
            : c
        )
      );
      
      toast({
        title: "Invitation accepted",
        description: "You have accepted the collaboration invitation.",
      });
    } catch (err) {
      console.error('Error accepting collaboration:', err);
      toast({
        title: "Error",
        description: "Failed to accept invitation. Please try again.",
        variant: "destructive"
      });
      throw err;
    }
  }, [toast]);

  // Decline collaboration invite
  const declineCollaboration = useCallback(async (collaborationId: string) => {
    try {
      await forumPostService.declineCollaborationInvite(collaborationId);
      
      setCollaborations(prev => 
        prev.map(c => 
          c.id === collaborationId 
            ? { ...c, status: 'declined' }
            : c
        )
      );
      
      toast({
        title: "Invitation declined",
        description: "You have declined the collaboration invitation.",
      });
    } catch (err) {
      console.error('Error declining collaboration:', err);
      toast({
        title: "Error",
        description: "Failed to decline invitation. Please try again.",
        variant: "destructive"
      });
      throw err;
    }
  }, [toast]);

  // Update analytics
  const updateAnalytics = useCallback(async (data: Partial<PostAnalytics>) => {
    if (!postId) return;
    
    try {
      await forumPostService.updatePostAnalytics(postId, data);
      setAnalytics(prev => prev ? { ...prev, ...data } : null);
    } catch (err) {
      console.error('Error updating analytics:', err);
    }
  }, [postId]);

  // Analyze content quality
  const analyzeContentQuality = useCallback(async (content: string) => {
    try {
      return await forumPostService.analyzePostQuality(content);
    } catch (err) {
      console.error('Error analyzing content quality:', err);
      throw err;
    }
  }, []);

  // Check if user is collaborator
  const isCollaborator = useCallback((userId?: string) => {
    if (!userId) return false;
    return collaborations.some(c => c.user_id === userId && c.status === 'accepted');
  }, [collaborations]);

  // Check if user can edit post
  const canEditPost = useCallback((authorId?: string, userRole?: string) => {
    if (!user) return false;
    if (authorId === user.id) return true;
    if (userRole && ['admin', 'moderator'].includes(userRole)) return true;
    return isCollaborator(user.id);
  }, [user, isCollaborator]);

  // Load data on mount
  useEffect(() => {
    if (postId) {
      loadPostData();
      trackPostView();
    }
  }, [postId, loadPostData, trackPostView]);

  return {
    // Data
    versions,
    collaborations,
    analytics,
    engagement,
    userEngagement,
    postStats,
    loading,
    error,
    
    // Actions
    loadPostData,
    updateEngagement,
    createVersion,
    restoreVersion,
    inviteCollaborator,
    acceptCollaboration,
    declineCollaboration,
    updateAnalytics,
    analyzeContentQuality,
    
    // Utilities
    isCollaborator,
    canEditPost,
    trackPostView
  };
}; 