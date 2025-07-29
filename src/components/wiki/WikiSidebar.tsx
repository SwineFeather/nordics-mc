import React, { useState, useMemo } from 'react';
import { MoreHorizontal, ChevronDown, ChevronRight, Plus, FileText, Folder, GripVertical, Search, RefreshCw } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { WikiCategory, WikiPage } from '@/types/wiki';
import { useToast } from '@/hooks/use-toast';

// --- Types ---
export type WikiSidebarItem = {
  type: 'group' | 'page';
  icon: string;
  title: string;
  slug: string;
  ext: 'md' | 'mdx';
  children: WikiSidebarItem[];
  originalData?: WikiCategory | WikiPage;
  isGroup?: boolean; // true if folder has no README.md
  isPage?: boolean; // true if folder has README.md or is a .md file
  path?: string; // full path in storage
};

export interface WikiSidebarProps {
  categories: WikiCategory[];
  selectedSlug?: string;
  onNavigate?: (slug: string) => void;
  onAddPage?: (parentSlug: string, position: 'sibling' | 'child' | 'above' | 'below') => void;
  onEditPage?: (slug: string) => void;
  onDeletePage?: (slug: string) => void;
  onDuplicatePage?: (slug: string) => void;
  onRenamePage?: (slug: string) => void;
  onAddGroup?: () => void;
  onEditGroup?: (slug: string) => void;
  onDeleteGroup?: (slug: string) => void;
  onToggleEditMode?: (edit: boolean) => void;
  onRefreshData?: () => void;
  editMode?: boolean;
  loading?: boolean;
}

// Helper function to convert WikiCategory[] to WikiSidebarItem[]
const convertCategoriesToSidebarItems = (categories: WikiCategory[]): WikiSidebarItem[] => {
  const convertPage = (page: WikiPage, depth: number = 0): WikiSidebarItem => {
    const children: WikiSidebarItem[] = [];
    
    // If page has children, convert them recursively
    if (page.children && page.children.length > 0) {
      children.push(...page.children.map(child => convertPage(child, depth + 1)));
    }
    
    return {
      type: 'page',
      icon: page.icon || '📄',
      title: page.title,
      slug: page.slug,
      ext: page.githubPath?.endsWith('.mdx') ? 'mdx' : 'md',
      children,
      originalData: page,
      isPage: true,
      path: page.id // Use the id as path for storage-based pages
    };
  };

  const convertCategory = (category: WikiCategory): WikiSidebarItem => {
    const pages: WikiSidebarItem[] = category.pages.map(page => convertPage(page));
    
    // Check if this category is a group (no README.md) or a page (has README.md)
    const hasReadme = pages.some(page => page.slug === 'README' || page.title === 'README');
    
    return {
      type: 'group',
      icon: category.icon || '📁',
      title: category.title,
      slug: category.slug,
      ext: 'md',
      children: pages,
      originalData: category,
      isGroup: !hasReadme,
      isPage: hasReadme,
      path: category.id // Use the id as path for storage-based categories
    };
  };

  return categories.map(convertCategory);
};

// Helper to get icon for different content types
const getIconForContent = (title: string, category?: string): string => {
  const lowerTitle = title.toLowerCase();
  const lowerCategory = category?.toLowerCase() || '';
  
  // Towns/Nations
  if (lowerCategory.includes('town') || lowerCategory.includes('nation') || lowerTitle.includes('town') || lowerTitle.includes('nation')) {
    return '🏰';
  }
  
  // Combat
  if (lowerCategory.includes('combat') || lowerTitle.includes('weapon') || lowerTitle.includes('armor') || lowerTitle.includes('combat')) {
    return '⚔️';
  }
  
  // World/Biomes
  if (lowerCategory.includes('world') || lowerCategory.includes('biome') || lowerTitle.includes('biome') || lowerTitle.includes('world')) {
    return '🌍';
  }
  
  // Gameplay
  if (lowerCategory.includes('gameplay') || lowerTitle.includes('guide') || lowerTitle.includes('tutorial')) {
    return '🎮';
  }
  
  // Companies/Business
  if (lowerTitle.includes('company') || lowerTitle.includes('business') || lowerTitle.includes('industry')) {
    return '🏢';
  }
  
  // Default icons based on title
  if (lowerTitle.includes('map')) return '🗺️';
  if (lowerTitle.includes('api')) return '🔧';
  if (lowerTitle.includes('guide')) return '📖';
  if (lowerTitle.includes('setting')) return '⚙️';
  if (lowerTitle.includes('achievement')) return '🏆';
  
  return '📄';
};

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Helper to render vertical lines for hierarchy
const renderVerticalLines = (depth: number, isLast: boolean) => {
  if (depth === 0) return null;
  return (
    <div className="absolute left-0 top-0 h-full flex" style={{ width: `${depth * 16}px` }}>
      {[...Array(depth)].map((_, i) => (
        <div
          key={i}
          className={`w-px h-full ${i === depth - 1 && isLast ? 'bg-transparent' : 'bg-muted-300 dark:bg-muted-700'} ml-4`}
          style={{ opacity: 0.5 }}
        />
      ))}
    </div>
  );
};

