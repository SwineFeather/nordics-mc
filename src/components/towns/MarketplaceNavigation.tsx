import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  Star, 
  Building2, 
  TrendingUp,
  Users,
  Award
} from 'lucide-react';

interface MarketplaceNavigationProps {
  activeTab: 'all' | 'featured' | 'businesses';
  onTabChange: (tab: 'all' | 'featured' | 'businesses') => void;
  stats: {
    totalShops: number;
    featuredShops: number;
    totalCompanies: number;
  };
}

const MarketplaceNavigation: React.FC<MarketplaceNavigationProps> = ({
  activeTab,
  onTabChange,
  stats
}) => {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Store className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Marketplace</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {stats.totalShops} shops
          </Badge>
          <Badge variant="outline" className="text-xs">
            {stats.totalCompanies} companies
          </Badge>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-4">
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTabChange('all')}
          className="flex items-center gap-2"
        >
          <Store className="w-4 h-4" />
          All Shops
          <Badge variant="secondary" className="ml-1 text-xs">
            {stats.totalShops}
          </Badge>
        </Button>
        
        <Button
          variant={activeTab === 'featured' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTabChange('featured')}
          className="flex items-center gap-2"
        >
          <Star className="w-4 h-4" />
          Featured Shops
          <Badge variant="secondary" className="ml-1 text-xs">
            {stats.featuredShops}
          </Badge>
        </Button>
        
        <Button
          variant={activeTab === 'businesses' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTabChange('businesses')}
          className="flex items-center gap-2"
        >
          <Building2 className="w-4 h-4" />
          Business Listings
          <Badge variant="secondary" className="ml-1 text-xs">
            {stats.totalCompanies}
          </Badge>
        </Button>
      </div>
    </div>
  );
};

export default MarketplaceNavigation; 