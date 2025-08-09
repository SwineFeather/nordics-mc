
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSupabaseWikiData } from '../hooks/useSupabaseWikiData';
import { useWikiCollaboration } from '../hooks/useWikiCollaboration';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Search, Plus, BookOpen, Users, Calendar, Edit3, FolderOpen, FileText, RefreshCw, AlertCircle, Save, X,
  MessageSquare, History, Upload, Settings, GitMerge, CheckCircle, Clock, User, MoreHorizontal, ChevronDown, ChevronRight, Menu
} from 'lucide-react';
import PageSettings from '../components/wiki/PageSettings';
import { formatDistanceToNow } from 'date-fns';
import { WikiPage, UserRole, getRolePermissions } from '../types/wiki';
import { toast } from 'sonner';

// Import advanced wiki components
import OptimizedWikiSidebar from '../components/wiki/OptimizedWikiSidebar';
import EnhancedWikiEditor from '../components/wiki/EnhancedWikiEditor';
import Comments from '../components/wiki/Comments';
import SuggestedEdits from '../components/wiki/SuggestedEdits';
import PageHistory from '../components/wiki/PageHistory';
import BreadcrumbNavigation from '../components/wiki/BreadcrumbNavigation';
import SimpleMarkdownRenderer from '../components/SimpleMarkdownRenderer';
import { SupabaseWikiService } from '../services/supabaseWikiService';
import { supabase } from '../integrations/supabase/client';
import LiveDataIndicator from '../components/wiki/LiveDataIndicator';
import LiveDataContent from '../components/wiki/LiveDataContent';

