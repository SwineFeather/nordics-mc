import { useState, useEffect, useCallback, useRef } from 'react';
import { WikiCategory, WikiPage } from '@/types/wiki';
import { SupabaseWikiService, WikiFileStructure } from '@/services/supabaseWikiService';

interface SupabaseWikiData {
  categories: WikiCategory[];
  fileStructure: WikiFileStructure[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
  getPageByPath: (path: string) => Promise<WikiPage | null>;
  searchPages: (query: string) => Promise<WikiPage[]>;
  getFileContent: (path: string) => Promise<string>;
  getFileContentWithMetadata: (path: string) => Promise<{ content: string; isLiveData: boolean; lastUpdated?: string }>;
  savePage: (path: string, content: string, title?: string) => Promise<void>;
  createPage: (path: string, title: string, content: string, category?: string) => Promise<void>;
  deletePage: (path: string) => Promise<void>;
  checkEditPermission: () => Promise<boolean>;
}

export const useSupabaseWikiData = (): SupabaseWikiData => {
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [fileStructure, setFileStructure] = useState<WikiFileStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load data from Supabase storage
  const loadData = useCallback(async (forceRefresh = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      // Get the file structure from storage
      const structure = await SupabaseWikiService.getFileStructure();
      
      if (abortControllerRef.current.signal.aborted) return;

      // Convert to wiki categories and pages
      const wikiCategories = await SupabaseWikiService.convertToWikiData(structure);
      
      if (abortControllerRef.current.signal.aborted) return;

      setFileStructure(structure);
      setCategories(wikiCategories);
      setLastUpdated(new Date());

    } catch (err) {
      if (abortControllerRef.current.signal.aborted) return;

      console.error('❌ Failed to load Supabase wiki data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load wiki data');
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  // Get page by path
  const getPageByPath = useCallback(async (path: string): Promise<WikiPage | null> => {
    try {
      return await SupabaseWikiService.getPageByPath(path);
    } catch (error) {
      console.error('Failed to get page by path:', error);
      return null;
    }
  }, []);

  // Search pages
  const searchPages = useCallback(async (query: string): Promise<WikiPage[]> => {
    try {
      return await SupabaseWikiService.searchPages(query);
    } catch (error) {
      console.error('Failed to search pages:', error);
      return [];
    }
  }, []);

  // Get file content
  const getFileContent = useCallback(async (path: string): Promise<string> => {
    try {
      return await SupabaseWikiService.getFileContent(path);
    } catch (error) {
      console.error('Failed to get file content:', error);
      throw error;
    }
  }, []);

  // Get file content with metadata
  const getFileContentWithMetadata = useCallback(async (path: string): Promise<{ content: string; isLiveData: boolean; lastUpdated?: string }> => {
    try {
      return await SupabaseWikiService.getFileContentWithMetadata(path);
    } catch (error) {
      console.error('Failed to get file content with metadata:', error);
      throw error;
    }
  }, []);

  // Save page
  const savePage = useCallback(async (path: string, content: string, title?: string): Promise<void> => {
    try {
      await SupabaseWikiService.savePage(path, content, title);
      // Don't refresh data immediately as it can overwrite editor state
      // Data will be refreshed when needed (e.g., when switching pages)
    } catch (error) {
      console.error('Failed to save page:', error);
      throw error;
    }
  }, []);

  // Create page
  const createPage = useCallback(async (path: string, title: string, content: string, category?: string): Promise<void> => {
    try {
      await SupabaseWikiService.createPage(path, title, content, category);
      // Refresh data after creating to get the new page
      await refreshData();
    } catch (error) {
      console.error('Failed to create page:', error);
      throw error;
    }
  }, [refreshData]);

  // Delete page
  const deletePage = useCallback(async (path: string): Promise<void> => {
    try {
      await SupabaseWikiService.deletePage(path);
      // Refresh data after deleting to update the structure
      await refreshData();
    } catch (error) {
      console.error('Failed to delete page:', error);
      throw error;
    }
  }, [refreshData]);

  // Check edit permission
  const checkEditPermission = useCallback(async (): Promise<boolean> => {
    try {
      return await SupabaseWikiService.checkEditPermission();
    } catch (error) {
      console.error('Failed to check edit permission:', error);
      return false;
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
    getFileContentWithMetadata,
    savePage,
    createPage,
    deletePage,
    checkEditPermission
  };
}; 