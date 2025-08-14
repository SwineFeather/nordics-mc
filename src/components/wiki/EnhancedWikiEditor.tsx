import React, { useState, useEffect, useCallback, forwardRef, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Save, 
  Eye, 
  Edit3, 
  History, 
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Bold,
  Italic,
  Code,
  Link,
  Image,
  Table,
  List,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Upload,
  Settings,
  Palette,
  FileText,
  Sparkles
} from 'lucide-react';
import { WikiPage, UserRole } from '@/types/wiki';
import SimpleMarkdownRenderer from '@/components/SimpleMarkdownRenderer';
import MediaUploader from '@/components/wiki/MediaUploader';
import TableEditor from '@/components/wiki/TableEditor';
import { toast } from 'sonner';

interface EnhancedWikiEditorProps {
  page: WikiPage;
  userRole: UserRole;
  isEditing: boolean;
  onSave: (updates: Partial<WikiPage>) => Promise<void>;
  onToggleEdit: () => void;
  autoSaveEnabled: boolean;
  onAutoSaveToggle: (enabled: boolean) => void;
}

// Update ToolbarButton to accept 'icon' as a prop:
type ToolbarButtonProps = React.ComponentPropsWithoutRef<typeof Button> & {
  icon: React.ReactNode;
};

const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ icon, ...props }, ref) => (
  <Button
      ref={ref}
    variant="ghost"
    size="sm"
    className="h-8 w-8 p-0"
      {...props}
  >
    {icon}
  </Button>
  )
);
ToolbarButton.displayName = 'ToolbarButton';

