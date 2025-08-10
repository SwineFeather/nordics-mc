import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Pin, Lock, Star, Search, ChevronLeft, ChevronRight, SortAsc, SortDesc } from 'lucide-react';
import { useForumPosts } from '@/hooks/useForumPosts';
import { useForumCategories } from '@/hooks/useForumCategories';
import { formatDistanceToNow } from 'date-fns';
import PostEditor from './PostEditor';
import ForumSearch from './ForumSearch';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerBadges } from '@/hooks/usePlayerBadges';
import { isStaffRole } from '@/utils/roleUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EnhancedForumPostsProps {
  categoryId: string;
  onBack: () => void;
  onPostSelect: (postId: string) => void;
}

type SortOption = 'newest' | 'oldest' | 'most_replies' | 'most_views' | 'most_reactions' | 'trending';

const EnhancedForumPosts = ({ categoryId, onBack, onPostSelect }: EnhancedForumPostsProps) => {
  const { posts, loading, createPost } = useForumPosts(categoryId);
  const { categories } = useForumCategories();
  const [showEditor, setShowEditor] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState(posts);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const { user, profile } = useAuth();

  // Get current category to check if it's moderator-only
  const currentCategory = categories.find(cat => cat.id === categoryId);
        const isModeratorOnlyCategory = currentCategory?.role_required === 'moderator' || false;
  const userHasStaffPermissions = profile && isStaffRole(profile.role);
  const canCreatePost = user && (!isModeratorOnlyCategory || userHasStaffPermissions);

  // Update filtered posts when posts change
  useEffect(() => {
    setFilteredPosts(posts);
    setCurrentPage(1); // Reset to first page when posts change
  }, [posts]);

  // Sort posts based on selected option
  useEffect(() => {
    const sortedPosts = [...posts].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'most_replies':
          return (b.reply_count || 0) - (a.reply_count || 0);
        case 'most_views':
          return b.view_count - a.view_count;
        case 'most_reactions':
          // TODO: Implement when reactions are added
          return 0;
        case 'trending':
          // Simple trending algorithm: (replies * 2) + views + (days since creation * -1)
          const aTrending = (a.reply_count || 0) * 2 + a.view_count + 
            Math.floor((Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24) * -1);
          const bTrending = (b.reply_count || 0) * 2 + b.view_count + 
            Math.floor((Date.now() - new Date(b.created_at).getTime()) / (1000 * 60 * 60 * 24) * -1);
          return bTrending - aTrending;
        default:
          return 0;
      }
    });
    setFilteredPosts(sortedPosts);
    setCurrentPage(1); // Reset to first page when sorting changes
  }, [posts, sortBy]);

  // Calculate pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const handleCreatePost = async (title: string, content: string, tags: string[], postType: string) => {
    if (!user) return;
    
    try {
      await createPost({
        title,
        content,
        tags,
        post_type: postType,
        category_id: categoryId,
        author_id: user.id,
      });
      setShowEditor(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption);
  };

  const getActivityIndicator = (_post: any) => null; // Removed activity badges per request

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (showEditor) {
    return (
      <PostEditor
        onSubmit={handleCreatePost}
        onCancel={() => setShowEditor(false)}
        categoryName={currentCategory?.name}
        categoryId={categoryId}
        onBack={() => setShowEditor(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-0 h-auto">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Forum
          </Button>
          <span className="text-muted-foreground">•</span>
          <span className="font-medium text-foreground">
            {currentCategory?.name || 'Forum'}
          </span>
        </nav>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-4 w-4 mr-2" />
            {showSearch ? 'Hide Search' : 'Search'}
          </Button>
          {canCreatePost && (
            <Button onClick={() => setShowEditor(true)}>
              Create Post
            </Button>
          )}
        </div>
      </div>

      {/* Search Section */}
      {showSearch && (
        <ForumSearch 
          categoryId={categoryId}
          onPostSelect={onPostSelect}
        />
      )}

      {/* Posts List */}
      {!showSearch && (
        <div className="space-y-4">
          {/* Sort Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="most_replies">Most Replies</SelectItem>
                  <SelectItem value="most_views">Most Views</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredPosts.length} posts
            </div>
          </div>

          {currentPosts.length === 0 ? (
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to start a discussion!
                </p>
                {canCreatePost && (
                  <Button onClick={() => setShowEditor(true)}>
                    Create First Post
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {currentPosts.map((post) => {
                const activity = getActivityIndicator(post);
                return (
                  <Card 
                    key={post.id}
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                    onClick={() => onPostSelect(post.id)}
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
                            {activity && (
                              <Badge variant="outline" className={`${activity.color} border-current`}>
                                <activity.icon className="w-3 h-3 mr-1" />
                                {activity.label}
                              </Badge>
                            )}
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {post.content.substring(0, 200)}...
                            </p>
                          </div>
                        </div>
                        
                        {/* Removed per request: reply/view counts */}
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
                          {/* Badge next to author */}
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
                );
              })}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Back to top button */}
      {!showSearch && filteredPosts.length > 5 && (
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:scale-105 transition-transform"
          >
            Back to Top
          </Button>
        </div>
      )}
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

export default EnhancedForumPosts;
