import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FolderOpen, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { WikiCategory, UserRole, getRolePermissions } from '@/types/wiki';
import PageTemplates, { pageTemplates, PageTemplate } from './PageTemplates';
import { toast } from 'sonner';

interface AddPageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: WikiCategory[];
  userRole: UserRole;
  onCreatePage: (pageData: {
    title: string;
    slug: string;
    content: string;
    categoryId: string;
  }) => void;
  onCreateCategory?: (categoryData: {
    title: string;
    slug: string;
    description: string;
    parentId?: string;
  }) => void;
}

const AddPageModal = ({ 
  open, 
  onOpenChange, 
  categories, 
  userRole, 
  onCreatePage,
  onCreateCategory
}: AddPageModalProps) => {
  const [pageType, setPageType] = useState<'page' | 'category'>('page');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const permissions = getRolePermissions(userRole);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (pageType === 'page') {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleTemplateSelect = (template: PageTemplate) => {
    setContent(template.content);
    setShowTemplates(false);
    toast.success(`Applied ${template.name} template`);
  };

  const handleCreate = async () => {
    if (!title.trim() || !slug.trim()) return;

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug.trim())) {
      toast.error('Slug can only contain lowercase letters, numbers, and hyphens');
      return;
    }

    // Check for duplicate slug
    const existingPage = categories.flatMap(cat => cat.pages).find(page => page.slug === slug.trim());
    if (existingPage) {
      toast.error('A page with this slug already exists');
      return;
    }

    setIsCreating(true);
    try {
      if (pageType === 'page') {
        if (categories.length === 0) {
          throw new Error('No categories available. Please create a category first.');
        }
        
        const selectedCategoryId = categoryId || categories[0]?.id;
        if (!selectedCategoryId) {
          throw new Error('Please select a category for this page.');
        }
        
        await onCreatePage({
          title: title.trim(),
          slug: slug.trim(),
          content: content.trim() || '# ' + title + '\n\nWrite your content here...',
          categoryId: selectedCategoryId
        });
      } else {
        // Handle category creation
        if (onCreateCategory) {
          await onCreateCategory({
            title: title.trim(),
            slug: slug.trim(),
            description: description.trim(),
            parentId: parentCategoryId === 'none' ? undefined : parentCategoryId
          });
        } else {
          console.log('Category creation not yet implemented');
        }
      }
      
      // Reset form
      setTitle('');
      setSlug('');
      setContent('');
      setCategoryId('');
      setDescription('');
      setParentCategoryId('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create page:', error);
      toast.error(`Failed to create ${pageType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const canCreate = permissions.canCreate && title.trim() && slug.trim() && (pageType === 'category' || (pageType === 'page' && categories.length > 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add New {pageType === 'page' ? 'Page' : 'Category'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Page Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-colors ${
                pageType === 'page' ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => setPageType('page')}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <div>
                    <h3 className="font-medium">Page</h3>
                    <p className="text-sm text-muted-foreground">Create a new wiki page</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-colors ${
                pageType === 'category' ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => setPageType('category')}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="w-5 h-5" />
                  <div>
                    <h3 className="font-medium">Category</h3>
                    <p className="text-sm text-muted-foreground">Create a new category</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={`Enter ${pageType} title...`}
              className="mt-1"
            />
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="page-url-slug"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This will be the URL: /wiki/{slug}
            </p>
          </div>

          {pageType === 'page' && (
            <>
              {/* Category Selection */}
              <div>
                <Label htmlFor="category">Category</Label>
                {categories.length === 0 ? (
                  <div className="mt-1 p-3 border border-dashed border-muted-foreground/30 rounded-md text-center">
                    <p className="text-sm text-muted-foreground mb-2">No categories available</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Switch to "Category" tab above to create your first category
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPageType('category')}
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Create Category First
                    </Button>
                  </div>
                ) : (
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            <FolderOpen className="w-4 h-4" />
                            <span>{category.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Initial Content (Markdown)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTemplates(true)}
                    className="flex items-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Use Template</span>
                  </Button>
                </div>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="# Welcome to your new page

Write your content here using **markdown** syntax.

## Features
- Feature 1
- Feature 2
- Feature 3

### Code Example
```
console.log('Hello Nordics!');
```"
                  className="mt-1 min-h-[200px] font-mono text-sm"
                />
              </div>
            </>
          )}

          {pageType === 'category' && (
            <>
              {/* Parent Category */}
              <div>
                <Label htmlFor="parent">Parent Category (Optional)</Label>
                <Select value={parentCategoryId} onValueChange={setParentCategoryId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select parent category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No parent (top-level)</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this category contains..."
                  className="mt-1"
                />
              </div>
            </>
          )}

          {/* Permission Check */}
          {!permissions.canCreate && (
            <Card className="border-accent/30 bg-accent/10">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-accent" />
                  <span className="text-sm">
                    You don't have permission to create {pageType}s. Contact staff for access.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!canCreate || isCreating}
              className="min-w-[120px]"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create {pageType === 'page' ? 'Page' : 'Category'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
      
      {/* Template Selection Modal */}
      {showTemplates && (
        <PageTemplates
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </Dialog>
  );
};

export default AddPageModal; 