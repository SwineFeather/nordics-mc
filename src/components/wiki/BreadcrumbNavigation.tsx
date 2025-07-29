import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WikiCategory, WikiPage } from '@/types/wiki';

interface BreadcrumbItem {
  id: string;
  title: string;
  type: 'home' | 'category' | 'page';
  slug?: string;
}

interface BreadcrumbNavigationProps {
  currentPage?: WikiPage;
  categories: WikiCategory[];
  onNavigate: (path: string) => void;
  className?: string;
}

const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  currentPage,
  categories,
  onNavigate,
  className = ''
}) => {
  // Build breadcrumb trail
  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      {
        id: 'home',
        title: 'Wiki',
        type: 'home',
        slug: '/wiki'
      }
    ];

    if (!currentPage) {
      return breadcrumbs;
    }

    // Find the category that contains this page
    const findCategoryForPage = (cats: WikiCategory[], pageId: string): WikiCategory | null => {
      for (const cat of cats) {
        if (cat.pages.some(p => p.id === pageId)) {
          return cat;
        }
        // Check children recursively
        if (cat.children) {
          const found = findCategoryForPage(cat.children, pageId);
          if (found) return found;
        }
      }
      return null;
    };

    const category = findCategoryForPage(categories, currentPage.id);
    
    if (category) {
      // Add category to breadcrumbs
      breadcrumbs.push({
        id: category.id,
        title: category.title,
        type: 'category',
        slug: category.slug
      });
    }

    // Add current page
    breadcrumbs.push({
      id: currentPage.id,
      title: currentPage.title,
      type: 'page',
      slug: currentPage.slug
    });

    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  const handleBreadcrumbClick = (item: BreadcrumbItem) => {
    if (item.type === 'home') {
      onNavigate('/wiki');
    } else if (item.type === 'category') {
      // Find the category and navigate to its first page or category overview
      const category = categories.find(cat => cat.id === item.id);
      if (category && category.pages.length > 0) {
        onNavigate(`/wiki/${category.pages[0].slug}`);
      }
    } else if (item.type === 'page' && item.slug) {
      onNavigate(`/wiki/${item.slug}`);
    }
  };

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      {breadcrumbs.map((item, index) => (
        <div key={item.id} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <Button
            variant={index === breadcrumbs.length - 1 ? "default" : "ghost"}
            size="sm"
            className={`h-auto p-1 text-sm ${
              index === breadcrumbs.length - 1 
                ? 'font-medium' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => handleBreadcrumbClick(item)}
            disabled={index === breadcrumbs.length - 1}
          >
            {item.type === 'home' && <Home className="w-3 h-3 mr-1" />}
            {item.title}
          </Button>
        </div>
      ))}
    </nav>
  );
};

export default BreadcrumbNavigation; 