import { useState, useCallback } from 'react';
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
  GripVertical,
  Move,
  AlertTriangle
} from 'lucide-react';
import { WikiCategory, WikiPage } from '@/types/wiki';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface EnhancedDraggableCategoryListProps {
  categories: WikiCategory[];
  currentSlug?: string;
  onCategoryClick?: (category: WikiCategory) => void;
  onPageClick?: (page: WikiPage) => void;
  onAddPage?: (categoryId: string) => void;
  onAddSubcategory?: (parentId: string) => void;
  onReorderCategories?: (newOrder: WikiCategory[]) => void;
  onMovePage?: (pageId: string, fromCategoryId: string, toCategoryId: string, newIndex: number) => void;
  onMoveCategory?: (categoryId: string, newParentId: string | null, newIndex: number) => void;
  userRole?: string;
  maxDepth?: number;
}

interface DragItem {
  id: string;
  type: 'category' | 'page';
  categoryId?: string;
  parentId?: string;
  depth?: number;
}

const EnhancedDraggableCategoryList = ({
  categories,
  currentSlug,
  onCategoryClick,
  onPageClick,
  onAddPage,
  onAddSubcategory,
  onReorderCategories,
  onMovePage,
  onMoveCategory,
  userRole = 'member',
  maxDepth = 6
}: EnhancedDraggableCategoryListProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const canDropAtDepth = (targetDepth: number, sourceDepth: number): boolean => {
    // Can't drop deeper than max depth
    if (targetDepth >= maxDepth) return false;
    
    // Can't drop a parent into its own child
    if (targetDepth > sourceDepth) return false;
    
    return true;
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false);
    setDragOverItem(null);

    if (!result.destination) return;

    const { source, destination, draggableId, type } = result;

    if (type === 'category') {
      handleCategoryDrop(draggableId, destination);
    } else if (type === 'page') {
      handlePageDrop(draggableId, source, destination);
    }
  };

  const handleCategoryDrop = (categoryId: string, destination: any) => {
    const targetCategoryId = destination.droppableId;
    const newIndex = destination.index;

    // Determine new parent and depth
    let newParentId: string | null = null;
    let newDepth = 0;

    if (targetCategoryId === 'root') {
      newParentId = null;
      newDepth = 0;
    } else {
      newParentId = targetCategoryId;
      // Find the target category to get its depth
      const targetCategory = findCategoryById(categories, targetCategoryId);
      newDepth = (targetCategory?.depth || 0) + 1;
    }

    // Validate the move
    const sourceCategory = findCategoryById(categories, categoryId);
    if (sourceCategory && !canDropAtDepth(newDepth, sourceCategory.depth || 0)) {
      console.warn('Invalid drop: would exceed max depth or create circular reference');
      return;
    }

    onMoveCategory?.(categoryId, newParentId, newIndex);
  };

  const handlePageDrop = (pageId: string, source: any, destination: any) => {
    const fromCategoryId = source.droppableId;
    const toCategoryId = destination.droppableId;
    const newIndex = destination.index;

    onMovePage?.(pageId, fromCategoryId, toCategoryId, newIndex);
  };

  const findCategoryById = (cats: WikiCategory[], id: string): WikiCategory | null => {
    for (const cat of cats) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const found = findCategoryById(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const renderCategory = (category: WikiCategory, depth: number = 0, index: number = 0): JSX.Element => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const hasPages = category.pages && category.pages.length > 0;
    const canAddSubcategory = depth < maxDepth - 1;
    const canAddPage = true;
    const isDragOver = dragOverItem === category.id;

    return (
      <Draggable key={category.id} draggableId={category.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`space-y-1 ${snapshot.isDragging ? 'opacity-50' : ''}`}
          >
            {/* Category Header */}
            <div 
              className={`
                flex items-center justify-between p-2 rounded-md cursor-pointer
                hover:bg-accent/50 transition-colors group
                ${isDragOver ? 'bg-accent/70 border-2 border-dashed border-primary' : ''}
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
                {/* Drag Handle */}
                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>

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

                {/* Depth Warning */}
                {depth >= maxDepth - 1 && (
                  <div title="Maximum depth reached">
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                  </div>
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
                {/* Pages Droppable */}
                <Droppable droppableId={category.id} type="page">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[20px] ${snapshot.isDraggingOver ? 'bg-accent/20 rounded' : ''}`}
                    >
                      {category.pages.map((page, pageIndex) => (
                        <Draggable key={page.id} draggableId={page.id} index={pageIndex}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`
                                flex items-center space-x-2 p-2 rounded-md cursor-pointer
                                hover:bg-accent/30 transition-colors
                                ${page.slug === currentSlug ? 'bg-accent/50' : ''}
                                ${snapshot.isDragging ? 'opacity-50' : ''}
                              `}
                              style={{ 
                                paddingLeft: `${12 + (depth + 1) * 16}px`,
                                ...provided.draggableProps.style
                              }}
                              onClick={() => onPageClick?.(page)}
                            >
                              <Move className="h-3 w-3 text-muted-foreground" />
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm truncate">{page.title}</span>
                              {page.status === 'draft' && (
                                <Badge variant="outline" className="text-xs">
                                  Draft
                                </Badge>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Subcategories */}
                {category.children && (
                  <Droppable droppableId={`sub-${category.id}`} type="category">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[20px] ${snapshot.isDraggingOver ? 'bg-accent/20 rounded' : ''}`}
                      >
                        {category.children.map((childCategory, childIndex) => 
                          renderCategory(childCategory, depth + 1, childIndex)
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                )}
              </div>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <ScrollArea className="h-full">
        <Droppable droppableId="root" type="category">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-1 p-2 ${snapshot.isDraggingOver ? 'bg-accent/20 rounded' : ''}`}
            >
              {categories.map((category, index) => renderCategory(category, 0, index))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </ScrollArea>
    </DragDropContext>
  );
};

export default EnhancedDraggableCategoryList; 