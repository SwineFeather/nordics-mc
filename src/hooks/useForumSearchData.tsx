import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SearchAuthor {
  id: string;
  name: string;
  minecraft_username?: string;
}

interface SearchData {
  tags: string[];
  authors: SearchAuthor[];
  loading: boolean;
  error: string | null;
}

export const useForumSearchData = (): SearchData => {
  const [tags, setTags] = useState<string[]>([]);
  const [authors, setAuthors] = useState<SearchAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // For now, use a predefined list of tags since the tags column might not exist yet
        // In the future, you can uncomment the code below when the tags column is added
        const mockTags = [
          'general', 'help', 'announcement', 'discussion', 'question', 
          'guide', 'bug-report', 'feature-request', 'news', 'update',
          'community', 'server', 'minecraft', 'mods', 'plugins'
        ];
        setTags(mockTags);

        // Uncomment this when tags column is added to forum_posts table:
        /*
        // Fetch tags from posts
        const { data: postsData, error: postsError } = await supabase
          .from('forum_posts')
          .select('tags')
          .not('tags', 'is', null);

        if (postsError) throw postsError;

        // Extract unique tags
        const allTags = new Set<string>();
        postsData?.forEach(post => {
          if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach(tag => allTags.add(tag));
          }
        });

        setTags(Array.from(allTags).sort());
        */

        // Fetch authors
        const { data: authorsData, error: authorsError } = await supabase
          .from('forum_posts')
          .select(`
            author_id,
            profiles!forum_posts_author_id_fkey (
              id,
              full_name,
              minecraft_username
            )
          `)
          .not('author_id', 'is', null);

        if (authorsError) throw authorsError;

        // Extract unique authors
        const uniqueAuthors = new Map<string, SearchAuthor>();
        authorsData?.forEach(post => {
          if (post.profiles && post.author_id) {
            const profile = post.profiles as any;
            uniqueAuthors.set(post.author_id, {
              id: post.author_id,
              name: profile.full_name || profile.minecraft_username || 'Unknown User',
              minecraft_username: profile.minecraft_username
            });
          }
        });

        setAuthors(Array.from(uniqueAuthors.values()).sort((a, b) => a.name.localeCompare(b.name)));

      } catch (err) {
        console.error('Error fetching search data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch search data');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchData();
  }, []);

  return { tags, authors, loading, error };
}; 