const WikiSidebar: React.FC<WikiSidebarProps> = ({
  categories,
  selectedSlug,
  onNavigate = () => {},
  onAddPage = () => {},
  onEditPage = () => {},
  onDeletePage = () => {},
  onDuplicatePage = () => {},
  onRenamePage = () => {},
  onAddGroup = () => {},
  onEditGroup = () => {},
  onDeleteGroup = () => {},
  onToggleEditMode = () => {},
  onRefreshData = () => {},
  editMode: editModeProp,
  loading = false,
}) => {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(editModeProp ?? false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showActions, setShowActions] = useState<Record<string, boolean>>({});
  const [localSelectedSlug, setLocalSelectedSlug] = useState<string>('');
  const [search, setSearch] = useState('');

  // Use prop or local state for selection
  const currentSlug = selectedSlug ?? localSelectedSlug;

  // Convert categories to sidebar items with proper icons
  const sidebarItems = useMemo(() => {
    const items = convertCategoriesToSidebarItems(categories);
    
    // Add icons to items that don't have them
    const addIcons = (items: WikiSidebarItem[]): WikiSidebarItem[] => {
      return items.map(item => {
        if (!item.icon || item.icon === '📄') {
          item.icon = getIconForContent(
            item.title,
            item.originalData && 'category' in item.originalData ? item.originalData.category : undefined
          );
        }
        
        if (item.children.length > 0) {
          item.children = addIcons(item.children);
        }
        
        return item;
      });
    };
    
    return addIcons(items);
  }, [categories]);

  // Toggle expand/collapse for nested pages
  const handleToggle = (slug: string) => {
    setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  // Show/hide actions dropdown
  const handleShowActions = (slug: string, show: boolean) => {
    setShowActions((prev) => ({ ...prev, [slug]: show }));
  };

  // Handle navigation
  const handleNavigate = (slug: string) => {
    setLocalSelectedSlug(slug);
    onNavigate(slug);
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await onRefreshData();
      toast({
        title: "Wiki refreshed",
        description: "Latest content loaded from GitHub",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not load latest content",
        variant: "destructive",
      });
    }
  };

  // Drag and drop handlers
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    // For now, just show a toast that drag and drop is not fully implemented
    toast({
      title: "Drag and drop",
      description: "This feature is not yet fully implemented with real data",
    });
  };

  // Actions for the dropdown menu
  const actions = [
    { label: 'Insert Page', icon: <Plus size={16} />, key: 'insertPage' },
    { label: 'Insert Subpage', icon: <Plus size={16} />, key: 'insertSubpage' },
    { label: 'Import subpages', icon: <FileText size={16} />, key: 'import' },
    { label: 'Add cover', icon: <Folder size={16} />, key: 'cover' },
    { label: 'Rename', icon: <FileText size={16} />, key: 'rename' },
    { label: 'Duplicate', icon: <FileText size={16} />, key: 'duplicate' },
    { label: 'Options', icon: <FileText size={16} />, key: 'options' },
    { label: 'Delete', icon: <FileText size={16} />, key: 'delete', danger: true },
    { label: 'Hide page', icon: <FileText size={16} />, key: 'hide', toggle: true },
    { label: 'Export as PDF', icon: <FileText size={16} />, key: 'export', badge: 'Upgrade' },
  ];

  // Render actions dropdown
  const renderActionsDropdown = (slug: string, isGroup = false) => (
    <div className="absolute right-0 top-8 z-20 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl p-1 text-sm animate-fade-in">
      {actions.map((action) => (
        <div
          key={action.label}
          className={`flex items-center px-3 py-2 rounded-lg transition-colors cursor-pointer ${action.danger ? 'hover:bg-red-100 dark:hover:bg-red-900 text-red-600' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
          onClick={() => {
            if (isGroup) {
              if (action.key === 'rename') onEditGroup(slug);
              if (action.key === 'delete') onDeleteGroup(slug);
            } else {
              if (action.key === 'insertPage') onAddPage(slug, 'sibling');
              if (action.key === 'insertSubpage') onAddPage(slug, 'child');
              if (action.key === 'rename') onRenamePage(slug);
              if (action.key === 'duplicate') onDuplicatePage(slug);
              if (action.key === 'delete') onDeletePage(slug);
              if (action.key === 'import') {/* stub */}
              if (action.key === 'cover') {/* stub */}
              if (action.key === 'options') {/* stub */}
              if (action.key === 'hide') {/* stub */}
              if (action.key === 'export') {/* stub */}
            }
            setShowActions((prev) => ({ ...prev, [slug]: false }));
          }}
          title={action.label}
        >
          <span className="mr-2">{action.icon}</span>
          <span>{action.label}</span>
          {action.badge && <span className="ml-auto bg-pink-500 text-white text-xs px-2 py-0.5 rounded">{action.badge}</span>}
          {action.toggle && <input type="checkbox" className="ml-auto" />}
        </div>
      ))}
    </div>
  );

  // Filtered items for search
  const filterItems = (items: WikiSidebarItem[], search: string): WikiSidebarItem[] => {
    if (!search.trim()) return items;
    const lower = search.toLowerCase();
    return items
      .map(item => {
        if (item.type === 'group') {
          const filteredPages = item.children.filter(page => page.title.toLowerCase().includes(lower));
          if (item.title.toLowerCase().includes(lower) || filteredPages.length > 0) {
            return { ...item, children: filteredPages };
          }
          return null;
        } else {
          return item.title.toLowerCase().includes(lower) ? item : null;
        }
      })
      .filter(Boolean) as WikiSidebarItem[];
  };

  // Recursive render for pages (with drag-and-drop for first level)
  const renderPages = (pages: WikiSidebarItem[], groupSlug: string, depth = 0) => {
    if (depth === 0 && editMode) {
      // Only first level pages are draggable when in edit mode
      return (
        <Droppable droppableId={groupSlug} type={`page-${groupSlug}`}>
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {pages.map((page, idx) => {
                const hasChildren = page.children && page.children.length > 0;
                const isExpanded = expanded[page.slug] ?? depth < 1;
                return (
                  <Draggable key={page.slug} draggableId={page.slug} index={idx}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`relative group flex flex-col ${snapshot.isDragging ? 'bg-muted-100 dark:bg-muted-900 shadow-lg' : ''}`}
                        style={{ borderRadius: 8, marginBottom: 2 }}
                      >
                        <div
                          className={`flex items-center pl-${4 + depth * 4} pr-2 py-1 rounded-lg cursor-pointer transition-colors relative ${currentSlug === page.slug ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted-100 dark:hover:bg-muted-800'}`}
                          tabIndex={0}
                          aria-selected={currentSlug === page.slug}
                          onClick={() => handleNavigate(page.slug)}
                          onKeyDown={e => { if (e.key === 'Enter') handleNavigate(page.slug); }}
                          style={{ minHeight: 36 }}
                        >
                          {/* Drag handle */}
                          <span {...provided.dragHandleProps} className="mr-1 p-1 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100"><GripVertical size={14} /></span>
                          {/* Vertical lines for hierarchy */}
                          {renderVerticalLines(depth, idx === pages.length - 1)}
                          {/* Arrow for children */}
                          {hasChildren ? (
                            <button className="mr-1 rounded hover:bg-muted-200 dark:hover:bg-muted-700 p-1" onClick={e => { e.stopPropagation(); handleToggle(page.slug); }} aria-label={isExpanded ? 'Collapse' : 'Expand'}>
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                          ) : (
                            <span className="mr-5" />
                          )}
                          {/* Icon */}
                          <span className="mr-2 text-lg" style={{ opacity: 0.85 }}>{page.icon}</span>
                          {/* Title */}
                          <span className="font-normal text-sm" style={{ flex: 1 }}>{page.title}</span>
                          {/* More actions */}
                          <span className="ml-auto relative">
                            <button
                              className="p-1 hover:bg-muted-200 dark:hover:bg-muted-700 rounded-lg border border-transparent focus:border-primary/50"
                              aria-label="More actions"
                              onClick={e => { e.stopPropagation(); handleShowActions(page.slug, !showActions[page.slug]); }}
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            {showActions[page.slug] && renderActionsDropdown(page.slug)}
                          </span>
                        </div>
                        {/* Children */}
                        {hasChildren && isExpanded && (
                          <div>{renderPages(page.children, groupSlug, depth + 1)}</div>
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      );
    } else {
      // Nested pages (not draggable)
      return (
        <div>
          {pages.map((page) => {
            const hasChildren = page.children && page.children.length > 0;
            const isExpanded = expanded[page.slug] ?? depth < 1;
            return (
              <div key={page.slug} className="relative group flex flex-col" style={{ borderRadius: 8, marginBottom: 2 }}>
                <div
                  className={`flex items-center pl-${4 + depth * 4} pr-2 py-1 rounded-lg cursor-pointer transition-colors relative ${currentSlug === page.slug ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted-100 dark:hover:bg-muted-800'}`}
                  tabIndex={0}
                  aria-selected={currentSlug === page.slug}
                  onClick={() => handleNavigate(page.slug)}
                  onKeyDown={e => { if (e.key === 'Enter') handleNavigate(page.slug); }}
                  style={{ minHeight: 36 }}
                >
                  {/* Vertical lines for hierarchy */}
                  {renderVerticalLines(depth, pages.length - 1 === pages.indexOf(page))}
                  {/* Arrow for children */}
                  {hasChildren ? (
                    <button className="mr-1 rounded hover:bg-muted-200 dark:hover:bg-muted-700 p-1" onClick={e => { e.stopPropagation(); handleToggle(page.slug); }} aria-label={isExpanded ? 'Collapse' : 'Expand'}>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  ) : (
                    <span className="mr-5" />
                  )}
                  {/* Icon */}
                  <span className="mr-2 text-lg" style={{ opacity: 0.85 }}>{page.icon}</span>
                  {/* Title */}
                  <span className="font-normal text-sm" style={{ flex: 1 }}>{page.title}</span>
                  {/* More actions */}
                  <span className="ml-auto relative">
                    <button
                      className="p-1 hover:bg-muted-200 dark:hover:bg-muted-700 rounded-lg border border-transparent focus:border-primary/50"
                      aria-label="More actions"
                      onClick={e => { e.stopPropagation(); handleShowActions(page.slug, !showActions[page.slug]); }}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {showActions[page.slug] && renderActionsDropdown(page.slug)}
                  </span>
                </div>
                {/* Children */}
                {hasChildren && isExpanded && (
                  <div>{renderPages(page.children, groupSlug, depth + 1)}</div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
  };

  // Render groups and ungrouped pages
  const filteredItems = filterItems(sidebarItems, search);
  
  return (
    <aside
      className="relative h-[calc(100vh-4rem)] w-80 min-w-64 max-w-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl flex flex-col overflow-y-auto animate-fade-in"
    >
      {/* Search bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-muted-50 dark:bg-muted-900 rounded-t-2xl sticky top-0 z-10">
        <Search className="w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          className="flex-1 bg-transparent outline-none text-sm py-1 px-2"
          placeholder="Search pages..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          className="p-1 hover:bg-muted-200 dark:hover:bg-muted-700 rounded-lg border border-transparent focus:border-primary/50"
          onClick={handleRefresh}
          disabled={loading}
          title="Refresh from GitHub"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button
          className={`px-2 py-1 rounded text-sm font-medium ${editMode ? 'bg-neutral-800 text-white' : 'bg-neutral-200 dark:bg-neutral-800 dark:text-white'}`}
          onClick={() => { setEditMode(e => { onToggleEditMode(!e); return !e; }); }}
        >
          {editMode ? 'Exit Edit' : 'Edit'}
        </button>
      </div>
      
      {editMode ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sidebar-groups" type="group">
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 p-2 space-y-6">
                {filteredItems.map((item, idx) => {
                  if (item.type === 'group') {
                    return (
                      <Draggable key={item.slug} draggableId={item.slug} index={idx}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`space-y-1 bg-muted-50 dark:bg-muted-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 ${snapshot.isDragging ? 'ring-2 ring-primary' : ''}`}
                            style={{ padding: '8px 0', marginBottom: 8 }}
                          >
                            <div className="flex items-center px-3 py-2 font-bold text-sm rounded-xl group">
                              {/* Drag handle for group */}
                              <span {...provided.dragHandleProps} className="mr-2 p-1 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100"><GripVertical size={16} /></span>
                              <span className="mr-2 text-lg" style={{ opacity: 0.85 }}>{item.icon}</span>
                              <span 
                                className={`text-sm tracking-tight ${item.isGroup ? 'font-bold' : 'font-semibold'}`} 
                                style={{ flex: 1 }}
                              >
                                {item.title}
                              </span>
                              {/* More actions for group */}
                              <span className="ml-auto relative">
                                <button
                                  className="p-1 hover:bg-muted-200 dark:hover:bg-muted-700 rounded-lg border border-transparent focus:border-primary/50"
                                  aria-label="More actions"
                                  onClick={e => { e.stopPropagation(); handleShowActions(item.slug, !showActions[item.slug]); }}
                                >
                                  <MoreHorizontal size={16} />
                                </button>
                                {showActions[item.slug] && renderActionsDropdown(item.slug, true)}
                              </span>
                            </div>
                            <div className="pl-2 pr-1">
                              {renderPages(item.children, item.slug)}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  } else if (item.type === 'page') {
                    // Ungrouped page (not draggable for now)
                    return (
                      <div key={item.slug} className="space-y-1">
                        {renderPages([item], 'ungrouped')}
                      </div>
                    );
                  }
                  return null;
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        // Non-edit mode: render without drag and drop
        <div className="flex-1 p-2 space-y-6">
          {filteredItems.map((item) => {
            if (item.type === 'group') {
              return (
                <div key={item.slug} className="space-y-1 bg-muted-50 dark:bg-muted-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800" style={{ padding: '8px 0', marginBottom: 8 }}>
                  <div className="flex items-center px-3 py-2 font-bold text-sm rounded-xl group">
                    <span className="mr-2 text-lg" style={{ opacity: 0.85 }}>{item.icon}</span>
                    <span 
                      className={`text-sm tracking-tight ${item.isGroup ? 'font-bold' : 'font-semibold'}`} 
                      style={{ flex: 1 }}
                    >
                      {item.title}
                    </span>
                    {/* More actions for group */}
                    <span className="ml-auto relative">
                      <button
                        className="p-1 hover:bg-muted-200 dark:hover:bg-muted-700 rounded-lg border border-transparent focus:border-primary/50"
                        aria-label="More actions"
                        onClick={e => { e.stopPropagation(); handleShowActions(item.slug, !showActions[item.slug]); }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {showActions[item.slug] && renderActionsDropdown(item.slug, true)}
                    </span>
                  </div>
                  <div className="pl-2 pr-1">
                    {renderPages(item.children, item.slug)}
                  </div>
                </div>
              );
            } else if (item.type === 'page') {
              // Ungrouped page
              return (
                <div key={item.slug} className="space-y-1">
                  {renderPages([item], 'ungrouped')}
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
      
      {/* Add group button (edit mode) */}
      {editMode && (
        <div className="p-3">
          <button className="w-full py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm transition-colors shadow" onClick={onAddGroup}>
            + Add Group
          </button>
        </div>
      )}
    </aside>
  );
};

export default WikiSidebar; 