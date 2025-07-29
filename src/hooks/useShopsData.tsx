import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Shop {
  id: string;
  owner_uuid: string;
  world: string;
  x: number;
  y: number;
  z: number;
  item_type: string;
  item_amount: number;
  item_durability: number;
  item_display_name: string | null;
  item_lore: string[] | null;
  item_enchants: any | null;
  item_custom_model_data: number | null;
  item_unbreakable: boolean | null;
  price: number;
  type: 'buy' | 'sell';
  stock: number;
  unlimited: boolean;
  last_updated: number;
  description: string | null;
  company_id?: string | null;
  is_featured?: boolean;
}

export interface ShopWithOwner extends Shop {
  owner_name?: string;
  owner_avatar?: string;
}

export const useShopsData = () => {
  const [shops, setShops] = useState<ShopWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchShops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await (supabase as any)
        .from('shops')
        .select('*')
        .order('last_updated', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform the data to include owner information
      const shopsWithOwners: ShopWithOwner[] = data?.map(shop => ({
        ...shop,
        owner_name: shop.owner_uuid, // We'll enhance this later with player names
        owner_avatar: undefined
      })) || [];

      setShops(shopsWithOwners);
      setLastSync(new Date());
    } catch (err) {
      console.error('Error fetching shops:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchShopsByType = useCallback(async (type: 'buy' | 'sell') => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await (supabase as any)
        .from('shops')
        .select('*')
        .eq('type', type)
        .order('last_updated', { ascending: false });

      if (fetchError) throw fetchError;

      const shopsWithOwners: ShopWithOwner[] = data?.map(shop => ({
        ...shop,
        owner_name: shop.owner_uuid,
        owner_avatar: undefined
      })) || [];

      setShops(shopsWithOwners);
      setLastSync(new Date());
    } catch (err) {
      console.error('Error fetching shops by type:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchShopsByItem = useCallback(async (itemType: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await (supabase as any)
        .from('shops')
        .select('*')
        .ilike('item_type', `%${itemType}%`)
        .order('last_updated', { ascending: false });

      if (fetchError) throw fetchError;

      const shopsWithOwners: ShopWithOwner[] = data?.map(shop => ({
        ...shop,
        owner_name: shop.owner_uuid,
        owner_avatar: undefined
      })) || [];

      setShops(shopsWithOwners);
      setLastSync(new Date());
    } catch (err) {
      console.error('Error fetching shops by item:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshShops = useCallback(() => {
    fetchShops();
  }, [fetchShops]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  return {
    shops,
    loading,
    error,
    lastSync,
    fetchShops,
    fetchShopsByType,
    fetchShopsByItem,
    refreshShops
  };
}; 