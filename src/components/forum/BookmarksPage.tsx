import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Pin, Lock, MessageSquare, Eye, Star, Bookmark, BookmarkCheck, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerBadges } from '@/hooks/usePlayerBadges';
import { getSavedPosts, unsavePost } from '@/hooks/useForumPosts';
import { useToast } from '@/hooks/use-toast';
import SimpleMarkdownRenderer from '@/components/SimpleMarkdownRenderer';

interface BookmarksPageProps {
  onBack: () => void;
  onPostSelect: (postId: string) => void;
}

interface SavedPost {
  id: string;
  title: string;
  content: string;
  category_id: string;
  author_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_featured: boolean;
  view_count: number;
  reply_count?: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    minecraft_username: string | null;
  };
  category?: {
    id: string;
    name: string;
    description: string | null;
  };
}

const BookmarksPage = ({ onBack, onPostSelect }: BookmarksPageProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedPosts();
    }
  }, [user]);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      const posts = await getSavedPosts(user!.id);
      setSavedPosts(posts);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      toast({
        title: "Error",
        description: "Failed to load saved posts.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsavePost = async (postId: string) => {
    if (!user) return;

    try {
      await unsavePost(user.id, postId);
      setSavedPosts(prev => prev.filter(post => post.id !== postId));
      toast({
        title: "Post removed",
        description: "Post has been removed from your bookmarks.",
      });
    } catch (error) {
      console.error('Error removing saved post:', error);
      toast({
        title: "Error",
        description: "Failed to remove post from bookmarks.",
        variant: "destructive"
      });
    }
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forum
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forum
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <BookmarkCheck className="w-6 h-6 mr-2 text-primary" />
              My Bookmarks
            </h1>
            <p className="text-muted-foreground">
              {savedPosts.length} saved post{savedPosts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Bookmarks List */}
      {savedPosts.length === 0 ? (
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="py-12 text-center">
            <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
            <p className="text-muted-foreground mb-4">
              Start exploring the forum and save posts you want to read later!
            </p>
            <Button onClick={onBack}>
              Browse Forum
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedPosts.map((post) => (
            <Card 
              key={post.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-2 flex-wrap">
                      {post.is_pinned && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                          <Pin className="w-3 h-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                      {post.is_locked && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                      {post.is_featured && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {post.category?.name || 'Unknown Category'}
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 
                        className="text-lg font-semibold group-hover:text-primary transition-colors"
                        onClick={() => onPostSelect(post.id)}
                      >
                        {post.title}
                      </h3>
                      <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        <SimpleMarkdownRenderer content={post.content.substring(0, 200) + '...'} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-3 ml-4">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1 hover:text-primary transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium">{post.reply_count || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1 hover:text-primary transition-colors">
                        <Eye className="w-4 h-4" />
                        <span className="font-medium">{post.view_count}</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnsavePost(post.id);
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={post.author?.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        {post.author?.full_name?.[0] || post.author?.email[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground font-medium">
                      {post.author?.full_name || post.author?.email}
                    </span>
                    {post.author?.id && (
                      <ForumAuthorBadge userId={post.author.id} />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksPage; 