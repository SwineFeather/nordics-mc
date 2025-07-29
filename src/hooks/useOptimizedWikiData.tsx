import { useState, useEffect, useCallback, useRef } from 'react';
import { WikiCategory, WikiPage } from '@/types/wiki';
import { OptimizedWikiService, WikiFileStructure } from '@/services/optimizedWikiService';

interface OptimizedWikiData {
  categories: WikiCategory[];
  fileStructure: WikiFileStructure[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
  getPageByPath: (path: string) => Promise<WikiPage | null>;
  searchPages: (query: string) => Promise<WikiPage[]>;
  getFileContent: (path: string) => Promise<string>;
  loadPageContent: (pageId: string) => Promise<string | null>;
}

export const useOptimizedWikiData = (): OptimizedWikiData => {
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [fileStructure, setFileStructure] = useState<WikiFileStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loadedPages, setLoadedPages] = useState<Map<string, string>>(new Map());
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load only file structure initially (fast)
  const loadData = useCallback(async (forceRefresh = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading optimized wiki structure...');

      // Get only the file structure from storage (no content)
      const structure = await OptimizedWikiService.getFileStructureOnly();
      
      if (abortControllerRef.current.signal.aborted) return;

      // Convert to wiki categories with minimal page data (no content)
      const wikiCategories = await OptimizedWikiService.convertToWikiDataMinimal(structure);
      
      if (abortControllerRef.current.signal.aborted) return;

      setFileStructure(structure);
      setCategories(wikiCategories);
      setLastUpdated(new Date());

      console.log(`✅ Loaded ${wikiCategories.length} categories with ${wikiCategories.reduce((total, cat) => total + (cat.pages?.length || 0), 0)} pages (structure only)`);

    } catch (err) {
      if (abortControllerRef.current.signal.aborted) return;

      console.error('❌ Failed to load optimized wiki data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load wiki data');
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Load page content on-demand
  const loadPageContent = useCallback(async (pageId: string): Promise<string | null> => {
    // Check if already loaded
    if (loadedPages.has(pageId)) {
      return loadedPages.get(pageId) || null;
    }

    try {
      console.log(`📄 Loading content for page: ${pageId}`);
      const content = await OptimizedWikiService.getPageContent(pageId);
      
      if (content) {
        setLoadedPages(prev => new Map(prev).set(pageId, content));
        console.log(`✅ Loaded content for page: ${pageId}`);
      }
      
      return content;
    } catch (error) {
      console.error(`❌ Failed to load content for page ${pageId}:`, error);
      return null;
    }
  }, [loadedPages]);

  // Refresh data
  const refreshData = useCallback(async () => {
    console.log('🔄 Refreshing optimized wiki data...');
    setLoadedPages(new Map()); // Clear loaded pages cache
    await loadData(true);
  }, [loadData]);

  // Get page by path
  const getPageByPath = useCallback(async (path: string): Promise<WikiPage | null> => {
    try {
      return await OptimizedWikiService.getPageByPath(path);
    } catch (error) {
      console.error('Failed to get page by path:', error);
      return null;
    }
  }, []);

  // Search pages (only searches titles and metadata, not content)
  const searchPages = useCallback(async (query: string): Promise<WikiPage[]> => {
    try {
      return await OptimizedWikiService.searchPages(query);
    } catch (error) {
      console.error('Failed to search pages:', error);
      return [];
    }
  }, []);

  // Get file content
  const getFileContent = useCallback(async (path: string): Promise<string> => {
    try {
      return await OptimizedWikiService.getFileContent(path);
    } catch (error) {
      console.error('Failed to get file content:', error);
      throw error;
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    categories,
    fileStructure,
    loading,
    error,
    lastUpdated,
    refreshData,
    getPageByPath,
    searchPages,
    getFileContent,
    loadPageContent
  };
}; 