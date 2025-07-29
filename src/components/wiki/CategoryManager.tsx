import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FolderOpen, 
  FileText, 
  Edit3, 
  Trash2, 
  Plus, 
  ChevronRight,
  ChevronDown,
  GripVertical,
  Settings,
  Users
} from 'lucide-react';
import { WikiCategory, UserRole } from '@/types/wiki';
import { toast } from 'sonner';

interface CategoryManagerProps {
  categories: WikiCategory[];
  userRole: UserRole;
  onUpdateCategory: (id: string, updates: Partial<WikiCategory>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onReorderCategories: (categoryId: string, newOrder: number) => Promise<void>;
  onMoveCategory: (categoryId: string, newParentId: string | null) => Promise<void>;
}

interface CategoryItemProps {
  category: WikiCategory;
  depth: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (category: WikiCategory) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, parentId: string | null) => void;
  canEdit: boolean;
  allCategories: WikiCategory[];
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  depth,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onMove,
  canEdit,
  allCategories
}) => {
  const hasChildren = category.children && category.children.length > 0;
  const hasPages = category.pages && category.pages.length > 0;

  return (
    <div className="space-y-1">
      <div 
        className={`flex items-center space-x-2 p-2 rounded hover:bg-accent/50 transition-colors ${
          hasChildren ? 'font-medium' : 'font-normal'
        }`}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
        
        {hasChildren && (
          <button
            onClick={onToggleExpand}
            className="p-1 hover:bg-accent/30 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        
        <FolderOpen className="w-4 h-4 text-muted-foreground" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm truncate">{category.title}</span>
            {hasPages && (
              <Badge variant="secondary" className="text-xs">
                {category.pages.length} pages
              </Badge>
            )}
          </div>
          {category.description && (
            <p className="text-xs text-muted-foreground truncate">
              {category.description}
            </p>
          )}
        </div>
        
        {canEdit && (
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(category)}
              className="h-8 w-8 p-0"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(category.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      
      {isExpanded && hasChildren && (
        <div className="ml-4">
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              depth={depth + 1}
              isExpanded={true}
              onToggleExpand={() => {}} // Will be handled by parent
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
              canEdit={canEdit}
              allCategories={allCategories}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  userRole,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  onMoveCategory
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<WikiCategory | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const canEdit = userRole === 'admin' || userRole === 'moderator' || userRole === 'editor';

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleEdit = (category: WikiCategory) => {
    setEditingCategory(category);
    setIsEditing(true);
  };

  const handleSave = async (updates: Partial<WikiCategory>) => {
    if (!editingCategory) return;
    
    try {
      await onUpdateCategory(editingCategory.id, updates);
      setEditingCategory(null);
      setIsEditing(false);
      toast.success('Category updated successfully');
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all its pages and subcategories.')) {
      return;
    }
    
    try {
      await onDeleteCategory(categoryId);
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleMove = async (categoryId: string, parentId: string | null) => {
    try {
      await onMoveCategory(categoryId, parentId);
      toast.success('Category moved successfully');
    } catch (error) {
      console.error('Failed to move category:', error);
      toast.error('Failed to move category');
    }
  };

  // Flatten all categories for parent selection
  const allCategories = categories.reduce((acc: WikiCategory[], category) => {
    acc.push(category);
    if (category.children) {
      acc.push(...category.children);
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Category Management</h2>
          <p className="text-muted-foreground">
            Manage wiki categories and their hierarchy
          </p>
        </div>
        {canEdit && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        )}
      </div>

      {/* Category Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="w-5 h-5" />
            <span>Categories ({categories.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <div className="space-y-1">
              {categories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  depth={0}
                  isExpanded={expandedCategories.has(category.id)}
                  onToggleExpand={() => toggleExpanded(category.id)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onMove={handleMove}
                  canEdit={canEdit}
                  allCategories={allCategories}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No categories found</p>
              {canEdit && (
                <p className="text-sm">Create your first category to get started</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {isEditing && editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Category</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  defaultValue={editingCategory.title}
                  onChange={(e) => setEditingCategory({
                    ...editingCategory,
                    title: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  defaultValue={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({
                    ...editingCategory,
                    description: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-parent">Parent Category</Label>
                <Select
                  value={editingCategory.parent_id || 'none'}
                  onValueChange={(value) => setEditingCategory({
                    ...editingCategory,
                    parent_id: value === 'none' ? undefined : value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No parent (top-level)</SelectItem>
                    {allCategories
                      .filter(cat => cat.id !== editingCategory.id)
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingCategory(null);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSave({
                  title: editingCategory.title,
                  description: editingCategory.description,
                  parent_id: editingCategory.parent_id
                })}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager; 