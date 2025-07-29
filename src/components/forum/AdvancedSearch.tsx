import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Search, Filter, X, Clock, User, Tag, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useForumCategories } from '@/hooks/useForumCategories';
import { useForumSearchData } from '@/hooks/useForumSearchData';

export interface SearchFilters {
  query: string;
  categories: string[];
  tags: string[];
  authors: string[];
  postTypes: string[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  sortBy: 'relevance' | 'newest' | 'oldest' | 'most_replies' | 'most_views' | 'most_reactions';
  includeContent: boolean;
  includeComments: boolean;
  onlyUnread: boolean;
  onlyPinned: boolean;
  onlyLocked: boolean;
  onlyFeatured: boolean;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  initialFilters?: Partial<SearchFilters>;
  className?: string;
}

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most_replies', label: 'Most Replies' },
  { value: 'most_views', label: 'Most Views' },
  { value: 'most_reactions', label: 'Most Reactions' }
];

const POST_TYPES = [
  { value: 'discussion', label: 'Discussion' },
  { value: 'question', label: 'Question' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'guide', label: 'Guide' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' }
];

export const AdvancedSearch = ({ 
  onSearch, 
  onClear, 
  initialFilters,
  className 
}: AdvancedSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    categories: [],
    tags: [],
    authors: [],
    postTypes: [],
    dateRange: { from: undefined, to: undefined },
    sortBy: 'relevance',
    includeContent: true,
    includeComments: true,
    onlyUnread: false,
    onlyPinned: false,
    onlyLocked: false,
    onlyFeatured: false,
    ...initialFilters
  });

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { categories } = useForumCategories();
  const { tags, authors, loading } = useForumSearchData();

  // Update active filters display
  useEffect(() => {
    const active: string[] = [];
    
    if (filters.query) active.push(`Query: "${filters.query}"`);
    if (filters.categories.length > 0) active.push(`${filters.categories.length} categories`);
    if (filters.tags.length > 0) active.push(`${filters.tags.length} tags`);
    if (filters.authors.length > 0) active.push(`${filters.authors.length} authors`);
    if (filters.postTypes.length > 0) active.push(`${filters.postTypes.length} post types`);
    if (filters.dateRange.from || filters.dateRange.to) active.push('Date range');
    if (filters.onlyUnread) active.push('Unread only');
    if (filters.onlyPinned) active.push('Pinned only');
    if (filters.onlyLocked) active.push('Locked only');
    if (filters.onlyFeatured) active.push('Featured only');
    
    setActiveFilters(active);
  }, [filters]);

  const handleSearch = () => {
    onSearch(filters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setFilters({
      query: '',
      categories: [],
      tags: [],
      authors: [],
      postTypes: [],
      dateRange: { from: undefined, to: undefined },
      sortBy: 'relevance',
      includeContent: true,
      includeComments: true,
      onlyUnread: false,
      onlyPinned: false,
      onlyLocked: false,
      onlyFeatured: false
    });
    onClear();
  };

  const removeFilter = (filterType: keyof SearchFilters, value?: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (filterType === 'query') {
        newFilters.query = '';
      } else if (Array.isArray(newFilters[filterType])) {
        const arr = newFilters[filterType] as string[];
        if (value) {
          newFilters[filterType] = arr.filter(item => item !== value) as any;
        } else {
          newFilters[filterType] = [] as any;
        }
      } else if (filterType === 'dateRange') {
        newFilters.dateRange = { from: undefined, to: undefined };
      } else if (typeof newFilters[filterType] === 'boolean') {
        newFilters[filterType] = false as any;
      }
      
      return newFilters;
    });
  };

  const toggleArrayFilter = (filterType: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      const arr = prev[filterType] as string[];
      const newArr = arr.includes(value) 
        ? arr.filter(item => item !== value)
        : [...arr, value];
      return { ...prev, [filterType]: newArr };
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search posts, content, or tags..."
            value={filters.query}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            className="pl-10"
          />
        </div>
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Advanced Search Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                
                {/* Categories */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Categories</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={filters.categories.includes(category.id)}
                          onCheckedChange={() => toggleArrayFilter('categories', category.id)}
                        />
                        <Label htmlFor={`category-${category.id}`} className="text-sm">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 20).map((tag) => (
                      <Badge
                        key={tag}
                        variant={filters.tags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleArrayFilter('tags', tag)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Authors */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Authors</Label>
                  <Select onValueChange={(value) => toggleArrayFilter('authors', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select authors..." />
                    </SelectTrigger>
                    <SelectContent>
                      {authors.map((author) => (
                        <SelectItem key={author.id} value={author.id}>
                          {author.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filters.authors.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {filters.authors.map((authorId) => {
                        const author = authors.find(a => a.id === authorId);
                        return (
                          <Badge key={authorId} variant="secondary" className="text-xs">
                            {author?.name || authorId}
                            <X 
                              className="w-3 h-3 ml-1 cursor-pointer" 
                              onClick={() => removeFilter('authors', authorId)}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Post Types */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Post Types</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {POST_TYPES.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type.value}`}
                          checked={filters.postTypes.includes(type.value)}
                          onCheckedChange={() => toggleArrayFilter('postTypes', type.value)}
                        />
                        <Label htmlFor={`type-${type.value}`} className="text-sm">
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateRange.from ? format(filters.dateRange.from, "PPP") : "From date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.from}
                          onSelect={(date) => setFilters(prev => ({ 
                            ...prev, 
                            dateRange: { ...prev.dateRange, from: date } 
                          }))}
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateRange.to ? format(filters.dateRange.to, "PPP") : "To date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.to}
                          onSelect={(date) => setFilters(prev => ({ 
                            ...prev, 
                            dateRange: { ...prev.dateRange, to: date } 
                          }))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sort By</Label>
                  <Select value={filters.sortBy} onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Special Filters */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Special Filters</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="unread"
                        checked={filters.onlyUnread}
                        onCheckedChange={(checked) => setFilters(prev => ({ ...prev, onlyUnread: !!checked }))}
                      />
                      <Label htmlFor="unread" className="text-sm">Unread posts only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pinned"
                        checked={filters.onlyPinned}
                        onCheckedChange={(checked) => setFilters(prev => ({ ...prev, onlyPinned: !!checked }))}
                      />
                      <Label htmlFor="pinned" className="text-sm">Pinned posts only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="locked"
                        checked={filters.onlyLocked}
                        onCheckedChange={(checked) => setFilters(prev => ({ ...prev, onlyLocked: !!checked }))}
                      />
                      <Label htmlFor="locked" className="text-sm">Locked posts only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        checked={filters.onlyFeatured}
                        onCheckedChange={(checked) => setFilters(prev => ({ ...prev, onlyFeatured: !!checked }))}
                      />
                      <Label htmlFor="featured" className="text-sm">Featured posts only</Label>
                    </div>
                  </div>
                </div>

                {/* Search Options */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Search Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeContent"
                        checked={filters.includeContent}
                        onCheckedChange={(checked) => setFilters(prev => ({ ...prev, includeContent: !!checked }))}
                      />
                      <Label htmlFor="includeContent" className="text-sm">Include post content in search</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeComments"
                        checked={filters.includeComments}
                        onCheckedChange={(checked) => setFilters(prev => ({ ...prev, includeComments: !!checked }))}
                      />
                      <Label htmlFor="includeComments" className="text-sm">Include comments in search</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>

        <Button onClick={handleSearch} disabled={loading}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
        
        {activeFilters.length > 0 && (
          <Button variant="outline" onClick={handleClear}>
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {filter}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => {
                  // This is a simplified removal - in a real implementation you'd need to map back to the actual filter
                  handleClear();
                }}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}; 