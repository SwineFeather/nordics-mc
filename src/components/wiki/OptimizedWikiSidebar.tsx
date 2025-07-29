import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { WikiCategory, WikiPage } from '@/types/wiki';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface OptimizedWikiSidebarProps {
  categories: WikiCategory[];
  selectedSlug?: string;
  onNavigate?: (pageId: string) => void;
  onRefreshData?: () => void;
  onWikiBranchChange?: (branch: string) => void;
  loading?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  availableBranches?: string[];
  currentBranch?: string;
}

const OptimizedWikiSidebar: React.FC<OptimizedWikiSidebarProps> = ({
  categories,
  selectedSlug,
  onNavigate = () => {},
  onRefreshData = () => {},
  onWikiBranchChange = () => {},
  loading = false,
  searchQuery,
  onSearchChange,
  availableBranches = ['Nordics'],
  currentBranch = 'Nordics'
}) => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Don't auto-expand categories - let users expand manually

  // Toggle expand/collapse for categories
  const handleToggle = (categoryId: string) => {
    setExpanded((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  // Handle navigation
  const handleNavigate = (slug: string) => {
    onNavigate(slug);
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await onRefreshData();
      toast({
        title: "Wiki refreshed",
        description: "Latest content loaded from GitHub",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not load latest content",
        variant: "destructive",
      });
    }
  };

  // Recursive function to filter categories and their subcategories
  const filterCategoriesRecursively = (cats: WikiCategory[]): WikiCategory[] => {
    if (!cats || !Array.isArray(cats)) return [];
    
    return cats.map(category => {
      if (!category) return null;
      
      // If no search query, show all pages
      const filteredPages = searchQuery.trim() === '' 
        ? (category.pages || [])
        : (category.pages?.filter(page =>
            page && page.title && page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.title && category.title.toLowerCase().includes(searchQuery.toLowerCase())
          ) || []);

      // Recursively filter subcategories
      const filteredChildren = category.children ? filterCategoriesRecursively(category.children) : [];

      return {
        ...category,
        pages: filteredPages,
        children: filteredChildren
      };
    }).filter(category => 
      // Show category if it has pages, children, or matches search
      category && (
        (category.pages && category.pages.length > 0) || 
        (category.children && category.children.length > 0) ||
        (searchQuery.trim() !== '' && category.title && category.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );
  };

  const filteredCategories = filterCategoriesRecursively(categories);

  // Recursive function to render categories and their subcategories
  const renderCategory = (category: WikiCategory, depth: number = 0) => {
    if (!category || !category.id) return null;
    
    const isExpanded = expanded[category.id];
    const hasChildren = category.children && category.children.length > 0;
    const hasPages = category.pages && category.pages.length > 0;
    const totalItems = (category.pages?.length || 0) + (category.children?.length || 0);
    const isTopLevel = depth === 0;
    
    // Check if this category has a README file
    const readmePage = category.pages?.find(page => 
      page && page.id && (page.id.endsWith('/README.md') || (page.title && page.title.toLowerCase() === 'readme'))
    );
    const hasReadme = !!readmePage;

    return (
      <div key={category.id} className={`${isTopLevel ? 'space-y-4' : 'space-y-2'}`}>
        {/* Category Header */}
        <div 
          className={`flex items-center gap-2 cursor-pointer transition-all duration-200 rounded-md px-2 py-1.5 ${
            isTopLevel 
              ? 'bg-muted/40 hover:bg-muted/60' 
              : 'hover:bg-muted/30'
          }`}
          onClick={(e) => {
            // If category has README, navigate to it instead of expanding
            if (hasReadme && readmePage) {
              e.stopPropagation();
              handleNavigate(readmePage.id);
            } else {
              handleToggle(category.id);
            }
          }}
        >
          {(hasChildren || hasPages) ? (
            <button 
              className="p-0.5 hover:bg-muted/50 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle(category.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4" />
          )}
          
          <div className="flex items-center gap-1.5 flex-1">
            <span className={`font-medium ${isTopLevel ? 'text-sm' : 'text-xs'}`}>
              {category.title}
            </span>
            {hasReadme && (
              <span className="text-xs text-muted-foreground">📄</span>
            )}
          </div>
          
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
            {totalItems}
          </Badge>
        </div>
        
        {/* Category Content */}
        {isExpanded && (
          <div className={`${isTopLevel ? 'space-y-2' : 'space-y-1'} ml-4`}>
            {/* Render pages in this category (excluding README) */}
            {category.pages?.filter(page => 
              page && page.id && !page.id.endsWith('/README.md') && page.title && page.title.toLowerCase() !== 'readme'
            ).map((page) => {
              if (!page || !page.id || !page.title) return null;
              
              return (
                <div
                  key={page.id}
                  className={`flex items-center gap-2 cursor-pointer rounded-md px-2 py-1 transition-all duration-200 ${
                    selectedSlug === page.id
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => {
                    handleNavigate(page.id);
                  }}
                >
                  <span className="text-xs font-medium truncate">{page.title}</span>
                </div>
              );
            })}
            
            {/* Recursively render subcategories */}
            {category.children?.map((subcategory) => 
              subcategory ? renderCategory(subcategory, depth + 1) : null
            )}
          </div>
        )}
      </div>
    );
  };

  // Render top-level categories and solo pages
  return (
    <div className="h-full bg-background/60 backdrop-blur-sm rounded-lg p-4 space-y-4">
      {/* Wiki Branch Selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          Wiki Branch
        </div>
        <Select value={currentBranch} onValueChange={onWikiBranchChange}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="Select wiki branch" />
          </SelectTrigger>
          <SelectContent>
            {availableBranches.map((branch) => (
              branch ? (
                <SelectItem key={branch} value={branch}>
                  <div className="flex items-center gap-2">
                    {branch}
                  </div>
                </SelectItem>
              ) : null
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="h-px bg-border/50" />

      {/* Search */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-7 text-xs"
          />
        </div>
      </div>

      {/* Stats and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="p-1 hover:bg-muted/50 rounded transition-colors"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh wiki content"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <span className="text-xs text-muted-foreground">
            {categories.reduce((total, cat) => total + (cat && cat.pages ? cat.pages.length : 0), 0)} pages
          </span>
        </div>
      </div>
      
      {/* Categories */}
      <div className="space-y-4 overflow-y-auto flex-1">
        {filteredCategories.map((category) => {
          if (!category) return null;
          
          // If this category is a solo page (no children, only one page), render as a page
          if ((category.pages?.length === 1) && (!category.children || category.children.length === 0)) {
            const page = category.pages[0];
            if (!page || !page.id || !page.title) return null;
            
            return (
              <div
                key={page.id}
                className={`flex items-center gap-2 cursor-pointer rounded-md px-2 py-1 transition-all duration-200 ${
                  selectedSlug === page.id
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => handleNavigate(page.id)}
              >
                <span className="text-xs font-medium truncate">{page.title}</span>
              </div>
            );
          }
          // Otherwise, render as a category/folder
          return renderCategory(category);
        })}
        
        {filteredCategories.length === 0 && searchQuery && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-xs">No pages found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizedWikiSidebar; 