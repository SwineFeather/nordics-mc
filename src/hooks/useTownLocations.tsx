import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TownLocation {
  id: number;
  name: string;
  location_x: number | null;
  location_z: number | null;
  is_capital: boolean;
  nation_name: string | null;
  balance: number | null;
}

export const useTownLocations = () => {
  const [towns, setTowns] = useState<TownLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTownLocations = async () => {
      try {
        setLoading(true);
        
        // Fetch towns that have location data (show all regardless of public flag for home map)
        const { data, error } = await supabase
          .from('towns')
          .select('id, name, location_x, location_z, is_capital, nation_name, balance')
          .not('location_x', 'is', null)
          .not('location_z', 'is', null)
          .order('name');

        if (error) {
          console.error('Error fetching town locations:', error);
          setError(error.message);
          return;
        }

        setTowns(data || []);
      } catch (err) {
        console.error('Error in useTownLocations:', err);
        setError('Failed to fetch town locations');
      } finally {
        setLoading(false);
      }
    };

    fetchTownLocations();
  }, []);

  return { towns, loading, error };
}; 