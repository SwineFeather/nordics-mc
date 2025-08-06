
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MessageSquare, ArrowRight, Newspaper, Loader2, Flag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ForumPost } from '@/hooks/useForumPosts';
import { ForumCategory } from '@/hooks/useForumCategories';

const NewsSection: React.FC = () => {
  const navigate = useNavigate();
  const [featuredPosts, setFeaturedPosts] = useState<ForumPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories first
        const { data: categoriesData } = await supabase
          .from('forum_categories')
          .select('*')
          .in('slug', ['patches', 'news'])
          .order('order_index', { ascending: true });

        if (categoriesData) {
          setCategories(categoriesData);
          const categoryIds = categoriesData.map(cat => cat.id);

          // Fetch latest posts from Patch Notes and News & Announcements (not just featured)
          const { data: featuredData } = await supabase
            .from('forum_posts')
            .select(`
              *,
              author:profiles(id, full_name, email, avatar_url, minecraft_username)
            `)
            .in('category_id', categoryIds)
            .order('created_at', { ascending: false })
            .limit(4);

          // Fetch recent posts from all forum categories for "Recent Updates"
          const { data: recentData } = await supabase
            .from('forum_posts')
            .select(`
              *,
              author:profiles(id, full_name, email, avatar_url, minecraft_username)
            `)
            .order('created_at', { ascending: false })
            .limit(8);

          setFeaturedPosts(featuredData || []);
          setRecentPosts(recentData || []);
        }
      } catch (error) {
        console.error('Error fetching forum posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName) {
      case 'Patch Notes':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'News & Announcements':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Events':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default:
        return 'bg-orange-50 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300';
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getAuthorName = (author: any) => {
    return author?.minecraft_username || author?.full_name || 'Unknown User';
  };

  const getAuthorAvatar = (author: any) => {
    if (author?.minecraft_username) {
      return `https://mc-heads.net/avatar/${author.minecraft_username}/32`;
    }
    return author?.avatar_url || '';
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    const stripped = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return stripped.length > maxLength ? stripped.substring(0, maxLength) + '...' : stripped;
  };

  const handlePostClick = (post: ForumPost) => {
    navigate(`/forum/post/${post.id}`);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50/50 via-red-50/50 to-amber-50/50 dark:from-orange-950/20 dark:via-red-950/20 dark:to-amber-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Flag className="h-6 w-6 text-orange-500" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Latest News
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest server news, events, and announcements
          </p>
        </div>

        {/* Featured News */}
        {loading ? (
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-6">Featured</h3>
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          </div>
        ) : featuredPosts.length > 0 ? (
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-6">Featured</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredPosts.map((post) => (
                <Card 
                  key={post.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700"
                  onClick={() => handlePostClick(post)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getCategoryColor(getCategoryName(post.category_id))}>
                        {getCategoryName(post.category_id)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-lg hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {truncateContent(post.content)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={getAuthorAvatar(post.author)} alt={getAuthorName(post.author)} />
                          <AvatarFallback className="text-xs">
                            {getAuthorName(post.author).slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{getAuthorName(post.author)}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {post.reply_count || 0}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-6">Featured</h3>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No featured posts available.</p>
            </div>
          </div>
        )}

        {/* Recent News */}
        {loading ? (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-6">Recent Updates</h3>
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-6">Recent Updates</h3>
            {recentPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentPosts.map((post) => (
                  <Card 
                    key={post.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700"
                    onClick={() => handlePostClick(post)}
                  >
                    <CardContent className="p-4">
                      <Badge className={`${getCategoryColor(getCategoryName(post.category_id))} mb-2`}>
                        {getCategoryName(post.category_id)}
                      </Badge>
                      <h4 className="font-medium mb-2 line-clamp-2 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                        {post.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {truncateContent(post.content, 100)}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(post.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {post.reply_count || 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent forum posts available.</p>
              </div>
            )}
          </div>
        )}

        {/* Link to Forum */}
        <div className="text-center">
          <Link to="/forum">
            <Button className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
              View All Forum Posts
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
