import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Eye, 
  Edit3, 
  History, 
  AlertTriangle,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { WikiPage, UserRole } from '@/types/wiki';
import { toast } from 'sonner';

interface WikiEditorProps {
  page: WikiPage;
  userRole: UserRole;
  isEditing: boolean;
  onSave: (updates: Partial<WikiPage>) => Promise<void>;
  onToggleEdit: () => void;
  autoSaveEnabled: boolean;
  onAutoSaveToggle: (enabled: boolean) => void;
}

const WikiEditor: React.FC<WikiEditorProps> = ({
  page,
  userRole,
  isEditing,
  onSave,
  onToggleEdit,
  autoSaveEnabled,
  onAutoSaveToggle
}) => {
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [status, setStatus] = useState(page.status);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(async () => {
      if (hasUnsavedChanges) {
        await handleSave();
      }
    }, 30000); // Auto-save after 30 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [content, title, autoSaveEnabled, hasUnsavedChanges]);

  // Track changes
  useEffect(() => {
    const hasChanges = title !== page.title || content !== page.content || status !== page.status;
    setHasUnsavedChanges(hasChanges);
  }, [title, content, status, page.title, page.content, page.status]);

  const handleSave = async () => {
    if (!hasUnsavedChanges) return;
    
    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        status
      });
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      toast.success('Page saved successfully!');
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      draft: { icon: Clock, color: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' },
      review: { icon: AlertTriangle, color: 'bg-orange-500/20 text-orange-700 border-orange-500/30' },
      published: { icon: CheckCircle, color: 'bg-green-500/20 text-green-700 border-green-500/30' }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <Icon className="w-3 h-3" />
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  const canPublish = userRole === 'admin' || userRole === 'moderator';
  const canEdit = userRole === 'admin' || userRole === 'moderator' || userRole === 'editor';

  if (!isEditing) {
    return (
      <Card className="min-h-[400px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-2xl font-medium">{page.title}</CardTitle>
            {getStatusBadge()}
          </div>
          {/* Removed in-content Edit and History buttons here */}
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <MarkdownRenderer content={page.content} />
          </div>
          <div className="mt-8 pt-4 border-t text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span>Last updated: {page.updatedAt}</span>
                <span>By: {page.authorName}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-h-[400px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-medium bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 py-1"
            placeholder="Page title..."
          />
          {canPublish && (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'review' | 'published')}
              className="text-sm border rounded px-2 py-1 bg-background"
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
            </select>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={onToggleEdit} variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Content (Markdown)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoSave"
                    checked={autoSaveEnabled}
                    onChange={(e) => onAutoSaveToggle(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="autoSave" className="text-xs text-muted-foreground">
                    Auto-save
                  </label>
                </div>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# Welcome to your page

Write your content here using **markdown** syntax.

## Features
- Feature 1
- Feature 2
- Feature 3

### Code Example
\`\`\`javascript
console.log('Hello Nordics!');
\`\`\`"
                className="min-h-[400px] font-mono text-sm resize-none"
              />
              {hasUnsavedChanges && (
                <div className="text-sm text-muted-foreground">
                  ⚠️ You have unsaved changes
                </div>
              )}
              {lastSaved && (
                <div className="text-xs text-muted-foreground">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-4">
            <div className="prose prose-sm max-w-none min-h-[400px] border rounded-lg p-4">
              <MarkdownRenderer content={content} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WikiEditor; 