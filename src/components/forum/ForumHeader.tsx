
import { useState } from 'react';
import { Search, Filter, SortAsc, SortDesc, Plus } from 'lucide-react';
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
import { useAuth } from '@/hooks/useAuth';

interface ForumHeaderProps {
  onSearch: (query: string) => void;
  onFilter: (filter: string) => void;
  onSort: (sort: string) => void;
  onCreatePost: () => void;
  searchQuery: string;
  activeFilter: string;
  activeSort: string;
  postCount?: number;
}

const ForumHeader = ({ 
  onSearch, 
  onFilter, 
  onSort, 
  onCreatePost, 
  searchQuery, 
  activeFilter, 
  activeSort,
  postCount = 0 
}: ForumHeaderProps) => {
  const { user } = useAuth();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onSearch(value);
  };

  const filterOptions = [
    { value: 'all', label: 'All Posts', count: postCount },
    { value: 'pinned', label: 'Pinned' },
    { value: 'locked', label: 'Locked' },
    { value: 'featured', label: 'Featured' },
    { value: 'my-posts', label: 'My Posts' },
    { value: 'recent', label: 'Recent Activity' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: SortDesc },
    { value: 'oldest', label: 'Oldest First', icon: SortAsc },
    { value: 'most-replies', label: 'Most Replies', icon: SortDesc },
    { value: 'most-views', label: 'Most Views', icon: SortDesc },
    { value: 'recent-activity', label: 'Recent Activity', icon: SortDesc }
  ];

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search posts and topics..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {activeFilter !== 'all' && (
                  <Badge variant="secondary" className="ml-2 h-5">
                    {filterOptions.find(f => f.value === activeFilter)?.label}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter Posts</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filterOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onFilter(option.value)}
                  className={activeFilter === option.value ? 'bg-accent' : ''}
                >
                  <div className="flex justify-between items-center w-full">
                    <span>{option.label}</span>
                    {option.count !== undefined && (
                      <Badge variant="outline" className="ml-2">
                        {option.count}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {(() => {
                  const currentSort = sortOptions.find(s => s.value === activeSort);
                  const IconComponent = currentSort?.icon || SortDesc;
                  return <IconComponent className="h-4 w-4 mr-2" />;
                })()}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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

          {/* Create Post Button */}
          {user && (
            <Button onClick={onCreatePost} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchQuery || activeFilter !== 'all') && (
        <div className="flex gap-2 flex-wrap">
          {searchQuery && (
            <Badge variant="secondary">
              Search: "{searchQuery}"
              <button 
                onClick={() => handleSearchChange('')}
                className="ml-2 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {activeFilter !== 'all' && (
            <Badge variant="secondary">
              Filter: {filterOptions.find(f => f.value === activeFilter)?.label}
              <button 
                onClick={() => onFilter('all')}
                className="ml-2 hover:text-destructive"
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

export default ForumHeader;
