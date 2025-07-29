
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Save, 
  Eye, 
  Edit3, 
  History, 
  Users, 
  FileText,
  AlertTriangle,
  Upload,
  Settings,
  CheckCircle,
  Clock,
  User,
  GitBranch,
  GitPullRequest,
  GitMerge
} from 'lucide-react';
import { WikiPage, UserRole, getRolePermissions } from '@/types/wiki';
import MarkdownRenderer from './MarkdownRenderer';
import { toast } from 'sonner';

interface WikiEditorProps {
  page?: WikiPage;
  userRole?: UserRole;
  isEditing?: boolean;
  onSave?: (page: Partial<WikiPage>) => void;
  onToggleEdit?: () => void;
  autoSaveEnabled?: boolean;
  onAutoSaveToggle?: (enabled: boolean) => void;
}

const WikiEditor = ({ 
  page,
  userRole = 'member',
  isEditing = false,
  onSave,
  onToggleEdit,
  autoSaveEnabled = true,
  onAutoSaveToggle
}: WikiEditorProps) => {
  const [pageTitle, setPageTitle] = useState(page?.title || 'New Wiki Page');
  const [pageContent, setPageContent] = useState(page?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [suggestedEdits, setSuggestedEdits] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const permissions = getRolePermissions(userRole);

  // Track changes
  useEffect(() => {
    if (page) {
      setPageTitle(page.title);
      setPageContent(page.content);
      setHasUnsavedChanges(false);
    }
  }, [page]);

  useEffect(() => {
    if (page) {
      const hasChanges = pageTitle !== page.title || pageContent !== page.content;
      setHasUnsavedChanges(hasChanges);
    }
  }, [pageTitle, pageContent, page]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !onSave) return;
    
    try {
      await onSave({
        title: pageTitle,
        content: pageContent,
        status: page?.status || 'draft'
      });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [hasUnsavedChanges, onSave, pageTitle, pageContent, page?.status]);

  useEffect(() => {
    if (!autoSaveEnabled || !isEditing) return;

    const interval = setInterval(autoSave, 30000); // Auto-save every 30 seconds
    return () => clearInterval(interval);
  }, [autoSaveEnabled, isEditing, autoSave]);

  const handleSave = async () => {
    if (!permissions.canEdit || !onSave) return;
    
    setIsSaving(true);
    try {
      await onSave({
        title: pageTitle,
        content: pageContent,
        status: permissions.canPublish ? 'published' : 'draft'
      });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      if (onToggleEdit) onToggleEdit();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportMarkdown = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setPageContent(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSuggestEdit = () => {
    // This would create a suggested edit for moderators to review
    console.log('Suggesting edit:', { title: pageTitle, content: pageContent });
    // For now, we'll just show a toast since the suggested_edits table doesn't exist yet
    toast.info('Suggested edits feature coming soon!');
  };

  const getUserRoleBadge = () => {
    const roleColors = {
      admin: 'bg-destructive/20 text-destructive border-destructive/30',
      moderator: 'bg-primary/20 text-primary border-primary/30',
      editor: 'bg-secondary/20 text-secondary border-secondary/30',
      member: 'bg-muted/20 text-muted-foreground border-muted-foreground/30'
    };

    return (
      <Badge className={`${roleColors[userRole]} capitalize`}>
        {userRole}
      </Badge>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <FileText className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-medium">{pageTitle}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-muted-foreground">Your role:</span>
              {getUserRoleBadge()}
              {page?.status && (
                <Badge className="bg-accent/20 text-accent border-accent/30 capitalize">
                  {page.status}
                </Badge>
              )}
              {lastSaved && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <CheckCircle className="w-3 h-3" />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
              {hasUnsavedChanges && (
                <div className="flex items-center space-x-1 text-xs text-orange-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Unsaved changes</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {permissions.canEdit && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl"
                onClick={handleImportMarkdown}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import .md
              </Button>
              <Button
                variant={isEditing ? "secondary" : "default"}
                size="sm"
                className="rounded-xl"
                onClick={onToggleEdit}
              >
                {isEditing ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    View Mode
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Mode
                  </>
                )}
              </Button>
            </>
          )}
          
          {!permissions.canEdit && permissions.canRead && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={handleSuggestEdit}
            >
              <GitPullRequest className="w-4 h-4 mr-2" />
              Suggest Edit
            </Button>
          )}
        </div>
      </div>

      {/* Permission Alert */}
      {!permissions.canEdit && (
        <Card className="mb-6 border-accent/30 bg-accent/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-accent" />
              <span className="text-sm">
                You have read-only access. Contact staff for editing permissions.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {isEditing && permissions.canEdit ? (
        <div className="space-y-6">
          {/* Auto-save toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-save"
              checked={autoSaveEnabled}
              onCheckedChange={onAutoSaveToggle}
            />
            <Label htmlFor="auto-save" className="text-sm">
              Auto-save every 30 seconds
            </Label>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Page Title</label>
            <Input
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className="rounded-xl"
              placeholder="Enter page title..."
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Content (Markdown supported)
            </label>
            <Textarea
              value={pageContent}
              onChange={(e) => setPageContent(e.target.value)}
              className="min-h-[600px] rounded-xl font-mono text-sm"
              placeholder="# Welcome to the page

## Introduction
Write your content here using **markdown** syntax.

### Features
- Feature 1
- Feature 2  
- Feature 3

### Code Example
```
console.log('Hello Nordics!');
```

**Bold text** and *italic text* are supported."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-border/50">
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className="rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              
              {permissions.canPublish && page?.status === 'draft' && (
                <Button 
                  variant="outline"
                  className="rounded-xl"
                >
                  Publish
                </Button>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {page ? `Last saved: ${page.updatedAt}` : 'Not saved yet'}
            </div>
          </div>
        </div>
      ) : (
        <Card className="min-h-[600px] rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{pageTitle}</CardTitle>
              {page && (
                <div className="text-sm text-muted-foreground">
                  By {page.authorName} • Updated {page.updatedAt}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer 
              content={pageContent || '*No content available*'} 
              className="text-base leading-relaxed"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WikiEditor;
