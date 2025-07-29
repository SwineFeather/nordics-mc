import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  List, 
  ChevronRight, 
  ChevronDown,
  Minus,
  Hash,
  Eye,
  EyeOff
} from 'lucide-react';

interface TocItem {
  id: string;
  title: string;
  level: number;
  element: HTMLElement;
  isVisible: boolean;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
  maxDepth?: number;
  showNumbers?: boolean;
  sticky?: boolean;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  content,
  className = '',
  maxDepth = 6,
  showNumbers = false,
  sticky = true
}) => {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(true);

  // Parse headings from content and create TOC items
  const parseHeadings = useMemo(() => {
    return (content: string): TocItem[] => {
      const items: TocItem[] = [];
      const lines = content.split('\n');
      let counter = 1;

      lines.forEach((line, index) => {
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          if (level <= maxDepth) {
            const title = headingMatch[2].trim();
            const id = `heading-${counter}`;
            
            items.push({
              id,
              title,
              level,
              element: null as any, // Will be set when DOM is ready
              isVisible: true
            });
            counter++;
          }
        }
      });

      return items;
    };
  }, [maxDepth]);

  // Update TOC when content changes
  useEffect(() => {
    const items = parseHeadings(content);
    setTocItems(items);
    
    // Reset expanded items when content changes
    setExpandedItems(new Set());
  }, [content, parseHeadings]);

  // Find heading elements in DOM and set up intersection observer
  useEffect(() => {
    if (tocItems.length === 0) return;

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      const elements: HTMLElement[] = [];
      
      // Find all heading elements
      for (let i = 1; i <= maxDepth; i++) {
        const headings = document.querySelectorAll(`h${i}`);
        headings.forEach((heading, index) => {
          if (index < tocItems.length) {
            const element = heading as HTMLElement;
            element.id = tocItems[index].id;
            elements.push(element);
          }
        });
      }

      // Update TOC items with elements
      setTocItems(prev => prev.map((item, index) => ({
        ...item,
        element: elements[index] || null
      })));

      // Set up intersection observer for active heading detection
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        {
          rootMargin: '-20% 0px -70% 0px',
          threshold: 0
        }
      );

      elements.forEach(element => {
        if (element) {
          observer.observe(element);
        }
      });

      return () => {
        observer.disconnect();
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [tocItems, maxDepth]);

  // Scroll to heading
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Toggle item expansion
  const toggleExpansion = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Check if item has children
  const hasChildren = (item: TocItem, items: TocItem[]): boolean => {
    const itemIndex = items.indexOf(item);
    if (itemIndex === -1 || itemIndex === items.length - 1) return false;
    
    const nextItem = items[itemIndex + 1];
    return nextItem.level > item.level;
  };

  // Get children of an item
  const getChildren = (item: TocItem, items: TocItem[]): TocItem[] => {
    const itemIndex = items.indexOf(item);
    if (itemIndex === -1) return [];
    
    const children: TocItem[] = [];
    let i = itemIndex + 1;
    
    while (i < items.length && items[i].level > item.level) {
      if (items[i].level === item.level + 1) {
        children.push(items[i]);
      }
      i++;
    }
    
    return children;
  };

  // Render TOC item recursively (make whole row clickable for expand/collapse)
  const renderTocItem = (item: TocItem, items: TocItem[], depth: number = 0): JSX.Element => {
    const children = getChildren(item, items);
    const hasChildItems = children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = activeId === item.id;

    return (
      <div key={item.id} className="space-y-1">
        <div
          className={`group flex items-center space-x-2 px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
            isActive 
              ? 'bg-primary/10 text-primary font-medium' 
              : 'hover:bg-accent/30 text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => {
            if (hasChildItems) toggleExpansion(item.id);
            scrollToHeading(item.id);
          }}
          style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
        >
          {/* Expand/collapse icon (visual only, now whole row is clickable) */}
          {hasChildItems && (
            <span className="flex items-center justify-center w-5 h-5">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </span>
          )}
          {/* Heading level indicator */}
          <div className="flex items-center space-x-1 opacity-40">
            {Array.from({ length: Math.min(item.level, 3) }).map((_, i) => (
              <Minus key={i} className="w-2 h-1" />
            ))}
          </div>
          {/* Title */}
          <span className="truncate flex-1">{item.title}</span>
        </div>
        {/* Children */}
        {hasChildItems && isExpanded && (
          <div className="ml-4 space-y-1">
            {children.map(child => renderTocItem(child, items, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (tocItems.length === 0) {
    return null;
  }

  // Card styling: blend into background, subtle border, muted colors
  const cardContent = (
    <Card className={`bg-muted/40 border border-border/40 shadow-none ${className} ${sticky ? 'sticky top-4' : ''}`}>
      <CardHeader className="pb-2 border-b border-border/30 bg-transparent">
        <CardTitle className="text-xs font-semibold flex items-center space-x-2 text-muted-foreground">
          <List className="w-4 h-4 opacity-60" />
            <span>Table of Contents</span>
          <Badge variant="secondary" className="text-xs bg-muted/60 text-muted-foreground border-none">
              {tocItems.length}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
          className="h-6 w-6 p-0 text-muted-foreground hover:bg-transparent"
            onClick={() => setIsVisible(!isVisible)}
            title={isVisible ? "Hide TOC" : "Show TOC"}
          >
            {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </Button>
      </CardHeader>
      {isVisible && (
        <CardContent className="pt-0">
          <ScrollArea className="h-[calc(100vh-200px)] max-h-[600px] pr-1">
            <div className="space-y-1">
              {tocItems
                .filter(item => item.level === Math.min(...tocItems.map(t => t.level)))
                .map(item => renderTocItem(item, tocItems))}
            </div>
          </ScrollArea>
          <div className="pt-2 border-t mt-4 border-border/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Auto-generated from headings</span>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Hash className="w-3 h-3" />
                  <span>H1-H{maxDepth}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );

  return cardContent;
};

export default TableOfContents; 