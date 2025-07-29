import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Link, 
  FileText, 
  FolderOpen, 
  Tag, 
  TrendingUp,
  Star,
  Clock,
  ExternalLink
} from 'lucide-react';
import { WikiPage, WikiCategory } from '@/types/wiki';

interface RelatedPage {
  page: WikiPage;
  categoryTitle: string;
  relevance: number;
  reason: string;
}

interface RelatedPagesProps {
  currentPage: WikiPage;
  categories: WikiCategory[];
  onNavigate: (path: string) => void;
  maxItems?: number;
  className?: string;
}

const RelatedPages: React.FC<RelatedPagesProps> = ({
  currentPage,
  categories,
  onNavigate,
  maxItems = 5,
  className = ''
}) => {
  // Calculate related pages based on multiple factors
  const relatedPages = useMemo(() => {
    const allPages: RelatedPage[] = [];
    
    // Get all pages from all categories
    categories.forEach(category => {
      category.pages.forEach(page => {
        if (page.id === currentPage.id) return; // Skip current page
        
        let relevance = 0;
        const reasons: string[] = [];
        
        // 1. Same category (high weight)
        if (page.category === currentPage.category) {
          relevance += 50;
          reasons.push('Same category');
        }
        
        // 2. Tag similarity (high weight)
        const currentTags = currentPage.tags || [];
        const pageTags = page.tags || [];
        const commonTags = currentTags.filter(tag => pageTags.includes(tag));
        if (commonTags.length > 0) {
          relevance += commonTags.length * 30;
          reasons.push(`${commonTags.length} common tag${commonTags.length > 1 ? 's' : ''}`);
        }
        
        // 3. Title similarity (medium weight)
        const currentTitleWords = currentPage.title.toLowerCase().split(/\s+/);
        const pageTitleWords = page.title.toLowerCase().split(/\s+/);
        const commonTitleWords = currentTitleWords.filter(word => 
          pageTitleWords.some(pageWord => pageWord.includes(word) || word.includes(pageWord))
        );
        if (commonTitleWords.length > 0) {
          relevance += commonTitleWords.length * 20;
          reasons.push('Similar title');
        }
        
        // 4. Content similarity (medium weight)
        const currentContentWords = currentPage.content.toLowerCase().split(/\s+/).slice(0, 100);
        const pageContentWords = page.content.toLowerCase().split(/\s+/).slice(0, 100);
        const commonContentWords = currentContentWords.filter(word => 
          word.length > 3 && pageContentWords.includes(word)
        );
        if (commonContentWords.length > 5) {
          relevance += Math.min(commonContentWords.length * 2, 40);
          reasons.push('Similar content');
        }
        
        // 5. Same author (low weight)
        if (page.authorId === currentPage.authorId) {
          relevance += 10;
          reasons.push('Same author');
        }
        
        // 6. Recent updates (low weight)
        const currentDate = new Date(currentPage.updatedAt);
        const pageDate = new Date(page.updatedAt);
        const daysDiff = Math.abs(currentDate.getTime() - pageDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff < 7) {
          relevance += 5;
          reasons.push('Recently updated');
        }
        
        // 7. Popular pages (low weight)
        if (page.status === 'published' && currentPage.status === 'published') {
          relevance += 5;
          reasons.push('Published content');
        }
        
        if (relevance > 0) {
          allPages.push({
            page,
            categoryTitle: category.title,
            relevance,
            reason: reasons.join(', ')
          });
        }
      });
    });
    
    // Sort by relevance and return top results
    return allPages
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxItems);
  }, [currentPage, categories, maxItems]);

  // Get relevance color
  const getRelevanceColor = (relevance: number): string => {
    if (relevance >= 80) return 'text-green-600';
    if (relevance >= 60) return 'text-blue-600';
    if (relevance >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  // Get relevance badge variant
  const getRelevanceBadge = (relevance: number): "default" | "secondary" | "outline" => {
    if (relevance >= 80) return "default";
    if (relevance >= 60) return "secondary";
    return "outline";
  };

  if (relatedPages.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <Link className="w-4 h-4" />
            <span>Related Pages</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No related pages found</p>
            <p className="text-xs">Try adding tags to find similar content</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-muted/40 border border-border/40 shadow-none ${className}`}>
      <CardHeader className="pb-2 border-b border-border/30 bg-transparent">
        <CardTitle className="text-xs font-semibold flex items-center space-x-2 text-muted-foreground">
          <Link className="w-4 h-4 opacity-60" />
          <span>Related Pages</span>
          <Badge variant="secondary" className="text-xs bg-muted/60 text-muted-foreground border-none">
            {relatedPages.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[220px] pr-1">
          <div className="space-y-2">
            {relatedPages.map((related) => (
              <div
                key={related.page.id}
                className="group p-2 border border-border/20 rounded-lg hover:bg-accent/30 transition-colors cursor-pointer bg-transparent"
                onClick={() => onNavigate(`/wiki/${related.page.slug}`)}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <h4 className="text-xs font-medium truncate text-foreground">
                        {related.page.title}
                      </h4>
                      <Badge 
                        variant={getRelevanceBadge(related.relevance)}
                        className="text-xs"
                      >
                        {related.relevance}%
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-1">
                      <FolderOpen className="w-3 h-3" />
                      <span className="truncate">{related.categoryTitle}</span>
                      <span>•</span>
                      <span className="capitalize">{related.page.status}</span>
                      {related.page.authorName && (
                        <>
                          <span>•</span>
                          <span>by {related.page.authorName}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {related.reason}
                    </p>
                    {related.page.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {related.page.description}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
                {/* Tags */}
                {related.page.tags && related.page.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {related.page.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {related.page.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{related.page.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="pt-2 border-t mt-2 border-border/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Relevance score based on tags, content, and categories</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatedPages; 