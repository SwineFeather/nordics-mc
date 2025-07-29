
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, MapPin, User, ExternalLink, Star, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SponsoredShop {
  id: string;
  shop_name: string;
  owner_name: string;
  location?: string;
  description?: string;
  shop_type?: string;
  is_active: boolean;
  sponsored_priority: number;
  created_at: string;
}

const SponsoredShopsTab: React.FC = () => {
  const [sponsoredShops, setSponsoredShops] = useState<SponsoredShop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSponsoredShops();
  }, []);

  const fetchSponsoredShops = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_shops')
        .select('*')
        .eq('is_active', true)
        .eq('is_sponsored', true)
        .order('sponsored_priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSponsoredShops(data || []);
    } catch (error) {
      console.error('Error fetching sponsored shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority: number) => {
    if (priority >= 10) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (priority >= 5) return <Star className="w-4 h-4 text-orange-500" />;
    return <Star className="w-4 h-4 text-blue-500" />;
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 10) return <Badge className="bg-yellow-500 text-white">Premium</Badge>;
    if (priority >= 5) return <Badge className="bg-orange-500 text-white">Featured</Badge>;
    return <Badge className="bg-blue-500 text-white">Sponsored</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center text-foreground">
          <Star className="w-5 h-5 mr-2 text-yellow-500" />
          Sponsored Shops
        </h3>
        <Badge variant="outline" className="border-border">{sponsoredShops.length} featured shops</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sponsoredShops.map((shop) => (
          <Card key={shop.id} className="bg-card border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-50/20 to-orange-50/20 dark:from-yellow-950/20 dark:to-orange-950/20">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-lg flex items-center text-foreground">
                  <Store className="w-5 h-5 mr-2 text-primary" />
                  {shop.shop_name}
                  <span className="ml-2">{getPriorityIcon(shop.sponsored_priority)}</span>
                </CardTitle>
                {getPriorityBadge(shop.sponsored_priority)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="w-4 h-4 mr-2" />
                  <span>Owner: {shop.owner_name}</span>
                </div>
                
                {shop.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{shop.location}</span>
                  </div>
                )}
                
                {shop.description && (
                  <p className="text-sm text-muted-foreground">{shop.description}</p>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button variant="default" size="sm" className="flex-1 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                    Visit Premium Shop
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl border-border">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sponsoredShops.length === 0 && (
        <div className="text-center py-12">
          <Star className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2 text-foreground">No Sponsored Shops</h3>
          <p className="text-muted-foreground">There are currently no sponsored shops available.</p>
        </div>
      )}
    </div>
  );
};

export default SponsoredShopsTab;
