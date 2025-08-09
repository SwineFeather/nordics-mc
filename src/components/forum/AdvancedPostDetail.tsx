import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { sanitizeHtml } from '@/utils/htmlSanitizer';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// Removed: Progress (no stats shown)
import {
  ArrowLeft, Pin, Lock,
  Edit, Trash2, MoreHorizontal, History, Users, BarChart3,
  ThumbsUp, ThumbsDown,
  Crown, Shield, Star
} from 'lucide-react';
import { useForumPosts, incrementPostViewCount, savePost, unsavePost, getSavedPosts } from '@/hooks/useForumPosts';
import { useForumReplies } from '@/hooks/useForumReplies';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerBadges } from '@/hooks/usePlayerBadges';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { isStaffRole } from '@/utils/roleUtils';
import { AdvancedPostEditor } from './AdvancedPostEditor';
import PostReactions from './PostReactions';
import PostNotifications from './PostNotifications';
import { forumPostService, PostVersion, PostCollaboration, PostCollaborationWithUser } from '@/services/forumPostService';
import { forumNotificationService } from '@/services/forumNotificationService';
import { supabase } from '@/integrations/supabase/client';
import { ForumPost } from '@/hooks/useForumPosts';
import { useNationForumAccess } from '@/hooks/useNationForumAccess';

interface AdvancedPostDetailProps {
  postId: string;
  onBack: () => void;
}