const EnhancedWikiEditor: React.FC<EnhancedWikiEditorProps> = ({
  page,
  userRole,
  isEditing,
  onSave,
  onToggleEdit,
  autoSaveEnabled,
  onAutoSaveToggle
}) => {
  const [content, setContent] = useState(page.content);
  const [title, setTitle] = useState(page.title);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [showTableEditor, setShowTableEditor] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const [previousPageId, setPreviousPageId] = useState(page.id);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canEdit = userRole === 'admin' || userRole === 'moderator' || userRole === 'member';

  // Reset local state when page changes or when page content is updated (after save)
  useEffect(() => {
    // Reset if the page ID changed (new page selected) or if content was updated externally
    if (page.id !== previousPageId) {
      setContent(page.content);
      setTitle(page.title);
      setHasUnsavedChanges(false);
      setPreviousPageId(page.id);
    }
  }, [page.id, page.content, page.title, previousPageId]);

  useEffect(() => {
    const hasChanges = content !== page.content || title !== page.title;
    setHasUnsavedChanges(hasChanges);
  }, [content, title, page.content, page.title]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !autoSaveEnabled) return;
    try {
      await onSave({ title, content });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [hasUnsavedChanges, autoSaveEnabled, onSave, content, title]);

  useEffect(() => {
    if (!autoSaveEnabled || !isEditing || !hasUnsavedChanges) return;
    const interval = setInterval(autoSave, 30000); // Auto-save every 30 seconds
    return () => clearInterval(interval);
  }, [autoSaveEnabled, isEditing, autoSave, hasUnsavedChanges]);

  const handleSave = async () => {
    if (!hasUnsavedChanges) return;
    setIsSaving(true);
    try {
      console.log('💾 Saving content:', { title, contentLength: content.length });
      await onSave({ title, content });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      toast.success('Page saved successfully!');
    } catch (error) {
      console.error('Failed to save page:', error);
      toast.error('Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  // Warn user about unsaved changes
  useEffect(() => {
    if (!isEditing) return;
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isEditing]);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isEditing]);

  const getStatusBadge = () => {
    switch (page.status) {
      case 'published':
        return <Badge className="bg-green-500">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'review':
        return <Badge className="bg-yellow-500">Review</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Text insertion helpers
  const insertText = (text: string, before = '', after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    setContent(newText);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = content.substring(0, start) + text + content.substring(start);
    setContent(newText);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const toolbarActions = {
    bold: () => insertText('**', '**', '**'),
    italic: () => insertText('*', '*', '*'),
    code: () => insertText('`', '`', '`'),
    codeBlock: () => insertAtCursor('\n```\n\n```\n'),
    link: () => insertText('[', '](url)', ''),
    image: () => insertText('![', '](url)', ''),
    heading1: () => insertAtCursor('\n# '),
    heading2: () => insertAtCursor('\n## '),
    heading3: () => insertAtCursor('\n### '),
    list: () => insertAtCursor('\n- '),
    numberedList: () => insertAtCursor('\n1. '),
    quote: () => insertAtCursor('\n> '),
    horizontalRule: () => insertAtCursor('\n---\n'),
  };

  const handleMediaInsert = (markdown: string) => {
    insertAtCursor(markdown);
    setShowMediaUploader(false);
  };

  const handleTableInsert = (markdown: string) => {
    insertAtCursor('\n' + markdown + '\n');
    setShowTableEditor(false);
  };

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
          <SimpleMarkdownRenderer content={content} />
          <div className="mt-8 pt-4 border-t text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span>Last updated: {page.updatedAt}</span>
                <span>By: {page.authorName}</span>
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    Unsaved Changes
                  </Badge>
                )}
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
          <CardTitle className="text-2xl font-medium">{page.title}</CardTitle>
          {getStatusBadge()}
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={onToggleEdit} variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
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
              {/* Enhanced Toolbar */}
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg border">
                <div className="flex items-center space-x-1">
                  <ToolbarButton
                    icon={<Bold className="w-4 h-4" />}
                    onClick={toolbarActions.bold}
                    title="Bold"
                  />
                  <ToolbarButton
                    icon={<Italic className="w-4 h-4" />}
                    onClick={toolbarActions.italic}
                    title="Italic"
                  />
                  <ToolbarButton
                    icon={<Code className="w-4 h-4" />}
                    onClick={toolbarActions.code}
                    title="Inline Code"
                  />
                  <div className="w-px h-6 bg-border mx-2" />
                  <ToolbarButton
                    icon={<Heading1 className="w-4 h-4" />}
                    onClick={toolbarActions.heading1}
                    title="Heading 1"
                  />
                  <ToolbarButton
                    icon={<Heading2 className="w-4 h-4" />}
                    onClick={toolbarActions.heading2}
                    title="Heading 2"
                  />
                  <ToolbarButton
                    icon={<Heading3 className="w-4 h-4" />}
                    onClick={toolbarActions.heading3}
                    title="Heading 3"
                  />
                  <div className="w-px h-6 bg-border mx-2" />
                  <ToolbarButton
                    icon={<List className="w-4 h-4" />}
                    onClick={toolbarActions.list}
                    title="Bullet List"
                  />
                  <ToolbarButton
                    icon={<Quote className="w-4 h-4" />}
                    onClick={toolbarActions.quote}
                    title="Quote"
                  />
                  <div className="w-px h-6 bg-border mx-2" />
                  <Dialog open={showMediaUploader} onOpenChange={setShowMediaUploader}>
                    <DialogTrigger asChild>
                      <ToolbarButton
                        icon={<Upload className="w-4 h-4" />}
                        onClick={() => {}}
                        title="Upload Media"
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Upload Media</DialogTitle>
                      </DialogHeader>
                      <MediaUploader onInsertMedia={handleMediaInsert} />
                    </DialogContent>
                  </Dialog>
                  <Dialog open={showTableEditor} onOpenChange={setShowTableEditor}>
                    <DialogTrigger asChild>
                      <ToolbarButton
                        icon={<Table className="w-4 h-4" />}
                        onClick={() => {}}
                        title="Insert Table"
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Table Editor</DialogTitle>
                      </DialogHeader>
                      <TableEditor onInsertTable={handleTableInsert} />
                    </DialogContent>
                  </Dialog>
                </div>
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

              {/* Editor */}
              <div className="mb-4">
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Page Title"
                  className="w-full text-2xl font-bold mb-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => {
                  // Ensure the textarea is properly focused
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
                placeholder="# Welcome to your page

Write your content here using **markdown** syntax.

## Features
- Enhanced markdown rendering
- Syntax highlighting for code blocks
- Media upload and management
- Table editor with visual interface
- Special blockquote types (⚠️ !warning, ℹ️ !info, 💡 !tip, 🚨 !danger)

### Code Example
\`\`\`javascript
console.log('Hello Nordics!');
\`\`\`

### Special Blockquotes
> ⚠️ This is a warning message
> ℹ️ This is an info message  
> 💡 This is a tip
> 🚨 This is a danger message"
                className="min-h-[500px] font-mono text-sm resize-none"
              />
              
              {/* Status Bar */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  {hasUnsavedChanges && (
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Unsaved changes</span>
                    </div>
                  )}
                  {lastSaved && (
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span>{content.length} characters</span>
                  <span>•</span>
                  <span>{content.split('\n').length} lines</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-4">
            <div className="prose prose-sm max-w-none min-h-[500px] max-h-[600px] border rounded-lg p-4 overflow-y-auto">
              <SimpleMarkdownRenderer content={content} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedWikiEditor; 