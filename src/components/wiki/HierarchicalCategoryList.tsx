import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  FileText,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { WikiCategory, WikiPage } from '@/types/wiki';

interface HierarchicalCategoryListProps {
  categories: WikiCategory[];
  currentSlug?: string;
  onCategoryClick?: (category: WikiCategory) => void;
  onPageClick?: (page: WikiPage) => void;
  onAddPage?: (categoryId: string) => void;
  onAddSubcategory?: (parentId: string) => void;
  userRole?: string;
  maxDepth?: number;
}

const HierarchicalCategoryList = ({
  categories,
  currentSlug,
  onCategoryClick,
  onPageClick,
  onAddPage,
  onAddSubcategory,
  userRole = 'member',
  maxDepth = 6
}: HierarchicalCategoryListProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategory = (category: WikiCategory, depth: number = 0): JSX.Element => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const hasPages = category.pages && category.pages.length > 0;
    const canAddSubcategory = depth < maxDepth - 1;
    const canAddPage = true; // Always allow pages

    return (
      <div key={category.id} className="space-y-1">
        {/* Category Header */}
        <div 
          className={`
            flex items-center justify-between p-2 rounded-md cursor-pointer
            hover:bg-accent/50 transition-colors group
            ${depth > 0 ? 'ml-4' : ''}
          `}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <div 
            className="flex items-center space-x-2 flex-1"
            onClick={() => {
              if (hasChildren || hasPages) {
                toggleCategory(category.id);
              }
              onCategoryClick?.(category);
            }}
          >
            {/* Expand/Collapse Icon */}
            {(hasChildren || hasPages) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory(category.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}
            
            {/* Category Icon */}
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 text-blue-500" />
            )}
            
            {/* Category Title */}
            <span className="text-sm font-medium truncate">
              {category.title}
            </span>
            
            {/* Page Count Badge */}
            {category.pages.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {category.pages.length}
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {canAddPage && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddPage?.(category.id);
                }}
                title="Add page"
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
            
            {canAddSubcategory && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddSubcategory?.(category.id);
                }}
                title="Add subcategory"
              >
                <Folder className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-1">
            {/* Pages */}
            {category.pages.map((page) => (
              <div
                key={page.id}
                className={`
                  flex items-center space-x-2 p-2 rounded-md cursor-pointer
                  hover:bg-accent/30 transition-colors
                  ${page.slug === currentSlug ? 'bg-accent/50' : ''}
                `}
                style={{ paddingLeft: `${12 + (depth + 1) * 16}px` }}
                onClick={() => onPageClick?.(page)}
              >
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm truncate">{page.title}</span>
                {page.status === 'draft' && (
                  <Badge variant="outline" className="text-xs">
                    Draft
                  </Badge>
                )}
              </div>
            ))}

            {/* Subcategories */}
            {category.children?.map((childCategory) => 
              renderCategory(childCategory, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {categories.map((category) => renderCategory(category))}
      </div>
    </ScrollArea>
  );
};

export default HierarchicalCategoryList; 