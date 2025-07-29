import { useState, useEffect } from 'react';

export interface Shop {
  id: string;
  owner: string;
  location: string;
  item: string;
  price: number;
  stock: number;
  type: 'buy' | 'sell';
}

export const useShopData = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const mockShops: Shop[] = [
          {
            id: '1',
            owner: 'PlayerOne',
            location: 'Spawn Market (100, 64, 200)',
            item: 'Diamond',
            price: 50,
            stock: 24,
            type: 'sell'
          },
          {
            id: '2',
            owner: 'MerchantKing',
            location: 'Trade District (150, 65, 180)',
            item: 'Iron Ingot',
            price: 5,
            stock: 100,
            type: 'buy'
          },
          {
            id: '3',
            owner: '_Bamson',
            location: 'Garvia Market (200, 64, 300)',
            item: 'Stone Bricks',
            price: 2,
            stock: 500,
            type: 'sell'
          }
        ];
        
        setShops(mockShops);
      } catch (error) {
        console.error('Failed to fetch shop data:', error);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  const createShop = async (shopData: Omit<Shop, 'id'>) => {
    try {
      const newShop: Shop = {
        ...shopData,
        id: Math.random().toString(36).substr(2, 9)
      };
      
      console.log('Creating new shop:', newShop);
      
      setShops(prevShops => {
        const updatedShops = [...prevShops, newShop];
        console.log('Updated shops list:', updatedShops);
        return updatedShops;
      });
      
      return { success: true, shop: newShop };
    } catch (error) {
      console.error('Failed to create shop:', error);
      return { success: false, error: 'Failed to create shop' };
    }
  };

  const deleteShop = async (shopId: string) => {
    try {
      setShops(prevShops => prevShops.filter(shop => shop.id !== shopId));
      return { success: true };
    } catch (error) {
      console.error('Failed to delete shop:', error);
      return { success: false, error: 'Failed to delete shop' };
    }
  };

  const refreshShops = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 100);
  };

  return { 
    shops, 
    loading, 
    createShop, 
    deleteShop,
    refreshShops
  };
};
