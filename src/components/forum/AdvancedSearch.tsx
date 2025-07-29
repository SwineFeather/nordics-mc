
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, X, Calendar } from 'lucide-react';

interface SearchFilters {
  query: string;
  author: string;
  tags: string[];
  dateFrom: string;
  dateTo: string;
  postType: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, onClear }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    author: '',
    tags: [],
    dateFrom: '',
    dateTo: '',
    postType: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [tagInput, setTagInput] = useState('');

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      query: '',
      author: '',
      tags: [],
      dateFrom: '',
      dateTo: '',
      postType: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    setTagInput('');
    onClear();
  };

  const addTag = () => {
    if (tagInput.trim() && !filters.tags.includes(tagInput.trim())) {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const postTypes = [
    'discussion',
    'question',
    'idea',
    'announcement',
    'guide',
    'showcase'
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Created Date' },
    { value: 'updated_at', label: 'Last Updated' },
    { value: 'like_count', label: 'Likes' },
    { value: 'reply_count', label: 'Replies' },
    { value: 'view_count', label: 'Views' }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Posts
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {isExpanded ? 'Hide Filters' : 'Advanced Filters'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Search posts..."
            value={filters.query}
            onChange={(e) => handleInputChange('query', e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Author Filter */}
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  placeholder="Search by author..."
                  value={filters.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                />
              </div>

              {/* Post Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="postType">Post Type</Label>
                <select
                  id="postType"
                  className="w-full p-2 border border-border rounded-md bg-background"
                  value={filters.postType}
                  onChange={(e) => handleInputChange('postType', e.target.value)}
                >
                  <option value="">All Types</option>
                  {postTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleInputChange('dateTo', e.target.value)}
                />
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <Label htmlFor="sortBy">Sort By</Label>
                <select
                  id="sortBy"
                  className="w-full p-2 border border-border rounded-md bg-background"
                  value={filters.sortBy}
                  onChange={(e) => handleInputChange('sortBy', e.target.value)}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <select
                  id="sortOrder"
                  className="w-full p-2 border border-border rounded-md bg-background"
                  value={filters.sortOrder}
                  onChange={(e) => handleInputChange('sortOrder', e.target.value as 'asc' | 'desc')}
                >
                  <option value="desc">Descending (Newest First)</option>
                  <option value="asc">Ascending (Oldest First)</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              {filters.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {filters.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleClear}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;
