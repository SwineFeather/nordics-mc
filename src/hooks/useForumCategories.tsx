import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ForumCategory {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon: string;
  color: string;
  order_index: number;
  role_required: string;
  nation_name?: string | null;
  town_name?: string | null;
  is_archived?: boolean;
  created_at: string;
  updated_at?: string;
  post_count?: number;
  last_activity?: string;
}

export const useForumCategories = () => {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Query the base forum_categories table directly to get nation_name and town_name
        const { data, error } = await supabase
          .from('forum_categories')
          .select(`
            *,
            forum_posts!forum_posts_category_id_fkey(
              id,
              created_at,
              updated_at
            )
          `)
          .order('order_index', { ascending: true });

        if (error) {
          throw error;
        }

        // Calculate post count and last activity for each category
        const categoriesWithStats = (data || []).map(category => {
          const posts = category.forum_posts || [];
          const postCount = posts.length;
          const lastActivity = posts.length > 0 
            ? Math.max(...posts.map((post: any) => new Date(post.updated_at || post.created_at).getTime()))
            : null;

          return {
            ...category,
            post_count: postCount,
            last_activity: lastActivity ? new Date(lastActivity).toISOString() : null,
            forum_posts: undefined // Remove the posts array to clean up the response
          };
        });

        setCategories(categoriesWithStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};
