import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Town {
  id: string;
  name: string;
  mayor: string;
  population: number;
  type: string;
  status: string;
  founded: string;
  nation_id?: string;
  is_independent: boolean;
  created_at: string;
  updated_at: string;
}

export const useTownsData = () => {
  const [towns, setTowns] = useState<Town[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTowns = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('towns')
          .select('*')
          .order('name');

        if (error) {
          throw error;
        }

        setTowns(data || []);
      } catch (err) {
        console.error('Error fetching towns:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch towns');
      } finally {
        setLoading(false);
      }
    };

    fetchTowns();
  }, []);

  return { towns, loading, error };
}; 