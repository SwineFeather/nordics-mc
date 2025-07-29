
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight,
  BookOpen,
  FileText,
  GripVertical
} from 'lucide-react';
import { WikiSummary, WikiPage, WikiCategory } from '@/types/wiki';

// Import react-beautiful-dnd components
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from 'react-beautiful-dnd';

interface DraggableWikiCategoryListProps {
  wikiData: WikiSummary;
  currentSlug?: string;
  searchTerm: string;
  onReorderPages?: (categoryId: string, startIndex: number, endIndex: number) => void;
  onMovePageToCategory?: (pageId: string, sourceCategoryId: string, destinationCategoryId: string, destinationIndex: number) => void;
}

const DraggableWikiCategoryList = ({ 
  wikiData, 
  currentSlug, 
  searchTerm,
  onReorderPages,
  onMovePageToCategory
}: DraggableWikiCategoryListProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);
  const [localWikiData, setLocalWikiData] = useState(wikiData);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  const filteredCategories = localWikiData.categories.map(category => ({
    ...category,
    pages: category.pages.filter(page => 
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.pages.length > 0);

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'bg-accent/20 text-accent border-accent/30',
      review: 'bg-secondary/20 text-secondary border-secondary/30',
      published: 'bg-primary/20 text-primary border-primary/30'
    };

    return (
      <Badge className={`text-xs ${variants[status as keyof typeof variants]}`}>
        {status}
      </Badge>
    );
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    // If dropped outside a valid droppable area
    if (!destination) {
      return;
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'page') {
      const sourceCategoryId = source.droppableId;
      const destinationCategoryId = destination.droppableId;

      // If moving within the same category
      if (sourceCategoryId === destinationCategoryId) {
        onReorderPages?.(sourceCategoryId, source.index, destination.index);
        
        // Update local state for immediate feedback
        const newCategories = [...localWikiData.categories];
        const categoryIndex = newCategories.findIndex(cat => cat.id === sourceCategoryId);
        const category = newCategories[categoryIndex];
        const newPages = [...category.pages];
        const [reorderedPage] = newPages.splice(source.index, 1);
        newPages.splice(destination.index, 0, reorderedPage);
        
        newCategories[categoryIndex] = { ...category, pages: newPages };
        setLocalWikiData({ ...localWikiData, categories: newCategories });
      } else {
        // Moving to a different category
        onMovePageToCategory?.(draggableId, sourceCategoryId, destinationCategoryId, destination.index);
        
        // Update local state for immediate feedback
        const newCategories = [...localWikiData.categories];
        const sourceCategoryIndex = newCategories.findIndex(cat => cat.id === sourceCategoryId);
        const destinationCategoryIndex = newCategories.findIndex(cat => cat.id === destinationCategoryId);
        
        const sourceCategory = newCategories[sourceCategoryIndex];
        const destinationCategory = newCategories[destinationCategoryIndex];
        
        const sourcePages = [...sourceCategory.pages];
        const destinationPages = [...destinationCategory.pages];
        
        const [movedPage] = sourcePages.splice(source.index, 1);
        destinationPages.splice(destination.index, 0, { ...movedPage, category: destinationCategory.slug });
        
        newCategories[sourceCategoryIndex] = { ...sourceCategory, pages: sourcePages };
        newCategories[destinationCategoryIndex] = { ...destinationCategory, pages: destinationPages };
        
        setLocalWikiData({ ...localWikiData, categories: newCategories });
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-2">
        {filteredCategories.map((category) => {
          const isExpanded = expandedSections.includes(category.id);
          
          return (
            <Collapsible
              key={category.id}
              open={isExpanded}
              onOpenChange={() => toggleSection(category.id)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between rounded-xl p-3 hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">{category.title}</div>
                      {category.description && (
                        <div className="text-xs text-muted-foreground">{category.description}</div>
                      )}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-1 mt-1">
                <Droppable droppableId={category.id} type="page">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[20px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-muted/30 rounded-lg' : ''
                      }`}
                    >
                      {category.pages.map((page, index) => (
                        <Draggable 
                          key={page.id} 
                          draggableId={page.id} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`transition-transform ${
                                snapshot.isDragging ? 'rotate-1 shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-center ml-4 group">
                                <div
                                  {...provided.dragHandleProps}
                                  className="mr-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-muted rounded transition-opacity cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical className="w-3 h-3 text-muted-foreground" />
                                </div>
                                <Link to={`/wiki/${page.slug}`} className="flex-1">
                                  <Button
                                    variant="ghost"
                                    className={`w-full justify-between text-left rounded-xl p-2 hover:bg-muted/50 ${
                                      currentSlug === page.slug 
                                        ? 'bg-primary/20 text-primary border border-primary/30' 
                                        : ''
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <FileText className="w-3 h-3" />
                                      <span className="text-sm">{page.title}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      {getStatusBadge(page.status)}
                                    </div>
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default DraggableWikiCategoryList;
