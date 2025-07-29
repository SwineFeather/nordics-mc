import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit3, Trash2, Copy, Download, Upload, Settings, FileText, Move, Save } from 'lucide-react';
import { WikiPage } from '@/types/wiki';
import { toast } from 'sonner';

interface PageSettingsProps {
  page: WikiPage;
  onDelete: (pageId: string) => void;
  onRename: (pageId: string, newTitle: string) => void;
  onMove: (pageId: string, newCategory: string) => void;
  onDuplicate: (page: WikiPage) => void;
  onExport: (page: WikiPage) => void;
  onImport: (file: File) => void;
  onUpdateSettings: (pageId: string, settings: Partial<WikiPage>) => void;
}

const PageSettings: React.FC<PageSettingsProps> = ({
  page,
  onDelete,
  onRename,
  onMove,
  onDuplicate,
  onExport,
  onImport,
  onUpdateSettings
}) => {
  const [deleted, setDeleted] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  // Form states
  const [newTitle, setNewTitle] = useState(page.title);
  const [newCategory, setNewCategory] = useState(page.category || '');
  const [newStatus, setNewStatus] = useState<'published' | 'draft' | 'review'>(page.status || 'published');
  const [newDescription, setNewDescription] = useState(page.description || '');
  const [isPublic, setIsPublic] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [allowEdits, setAllowEdits] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDelete = () => {
    onDelete(page.id);
    setDeleted(true);
    toast.success('Page deleted successfully!');
  };

  const handleRename = () => {
    if (newTitle.trim()) {
      onRename(page.id, newTitle.trim());
      setShowRenameDialog(false);
      toast.success('Page renamed successfully!');
    }
  };

  const handleMove = () => {
    if (newCategory.trim()) {
      onMove(page.id, newCategory.trim());
      setShowMoveDialog(false);
      toast.success('Page moved successfully!');
    }
  };

  const handleDuplicate = () => {
    onDuplicate(page);
    toast.success('Page duplicated successfully!');
  };

  const handleExport = () => {
    onExport(page);
    toast.success('Page exported successfully!');
  };

  const handleImport = () => {
    if (selectedFile) {
      onImport(selectedFile);
      setShowImportDialog(false);
      setSelectedFile(null);
      toast.success('Page imported successfully!');
    }
  };

  const handleSaveSettings = () => {
    onUpdateSettings(page.id, {
      status: newStatus,
      description: newDescription,
      // Add other settings as needed
    });
    setShowSettingsDialog(false);
    toast.success('Page settings updated!');
  };

  if (deleted) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">This page has been deleted.</p>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Page Management</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowRenameDialog(true)}>
            <Edit3 className="h-4 w-4 mr-2" />
            Rename Page
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setShowMoveDialog(true)}>
            <Move className="h-4 w-4 mr-2" />
            Move Page
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate Page
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Page
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setShowImportDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import Page
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowSettingsDialog(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Page Settings
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Page
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newTitle">New Title</Label>
              <Input
                id="newTitle"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter new page title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newCategory">New Category</Label>
              <Input
                id="newCategory"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category path (e.g., guides/tutorials)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMove}>Move</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Page Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={(value: 'published' | 'draft' | 'review') => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Enter page description"
                rows={3}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="public">Public Page</Label>
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="comments">Allow Comments</Label>
                <Switch
                  id="comments"
                  checked={allowComments}
                  onCheckedChange={setAllowComments}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="edits">Allow Edits</Label>
                <Switch
                  id="edits"
                  checked={allowEdits}
                  onCheckedChange={setAllowEdits}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Select Markdown File</Label>
              <Input
                id="file"
                type="file"
                accept=".md,.markdown"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!selectedFile}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PageSettings; 