import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  FileText, 
  FolderOpen, 
  MoreHorizontal, 
  Trash2,
  ExternalLink,
  Star
} from 'lucide-react';
import { WikiPage, WikiCategory } from '@/types/wiki';

interface RecentPage {
  id: string;
  title: string;
  slug: string;
  categoryTitle: string;
  lastVisited: Date;
  visitCount: number;
  isFavorite?: boolean;
}

interface RecentPagesProps {
  categories: WikiCategory[];
  onNavigate: (path: string) => void;
  maxItems?: number;
  className?: string;
}

const RecentPages: React.FC<RecentPagesProps> = ({
  categories,
  onNavigate,
  maxItems = 10,
  className = ''
}) => {
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);
  const [showAll, setShowAll] = useState(false);

  // Load recent pages from localStorage
  useEffect(() => {
    const loadRecentPages = () => {
      try {
        const stored = localStorage.getItem('wiki-recent-pages');
        if (stored) {
          const parsed = JSON.parse(stored);
          
          // Ensure parsed data is an array
          if (!Array.isArray(parsed)) {
            console.warn('Invalid recent pages data format, clearing...');
            localStorage.removeItem('wiki-recent-pages');
            setRecentPages([]);
            return;
          }
          
          // Convert string dates back to Date objects and filter out invalid entries
          const validPages = parsed
            .filter((page: any) => {
              // Check if page has required fields
              if (!page || typeof page !== 'object') {
                return false;
              }
              if (!page.id || !page.title || !page.slug || !page.categoryTitle) {
                return false;
              }
              // Check if page still exists in categories
              return categories.some(cat => 
                cat.pages.some(p => p.id === page.id)
              );
            })
            .map((page: any) => {
              try {
                return {
                  ...page,
                  lastVisited: new Date(page.lastVisited),
                  visitCount: page.visitCount || 1,
                  isFavorite: page.isFavorite || false
                };
              } catch (dateError) {
                console.warn('Invalid date in recent page:', page.id, dateError);
                return null;
              }
            })
            .filter((page: RecentPage | null): page is RecentPage => {
              // Filter out null pages and pages with invalid dates
              return page !== null && !isNaN(page.lastVisited.getTime());
            });
          
          setRecentPages(validPages);
          
          // If we had to filter out invalid data, save the cleaned version
          if (validPages.length !== parsed.length) {
            localStorage.setItem('wiki-recent-pages', JSON.stringify(validPages));
          }
        }
      } catch (error) {
        console.error('Failed to load recent pages:', error);
        // Clear corrupted data
        localStorage.removeItem('wiki-recent-pages');
        setRecentPages([]);
      }
    };

    loadRecentPages();
  }, [categories]);

  // Add page to recent pages
  const addToRecent = (page: WikiPage, categoryTitle: string) => {
    const existingIndex = recentPages.findIndex(rp => rp.id === page.id);
    const now = new Date();
    
    let updatedPages: RecentPage[];
    
    if (existingIndex >= 0) {
      // Update existing page
      updatedPages = [...recentPages];
      updatedPages[existingIndex] = {
        ...updatedPages[existingIndex],
        lastVisited: now,
        visitCount: updatedPages[existingIndex].visitCount + 1
      };
    } else {
      // Add new page
      const newRecentPage: RecentPage = {
        id: page.id,
        title: page.title,
        slug: page.slug,
        categoryTitle,
        lastVisited: now,
        visitCount: 1
      };
      updatedPages = [newRecentPage, ...recentPages];
    }

    // Sort by last visited and limit to maxItems
    updatedPages.sort((a, b) => b.lastVisited.getTime() - a.lastVisited.getTime());
    updatedPages = updatedPages.slice(0, maxItems);

    setRecentPages(updatedPages);
    
    // Save to localStorage
    try {
      localStorage.setItem('wiki-recent-pages', JSON.stringify(updatedPages));
    } catch (error) {
      console.error('Failed to save recent pages:', error);
    }
  };

  // Remove page from recent
  const removeFromRecent = (pageId: string) => {
    const updatedPages = recentPages.filter(p => p.id !== pageId);
    setRecentPages(updatedPages);
    
    try {
      localStorage.setItem('wiki-recent-pages', JSON.stringify(updatedPages));
    } catch (error) {
      console.error('Failed to save recent pages:', error);
    }
  };

  // Toggle favorite
  const toggleFavorite = (pageId: string) => {
    const updatedPages = recentPages.map(p => 
      p.id === pageId ? { ...p, isFavorite: !p.isFavorite } : p
    );
    setRecentPages(updatedPages);
    
    try {
      localStorage.setItem('wiki-recent-pages', JSON.stringify(updatedPages));
    } catch (error) {
      console.error('Failed to save recent pages:', error);
    }
  };

  // Clear all recent pages
  const clearAllRecent = () => {
    setRecentPages([]);
    try {
      localStorage.removeItem('wiki-recent-pages');
    } catch (error) {
      console.error('Failed to clear recent pages:', error);
    }
  };

  // Format relative time with proper error handling
  const formatRelativeTime = (date: Date): string => {
    try {
      // Ensure date is valid
      if (!date || isNaN(date.getTime())) {
        return 'Unknown';
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting relative time:', error);
      return 'Unknown';
    }
  };

  // Get displayed pages
  const displayedPages = showAll ? recentPages : recentPages.slice(0, 5);

  if (recentPages.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Recent Pages</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent pages</p>
            <p className="text-xs">Pages you visit will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-muted/40 border border-border/40 shadow-none ${className}`}>
      <CardHeader className="pb-2 border-b border-border/30 bg-transparent">
        <CardTitle className="text-xs font-semibold flex items-center space-x-2 text-muted-foreground">
          <Clock className="w-4 h-4 opacity-60" />
            <span>Recent Pages</span>
          <Badge variant="secondary" className="text-xs bg-muted/60 text-muted-foreground border-none">
              {recentPages.length}
            </Badge>
          </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[220px] pr-1">
          <div className="space-y-2">
            {displayedPages.map((page) => (
              <div
                key={page.id}
                className="group flex items-center justify-between p-2 border border-border/20 rounded-lg hover:bg-accent/30 transition-colors bg-transparent"
              >
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onNavigate(`/wiki/${page.slug}`)}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <h4 className="text-xs font-medium truncate text-foreground">
                      {page.title}
                    </h4>
                    {page.isFavorite && (
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <FolderOpen className="w-3 h-3" />
                    <span className="truncate">{page.categoryTitle}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(page.lastVisited)}</span>
                    {page.visitCount > 1 && (
                      <>
                        <span>•</span>
                        <span>{page.visitCount} visits</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => toggleFavorite(page.id)}
                    title={page.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star className={`w-3 h-3 ${page.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeFromRecent(page.id)}
                    title="Remove from recent"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        {recentPages.length > 5 && (
          <div className="pt-2 border-t mt-2 border-border/30">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show less' : `Show ${recentPages.length - 5} more`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Export the addToRecent function for use in other components
export const addPageToRecent = (page: WikiPage, categoryTitle: string) => {
  try {
    const stored = localStorage.getItem('wiki-recent-pages');
    let recentPages: RecentPage[] = [];
    
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Ensure parsed data is an array
      if (!Array.isArray(parsed)) {
        console.warn('Invalid recent pages data format, clearing...');
        localStorage.removeItem('wiki-recent-pages');
        recentPages = [];
      } else {
        // Convert string dates back to Date objects and filter out invalid entries
        recentPages = parsed
          .filter((page: any) => {
            // Check if page has required fields
            if (!page || typeof page !== 'object') {
              return false;
            }
            if (!page.id || !page.title || !page.slug || !page.categoryTitle) {
              return false;
            }
            return true;
          })
          .map((page: any) => {
            try {
              return {
                ...page,
                lastVisited: new Date(page.lastVisited),
                visitCount: page.visitCount || 1,
                isFavorite: page.isFavorite || false
              };
            } catch (dateError) {
              console.warn('Invalid date in recent page:', page.id, dateError);
              return null;
            }
          })
          .filter((page: RecentPage | null): page is RecentPage => {
            // Filter out null pages and pages with invalid dates
            return page !== null && !isNaN(page.lastVisited.getTime());
          });
      }
    }
    
    const existingIndex = recentPages.findIndex(rp => rp.id === page.id);
    const now = new Date();
    
    if (existingIndex >= 0) {
      recentPages[existingIndex] = {
        ...recentPages[existingIndex],
        lastVisited: now,
        visitCount: recentPages[existingIndex].visitCount + 1
      };
    } else {
      const newRecentPage: RecentPage = {
        id: page.id,
        title: page.title,
        slug: page.slug,
        categoryTitle,
        lastVisited: now,
        visitCount: 1
      };
      recentPages.unshift(newRecentPage);
    }

    // Sort by last visited and limit to 20 items
    recentPages.sort((a, b) => b.lastVisited.getTime() - a.lastVisited.getTime());
    const limitedPages = recentPages.slice(0, 20);
    
    localStorage.setItem('wiki-recent-pages', JSON.stringify(limitedPages));
  } catch (error) {
    console.error('Failed to add page to recent:', error);
    // Clear corrupted data
    localStorage.removeItem('wiki-recent-pages');
  }
};

export default RecentPages; 