import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Pin, Lock, MessageSquare, Bookmark, BookmarkCheck, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { useForumPosts, incrementPostViewCount, savePost, unsavePost, getSavedPosts } from '@/hooks/useForumPosts';
import { useForumReplies } from '@/hooks/useForumReplies';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerBadges } from '@/hooks/usePlayerBadges';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { isStaffRole } from '@/utils/roleUtils';
import PostEditor from './PostEditor';
import PostReactions from './PostReactions';
import PostNotifications from './PostNotifications';
import { forumNotificationService } from '@/services/forumNotificationService';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import SimpleMarkdownRenderer from '@/components/SimpleMarkdownRenderer';

interface PostDetailProps {
  postId: string;
  onBack: () => void;
}

const PostDetail = ({ postId, onBack }: PostDetailProps) => {
  const { posts, updatePost, deletePost } = useForumPosts();
  const { replies, createReply } = useForumReplies(postId);
  const [replyContent, setReplyContent] = useState('');
  const { user, profile } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { createNotification } = useNotifications();

  const post = posts.find(p => p.id === postId);

  // Debug: Log post data
  useEffect(() => {
    if (post) {
      console.log('Post data:', post);
      console.log('Post tags:', post.tags);
      console.log('Post content:', post.content);
    }
  }, [post]);

  // Check if user can edit/delete this post
  const canEditPost = user && (post?.author_id === user.id || (profile && isStaffRole(profile.role)));
  const canDeletePost = user && (post?.author_id === user.id || (profile && isStaffRole(profile.role)));

  useEffect(() => {
    incrementPostViewCount(postId);
    if (user) {
      getSavedPosts(user.id).then(posts => {
        setIsSaved(posts.some(p => p.id === postId));
      });
      
      // Mark forum notifications as read when viewing the post
      const markNotificationsAsRead = async () => {
        try {
          const { error } = await supabase
            .from('forum_notifications' as any)
            .update({ read_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('post_id', postId)
            .is('read_at', null);
          
          if (error) {
            console.error('Error marking notifications as read:', error);
          }
        } catch (error) {
          console.error('Error marking notifications as read:', error);
        }
      };
      
      markNotificationsAsRead();
    }
    // eslint-disable-next-line
  }, [postId, user]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyContent.trim()) return;

    try {
      const reply = await createReply({
        content: replyContent.trim(),
        post_id: postId,
        author_id: user.id,
      });
      
      // Create notification for the post author
      if (post && post.author_id !== user.id) {
        await forumNotificationService.createReplyNotification(
          postId,
          reply.id,
          post.author_id,
          user.id,
          replyContent.trim()
        );
      }

      // Process mentions in the reply content
      await forumNotificationService.processMentions(
        replyContent.trim(),
        postId,
        user.id
      );

      setReplyContent('');
      toast({
        title: "Reply posted",
        description: "Your reply has been successfully posted.",
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

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (isSaved) {
      await unsavePost(user.id, postId);
      setIsSaved(false);
    } else {
      await savePost(user.id, postId);
      setIsSaved(true);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (!post || !canDeletePost) return;
    
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await deletePost(post.id);
        toast({
          title: "Post deleted",
          description: "The post has been successfully deleted.",
        });
        onBack(); // Go back to posts list
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

  if (!post) {
    return <div className="text-center py-8">Post not found</div>;
  }

  if (isEditing) {
    console.log('Editing post:', post); // Debug log
    return (
      <PostEditor
        onSubmit={handleUpdatePost}
        onCancel={() => setIsEditing(false)}
        initialTitle={post.title}
        initialContent={post.content}
        initialTags={post.tags || []}
        initialPostType={post.post_type || 'discussion'}
        isEditing={true}
        onBack={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Posts
        </Button>
      </div>

      {/* Main Post */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {post.is_pinned && <Pin className="w-4 h-4 text-yellow-500" />}
              {post.is_locked && <Lock className="w-4 h-4 text-red-500" />}
              <h1 className="text-2xl font-bold">{post.title}</h1>
            </div>
            <div className="flex items-center space-x-2">
              {user && (
                <Button
                  variant={isSaved ? 'secondary' : 'outline'}
                  size="icon"
                  onClick={handleSave}
                  aria-label={isSaved ? 'Unsave post' : 'Save post'}
                >
                  {isSaved ? <BookmarkCheck className="w-5 h-5 text-primary" /> : <Bookmark className="w-5 h-5" />}
                </Button>
              )}
              

              
              {/* Post Notifications */}
              <PostNotifications postId={post.id} postTitle={post.title} />
              
              {(canEditPost || canDeletePost) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEditPost && (
                      <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Post
                      </DropdownMenuItem>
                    )}
                    {canDeletePost && (
                      <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Post
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={post.author?.avatar_url || ''} />
                <AvatarFallback>
                  {post.author?.full_name?.[0] || post.author?.email[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium flex items-center gap-2">
                  {post.author?.full_name || post.author?.email}
                  {post.author?.id && (
                    <ForumAuthorBadge userId={post.author.id} />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tags Display */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="prose max-w-none">
            <SimpleMarkdownRenderer content={post.content} />
          </div>
          
          {/* Post Reactions */}
          <div className="mt-6 pt-4 border-t border-border">
            <PostReactions postId={post.id} />
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Replies ({replies.length})
        </h2>

        {replies.map((reply) => (
          <Card key={reply.id}>
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={reply.author?.avatar_url || ''} />
                  <AvatarFallback>
                    {reply.author?.full_name?.[0] || reply.author?.email[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium">
                      {reply.author?.full_name || reply.author?.email}
                    </span>
                    {reply.author?.id && (
                      <ForumAuthorBadge userId={reply.author.id} />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="prose max-w-none">
                    <SimpleMarkdownRenderer content={reply.content} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Reply Form */}
        {user && !post.is_locked && (
          <Card>
            <CardContent className="pt-4">
              <form onSubmit={handleReply} className="space-y-4">
                <Textarea
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                />
                <Button type="submit" disabled={!replyContent.trim()}>
                  Post Reply
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const BADGE_ICONS = {
  User: <svg className="w-3 h-3"/>, // Replace with actual icons as needed
};

function ForumAuthorBadge({ userId }: { userId: string }) {
  const { data: badges } = usePlayerBadges(userId);
  if (!badges || badges.length === 0) return null;
  const badge = badges.find((b: any) => b.is_verified) || badges[0];
  return (
    <Badge style={{ backgroundColor: badge.badge_color, color: 'white' }} className="text-xs flex items-center gap-1">
      {BADGE_ICONS[badge.icon as keyof typeof BADGE_ICONS] || null}
      <span>{badge.badge_type}</span>
    </Badge>
  );
}

export default PostDetail;
