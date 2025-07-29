
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Eye, Code, Save, AlertTriangle, CheckCircle, Plus, FolderPlus, FileText, RefreshCw, Download, Upload } from 'lucide-react';
import { WikiSummary, WikiCategory, WikiPage } from '@/types/wiki';
import { parseSummaryMd, generateSummaryMd, SummaryTreeNode } from '@/utils/summaryParser';
import { summarySyncService } from '@/services/summarySyncService';
import { toast } from 'sonner';

interface SummaryEditorProps {
  wikiData: WikiSummary;
  onStructureUpdate?: (newCategories: any[]) => void;
  onRefreshData?: () => void;
}

const SummaryEditor = ({ wikiData, onStructureUpdate, onRefreshData }: SummaryEditorProps) => {
  const [summaryContent, setSummaryContent] = useState('');
  const [activeTab, setActiveTab] = useState('editor');
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewNodes, setPreviewNodes] = useState<SummaryTreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal states
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [selectedCategoryForPage, setSelectedCategoryForPage] = useState<string>('');
  
  // Form states
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageContent, setNewPageContent] = useState('');

  // Load current SUMMARY.md content on component mount
  useEffect(() => {
    loadCurrentSummaryContent();
  }, []);

  const loadCurrentSummaryContent = async () => {
    setIsLoading(true);
    try {
      const content = await summarySyncService.getCurrentSummaryContent();
      setSummaryContent(content);
      handleContentChange(content);
    } catch (error) {
      console.error('Failed to load SUMMARY.md content:', error);
      // Fallback to generating from current wiki data
      const fallbackContent = generateSummaryMd(wikiData.categories);
      setSummaryContent(fallbackContent);
      // Convert WikiCategory[] to SummaryTreeNode[] for preview
      const fallbackNodes = convertCategoriesToNodes(wikiData.categories);
      setPreviewNodes(fallbackNodes);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = (value: string) => {
    setSummaryContent(value);
    
    // Try to parse and show preview
    try {
      const newNodes = parseSummaryMd(value);
      setPreviewNodes(newNodes);
      setParseError(null);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Parse error');
    }
  };

  // Helper function to convert WikiCategory[] to SummaryTreeNode[]
  const convertCategoriesToNodes = (categories: WikiCategory[]): SummaryTreeNode[] => {
    return categories.map(cat => ({
      id: cat.id,
      type: 'category' as const,
      title: cat.title,
      slug: cat.slug,
      description: cat.description,
      order: cat.order,
      level: 2,
      children: cat.pages.map(page => ({
        id: page.id,
        type: 'page' as const,
        title: page.title,
        slug: page.slug,
        order: page.order,
        level: 3,
        children: [],
        parentId: cat.id
      }))
    }));
  };

  const handleSave = async () => {
    if (parseError) {
      toast.error('Cannot save with parse errors. Please fix the SUMMARY.md format.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await summarySyncService.updateSummaryContent(summaryContent);
      
      if (result.success) {
        // Refresh the wiki data
        onRefreshData?.();
        toast.success('SUMMARY.md updated and synced successfully!');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Failed to save SUMMARY.md:', error);
      toast.error(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    await loadCurrentSummaryContent();
    toast.info('Reset to current wiki structure');
  };

  const handleSyncFromDatabase = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Starting sync from database...');
      const result = await summarySyncService.syncToSummary();
      console.log('📊 Sync result:', result);
      
      if (result.success && result.summaryContent) {
        setSummaryContent(result.summaryContent);
        handleContentChange(result.summaryContent);
        toast.success('Synced from database successfully!');
        console.log('✅ SUMMARY.md content loaded:', result.summaryContent.substring(0, 200) + '...');
      } else {
        console.error('❌ Sync failed:', result.message);
        toast.error(result.message);
      }
    } catch (error) {
      console.error('❌ Failed to sync from database:', error);
      toast.error(`Failed to sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncToDatabase = async () => {
    if (parseError) {
      toast.error('Cannot sync with parse errors. Please fix the SUMMARY.md format.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await summarySyncService.syncFromSummary(summaryContent);
      
      if (result.success) {
        // Refresh the wiki data
        onRefreshData?.();
        toast.success('Synced to database successfully!');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Failed to sync to database:', error);
      toast.error(`Failed to sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Recursive function to render tree nodes
  const renderTreeNode = (node: SummaryTreeNode, depth: number = 0) => {
    const indent = depth * 16; // 16px per level
    
    return (
      <div key={node.id} style={{ marginLeft: `${indent}px` }}>
        <div className="flex items-center gap-2 py-1">
          {node.type === 'category' ? (
            <>
              <span className="text-primary font-medium">📁 {node.title}</span>
              <Badge variant="outline" className="text-xs">
                category
              </Badge>
            </>
          ) : (
            <>
              <span className="text-muted-foreground">📄 {node.title}</span>
              <Badge variant="outline" className="text-xs">
                {node.slug}
              </Badge>
            </>
          )}
        </div>
        {node.description && (
          <div className="text-sm text-muted-foreground ml-4 mb-2">
            {node.description}
          </div>
        )}
        {node.children && node.children.length > 0 && (
          <div className="ml-4">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleAddCategory = () => {
    if (!newCategoryTitle.trim()) {
      toast.error('Category title is required');
      return;
    }

    const newCategory: SummaryTreeNode = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'category',
      title: newCategoryTitle,
      slug: generateSlug(newCategoryTitle),
      description: newCategoryDescription,
      order: previewNodes.length,
      level: 2,
      children: []
    };

    const updatedNodes = [...previewNodes, newCategory];
    const newSummaryContent = generateSummaryMd(updatedNodes);
    
    setSummaryContent(newSummaryContent);
    setPreviewNodes(updatedNodes);
    setNewCategoryTitle('');
    setNewCategoryDescription('');
    setShowAddCategoryModal(false);
    
    toast.success(`Category "${newCategoryTitle}" added successfully!`);
  };

  const handleAddPage = () => {
    if (!newPageTitle.trim() || !selectedCategoryForPage) {
      toast.error('Page title and category are required');
      return;
    }

    const categoryIndex = previewNodes.findIndex(cat => cat.id === selectedCategoryForPage);
    if (categoryIndex === -1) {
      toast.error('Selected category not found');
      return;
    }

    const newPage: SummaryTreeNode = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'page',
      title: newPageTitle,
      slug: generateSlug(newPageTitle),
      order: previewNodes[categoryIndex].children.length,
      level: 3,
      children: [],
      parentId: selectedCategoryForPage
    };

    const updatedNodes = [...previewNodes];
    updatedNodes[categoryIndex].children.push(newPage);
    
    const newSummaryContent = generateSummaryMd(updatedNodes);
    
    setSummaryContent(newSummaryContent);
    setPreviewNodes(updatedNodes);
    setNewPageTitle('');
    setNewPageContent('');
    setSelectedCategoryForPage('');
    setShowAddPageModal(false);
    
    toast.success(`Page "${newPageTitle}" added successfully!`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            SUMMARY.md Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !!parseError}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save & Sync
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleSyncFromDatabase}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Load from DB
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleSyncToDatabase}
              disabled={isSaving || !!parseError}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Sync to DB
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              <div className="flex gap-2">
                <Dialog open={showAddCategoryModal} onOpenChange={setShowAddCategoryModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <FolderPlus className="w-4 h-4" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="categoryTitle">Category Title</Label>
                        <Input
                          id="categoryTitle"
                          value={newCategoryTitle}
                          onChange={(e) => setNewCategoryTitle(e.target.value)}
                          placeholder="Enter category title..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="categoryDescription">Description (optional)</Label>
                        <Textarea
                          id="categoryDescription"
                          value={newCategoryDescription}
                          onChange={(e) => setNewCategoryDescription(e.target.value)}
                          placeholder="Enter category description..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddCategory}>Add Category</Button>
                        <Button variant="outline" onClick={() => setShowAddCategoryModal(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showAddPageModal} onOpenChange={setShowAddPageModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Add Page
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Page</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="pageTitle">Page Title</Label>
                        <Input
                          id="pageTitle"
                          value={newPageTitle}
                          onChange={(e) => setNewPageTitle(e.target.value)}
                          placeholder="Enter page title..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="pageCategory">Category</Label>
                        <select
                          id="pageCategory"
                          value={selectedCategoryForPage}
                          onChange={(e) => setSelectedCategoryForPage(e.target.value)}
                          className="w-full p-2 border rounded"
                        >
                          <option value="">Select a category...</option>
                          {previewNodes.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="pageContent">Initial Content (optional)</Label>
                        <Textarea
                          id="pageContent"
                          value={newPageContent}
                          onChange={(e) => setNewPageContent(e.target.value)}
                          placeholder="Enter initial content..."
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddPage}>Add Page</Button>
                        <Button variant="outline" onClick={() => setShowAddPageModal(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Textarea
                value={summaryContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="# Summary

## Category Name
Brief description

* [Page Title](page-slug)
* [Another Page](another-page)

## Another Category
* [Some Page](some-page)"
              />

              {parseError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Parse Error:</strong> {parseError}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/20">
                <h4 className="font-medium mb-4">Preview of Wiki Structure</h4>
                {previewNodes.length === 0 ? (
                  <p className="text-muted-foreground">No categories to preview</p>
                ) : (
                  <div className="space-y-4">
                    {previewNodes.map(node => renderTreeNode(node))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          <strong>SUMMARY.md Sync Features:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• <strong>Bidirectional Sync:</strong> Changes in SUMMARY.md hide/show items in the wiki</li>
            <li>• <strong>Position Control:</strong> Reorder items by changing their position in SUMMARY.md</li>
            <li>• <strong>Auto-Sync:</strong> Wiki changes automatically update SUMMARY.md</li>
            <li>• <strong>Visibility Control:</strong> Items not in SUMMARY.md become invisible but not deleted</li>
            <li>• <strong>Format:</strong> Use GitBook-style SUMMARY.md format with ## for categories and * [Title](slug) for pages</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Comprehensive Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            SUMMARY.md Format Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">📝 Basic Structure</h4>
            <div className="bg-muted p-3 rounded font-mono text-sm">
              <div># Summary</div>
              <div className="mt-2">## Category Name</div>
              <div className="text-muted-foreground">Brief description of the category</div>
              <div className="mt-1">* [Page Title](page-slug)</div>
              <div>* [Another Page](another-page)</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">📂 Nested Categories</h4>
            <div className="bg-muted p-3 rounded font-mono text-sm">
              <div>## Main Category</div>
              <div>* [Main Page](main-page)</div>
              <div className="mt-2">### Subcategory</div>
              <div className="text-muted-foreground">  Description of subcategory</div>
              <div className="mt-1">* [Sub Page](sub-page)</div>
              <div className="mt-2">#### Sub-subcategory</div>
              <div>* [Deep Page](deep-page)</div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Use <code>##</code> for main categories, <code>###</code> for subcategories, <code>####</code> for sub-subcategories, etc.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">🎯 Page Links</h4>
            <div className="bg-muted p-3 rounded font-mono text-sm">
              <div>* [Page Title](page-slug)</div>
              <div>* [Welcome to the Wiki](welcome)</div>
              <div>* [Getting Started Guide](getting-started)</div>
              <div>* [Advanced Topics](advanced-topics)</div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              The format is <code>* [Display Name](url-slug)</code>. The slug should match the page's URL.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">📋 Descriptions</h4>
            <div className="bg-muted p-3 rounded font-mono text-sm">
              <div>## Getting Started</div>
              <div className="text-muted-foreground">Essential information for new users</div>
              <div className="mt-1">* [Welcome](welcome)</div>
              <div>* [Quick Start](quick-start)</div>
              <div className="mt-2">## Advanced Topics</div>
              <div className="text-muted-foreground">For experienced users who want to dive deeper</div>
              <div className="mt-1">* [Advanced Guide](advanced-guide)</div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Add descriptions under category headers to provide context.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">🔄 How Sync Works</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-medium">• Save & Sync:</span>
                <span>Applies SUMMARY.md changes to the wiki database</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">• Load from DB:</span>
                <span>Generates SUMMARY.md from current wiki structure</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">• Sync to DB:</span>
                <span>Same as Save & Sync - applies SUMMARY.md to database</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">• Reset:</span>
                <span>Reverts to current wiki structure</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">👁️ Visibility Control</h4>
            <div className="space-y-2 text-sm">
              <div>• <strong>Items in SUMMARY.md:</strong> Visible in the wiki</div>
              <div>• <strong>Items not in SUMMARY.md:</strong> Hidden (not deleted)</div>
              <div>• <strong>Reorder in SUMMARY.md:</strong> Changes position in wiki</div>
              <div>• <strong>Create in wiki:</strong> Automatically adds to SUMMARY.md</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">💡 Tips & Best Practices</h4>
            <div className="space-y-2 text-sm">
              <div>• Use descriptive category names and page titles</div>
              <div>• Keep slugs simple and URL-friendly (lowercase, hyphens)</div>
              <div>• Add descriptions to help users understand categories</div>
              <div>• Use nested categories to organize related content</div>
              <div>• Test your SUMMARY.md with the Preview tab</div>
              <div>• Save frequently to avoid losing changes</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">🚨 Common Issues</h4>
            <div className="space-y-2 text-sm">
              <div>• <strong>Parse Error:</strong> Check for proper formatting (## for categories, * [Title](slug) for pages)</div>
              <div>• <strong>Pages not showing:</strong> Make sure they're listed in SUMMARY.md</div>
              <div>• <strong>Wrong order:</strong> Reorder items in SUMMARY.md to change wiki order</div>
              <div>• <strong>Sync not working:</strong> Check browser console for errors</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryEditor;
