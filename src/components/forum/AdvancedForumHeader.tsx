import { useState } from 'react';
import { Search, Filter, SortAsc, SortDesc, Plus, Bookmark, Clock, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { usePostTypes } from '@/hooks/usePostTypes';

interface AdvancedForumHeaderProps {
  onSearch: (query: string) => void;
  onFilter: (filter: string) => void;
  onSort: (sort: string) => void;
  onPostTypeFilter: (postType: string) => void;
  onCreatePost: () => void;
  searchQuery: string;
  activeFilter: string;
  activeSort: string;
  activePostTypeFilter: string;
  activeView: string;
  onViewChange: (view: string) => void;
  showFilterSort?: boolean;
}

const AdvancedForumHeader = ({ 
  onSearch, 
  onFilter, 
  onSort, 
  onPostTypeFilter,
  onCreatePost, 
  searchQuery, 
  activeFilter, 
  activeSort,
  activePostTypeFilter,
  activeView,
  onViewChange,
  showFilterSort = true
}: AdvancedForumHeaderProps) => {
  const { user } = useAuth();
  const { postTypes } = usePostTypes();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onSearch(value);
  };

  const filterOptions = [
    { value: 'all', label: 'All Posts', icon: Filter },
    { value: 'pinned', label: 'Pinned', icon: Star },
    { value: 'saved', label: 'Saved Posts', icon: Bookmark },
    { value: 'my-posts', label: 'My Posts', icon: Clock },
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'recent', label: 'Recent Activity', icon: Clock }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: SortDesc },
    { value: 'oldest', label: 'Oldest First', icon: SortAsc },
    { value: 'most-replies', label: 'Most Replies', icon: SortDesc },
    { value: 'most-views', label: 'Most Views', icon: SortDesc },
    { value: 'recent-activity', label: 'Recent Activity', icon: SortDesc }
  ];

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search posts, topics, and discussions..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {showFilterSort && (
        <div className="flex gap-3">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[120px]">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {activeFilter !== 'all' && (
                  <Badge variant="secondary" className="ml-2 h-5">
                    1
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter Posts</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filterOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onFilter(option.value)}
                    className={activeFilter === option.value ? 'bg-accent' : ''}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {option.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[100px]">
                {(() => {
                  const currentSort = sortOptions.find(s => s.value === activeSort);
                  const IconComponent = currentSort?.icon || SortDesc;
                  return <IconComponent className="h-4 w-4 mr-2" />;
                })()}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Sort Posts</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onSort(option.value)}
                    className={activeSort === option.value ? 'bg-accent' : ''}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {option.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Post Type Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[120px]">
                <Filter className="h-4 w-4 mr-2" />
                Type
                {activePostTypeFilter !== 'all' && (
                  <Badge variant="secondary" className="ml-2 h-5">
                    1
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Post Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onPostTypeFilter('all')}
                className={activePostTypeFilter === 'all' ? 'bg-accent' : ''}
              >
                All Types
              </DropdownMenuItem>
              {postTypes.map((postType) => (
                <DropdownMenuItem
                  key={postType.value}
                  onClick={() => onPostTypeFilter(postType.value)}
                  className={activePostTypeFilter === postType.value ? 'bg-accent' : ''}
                >
                  {postType.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Create Post Button */}
          {user && (
            <Button onClick={onCreatePost} className="min-w-[130px]">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          )}
        </div>
        )}
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={onViewChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Saved
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Active Filters Display */}
      {(searchQuery || activeFilter !== 'all' || activePostTypeFilter !== 'all') && (
        <div className="flex gap-2 flex-wrap">
          {searchQuery && (
            <Badge variant="secondary" className="gap-2">
              Search: "{searchQuery}"
              <button 
                onClick={() => handleSearchChange('')}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {activeFilter !== 'all' && (
            <Badge variant="secondary" className="gap-2">
              Filter: {filterOptions.find(f => f.value === activeFilter)?.label}
              <button 
                onClick={() => onFilter('all')}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {activePostTypeFilter !== 'all' && (
            <Badge variant="secondary" className="gap-2">
              Type: {postTypes.find(t => t.value === activePostTypeFilter)?.label || activePostTypeFilter}
              <button 
                onClick={() => onPostTypeFilter('all')}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedForumHeader;
