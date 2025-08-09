import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { WikiComment } from '@/types/wiki';
import { WikiCommentService } from '@/services/wikiCommentService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  MessageSquare, 
  Reply, 
  Edit3, 
  Trash2, 
  Pin, 
  CheckCircle, 
  Flag,
  Send,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface CommentsProps {
  pageId: string; // May be UUID or storage path
  userRole: string;
  allowComments?: boolean;
  pageSlug?: string; // Optional explicit slug to resolve DB page id
}

const Comments: React.FC<CommentsProps> = ({ pageId, userRole, allowComments = true, pageSlug }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<WikiComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Load comments
  useEffect(() => {
    loadComments();
  }, [pageId, pageSlug]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await WikiCommentService.getComments(pageId, pageSlug);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      const comment = await WikiCommentService.createComment({
        page_id: pageId,
        author_id: user.id,
        parent_id: null,
        content: newComment.trim(),
        is_resolved: false,
        is_pinned: false,
        is_moderated: false
      }, pageSlug);

      setComments(prev => [...prev, comment]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      const reply = await WikiCommentService.createComment({
        page_id: pageId,
        author_id: user.id,
        parent_id: parentId,
        content: content.trim(),
        is_resolved: false,
        is_pinned: false,
        is_moderated: false
      });

      // Update the parent comment with the new reply
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), reply] }
          : comment
      ));

      setReplyingTo(null);
      toast.success('Reply added successfully');
    } catch (error) {
      console.error('Error creating reply:', error);
      toast.error('Failed to add reply');
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const updatedComment = await WikiCommentService.updateComment(commentId, {
        content: editContent.trim()
      });

      setComments(prev => prev.map(comment => 
        comment.id === commentId ? updatedComment : comment
      ));

      setEditingComment(null);
      setEditContent('');
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await WikiCommentService.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const canModerate = userRole === 'admin' || userRole === 'moderator';
  const canEdit = (comment: WikiComment) => user?.id === comment.author_id || canModerate;

  const CommentItem: React.FC<{ comment: WikiComment; isReply?: boolean }> = ({ comment, isReply = false }) => {
    const [replyContent, setReplyContent] = useState('');

    return (
      <Card className={`${isReply ? 'ml-8 mt-2' : 'mb-4'}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={comment.author_avatar} />
                <AvatarFallback>
                  {comment.author_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{comment.author_name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {comment.is_pinned && (
                <Badge variant="secondary" className="text-xs">
                  <Pin className="h-3 w-3 mr-1" />
                  Pinned
                </Badge>
              )}
              {comment.is_resolved && (
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Resolved
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {editingComment === comment.id ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit your comment..."
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              <div className="flex items-center gap-2">
                {!isReply && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                )}
                {canEdit(comment) && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditContent(comment.content);
                      }}
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </>
                )}
                {canModerate && (
                  <Button size="sm" variant="ghost">
                    <Flag className="h-3 w-3 mr-1" />
                    Moderate
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Reply form */}
          {replyingTo === comment.id && (
            <div className="mt-4 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleReply(comment.id, replyContent)}
                  disabled={!replyContent.trim()}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Reply
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!allowComments) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Comments Disabled</h3>
        <p className="text-muted-foreground">
          Comments are not enabled for this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New Comment Form */}
      {user && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Add a Comment</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment..."
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div>
        <h3 className="text-lg font-medium mb-4">
          Comments ({comments.length})
        </h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Comments Yet</h3>
            <p className="text-muted-foreground">
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments; 