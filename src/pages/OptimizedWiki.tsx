import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useOptimizedWikiData } from '../hooks/useOptimizedWikiData';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  Search, Plus, BookOpen, Users, Calendar, Edit3, FolderOpen, FileText, RefreshCw, AlertCircle, Save, X,
  MessageSquare, History, Upload, Settings, GitMerge, CheckCircle, Clock, User, MoreHorizontal, ChevronDown, ChevronRight,
  Loader2
} from 'lucide-react';
import PageSettings from '../components/wiki/PageSettings';
import { formatDistanceToNow } from 'date-fns';
import { WikiPage, UserRole, getRolePermissions } from '../types/wiki';
import SimpleMarkdownRenderer from '../components/SimpleMarkdownRenderer';

const OptimizedWiki: React.FC = () => {
  const { user, profile } = useAuth();
  const userRole = (profile?.role as UserRole) || 'member';
  const permissions = getRolePermissions(userRole);
  
  const { 
    categories, 
    loading, 
    error, 
    refreshData,
    getPageByPath,
    searchPages,
    getFileContent,
    loadPageContent
  } = useOptimizedWikiData();

  // Basic state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [pageContent, setPageContent] = useState<string>('');
  const [loadingPageContent, setLoadingPageContent] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Flatten all pages from all categories
  const allPages = categories.flatMap(category => 
    category.pages?.map(page => ({
      ...page,
      categoryName: category.title,
      categorySlug: category.slug
    })) || []
  );

  // Filter pages based on search query
  const filteredPages = allPages.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load page content when a page is selected
  const handlePageSelect = useCallback(async (page: WikiPage) => {
    setSelectedPage(page);
    setPageContent(''); // Clear previous content
    
    if (page.content) {
      // If page already has content, use it
      setPageContent(page.content);
    } else {
      // Load content on-demand
      setLoadingPageContent(true);
      try {
        const content = await loadPageContent(page.id);
        if (content) {
          setPageContent(content);
          // Update the page object with content
          page.content = content;
        }
      } catch (error) {
        console.error('Failed to load page content:', error);
        setPageContent('# Error Loading Content\n\nUnable to load the page content. Please try again.');
      } finally {
        setLoadingPageContent(false);
      }
    }
  }, [loadPageContent]);

  const handleRefresh = async () => {
    try {
      await refreshData();
      // Clear selected page when refreshing
      setSelectedPage(null);
      setPageContent('');
    } catch (error) {
      console.error('Failed to refresh:', error);
    }
  };

  // Page Settings Handlers
  const handleDeletePage = async (pageId: string) => {
    if (!selectedPage) return;
    
    try {
      console.log('Deleting page:', pageId);
      setSelectedPage(null);
      setPageContent('');
    } catch (error) {
      console.error('Failed to delete page:', error);
      throw error;
    }
  };

  const handleRenamePage = async (pageId: string, newTitle: string) => {
    if (!selectedPage) return;
    
    try {
      const updatedPage = { ...selectedPage, title: newTitle };
      setSelectedPage(updatedPage);
      console.log('Renaming page:', pageId, 'to:', newTitle);
    } catch (error) {
      console.error('Failed to rename page:', error);
      throw error;
    }
  };

  const handleMovePage = async (pageId: string, newCategory: string) => {
    if (!selectedPage) return;
    
    try {
      const updatedPage = { ...selectedPage, category: newCategory };
      setSelectedPage(updatedPage);
      console.log('Moving page:', pageId, 'to category:', newCategory);
    } catch (error) {
      console.error('Failed to move page:', error);
      throw error;
    }
  };

  const handleDuplicatePage = async (page: WikiPage) => {
    try {
      const duplicatePage: WikiPage = {
        ...page,
        id: `${page.id}-copy-${Date.now()}`,
        title: `${page.title} (Copy)`,
        slug: `${page.slug}-copy`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log('Duplicating page:', page.id);
      handlePageSelect(duplicatePage);
    } catch (error) {
      console.error('Failed to duplicate page:', error);
      throw error;
    }
  };

  const handleExportPage = async (page: WikiPage) => {
    try {
      const content = `# ${page.title}\n\n${pageContent}`;
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${page.slug}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export page:', error);
      throw error;
    }
  };

  const handleImportPage = async (file: File) => {
    try {
      const content = await file.text();
      console.log('Importing page from file:', file.name);
    } catch (error) {
      console.error('Failed to import page:', error);
      throw error;
    }
  };

  const handleUpdatePageSettings = async (pageId: string, settings: Partial<WikiPage>) => {
    if (!selectedPage) return;
    
    try {
      const updatedPage = { ...selectedPage, ...settings };
      setSelectedPage(updatedPage);
      console.log('Updating page settings:', pageId, settings);
    } catch (error) {
      console.error('Failed to update page settings:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading wiki structure...</p>
            <p className="text-xs text-muted-foreground mt-2">
              Loading file structure only (fast loading)
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Wiki</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRefresh}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Wiki
          </h1>
          <p className="text-muted-foreground mt-1">
            Fast-loading wiki with on-demand content
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {sidebarCollapsed ? 'Expand' : 'Collapse'}
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-64' : 'w-80'} transition-all duration-300`}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <Input
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8"
                />
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <FolderOpen className="h-4 w-4" />
                      {category.title}
                      <Badge variant="secondary" className="ml-auto">
                        {category.pages?.length || 0}
                      </Badge>
                    </div>
                    
                    <div className="ml-4 space-y-1">
                      {category.pages
                        ?.filter(page => 
                          !searchQuery || 
                          page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          category.title.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((page) => (
                          <button
                            key={page.id}
                            onClick={() => handlePageSelect(page)}
                            className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                              selectedPage?.id === page.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="truncate">{page.title}</span>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {searchQuery && filteredPages.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No pages found matching "{searchQuery}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {selectedPage ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedPage.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {selectedPage.authorName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDistanceToNow(new Date(selectedPage.updatedAt), { addSuffix: true })}
                      </div>
                                           <div className="flex items-center gap-1">
                       <FolderOpen className="h-4 w-4" />
                       {selectedPage.category}
                     </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedPage.status === 'published' ? 'default' : 'secondary'}>
                      {selectedPage.status}
                    </Badge>
                    
                    {/* Page Settings */}
                    {user && selectedPage && (
                      <PageSettings
                        page={selectedPage}
                        onDelete={handleDeletePage}
                        onRename={handleRenamePage}
                        onMove={handleMovePage}
                        onDuplicate={handleDuplicatePage}
                        onExport={handleExportPage}
                        onImport={handleImportPage}
                        onUpdateSettings={handleUpdatePageSettings}
                      />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {loadingPageContent ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading page content...</p>
                    </div>
                  </div>
                ) : pageContent ? (
                  <div className="prose prose-sm max-w-none">
                    <SimpleMarkdownRenderer content={pageContent} />
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No content available for this page</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Welcome to the Wiki</h3>
                  <p className="text-muted-foreground mb-4">
                    Select a page from the sidebar to start reading
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>✅ Fast loading - only structure loaded initially</p>
                    <p>📄 Content loads on-demand when you open pages</p>
                    <p>🔍 Search through page titles and categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptimizedWiki; 