export const AdvancedPostDetail: React.FC<AdvancedPostDetailProps> = ({ postId, onBack }) => {
  const { posts, updatePost, deletePost } = useForumPosts();
  const { replies, createReply } = useForumReplies(postId);
  const [replyContent, setReplyContent] = useState('');
  const { user, profile } = useAuth();
  const { hasAccessToForum, isAdmin, isModerator, loading: accessLoading } = useNationForumAccess();
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [versions, setVersions] = useState<PostVersion[]>([]);
  const [collaborations, setCollaborations] = useState<PostCollaborationWithUser[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [engagement, setEngagement] = useState({
    likes: 0,
    dislikes: 0,
    shares: 0,
    bookmarks: 0,
    comments: 0
  });
  const [userEngagement, setUserEngagement] = useState({
    liked: false,
    disliked: false,
    bookmarked: false
  });
  const [timeSpent, setTimeSpent] = useState(0);
  const [scrollDepth, setScrollDepth] = useState(0);
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();
  // Fix: Use post?.author?.minecraft_username as the player UUID for badges
  const { data: badges } = usePlayerBadges(post?.author?.minecraft_username || '');
  const postRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const scrollTrackerRef = useRef<NodeJS.Timeout>();

  // Check if user can edit/delete this post
  const canEditPost = user && (post?.author_id === user.id || (profile && isStaffRole(profile.role)));
  const canDeletePost = user && (post?.author_id === user.id || (profile && isStaffRole(profile.role)));
  const isCollaborator = collaborations.some(c => c.user_id === user?.id && c.status === 'accepted');

  // Fetch the specific post data
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('forum_posts')
          .select(`
            *,
            author:profiles(id, full_name, email, avatar_url, minecraft_username),
            category:forum_categories(id, name, slug, nation_name, town_name)
          `)
          .eq('id', postId)
          .single();

        if (error) throw error;
        setPost(data as ForumPost);
      } catch (error) {
        console.error('Error fetching post:', error);
        toast({
          title: "Error",
          description: "Failed to load post. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, toast]);

  useEffect(() => {
    if (post) {
      incrementPostViewCount(postId);
      loadPostData();
      trackUserEngagement();
      startTimeTracking();
      startScrollTracking();
    }
    
    return () => {
      if (scrollTrackerRef.current) {
        clearInterval(scrollTrackerRef.current);
      }
      saveTimeSpent();
    };
  }, [postId, post]);

  const loadPostData = async () => {
    if (!postId) return;
    
    try {
      const [versionsData, collaborationsData, analyticsData] = await Promise.all([
        forumPostService.getPostVersions(postId),
        forumPostService.getPostCollaborations(postId),
        forumPostService.getPostAnalytics(postId)
      ]);
      
      setVersions(versionsData);
      setCollaborations(collaborationsData);
      setAnalytics(analyticsData);
      
      // Load engagement data
      loadEngagementData();
    } catch (error) {
      console.error('Error loading post data:', error);
    }
  };

  const loadEngagementData = async () => {
    if (!postId || !user) return;
    
    try {
      // TODO: Uncomment when forum_post_engagement table is created
      // Load total engagement counts
      // const { data: totalEngagement } = await supabase
      //   .from('forum_post_engagement')
      //   .select('liked, disliked')
      //   .eq('post_id', postId);

      // if (totalEngagement) {
      //   const likes = totalEngagement.filter(e => e.liked).length;
      //   const dislikes = totalEngagement.filter(e => e.disliked).length;
        
      //   setEngagement({
      //     likes,
      //     dislikes,
      //     shares: 0,
      //     bookmarks: 0,
      //     comments: replies.length
      //   });
      // }
      
      // Load user's engagement
      // const { data: userEngagementData } = await supabase
      //   .from('forum_post_engagement')
      //   .select('liked, disliked')
      //   .eq('post_id', postId)
      //   .eq('user_id', user.id)
      //   .single();

      // if (userEngagementData) {
      //   setUserEngagement({
      //     liked: userEngagementData.liked || false,
      //     disliked: userEngagementData.disliked || false,
      //     bookmarked: false
      //   });
      // } else {
      //   setUserEngagement({
      //     liked: false,
      //     disliked: false,
      //     bookmarked: false
      //   });
      // }

      // Temporary: Use mock data until table is created
      setEngagement({
        likes: 0,
        dislikes: 0,
        shares: 0,
        bookmarks: 0,
        comments: replies.length
      });
      setUserEngagement({
        liked: false,
        disliked: false,
        bookmarked: false
      });
    } catch (error) {
      console.error('Error loading engagement data:', error);
      setEngagement({
        likes: 0,
        dislikes: 0,
        shares: 0,
        bookmarks: 0,
        comments: replies.length
      });
      setUserEngagement({
        liked: false,
        disliked: false,
        bookmarked: false
      });
    }
  };

  const trackUserEngagement = async () => {
    if (!postId || !user) return;
    
    try {
      await forumPostService.trackPostView(postId, user.id);
    } catch (error) {
      console.error('Error tracking post view:', error);
    }
  };

  const startTimeTracking = () => {
    startTimeRef.current = Date.now();
  };

  const startScrollTracking = () => {
    scrollTrackerRef.current = setInterval(() => {
      if (postRef.current) {
        const element = postRef.current;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;
        const depth = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
        setScrollDepth(Math.max(scrollDepth, depth));
      }
    }, 1000);
  };

  const saveTimeSpent = async () => {
    if (!postId || !user) return;
    
    const timeSpentSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setTimeSpent(timeSpentSeconds);
    
    try {
      await forumPostService.updatePostAnalytics(postId, {
        time_spent_reading: timeSpentSeconds,
        scroll_depth: scrollDepth
      });
    } catch (error) {
      console.error('Error saving time spent:', error);
    }
  };

  const handleEngagement = async (type: 'like' | 'dislike') => {
    if (!user || !postId) return;
    
    try {
      // Toggle the engagement state
      const newEngagement = { ...userEngagement };
      
      if (type === 'like') {
        newEngagement.liked = !newEngagement.liked;
        if (newEngagement.liked && newEngagement.disliked) {
          newEngagement.disliked = false;
          setEngagement(prev => ({ ...prev, dislikes: Math.max(0, prev.dislikes - 1) }));
        }
        setEngagement(prev => ({ 
          ...prev, 
          likes: newEngagement.liked ? prev.likes + 1 : Math.max(0, prev.likes - 1) 
        }));
      } else if (type === 'dislike') {
        newEngagement.disliked = !newEngagement.disliked;
        if (newEngagement.disliked && newEngagement.liked) {
          newEngagement.liked = false;
          setEngagement(prev => ({ ...prev, likes: Math.max(0, prev.likes - 1) }));
        }
        setEngagement(prev => ({ 
          ...prev, 
          dislikes: newEngagement.disliked ? prev.dislikes + 1 : Math.max(0, prev.dislikes - 1) 
        }));
      }
      
      setUserEngagement(newEngagement);
      
      // TODO: Uncomment when forum_post_engagement table is created
      // Save to database
      // await saveEngagementToDatabase(type, newEngagement[type === 'like' ? 'liked' : 'disliked']);
      
      // Show feedback
      const action = newEngagement[type === 'like' ? 'liked' : 'disliked'] ? 'added' : 'removed';
      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${action}`,
        description: `You ${action} your ${type} for this post.`,
      });
      
    } catch (error) {
      console.error('Error updating engagement:', error);
      toast({
        title: "Error",
        description: "Failed to update engagement. Please try again.",
        variant: "destructive"
      });
    }
  };

  // TODO: Uncomment when forum_post_engagement table is created
  // const saveEngagementToDatabase = async (type: 'like' | 'dislike', isActive: boolean) => {
  //   if (!user || !postId) return;
    
  //   try {
  //     // First, check if there's an existing engagement record
  //     const { data: existingEngagement } = await supabase
  //       .from('forum_post_engagement')
  //       .select('*')
  //       .eq('post_id', postId)
  //       .eq('user_id', user.id)
  //       .single();

  //     if (existingEngagement) {
  //       // Update existing record
  //       const updateData: any = {};
  //       if (type === 'like') {
  //         updateData.liked = isActive;
  //         if (isActive) updateData.disliked = false;
  //       } else {
  //         updateData.disliked = isActive;
  //         if (isActive) updateData.liked = false;
  //       }
        
  //       await supabase
  //         .from('forum_post_engagement')
  //         .update(updateData)
  //         .eq('id', existingEngagement.id);
  //     } else {
  //       // Create new record
  //       const newEngagement = {
  //         post_id: postId,
  //         user_id: user.id,
  //         liked: type === 'like' ? isActive : false,
  //         disliked: type === 'dislike' ? isActive : false,
  //         created_at: new Date().toISOString()
  //       };
        
  //       await supabase
  //         .from('forum_post_engagement')
  //         .insert(newEngagement);
  //     }
  //   } catch (error) {
  //     console.error('Error saving engagement to database:', error);
  //     throw error;
  //   }
  // };

  const handleDelete = async () => {
    if (!post || !canDeletePost) return;
    
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await deletePost(post.id);
        toast({
          title: "Post deleted",
          description: "The post has been successfully deleted.",
        });
        onBack();
      } catch (error) {
        console.error('Error deleting post:', error);
        toast({
          title: "Error",
          description: "Failed to delete post. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleUpdatePost = async (title: string, content: string, tags: string[], postType: string) => {
    if (!post) return;
    
    try {
      await updatePost(post.id, {
        title,
        content,
        tags,
        post_type: postType
      });
      setIsEditing(false);
      toast({
        title: "Post updated",
        description: "Your post has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateReply = async () => {
    if (!user || !replyContent.trim()) return;
    
    try {
      await createReply({
        content: replyContent.trim(),
        author_id: user.id,
        post_id: postId
      });
      setReplyContent('');
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      });
    } catch (error) {
      console.error('Error creating reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading || accessLoading) {
    return <div className="text-center py-8">Loading post...</div>;
  }

  if (!post) {
    return <div className="text-center py-8">Post not found</div>;
  }

  const categoryAny: any = (post as any).category;
  if (categoryAny && (categoryAny.nation_name || categoryAny.town_name)) {
    const allowed = (isAdmin || isModerator) || hasAccessToForum(categoryAny.nation_name || null, categoryAny.town_name || null);
    if (!allowed) {
      return (
        <div className="space-y-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">This post belongs to a private forum. You don't have permission to view it.</p>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  if (isEditing) {
    return (
      <AdvancedPostEditor
        onSubmit={handleUpdatePost}
        onCancel={() => setIsEditing(false)}
        initialTitle={post.title}
        initialContent={post.content}
        initialTags={post.tags || []}
        initialPostType={post.post_type || 'discussion'}
        isEditing={true}
        postId={post.id}
        onBack={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-6" ref={postRef}>
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-0 h-auto">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <span className="text-muted-foreground">•</span>
        <span className="font-medium text-foreground">{post.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h1 className="text-2xl font-bold">{post.title}</h1>
                    {post.is_pinned && <Pin className="w-4 h-4 text-amber-500" />}
                    {post.is_locked && <Lock className="w-4 h-4 text-red-500" />}
                    {post.is_featured && <Star className="w-4 h-4 text-yellow-500" />}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={post.author?.avatar_url} />
                        <AvatarFallback>{(post.author?.minecraft_username || post.author?.full_name)?.[0]}</AvatarFallback>
                      </Avatar>
                      <span>{post.author?.minecraft_username || post.author?.full_name}</span>
                                              {badges && badges.length > 0 && (
                          <div className="flex items-center space-x-1">
                            {badges?.slice(0, 3).map((badge) => (
                              <Badge key={badge.id} variant="secondary" className="text-xs">
                                {badge.badge_type}
                              </Badge>
                            ))}
                          </div>
                        )}
                    </div>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                    {post.updated_at !== post.created_at && (
                      <>
                        <span>•</span>
                        <span>edited {formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}</span>
                      </>
                    )}
                    {/* Edit count will be available after migration */}
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(canEditPost || isCollaborator) && (
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Post
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setShowVersionHistory(true)}>
                      <History className="w-4 h-4 mr-2" />
                      Version History
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowCollaboration(true)}>
                      <Users className="w-4 h-4 mr-2" />
                      Collaborators
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowAnalytics(true)}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </DropdownMenuItem>
                    {canDeletePost && (
                      <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Post
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Post Content */}
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
              </div>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Engagement Actions (counts removed per request) */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={userEngagement.liked ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleEngagement('like')}
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Like
                  </Button>
                  <Button
                    variant={userEngagement.disliked ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleEngagement('dislike')}
                  >
                    <ThumbsDown className="w-4 h-4 mr-1" />
                    Dislike
                  </Button>
                </div>
              </div>
              
              {/* Reply Form */}
              {user && (
                <div className="space-y-2 border-t pt-4">
                  <h3 className="text-lg font-semibold">Add a Reply</h3>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full p-3 border rounded-md resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleCreateReply} disabled={!replyContent.trim()}>
                      Post Reply
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Replies List */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Replies ({replies.length})</h3>
                {replies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No replies yet. Be the first to reply!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {replies.map((reply) => (
                      <div key={reply.id} className="p-4 border rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={reply.author?.avatar_url} />
                            <AvatarFallback>{(reply.author?.minecraft_username || reply.author?.full_name)?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{reply.author?.minecraft_username || reply.author?.full_name}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="prose max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(reply.content) }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Removed per request: Post Activity section and stats */}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Removed per request: Post Stats card */}
            
            {/* Collaborators */}
            {collaborations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Collaborators</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {collaborations.slice(0, 5).map((collab) => (
                      <div key={collab.id} className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={collab.user?.avatar_url} />
                          <AvatarFallback>{collab.user?.username?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{collab.user?.username}</span>
                        <Badge variant="outline" className="text-xs">
                          {collab.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Post Notifications */}
            <PostNotifications postId={postId} postTitle={post.title} />
          </div>
        </div>
      </div>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <History className="w-5 h-5" />
              <span>Version History</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {versions.map((version) => (
              <Card key={version.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">v{version.version_number}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Restore version logic would go here
                      setShowVersionHistory(false);
                    }}
                  >
                    Restore
                  </Button>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">{version.title}</h4>
                  {version.change_summary && (
                    <p className="text-sm text-muted-foreground">{version.change_summary}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {version.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Collaboration Dialog */}
      <Dialog open={showCollaboration} onOpenChange={setShowCollaboration}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Collaboration Management</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Current Collaborators</h4>
              <div className="space-y-2">
                {collaborations.map((collab) => (
                  <div key={collab.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={collab.user?.avatar_url} />
                        <AvatarFallback>{collab.user?.username?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{collab.user?.username}</span>
                      <Badge variant="outline" className="text-xs">
                        {collab.role}
                      </Badge>
                      {collab.status === 'pending' && (
                        <Badge variant="secondary" className="text-xs">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {collaborations.length === 0 && (
                  <p className="text-sm text-muted-foreground">No collaborators yet</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 