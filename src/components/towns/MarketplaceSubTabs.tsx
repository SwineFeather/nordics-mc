
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Store, Star } from 'lucide-react';
import ShopsTab from './ShopsTab';
import SponsoredShopsTab from './SponsoredShopsTab';

const MarketplaceSubTabs: React.FC = () => {
  return (
    <Tabs defaultValue="shops" className="w-full">
      <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-muted/40">
        <TabsTrigger value="shops" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Store className="w-4 h-4" />
          All Shops
        </TabsTrigger>
        <TabsTrigger value="sponsored" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Star className="w-4 h-4" />
          Featured
        </TabsTrigger>
      </TabsList>

      <TabsContent value="shops" className="mt-6">
        <ShopsTab />
      </TabsContent>

      <TabsContent value="sponsored" className="mt-6">
        <SponsoredShopsTab />
      </TabsContent>
    </Tabs>
  );
};

export default MarketplaceSubTabs;
