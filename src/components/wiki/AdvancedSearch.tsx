import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  FileText, 
  FolderOpen, 
  Star, 
  TrendingUp,
  Calendar,
  User,
  Tag,
  BookOpen,
  History,
  Trash2,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { WikiCategory, WikiPage } from '@/types/wiki';

interface SearchResult {
  item: WikiPage | WikiCategory;
  type: 'page' | 'category';
  relevance: number;
  matchedFields: string[];
  excerpt?: string;
}

interface SearchFilters {
  type: ('page' | 'category')[];
  category: string[];
  author: string[];
  status: ('published' | 'draft' | 'review')[];
  dateRange: {
    from: string;
    to: string;
  };
  tags: string[];
  hasContent: boolean;
  hasChildren: boolean;
}

interface AdvancedSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: WikiCategory[];
  onNavigate: (path: string) => void;
  searchHistory?: string[];
  onSearchHistoryUpdate?: (history: string[]) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  open,
  onOpenChange,
  categories,
  onNavigate,
  searchHistory = [],
  onSearchHistoryUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    type: ['page', 'category'],
    category: [],
    author: [],
    status: ['published'],
    dateRange: { from: '', to: '' },
    tags: [],
    hasContent: false,
    hasChildren: false
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('results');
  const [recentSearches, setRecentSearches] = useState<string[]>(searchHistory);

  // Extract all unique values for filters
  const filterOptions = useMemo(() => {
    const allPages = categories.flatMap(cat => cat.pages);
    const allAuthors = [...new Set(allPages.map(p => p.authorName))];
    const allTags = [...new Set(allPages.flatMap(p => p.tags || []))];
    const allStatuses = [...new Set(allPages.map(p => p.status))];

    return {
      authors: allAuthors,
      tags: allTags,
      statuses: allStatuses,
      categories: categories.map(cat => ({ id: cat.id, title: cat.title }))
    };
  }, [categories]);

  // Advanced search function
  const performSearch = useMemo(() => {
    return (term: string, searchFilters: SearchFilters): SearchResult[] => {
      if (!term.trim()) return [];

      const searchResults: SearchResult[] = [];
      const searchLower = term.toLowerCase();
      const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);

      // Search through categories
      if (searchFilters.type.includes('category')) {
        categories.forEach(category => {
          if (searchFilters.category.length > 0 && !searchFilters.category.includes(category.id)) {
            return;
          }

          let relevance = 0;
          const matchedFields: string[] = [];

          // Title match (highest weight)
          if (category.title.toLowerCase().includes(searchLower)) {
            relevance += 100;
            matchedFields.push('title');
          }

          // Description match
          if (category.description?.toLowerCase().includes(searchLower)) {
            relevance += 50;
            matchedFields.push('description');
          }

          // Word-by-word matching
          searchWords.forEach(word => {
            if (category.title.toLowerCase().includes(word)) relevance += 20;
            if (category.description?.toLowerCase().includes(word)) relevance += 10;
          });

          if (relevance > 0) {
            searchResults.push({
              item: category,
              type: 'category',
              relevance,
              matchedFields
            });
          }
        });
      }

      // Search through pages
      if (searchFilters.type.includes('page')) {
        categories.forEach(category => {
          category.pages.forEach(page => {
            // Apply filters
            if (searchFilters.category.length > 0 && !searchFilters.category.includes(category.id)) {
              return;
            }
            if (searchFilters.author.length > 0 && !searchFilters.author.includes(page.authorName)) {
              return;
            }
            if (searchFilters.status.length > 0 && !searchFilters.status.includes(page.status)) {
              return;
            }
            if (searchFilters.hasContent && !page.content.trim()) {
              return;
            }
            if (searchFilters.tags.length > 0 && !searchFilters.tags.some(tag => page.tags?.includes(tag))) {
              return;
            }

            let relevance = 0;
            const matchedFields: string[] = [];
            let excerpt = '';

            // Title match (highest weight)
            if (page.title.toLowerCase().includes(searchLower)) {
              relevance += 100;
              matchedFields.push('title');
            }

            // Content match
            if (page.content.toLowerCase().includes(searchLower)) {
              relevance += 30;
              matchedFields.push('content');
              
              // Generate excerpt
              const contentLower = page.content.toLowerCase();
              const index = contentLower.indexOf(searchLower);
              if (index !== -1) {
                const start = Math.max(0, index - 50);
                const end = Math.min(page.content.length, index + searchLower.length + 50);
                excerpt = page.content.substring(start, end);
                if (start > 0) excerpt = '...' + excerpt;
                if (end < page.content.length) excerpt = excerpt + '...';
              }
            }

            // Description match
            if (page.description?.toLowerCase().includes(searchLower)) {
              relevance += 50;
              matchedFields.push('description');
            }

            // Tags match
            if (page.tags?.some(tag => tag.toLowerCase().includes(searchLower))) {
              relevance += 40;
              matchedFields.push('tags');
            }

            // Word-by-word matching
            searchWords.forEach(word => {
              if (page.title.toLowerCase().includes(word)) relevance += 20;
              if (page.content.toLowerCase().includes(word)) relevance += 5;
              if (page.description?.toLowerCase().includes(word)) relevance += 10;
              if (page.tags?.some(tag => tag.toLowerCase().includes(word))) relevance += 15;
            });

            if (relevance > 0) {
              searchResults.push({
                item: page,
                type: 'page',
                relevance,
                matchedFields,
                excerpt
              });
            }
          });
        });
      }

      // Sort by relevance
      return searchResults.sort((a, b) => b.relevance - a.relevance);
    };
  }, [categories]);

  // Handle search
  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    
    // Simulate search delay for better UX
    setTimeout(() => {
      const searchResults = performSearch(searchTerm, filters);
      setResults(searchResults);
      setIsSearching(false);

      // Update search history
      const newHistory = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 10);
      setRecentSearches(newHistory);
      onSearchHistoryUpdate?.(newHistory);
    }, 300);
  };

  // Handle search on Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setFilters({
      type: ['page', 'category'],
      category: [],
      author: [],
      status: ['published'],
      dateRange: { from: '', to: '' },
      tags: [],
      hasContent: false,
      hasChildren: false
    });
  };

  // Navigate to result
  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'page') {
      onNavigate(`/wiki/${(result.item as WikiPage).slug}`);
    } else {
      const category = result.item as WikiCategory;
      if (category.pages.length > 0) {
        onNavigate(`/wiki/${category.pages[0].slug}`);
      }
    }
    onOpenChange(false);
  };

  // Get icon for result type
  const getResultIcon = (type: 'page' | 'category') => {
    return type === 'page' ? FileText : FolderOpen;
  };

  // Get category for page
  const getPageCategory = (page: WikiPage) => {
    return categories.find(cat => cat.pages.some(p => p.id === page.id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Advanced Search</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4">
          {/* Search Input */}
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search pages, categories, content..."
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <Button onClick={handleSearch} disabled={!searchTerm.trim() || isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
            <Button variant="outline" onClick={clearSearch}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="results">Results ({results.length})</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Results Tab */}
            <TabsContent value="results" className="flex-1">
              <ScrollArea className="h-[400px]">
                {results.length > 0 ? (
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <div
                        key={`${result.type}-${result.item.id}`}
                        className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {React.createElement(getResultIcon(result.type), { className: "w-4 h-4 text-muted-foreground" })}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-sm truncate">
                                {result.item.title}
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                {result.type}
                              </Badge>
                              {result.type === 'page' && (
                                <Badge variant="outline" className="text-xs">
                                  {(result.item as WikiPage).status}
                                </Badge>
                              )}
                            </div>
                            
                            {result.type === 'page' && (
                              <div className="text-xs text-muted-foreground mb-1">
                                in {getPageCategory(result.item as WikiPage)?.title || 'Unknown Category'}
                              </div>
                            )}

                            {result.excerpt && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {result.excerpt}
                              </p>
                            )}

                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>Relevance: {result.relevance}</span>
                              <span>•</span>
                              <span>Matched: {result.matchedFields.join(', ')}</span>
                              {result.type === 'page' && (
                                <>
                                  <span>•</span>
                                  <span>by {(result.item as WikiPage).authorName}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchTerm ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No results found for "{searchTerm}"</p>
                    <p className="text-sm">Try adjusting your search terms or filters</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Enter a search term to find content</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Filters Tab */}
            <TabsContent value="filters" className="space-y-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-6">
                  {/* Type Filter */}
                  <div>
                    <Label className="text-sm font-medium">Content Type</Label>
                    <div className="flex space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="type-page"
                          checked={filters.type.includes('page')}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({
                              ...prev,
                              type: checked 
                                ? [...prev.type, 'page']
                                : prev.type.filter(t => t !== 'page')
                            }));
                          }}
                        />
                        <Label htmlFor="type-page" className="text-sm">Pages</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="type-category"
                          checked={filters.type.includes('category')}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({
                              ...prev,
                              type: checked 
                                ? [...prev.type, 'category']
                                : prev.type.filter(t => t !== 'category')
                            }));
                          }}
                        />
                        <Label htmlFor="type-category" className="text-sm">Categories</Label>
                      </div>
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <Label className="text-sm font-medium">Categories</Label>
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (value && !filters.category.includes(value)) {
                          setFilters(prev => ({
                            ...prev,
                            category: [...prev.category, value]
                          }));
                        }
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select categories..." />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {filters.category.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {filters.category.map(catId => {
                          const cat = filterOptions.categories.find(c => c.id === catId);
                          return (
                            <Badge key={catId} variant="secondary" className="cursor-pointer" onClick={() => {
                              setFilters(prev => ({
                                ...prev,
                                category: prev.category.filter(id => id !== catId)
                              }));
                            }}>
                              {cat?.title || catId} <X className="w-3 h-3 ml-1" />
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Author Filter */}
                  <div>
                    <Label className="text-sm font-medium">Authors</Label>
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (value && !filters.author.includes(value)) {
                          setFilters(prev => ({
                            ...prev,
                            author: [...prev.author, value]
                          }));
                        }
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select authors..." />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.authors.map(author => (
                          <SelectItem key={author} value={author}>
                            {author}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {filters.author.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {filters.author.map(author => (
                          <Badge key={author} variant="secondary" className="cursor-pointer" onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              author: prev.author.filter(a => a !== author)
                            }));
                          }}>
                            {author} <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="flex space-x-4 mt-2">
                      {filterOptions.statuses.map(status => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={filters.status.includes(status)}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({
                                ...prev,
                                status: checked 
                                  ? [...prev.status, status]
                                  : prev.status.filter(s => s !== status)
                              }));
                            }}
                          />
                          <Label htmlFor={`status-${status}`} className="text-sm capitalize">{status}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags Filter */}
                  <div>
                    <Label className="text-sm font-medium">Tags</Label>
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (value && !filters.tags.includes(value)) {
                          setFilters(prev => ({
                            ...prev,
                            tags: [...prev.tags, value]
                          }));
                        }
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select tags..." />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.tags.map(tag => (
                          <SelectItem key={tag} value={tag}>
                            {tag}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {filters.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {filters.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              tags: prev.tags.filter(t => t !== tag)
                            }));
                          }}>
                            {tag} <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Additional Filters */}
                  <div>
                    <Label className="text-sm font-medium">Additional Filters</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="has-content"
                          checked={filters.hasContent}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({ ...prev, hasContent: !!checked }));
                          }}
                        />
                        <Label htmlFor="has-content" className="text-sm">Has content</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="has-children"
                          checked={filters.hasChildren}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({ ...prev, hasChildren: !!checked }));
                          }}
                        />
                        <Label htmlFor="has-children" className="text-sm">Has children</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              <ScrollArea className="h-[400px]">
                {recentSearches.length > 0 ? (
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSearchTerm(search);
                          setActiveTab('results');
                          setTimeout(() => handleSearch(), 100);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <History className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{search}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newHistory = recentSearches.filter((_, i) => i !== index);
                            setRecentSearches(newHistory);
                            onSearchHistoryUpdate?.(newHistory);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No search history yet</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSearch; 