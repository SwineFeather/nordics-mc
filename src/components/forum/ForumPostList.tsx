import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Eye, Bookmark, BookmarkCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { usePlayerBadges } from '@/hooks/usePlayerBadges';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import TagDisplay from './TagDisplay';
import { PostTypeBadge } from './PostTypeBadge';
import { RichContentRenderer } from './RichContentRenderer';
import { ReactionBar } from './ReactionBar';
import { ReputationDisplay } from './ReputationDisplay';
import { ReportContent } from './ReportContent';

interface ForumPostListProps {
  posts: any[];
  loading: boolean;
  user: any;
  onSave: (userId: string, postId: string) => void;
  onUnsave: (userId: string, postId: string) => void;
  onPostSelect: (postId: string) => void;
  savedPostIds: string[];
}

const ForumPostList: React.FC<ForumPostListProps> = ({ posts, loading, user, onSave, onUnsave, onPostSelect, savedPostIds }) => {
  const { toast } = useToast();
  const [optimisticSaved, setOptimisticSaved] = React.useState<string[]>(savedPostIds);

  React.useEffect(() => {
    setOptimisticSaved(savedPostIds);
  }, [savedPostIds]);

  if (loading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }
  if (!posts || posts.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No posts found.</div>;
  }
  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const isSaved = user && optimisticSaved.includes(post.id);
        return (
          <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow group" onClick={() => onPostSelect(post.id)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{post.title}</h3>
                    {post.post_type && <PostTypeBadge postType={post.post_type} size="sm" />}
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    <RichContentRenderer 
                      content={post.content?.substring(0, 200) + (post.content?.length > 200 ? '...' : '')} 
                      className="text-sm text-muted-foreground"
                    />
                  </div>
                  <TagDisplay tagNames={post.tags || []} className="mt-2" />
                  <div className="flex items-center gap-2 mt-2">
                    <ReactionBar postId={post.id} compact />
                    <ReportContent 
                      contentType="post" 
                      contentId={post.id} 
                      contentTitle={post.title}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.reply_count || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.view_count}</span>
                    </div>
                  </div>
                  {user && (
                    <Button
                      variant={isSaved ? 'secondary' : 'outline'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={async e => {
                        e.stopPropagation();
                        if (isSaved) {
                          setOptimisticSaved(prev => prev.filter(id => id !== post.id));
                          try {
                            await onUnsave(user.id, post.id);
                            toast({ title: 'Post unsaved', description: 'Removed from your saved posts.' });
                          } catch (err) {
                            setOptimisticSaved(prev => [...prev, post.id]);
                            toast({ title: 'Error', description: 'Failed to unsave post.', variant: 'destructive' });
                          }
                        } else {
                          setOptimisticSaved(prev => [...prev, post.id]);
                          try {
                            await onSave(user.id, post.id);
                            toast({ title: 'Post saved', description: 'Added to your saved posts.' });
                          } catch (err) {
                            setOptimisticSaved(prev => prev.filter(id => id !== post.id));
                            toast({ title: 'Error', description: 'Failed to save post.', variant: 'destructive' });
                          }
                        }
                      }}
                      aria-label={isSaved ? 'Unsave post' : 'Save post'}
                    >
                      {isSaved ? <BookmarkCheck className="w-5 h-5 text-primary" /> : <Bookmark className="w-5 h-5" />}
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={post.author?.avatar_url || ''} />
                      <AvatarFallback>{post.author?.full_name?.[0] || post.author?.email[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{post.author?.full_name || post.author?.email}</span>
                    {post.author?.id && <ForumAuthorBadge userId={post.author.id} />}
                    {post.author?.id && <ReputationDisplay userId={post.author.id} compact />}
                  </div>
                <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              </div>
            </CardHeader>
          </Card>
        );
      })}
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

export default ForumPostList; 