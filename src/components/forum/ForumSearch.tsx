import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, X, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { usePlayerBadges } from '@/hooks/usePlayerBadges';
import { searchPosts } from '@/hooks/useForumPosts';
import SimpleMarkdownRenderer from '@/components/SimpleMarkdownRenderer';

interface ForumSearchProps {
  categoryId?: string;
  onPostSelect: (postId: string) => void;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    minecraft_username: string | null;
  };
  created_at: string;
  view_count: number;
  reply_count?: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_featured: boolean;
}

const ForumSearch = ({ categoryId, onPostSelect }: ForumSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    try {
      const filters = categoryId ? { categories: [categoryId] } : undefined;
      const results = await searchPosts(searchQuery, filters, 20);
      setSearchResults(results);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
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

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Search Results ({searchResults.length})
            </h3>
            {searchResults.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Found {searchResults.length} posts matching "{searchQuery}"
              </p>
            )}
          </div>

          {searchResults.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or browse all posts.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {searchResults.map((post) => (
                <Card 
                  key={post.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onPostSelect(post.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={post.author?.avatar_url || ''} />
                        <AvatarFallback>
                          {post.author?.full_name?.[0] || post.author?.email[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {post.title}
                          </h4>
                          {post.is_pinned && (
                            <Badge variant="secondary" className="text-xs">
                              Pinned
                            </Badge>
                          )}
                          {post.is_locked && (
                            <Badge variant="secondary" className="text-xs">
                              Locked
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          <SimpleMarkdownRenderer content={post.content.substring(0, 150) + '...'} />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              {post.author?.full_name || post.author?.email}
                              {post.author?.id && (
                                <ForumAuthorBadge userId={post.author.id} />
                              )}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          {/* Removed per request: reply/view counts in search results */}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ForumSearch; 