const Wiki: React.FC = () => {
  const { user, profile } = useAuth();
  const userRole = (profile?.role as UserRole) || 'member';
  const permissions = getRolePermissions(userRole);
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  
  const { 
    categories, 
    fileStructure,
    loading, 
    error, 
    refreshData,
    getPageByPath,
    searchPages,
    getFileContent,
    getFileContentWithMetadata,
    savePage
  } = useSupabaseWikiData();

  // Wiki branch state
  const [currentWikiBranch, setCurrentWikiBranch] = useState('Nordics');
  const [availableBranches, setAvailableBranches] = useState(['Nordics']);

  // Basic state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Advanced features state
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showPageHistory, setShowPageHistory] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [showSuggestEditModal, setShowSuggestEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tocCollapsed, setTocCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tocOpen, setTocOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    status: 'draft' as 'draft' | 'review' | 'published',
    description: ''
  });

  // Collaboration state
  const [editSession, setEditSession] = useState<any>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Live data state
  const [isLiveData, setIsLiveData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>();
  const [isRefreshingLiveData, setIsRefreshingLiveData] = useState(false);
  const [entityData, setEntityData] = useState<any>(null);
  const [entityType, setEntityType] = useState<'town' | 'nation' | null>(null);

  // Use collaboration hook - always call it to follow Rules of Hooks
  const collaboration = useWikiCollaboration(selectedPage?.id || '');

  // Recursive function to flatten all pages from all categories and subcategories
  const flattenAllPages = (cats: any[]): any[] => {
    return cats.flatMap(category => {
      const categoryPages = category.pages?.map((page: any) => ({
        ...page,
        categoryName: category.title,
        categorySlug: category.slug
      })) || [];
      
      const subcategoryPages = category.children ? flattenAllPages(category.children) : [];
      
      return [...categoryPages, ...subcategoryPages];
    });
  };

  // Flatten all pages from all categories
  const allPages = flattenAllPages(categories);

  // Handle URL-based navigation
  useEffect(() => {
    if (slug && categories.length > 0) {
      // Convert URL slug to page path and try multiple matching strategies
      const pagePath = slug.replace(/-/g, '/');
      
      // Try to find the page by multiple strategies
      const findPageByPath = (cats: any[]): WikiPage | null => {
        for (const cat of cats) {
          // Check pages in this category
          for (const page of cat.pages || []) {
            // Try multiple matching strategies
            if (
              page.id === pagePath || 
              page.id.endsWith(`/${pagePath}.md`) ||
              page.slug === slug ||
              page.title.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase() ||
              page.id.toLowerCase().includes(pagePath.toLowerCase()) ||
              page.id.replace(/\//g, '-').replace(/\.md$/, '') === slug
            ) {
              return page;
            }
          }
          // Check subcategories
          if (cat.children) {
            const found = findPageByPath(cat.children);
            if (found) return found;
          }
        }
        return null;
      };
      
      const page = findPageByPath(categories);
      if (page) {
        // Only select if not already selected to avoid flicker
        if (selectedPage?.id !== page.id) {
          handlePageSelect(page);
        }
      } else {
        console.warn(`Page not found for URL slug: ${slug}`);
        
        // Try to find a similar page or redirect to home
        const similarPage = allPages.find(p => 
          p.title.toLowerCase().includes(slug.toLowerCase().replace(/-/g, ' ')) ||
          p.slug.toLowerCase().includes(slug.toLowerCase()) ||
          p.id.toLowerCase().includes(slug.toLowerCase())
        );
        
        if (similarPage) {
          if (selectedPage?.id !== similarPage.id) {
            handlePageSelect(similarPage);
          }
        } else {
          // If no page found, show the first available page or a 404 message
          if (allPages.length > 0) {
            if (selectedPage?.id !== allPages[0].id) {
              handlePageSelect(allPages[0]);
            }
          }
        }
      }
    }
  }, [slug, categories, allPages, navigate, selectedPage]);

  // Auto-select default page when no slug provided
  useEffect(() => {
    if (slug || categories.length === 0 || selectedPage) return;

    const lower = (s: string) => (s || '').trim().toLowerCase();
    const targets = ['nordics-home', 'nordics_home', 'home'];

    const bySlug = allPages.find(p => targets.includes(lower(p.slug as string)));
    const byTitle = allPages.find(p => targets.includes(lower(p.title as string).replace(/\s+/g, '-')) || lower(p.title as string) === 'nordics home');
    const byId = allPages.find(p => lower(p.id) === 'nordics/readme.md');

    const defaultPage = bySlug || byTitle || byId || (allPages.length > 0 ? allPages[0] : null);
    if (defaultPage) {
      handlePageSelect(defaultPage);
    }
  }, [slug, categories, allPages, selectedPage]);

  // Get all available categories recursively for the form
  const getAllCategories = (cats: any[]): any[] => {
    return cats.flatMap(category => {
      const subcategories = category.children ? getAllCategories(category.children) : [];
      return [category, ...subcategories];
    });
  };
  
  const allCategories = getAllCategories(categories);
  
  console.log('📋 All available pages:', allPages.map(p => ({ id: p.id, slug: p.slug, title: p.title, category: p.categoryName })));

  // Filter pages based on search query
  const filteredPages = allPages.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (page as any).categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      toast.success('Wiki data refreshed successfully!');
    } catch (error) {
      console.error('Failed to refresh wiki data:', error);
      toast.error('Failed to refresh wiki data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshLiveData = async () => {
    if (!selectedPage) return;
    
    setIsRefreshingLiveData(true);
    try {
      const filePath = selectedPage.githubPath || selectedPage.id;
      if (filePath) {
        // Always load static content from storage
        const staticContent = await SupabaseWikiService.getStaticFileContent(filePath);

        // Parse frontmatter to determine live sync preference and optional overrides
        const { frontmatter } = SupabaseWikiService.parseFrontmatterPublic(staticContent || '');
        const liveSyncEnabled = String(frontmatter?.live_sync_enabled || '').toLowerCase() === 'true';
        const fmEntityType = (frontmatter?.entity_type || '').toLowerCase();
        const fmEntityName = frontmatter?.entity_name as string | undefined;

        // Update page content with static version
        setSelectedPage({ ...(selectedPage as any), content: staticContent });

        if (liveSyncEnabled) {
          const { LiveWikiDataService } = await import('../services/liveWikiDataService');
          const shouldSync = LiveWikiDataService.shouldUseLiveData(filePath) || !!(fmEntityType && fmEntityName);
          if (shouldSync) {
            const { entityType: detectedType, entityName } = LiveWikiDataService.extractEntityInfo(filePath);
            const finalType = (fmEntityType === 'town' || fmEntityType === 'nation') ? (fmEntityType as 'town' | 'nation') : detectedType;
            const finalName = fmEntityName || entityName;
            if (finalType && finalName) {
              try {
                const liveData = await LiveWikiDataService.getLiveWikiData(finalType, finalName);
                setIsLiveData(true);
                setLastUpdated(liveData.lastUpdated);
                setEntityData(liveData.entityData);
                setEntityType(finalType);
                toast.success('Live data refreshed');
              } catch (error) {
                console.warn('Failed to fetch entity data for compact cards:', error);
                setIsLiveData(false);
                setEntityData(null);
                setEntityType(null);
              }
            }
          } else {
            setIsLiveData(false);
            setEntityData(null);
            setEntityType(null);
          }
        } else {
          // Live sync disabled: ensure UI does not display live cards
          setIsLiveData(false);
          setEntityData(null);
          setEntityType(null);
        }
      }
    } catch (error) {
      console.error('Failed to refresh live data:', error);
      toast.error('Failed to refresh live data');
    } finally {
      setIsRefreshingLiveData(false);
    }
  };

  const handleCreatePage = () => {
    setShowAddPageModal(true);
    setFormData({
      title: '',
      description: '',
      category: '',
      status: 'draft'
    });
  };

  const handleEditPage = (page: WikiPage) => {
    // Set the selected page and enable editing
    setSelectedPage(page);
    setIsEditing(true);
    
    // Start edit session if collaboration is available
    if (collaboration?.startEditSession) {
      collaboration.startEditSession();
    }
  };

  const handleSavePage = async () => {
    if (!formData.title.trim() || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      
      // Create the page path - use the selected category path
      const selectedCategory = categories.find(cat => cat.id === formData.category);
      if (!selectedCategory) {
        toast.error('Selected category not found');
        return;
      }
      
      const fileName = formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const pagePath = `${selectedCategory.id}/${fileName}.md`;
      
      console.log('📝 Creating new page:', pagePath);
      
      // Create initial content with title and description
      const initialContent = `# ${formData.title}

${formData.description ? `> ${formData.description}` : ''}

<!-- Start writing your content here -->
`;
      
      // Save the page to storage
      await savePage(pagePath, initialContent, formData.title);
      
      // Close modal and reset form
      setShowAddPageModal(false);
      setFormData({
        title: '',
        description: '',
        category: '',
        status: 'draft'
      });
      
      // Refresh data to show the new page
      await refreshData();
      
      toast.success('Page created successfully!');
    } catch (error) {
      console.error('Failed to create page:', error);
      toast.error('Failed to create page: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setShowAddPageModal(false);
    setIsCreating(false);
    setIsEditing(false);
    setFormData({
      title: '',
      category: '',
      status: 'draft',
      description: ''
    });
  };

  const handlePageSelect = async (page: WikiPage) => {
    // Avoid redundant work if selecting the same page
    if (selectedPage?.id === page.id) return;

    setSelectedPage(page);
    setActiveTab('content');

    // Update URL only if it changed to avoid route-effect loops
    const urlSlug = page.id.replace(/\//g, '-').replace(/\.md$/, '');
    if (slug !== urlSlug) {
      navigate(`/wiki/${urlSlug}`, { replace: true });
    }

    // Show loading state in the content area (prevents blank flicker)
    setIsRefreshingLiveData(true);

    // Try to load static content, then optionally attach live data depending on setting
    try {
      const filePath = page.githubPath || page.id;
      if (filePath) {
        const staticContent = await SupabaseWikiService.getStaticFileContent(filePath);

        // Update static content first
        setSelectedPage(prev => ({
          ...(prev || page),
          content: staticContent || (prev?.content ?? ''),
        } as WikiPage));

        // Live fetching disabled: ensure live UI is off
        setIsLiveData(false);
        setLastUpdated(undefined);
        setEntityData(null);
        setEntityType(null);
      }
    } catch (error) {
      console.warn('Failed to load live content, using static content:', error);
      setIsLiveData(false);
      setLastUpdated(undefined);
      setEntityData(null);
      setEntityType(null);
    } finally {
      setIsRefreshingLiveData(false);
    }
  };

  const handleEnhancedSave = async (updates: Partial<WikiPage>) => {
    if (!selectedPage) return;
    
    try {
      setIsSaving(true);
      
      console.log('🔍 Debug save - selectedPage:', {
        id: selectedPage.id,
        githubPath: selectedPage.githubPath,
        title: selectedPage.title
      });
      
      // Get the file path from the selected page
      const filePath = selectedPage.id || selectedPage.githubPath;
      if (!filePath) {
        throw new Error('No file path found for the selected page');
      }
      
      console.log('🔍 Debug save - filePath:', filePath);
      
      // Save to Supabase storage bucket
      await SupabaseWikiService.savePage(
        filePath,
        updates.content || selectedPage.content,
        updates.title || selectedPage.title
      );

      // Also save to database to create a revision entry and support history
      try {
        await SupabaseWikiService.savePageToDatabase(
          selectedPage.slug,
          updates.title || selectedPage.title,
          updates.content || selectedPage.content,
          selectedPage.status,
          undefined,
          selectedPage.description,
          selectedPage.tags
        );
      } catch (dbErr) {
        console.warn('Failed to save page to database (revision not recorded):', dbErr);
      }
      
      // Update the selected page with new content and title
      const updatedPage = {
        ...selectedPage,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      setSelectedPage(updatedPage);
      
      // Refresh the data to update the sidebar
      await refreshData();
      
      toast.success('Page saved successfully!');
    } catch (error) {
      console.error('Failed to save page:', error);
      toast.error('Failed to save page: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEdit = () => {
    if (!selectedPage) return;
    
    if (isEditing) {
      setIsEditing(false);
      // End edit session if exists
      if (collaboration?.endEditSession) {
        collaboration.endEditSession(editSession?.id);
      }
    } else {
      // Start edit session
      if (collaboration?.startEditSession) {
        collaboration.startEditSession();
      }
      setIsEditing(true);
    }
  };

  // Handle navigation from sidebar
  const handleNavigate = (pageId: string) => {
    console.log('🔍 Navigating to page ID:', pageId);
    
    // Try to find page by ID first (for nested pages)
    let page = allPages.find(p => p.id === pageId);
    
    // If not found by ID, try to find by slug (for backward compatibility)
    if (!page) {
      page = allPages.find(p => p.slug === pageId);
    }
    
    // If still not found, try to find by path ending
    if (!page) {
      page = allPages.find(p => p.id.endsWith(`/${pageId}.md`));
    }
    
    if (page) {
      console.log('✅ Found page:', page.title, 'with ID:', page.id);
      handlePageSelect(page);
    } else {
      console.warn(`❌ Page not found for ID: ${pageId}`);
      console.log('🔍 Available pages:', allPages.map(p => ({ id: p.id, slug: p.slug, title: p.title })));
    }
  };

  // Handle search change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleWikiBranchChange = (branch: string) => {
    setCurrentWikiBranch(branch);
    // In the future, this could load different wiki content based on the branch
    console.log('🔄 Switching to wiki branch:', branch);
  };

  // Page Settings Handlers
  const handleDeletePage = async (pageId: string) => {
    if (!selectedPage) return;
    
    try {
      // Actually delete from Supabase storage
      await SupabaseWikiService.deletePage(selectedPage.id);
      toast.success('Page deleted from Supabase!');
      setSelectedPage(null);
      await refreshData(); // Refresh categories/pages so sidebar updates
      navigate('/wiki', { replace: true });
    } catch (error) {
      console.error('Failed to delete page:', error);
      toast.error('Failed to delete page from Supabase: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    }
  };

  const handleRenamePage = async (pageId: string, newTitle: string) => {
    if (!selectedPage) return;
    
    try {
      // Update the selected page with new title
      const updatedPage = { ...selectedPage, title: newTitle };
      setSelectedPage(updatedPage);
      
      // In a real implementation, you'd call an API to update the page
      console.log('Renaming page:', pageId, 'to:', newTitle);
    } catch (error) {
      console.error('Failed to rename page:', error);
      throw error;
    }
  };

  const handleMovePage = async (pageId: string, newCategory: string) => {
    if (!selectedPage) return;
    
    try {
      // Update the selected page with new category
      const updatedPage = { ...selectedPage, category: newCategory };
      setSelectedPage(updatedPage);
      
      // In a real implementation, you'd call an API to move the page
      console.log('Moving page:', pageId, 'to category:', newCategory);
    } catch (error) {
      console.error('Failed to move page:', error);
      throw error;
    }
  };

  const handleDuplicatePage = async (page: WikiPage) => {
    try {
      // Create a duplicate page with a new ID and title
      const duplicatePage: WikiPage = {
        ...page,
        id: `${page.id}-copy-${Date.now()}`,
        title: `${page.title} (Copy)`,
        slug: `${page.slug}-copy`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // In a real implementation, you'd call an API to create the duplicate
      console.log('Duplicating page:', page.id);
      
      // Navigate to the new page
      handlePageSelect(duplicatePage);
    } catch (error) {
      console.error('Failed to duplicate page:', error);
      throw error;
    }
  };

  const handleExportPage = async (page: WikiPage) => {
    try {
      // Create a downloadable file with the page content
      const content = `# ${page.title}\n\n${page.content}`;
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
      // Parse the content and create a new page
      // This is a simplified implementation
      console.log('Importing page from file:', file.name);
      
      // In a real implementation, you'd parse the markdown and create a new page
      toast.success('Page imported successfully');
    } catch (error) {
      console.error('Failed to import page:', error);
      throw error;
    }
  };

  const handleUpdatePageSettings = async (pageId: string, settings: Partial<WikiPage>) => {
    if (!selectedPage) return;
    try {
      let filePath = selectedPage.githubPath;
      if (!filePath) {
        const findFilePath = (items: any[]): string | null => {
          for (const item of items) {
            if (item.type === 'file' && item.name === selectedPage.slug + '.md') {
              return item.path;
            }
            if (item.children) {
              const found = findFilePath(item.children);
              if (found) return found;
            }
          }
          return null;
        };
        filePath = findFilePath(fileStructure);
      }
      if (!filePath) {
        throw new Error('Could not find file path for the selected page');
      }

      // Get current content
      let content = selectedPage.content;
      
      // Parse existing frontmatter
      const { frontmatter, markdown } = SupabaseWikiService.parseFrontmatterPublic(content);
      
      // Create new frontmatter object with updated settings
      const newFrontmatter = {
        ...frontmatter,
        ...settings,
        updated_at: new Date().toISOString()
      };
      
      // Convert frontmatter object back to YAML string
      const frontmatterLines = Object.entries(newFrontmatter).map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}: "${value}"`;
        }
        return `${key}: ${value}`;
      });
      
      // Create new content with single frontmatter block
      const newContent = `---\n${frontmatterLines.join('\n')}\n---\n\n${markdown}`;
      
      await SupabaseWikiService.savePage(filePath, newContent, selectedPage.title);
      
      // Update local page state, including content so toggles reflect immediately
      setSelectedPage({ ...selectedPage, ...settings, content: newContent });
      await refreshData();
      
      // Re-evaluate live data after settings change
      await handleRefreshLiveData();
      toast.success('Page settings updated!');
    } catch (error) {
      console.error('Failed to update page settings:', error);
      toast.error('Failed to update page settings: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[420px]">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-muted border-t-primary animate-spin" />
            <h2 className="text-sm font-medium text-foreground">Loading wiki…</h2>
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
              <Button onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Refreshing...
                  </>
                ) : (
                  'Try Again'
                )}
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

  const totalPages = allPages.length;
  const totalCategories = categories.length;

  return (
    <div className="flex h-screen bg-background justify-center">
      {/* A4 Container */}
      <div className="flex h-full max-w-8xl w-full">
        {/* Mobile Sidebar Overlay - removed for now */}
        
        {/* Optimized Sidebar */}
        <div className={`
          ${sidebarCollapsed ? 'w-16' : 'w-80'} 
          transition-all duration-300 flex-shrink-0
          relative z-50
          h-full
        `}>
          <div className="h-full overflow-y-auto bg-background/60 backdrop-blur-sm rounded-lg flex flex-col">
            <OptimizedWikiSidebar
              categories={categories || []}
              selectedSlug={selectedPage?.id || ''}
              onNavigate={(pageId) => {
                handleNavigate(pageId);
                setSidebarOpen(false); // Close sidebar on mobile after navigation
              }}
              onRefreshData={handleRefresh}
              onWikiBranchChange={handleWikiBranchChange}
              loading={loading || false}
              searchQuery={searchQuery || ''}
              onSearchChange={handleSearchChange}
              availableBranches={availableBranches || ['Nordics']}
              currentBranch={currentWikiBranch || 'Nordics'}
            />

          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-background/60 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              {/* Mobile Sidebar Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              {/* Desktop Sidebar Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex"
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              
              {selectedPage && (
                <BreadcrumbNavigation
                  categories={categories}
                  currentPage={selectedPage}
                  onNavigate={(path) => {
                    const page = allPages.find(p => p.slug === path);
                    if (page) handlePageSelect(page);
                  }}
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              {user && permissions.canCreate && (
                <Button
                  size="sm"
                  onClick={handleCreatePage}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Page
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {selectedPage ? (
            <div className="h-full flex">
              {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-hidden px-4 lg:px-12 mr-4">
                {/* Mobile TOC Toggle */}
                <div className="flex justify-end mb-2 lg:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTocOpen(!tocOpen)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    TOC
                  </Button>
                </div>
                {/* Page Header */}
                <div className="border-b p-3 bg-background/40 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="h-5 px-2 text-[11px]">
                          {selectedPage.category}
                        </Badge>
                        {selectedPage.status !== 'published' && (
                          <Badge variant="outline" className="h-5 px-2 text-[11px]">
                            {selectedPage.status}
                          </Badge>
                        )}
                      </div>
                      <h1 className="text-xl font-semibold leading-tight">{selectedPage.title}</h1>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>By {selectedPage.authorName || 'Unknown'}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(selectedPage.createdAt), { addSuffix: true })}</span>
                        {selectedPage.updatedAt !== selectedPage.createdAt && (
                          <>
                            <span>•</span>
                            <span>Updated {formatDistanceToNow(new Date(selectedPage.updatedAt), { addSuffix: true })}</span>
                          </>
                        )}
                      </div>
                    </div>

                      <div className="flex items-center gap-1">

                      
                      {/* Show edit button for all authenticated users during development */}
                      {user && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPageHistory(true)}
                            className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 shadow-sm"
                          >
                            <History className="h-4 w-4 mr-2" />
                            History
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleToggleEdit}
                            className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 shadow-sm"
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            {isEditing ? 'Cancel Edit' : 'Edit'}
                          </Button>

                          {isEditing && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowMediaUploader(true)}
                              className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 shadow-sm"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Media
                            </Button>
                          )}
                        </>
                      )}
                      
                      {user && !isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveTab('suggested-edits');
                              setShowSuggestEditModal(true);
                            }}
                            className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 shadow-sm"
                          >
                            <GitMerge className="h-4 w-4 mr-2" />
                            Suggest Edit
                          </Button>
                      )}
                      
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
                </div>

                {/* Page Content Tabs */}
                <div className="flex-1 overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                      <TabsList className="w-full justify-start border-b rounded-none h-9 gap-1">
                        <TabsTrigger className="h-7 px-2 text-xs" value="content">Content</TabsTrigger>
                        <TabsTrigger className="h-7 px-2 text-xs" value="comments">
                          Comments{collaboration?.commentCount ? <span className="ml-1">{collaboration.commentCount}</span> : null}
                        </TabsTrigger>
                        <TabsTrigger className="h-7 px-2 text-xs" value="suggested-edits">
                          Suggested Edits{collaboration?.suggestedEditCount ? <span className="ml-1">{collaboration.suggestedEditCount}</span> : null}
                        </TabsTrigger>
                        <TabsTrigger className="h-7 px-2 text-xs" value="collaboration">Collab</TabsTrigger>
                      </TabsList>

                    <TabsContent value="content" className="flex-1 overflow-auto p-6">
                      {isEditing ? (
                        <EnhancedWikiEditor
                          page={selectedPage}
                          userRole={userRole}
                          isEditing={isEditing}
                          onSave={handleEnhancedSave}
                          onToggleEdit={handleToggleEdit}
                          autoSaveEnabled={autoSaveEnabled}
                          onAutoSaveToggle={setAutoSaveEnabled}
                        />
                      ) : (
                        <LiveDataContent
                          content={selectedPage.content}
                          isLiveData={isLiveData}
                          lastUpdated={lastUpdated}
                          onRefresh={handleRefreshLiveData}
                          isRefreshing={isRefreshingLiveData}
                          entityType={entityType}
                          entityData={entityData}
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="comments" className="flex-1 overflow-auto p-6">
                      <Comments
                        pageId={selectedPage.id}
                        pageSlug={selectedPage.slug}
                        userRole={userRole}
                        allowComments={selectedPage.allowComments}
                      />
                    </TabsContent>

                    <TabsContent value="suggested-edits" className="flex-1 overflow-auto p-6">
                      {selectedPage && (
                        <SuggestedEdits
                          pageId={selectedPage.id}
                          userRole={userRole}
                          currentContent={selectedPage.content}
                          currentTitle={selectedPage.title}
                          pageOwnerId={selectedPage.authorId}
                          onApplyEdit={async (title, content) => {
                            await handleEnhancedSave({ title, content });
                            // After applying, refresh live/static content
                            await handleRefreshLiveData();
                          }}
                          openSubmit={showSuggestEditModal}
                          onOpenSubmitChange={setShowSuggestEditModal}
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="collaboration" className="flex-1 overflow-auto p-6">
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Collaboration Dashboard</h3>
                        <p className="text-muted-foreground">
                          Real-time collaboration features coming soon
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* Mobile TOC Overlay */}
              {tocOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setTocOpen(false)} />
              )}
              
              {/* Table of Contents Sidebar */}
              <div className={`
                w-64 bg-background/60 backdrop-blur-sm rounded-lg p-4 overflow-y-auto
                fixed lg:relative z-50 lg:z-auto right-0 top-0 h-full
                ${tocOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                transition-transform duration-300
              `}>
              

                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <h3 className="font-medium text-sm">Table of Contents</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTocOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="font-medium mb-4 text-sm hidden lg:block">Table of Contents</h3>
                <div className="text-xs text-muted-foreground">
                  Auto-generated TOC coming soon
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Page</h3>
                <p className="text-muted-foreground">
                  Choose a page from the sidebar to view its content
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Modals - Simplified for now */}
      {showAdvancedSearch && (
        <Dialog open={showAdvancedSearch} onOpenChange={setShowAdvancedSearch}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Advanced Search</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-muted-foreground">Advanced search coming soon</p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showPageHistory && selectedPage && (
        <Dialog open={showPageHistory} onOpenChange={setShowPageHistory}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Page History</DialogTitle>
            </DialogHeader>
            <div className="p-2">
              <PageHistory 
                pageId={selectedPage.id} 
                pageTitle={selectedPage.title}
                pageSlug={selectedPage.slug}
                onRevisionRestored={async () => {
                  // Refresh the selected page content after restore
                  await handleRefreshLiveData();
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showMediaUploader && selectedPage && (
        <Dialog open={showMediaUploader} onOpenChange={setShowMediaUploader}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Media Upload</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-muted-foreground">Media upload coming soon</p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showSettings && (
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Wiki Settings</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-muted-foreground">Wiki settings coming soon</p>
            </div>
          </DialogContent>
        </Dialog>
      )}



      {/* Suggest Edit dialog is controlled within SuggestedEdits tab content */}

      {/* Create Page Dialog */}
      {showAddPageModal && (
        <Dialog open={showAddPageModal} onOpenChange={setShowAddPageModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Page
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter page title..."
                />
              </div>

              {/* Slug Preview */}
              {formData.title && (
                <div className="space-y-2">
                  <Label>Slug Preview</Label>
                  <div className="p-2 bg-muted rounded-md text-sm font-mono text-muted-foreground">
                    {formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((category) => (
                      category ? (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4" />
                            <span>{category.title || 'Untitled'}</span>
                            {category.id !== category.title && (
                              <span className="text-xs text-muted-foreground">
                                ({category.id})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ) : null
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the page..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'draft' | 'review' | 'published') => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddPageModal(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSavePage} 
                disabled={isSaving || !formData.title.trim() || !formData.category}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Page
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Wiki;
