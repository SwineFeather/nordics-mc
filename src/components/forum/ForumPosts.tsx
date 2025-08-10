import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Pin, Lock } from 'lucide-react';
import { useForumPosts } from '@/hooks/useForumPosts';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import PostEditor from './PostEditor';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerBadges } from '@/hooks/usePlayerBadges';
import { isStaffRole } from '@/utils/roleUtils';
import { useNationForumAccess } from '@/hooks/useNationForumAccess';

interface ForumPostsProps {
  categoryId: string;
  onBack: () => void;
  onPostSelect: (postId: string) => void;
}

const ForumPosts = ({ categoryId, onBack, onPostSelect }: ForumPostsProps) => {
  const { posts, loading, createPost } = useForumPosts(categoryId);
  const { hasAccessToForum, loading: accessLoading } = useNationForumAccess();
  const [category, setCategory] = useState<any | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const { user, profile } = useAuth();

  // Load the current category to check access
  React.useEffect(() => {
    let isMounted = true;
    const fetchCategory = async () => {
      setCategoryLoading(true);
      const { data } = await supabase
        .from('forum_categories')
        .select('id, name, role_required, nation_name, town_name')
        .eq('id', categoryId)
        .single();
      if (isMounted) {
        setCategory(data || null);
        setCategoryLoading(false);
      }
    };
    fetchCategory();
    return () => { isMounted = false; };
  }, [categoryId]);

  const currentCategory = category;
        const isModeratorOnlyCategory = currentCategory?.role_required === 'moderator' || false;
  const userHasStaffPermissions = profile && isStaffRole(profile.role);
  const canCreatePost = user && (!isModeratorOnlyCategory || userHasStaffPermissions);

  const handleCreatePost = async (
    title: string,
    content: string,
    tags: string[] = [],
    postType: string = 'discussion'
  ) => {
    if (!user) return;
    
    try {
      const created = await createPost({
        title,
        content,
        category_id: categoryId,
        author_id: user.id,
        tags,
        post_type: postType,
      });
      setShowEditor(false);
      if (created?.id) {
        onPostSelect(created.id);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (loading || accessLoading || categoryLoading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }

  // Access control: block private nation/town forums if user lacks access
  if (currentCategory && (currentCategory.nation_name || currentCategory.town_name)) {
    const allowed = hasAccessToForum(
      currentCategory.nation_name || null,
      currentCategory.town_name || null
    );
    if (!allowed) {
      return (
        <div className="space-y-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-foreground">Back to Categories</span>
          </Button>
          <Card className="dark:border-muted">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">This forum is private. You don\'t have access to view posts here.</p>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  if (showEditor) {
    return (
      <PostEditor
        onSubmit={handleCreatePost}
        onCancel={() => setShowEditor(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
          <span className="text-muted-foreground">•</span>
          <span className="font-medium text-foreground">{currentCategory?.name || 'Forum'}</span>
        </div>
        {canCreatePost && (
          <Button onClick={() => setShowEditor(true)}>
            New Post
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No posts yet. Be the first to start a discussion!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card 
              key={post.id}
              className="cursor-pointer hover:shadow-md transition-shadow dark:border-muted"
              onClick={() => onPostSelect(post.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {post.is_pinned && <Pin className="w-4 h-4 text-yellow-500" />}
                      {post.is_locked && <Lock className="w-4 h-4 text-red-500" />}
                      <h3 className="text-lg font-semibold">{post.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.content.substring(0, 200)}...
                    </p>
                  </div>
                  {/* Removed per request: reply/view counts */}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={post.author?.avatar_url || ''} />
                      <AvatarFallback>
                        {post.author?.full_name?.[0] || post.author?.email[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
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
          ))
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

export default ForumPosts;
