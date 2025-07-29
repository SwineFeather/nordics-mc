
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Calendar, 
  Tag,
  Pin,
  Lock,
  Star,
  Flag,
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { RichContentRenderer } from './RichContentRenderer';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  is_pinned: boolean;
  is_locked: boolean;
  is_featured: boolean;
  post_type: string;
  reply_count: number;
  like_count: number;
  view_count: number;
  author: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role: string;
  };
}

const AdvancedPostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('forum_posts')
          .select(`
            *,
            author:profiles(id, full_name, avatar_url, role)
          `)
          .eq('id', postId)
          .single();

        if (error) throw error;
        
        // Ensure tags is always an array
        const processedData = {
          ...data,
          tags: Array.isArray(data.tags) ? data.tags : 
                typeof data.tags === 'string' ? [data.tags] : []
        };
        
        setPost(processedData as ForumPost);
      } catch (error: any) {
        console.error('Error fetching post:', error);
        setError(error.message);
        toast.error('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return <div className="animate-pulse">Loading post...</div>;
  }

  if (error || !post) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
        <p className="text-muted-foreground mb-4">The post you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/forum')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forum
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/forum')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Forum
      </Button>

      {/* Post Card */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {post.is_pinned && (
                  <Badge variant="secondary">
                    <Pin className="h-3 w-3 mr-1" />
                    Pinned
                  </Badge>
                )}
                {post.is_locked && (
                  <Badge variant="destructive">
                    <Lock className="h-3 w-3 mr-1" />
                    Locked
                  </Badge>
                )}
                {post.is_featured && (
                  <Badge variant="default">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <Badge variant="outline">{post.post_type}</Badge>
              </div>
              <h1 className="text-3xl font-bold">{post.title}</h1>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Author Info */}
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={post.author.avatar_url || undefined} />
              <AvatarFallback>
                {post.author.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{post.author.full_name}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {post.author.role}
                </Badge>
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <RichContentRenderer 
            content={post.content} 
            className="prose prose-invert max-w-none"
          />
        </CardContent>

        <Separator />

        {/* Post Actions */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                {post.like_count || 0} Likes
              </Button>
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                {post.reply_count || 0} Replies
              </Button>
              <span className="text-sm text-muted-foreground">
                {post.view_count || 0} views
              </span>
            </div>
            <Button variant="ghost" size="sm">
              <Flag className="h-4 w-4 mr-2" />
              Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Replies Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Replies ({post.reply_count || 0})
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No replies yet. Be the first to reply!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedPostDetail;
