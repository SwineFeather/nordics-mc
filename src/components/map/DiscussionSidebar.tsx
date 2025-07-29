import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Pin, MoreVertical, Reply, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Discussion {
  id: string;
  map_date: string;
  content: string;
  author_id: string;
  parent_id?: string;
  is_pinned: boolean;
  is_moderated: boolean;
  created_at: string;
  edited_at?: string;
  author: {
    full_name: string;
    role: string;
  };
  replies?: Discussion[];
}

interface DiscussionSidebarProps {
  mapDate: string;
}

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-red-500 text-white';
    case 'moderator':
      return 'bg-orange-500 text-white';
    case 'editor':
      return 'bg-blue-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const DiscussionSidebar = ({ mapDate }: DiscussionSidebarProps) => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user, profile } = useAuth();

  const isStaff = profile?.role === 'admin' || profile?.role === 'moderator';

  const fetchDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('map_discussions')
        .select(`
          *,
          author:profiles(full_name, role)
        `)
        .eq('map_date', mapDate)
        .is('parent_id', null)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch replies for each discussion
      const discussionsWithReplies = await Promise.all(
        (data || []).map(async (discussion) => {
          const { data: replies, error: repliesError } = await supabase
            .from('map_discussions')
            .select(`
              *,
              author:profiles(full_name, role)
            `)
            .eq('parent_id', discussion.id)
            .order('created_at', { ascending: true });

          if (repliesError) throw repliesError;

          return { ...discussion, replies: replies || [] };
        })
      );

      setDiscussions(discussionsWithReplies);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();

    // Set up real-time subscription with better error handling
    const channel = supabase
      .channel('map-discussions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'map_discussions',
          filter: `map_date=eq.${mapDate}`
        },
        () => {
          fetchDiscussions();
        }
      )
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          console.error('Failed to subscribe to discussion updates:', status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mapDate]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !user) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('map_discussions')
        .insert({
          map_date: mapDate,
          content: newComment.trim(),
          author_id: user.id
        });

      if (error) throw error;

      toast.success('Comment added');
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !user) {
      toast.error('Please enter a reply');
      return;
    }

    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('map_discussions')
        .insert({
          map_date: mapDate,
          content: replyContent.trim(),
          author_id: user.id,
          parent_id: parentId
        });

      if (error) throw error;

      toast.success('Reply added');
      setReplyContent('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (discussionId: string) => {
    if (!editContent.trim()) {
      toast.error('Please enter content');
      return;
    }

    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('map_discussions')
        .update({
          content: editContent.trim(),
          edited_at: new Date().toISOString()
        })
        .eq('id', discussionId);

      if (error) throw error;

      toast.success('Comment updated');
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDiscussion = async (discussionId: string) => {
    try {
      const { error } = await supabase
        .from('map_discussions')
        .delete()
        .eq('id', discussionId);

      if (error) throw error;
      
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handlePinDiscussion = async (discussionId: string, isPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('map_discussions')
        .update({ is_pinned: !isPinned })
        .eq('id', discussionId);

      if (error) throw error;
      
      toast.success(isPinned ? 'Comment unpinned' : 'Comment pinned');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const startEditing = (discussion: Discussion) => {
    setEditingComment(discussion.id);
    setEditContent(discussion.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const canEditComment = (discussion: Discussion) => {
    if (!user) return false;
    if (user.id !== discussion.author_id) return false;
    
    const createdAt = new Date(discussion.created_at);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    return createdAt > oneHourAgo;
  };

  return (
    <div className="w-96 border-l bg-background flex flex-col">
      <Card className="m-4 mb-2 flex-shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <MessageSquare className="w-5 h-5 mr-2" />
            Discussion
          </CardTitle>
        </CardHeader>
      </Card>

      <ScrollArea className="flex-1 px-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {discussions.map((discussion) => (
              <Card key={discussion.id} className={discussion.is_pinned ? 'border-yellow-500' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {discussion.author?.full_name || 'Anonymous'}
                      </span>
                      <Badge 
                        className={`text-xs ${getRoleBadgeColor(discussion.author?.role || 'member')}`}
                      >
                        {discussion.author?.role}
                      </Badge>
                      {discussion.is_pinned && (
                        <Pin className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canEditComment(discussion) && (
                          <DropdownMenuItem
                            onClick={() => startEditing(discussion)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {isStaff && (
                          <DropdownMenuItem
                            onClick={() => handlePinDiscussion(discussion.id, discussion.is_pinned)}
                          >
                            <Pin className="w-4 h-4 mr-2" />
                            {discussion.is_pinned ? 'Unpin' : 'Pin'} Comment
                          </DropdownMenuItem>
                        )}
                        {(user?.id === discussion.author_id || isStaff) && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteDiscussion(discussion.id)}
                            className="text-red-600"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {editingComment === discussion.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px] text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleEditComment(discussion.id)}
                          disabled={submitting}
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditing}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm mb-3">{discussion.content}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div>
                      <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                      {discussion.edited_at && (
                        <span className="ml-2 text-muted-foreground">(edited)</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setReplyTo(replyTo === discussion.id ? null : discussion.id)}
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                  </div>

                  {/* Reply Form */}
                  {replyTo === discussion.id && user && (
                    <div className="mt-3 pt-3 border-t">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[60px] text-sm"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(discussion.id)}
                          disabled={submitting || !replyContent.trim()}
                        >
                          Reply
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReplyTo(null);
                            setReplyContent('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {discussion.replies && discussion.replies.length > 0 && (
                    <div className="mt-3 space-y-3 border-t pt-3">
                      {discussion.replies.map((reply) => (
                        <div key={reply.id} className="pl-3 border-l-2 border-muted">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs">
                              {reply.author?.full_name || 'Anonymous'}
                            </span>
                            <Badge 
                              className={`text-xs ${getRoleBadgeColor(reply.author?.role || 'member')}`}
                            >
                              {reply.author?.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </span>
                            {reply.edited_at && (
                              <span className="text-xs text-muted-foreground">(edited)</span>
                            )}
                          </div>
                          <p className="text-xs">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* New Comment Form */}
      {user && (
        <Card className="m-4 mt-2 flex-shrink-0">
          <CardContent className="p-4">
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <Textarea
                placeholder="Share your thoughts about this map..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={submitting || !newComment.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                {submitting ? 'Adding...' : 'Add Comment'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card className="m-4 mt-2 flex-shrink-0">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Please log in to participate in discussions
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DiscussionSidebar;
