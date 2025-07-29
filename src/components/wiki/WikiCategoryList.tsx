
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight,
  BookOpen,
  FileText
} from 'lucide-react';
import { WikiSummary } from '@/types/wiki';

interface WikiCategoryListProps {
  wikiData: WikiSummary;
  currentSlug?: string;
  searchTerm: string;
}

const WikiCategoryList = ({ wikiData, currentSlug, searchTerm }: WikiCategoryListProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  const filteredCategories = wikiData.categories.map(category => ({
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

  return (
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
              {category.pages.map((page) => (
                <Link key={page.id} to={`/wiki/${page.slug}`}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-between text-left rounded-xl p-2 ml-4 hover:bg-muted/50 ${
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
              ))}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};

export default WikiCategoryList;
