
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WikiCategory } from '@/types/wiki';
import { wikiSyncService } from '@/services/wikiSyncService';

interface CacheEntry {
  data: WikiCategory[];
  timestamp: number;
  expiresAt: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

export const useWikiData = () => {
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getCacheKey = () => 'wiki-data';

  const isCacheValid = (entry: CacheEntry): boolean => {
    return Date.now() < entry.expiresAt;
  };

  const getCachedData = (): WikiCategory[] | null => {
    const key = getCacheKey();
    const entry = cache.get(key);
    
    if (entry && isCacheValid(entry)) {
      console.log('📦 Using cached wiki data');
      return entry.data;
    }
    
    if (entry) {
      console.log('📦 Cache expired, fetching fresh data');
      cache.delete(key);
    }
    
    return null;
  };

  const setCachedData = (data: WikiCategory[]) => {
    const key = getCacheKey();
    const now = Date.now();
    
    cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + CACHE_DURATION
    });
    
    console.log('📦 Cached wiki data');
  };

  const clearCache = () => {
    cache.clear();
    console.log('📦 Cache cleared');
  };

  const loadWikiData = useCallback(async (forceRefresh = false) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = getCachedData();
        if (cachedData) {
          setCategories(cachedData);
          setLastUpdated(new Date());
          setLoading(false);
          return;
        }
      }

      console.log('🔄 Loading wiki data...');
      
      // Load from Supabase
      const data = await wikiSyncService.loadWikiDataFromSupabase();
      
      // Check if request was cancelled
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      setCategories(data);
      setLastUpdated(new Date());
      setCachedData(data);
      
      console.log(`✅ Loaded ${data.length} categories`);
    } catch (err) {
      // Don't set error if request was cancelled
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      console.error('❌ Failed to load wiki data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load wiki data');
      
      // Try to use cached data as fallback
      const cachedData = getCachedData();
      if (cachedData) {
        console.log('📦 Using cached data as fallback');
        setCategories(cachedData);
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const refreshData = useCallback(() => {
    clearCache();
    return loadWikiData(true);
  }, [loadWikiData]);

  // Error recovery with exponential backoff
  const retryWithBackoff = useCallback(async (attempt = 1) => {
    const maxAttempts = 3;
    const baseDelay = 1000; // 1 second
    
    if (attempt > maxAttempts) {
      setError('Failed to load data after multiple attempts');
      return;
    }

    const delay = baseDelay * Math.pow(2, attempt - 1);
    
    console.log(`🔄 Retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`);
    
    setTimeout(() => {
      loadWikiData(true);
    }, delay);
  }, [loadWikiData]);

  useEffect(() => {
    loadWikiData();

    // Create a unique channel name to avoid conflicts
    const channelName = `wiki-changes-${Date.now()}-${Math.random()}`;
    
    // Set up real-time subscription for wiki pages and categories
    const subscription = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'wiki_pages' }, 
        (payload) => {
          console.log('🔄 Wiki pages changed:', payload.eventType, (payload.new as any)?.title);
          // Invalidate cache and reload
          clearCache();
          loadWikiData(true);
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'wiki_categories' }, 
        (payload) => {
          console.log('🔄 Wiki categories changed:', payload.eventType, (payload.new as any)?.title);
          // Invalidate cache and reload
          clearCache();
          loadWikiData(true);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'page_revisions' },
        (payload) => {
          console.log('🔄 Page revisions changed:', payload.eventType);
          // Only reload if it's a new revision (not just viewing history)
          if (payload.eventType === 'INSERT') {
            clearCache();
            loadWikiData(true);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Wiki subscription status:', status);
      });

    return () => {
      console.log('🧹 Cleaning up wiki subscription');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      supabase.removeChannel(subscription);
    };
  }, []); // Empty dependency array to run only once

  return {
    categories,
    loading,
    error,
    lastUpdated,
    refreshData,
    retryWithBackoff,
    clearCache
  };
};
