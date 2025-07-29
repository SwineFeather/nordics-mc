import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store, 
  Search, 
  Filter, 
  MapPin, 
  User, 
  Coins, 
  Package, 
  TrendingUp, 
  TrendingDown,
  Star,
  Clock,
  Globe,
  Zap,
  Shield,
  Heart,
  ShoppingCart,
  Eye,
  RefreshCw,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Info
} from 'lucide-react';
import { useShopsData, ShopWithOwner } from '@/hooks/useShopsData';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import MarketplaceNavigation from './MarketplaceNavigation';
import BusinessListings from './BusinessListings';
import ShopCard from './ShopCard';
import ShopListItem from './ShopListItem';
import { 
  getItemIcon, 
  formatPrice, 
  formatLastUpdated, 
  getTypeColor, 
  getTypeIcon,
  getStockDisplay,
  getStockColor,
  formatCoordinates,
  getWorldDisplayName,
  getItemDisplayName
} from '@/utils/marketplaceUtils';
import MinecraftItemImage from '@/components/ui/MinecraftItemImage';

const ModernMarketplace: React.FC = () => {
  const { shops, loading, error, lastSync, fetchShopsByType, fetchShopsByItem, refreshShops } = useShopsData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteShops, setFavoriteShops] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('favoriteShops');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [sortBy, setSortBy] = useState<'recent' | 'price-low' | 'price-high' | 'name'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'businesses'>('all');

  // Get unique item types for category filter
  const categories = useMemo(() => {
    const uniqueTypes = [...new Set(shops.map(shop => shop.item_type))];
    return ['all', ...uniqueTypes.sort()];
  }, [shops]);

  // Filter and sort shops
  const filteredAndSortedShops = useMemo(() => {
    let filtered = shops.filter(shop => {
      const matchesSearch = 
        shop.item_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shop.item_display_name && shop.item_display_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        shop.owner_uuid.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || shop.type === filterType;
      const matchesCategory = selectedCategory === 'all' || shop.item_type === selectedCategory;
      const matchesFavorites = !showFavorites || isFavorite(shop.id);
      const matchesFeatured = activeTab !== 'featured' || (shop.is_featured === true);
      
      return matchesSearch && matchesType && matchesCategory && matchesFavorites && matchesFeatured;
    });

    // Sort shops
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.last_updated - a.last_updated;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return (a.item_display_name || a.item_type).localeCompare(b.item_display_name || b.item_type);
        default:
          return 0;
      }
    });

    return filtered;
  }, [shops, searchTerm, filterType, sortBy, selectedCategory, showFavorites, activeTab]);

  // Statistics
  const stats = useMemo(() => {
    const totalShops = shops.length;
    const buyShops = shops.filter(s => s.type === 'buy').length;
    const sellShops = shops.filter(s => s.type === 'sell').length;
    const totalValue = shops.reduce((sum, shop) => sum + (shop.price * shop.stock), 0);
    const uniqueItems = new Set(shops.map(s => s.item_type)).size;
    const activeOwners = new Set(shops.map(s => s.owner_uuid)).size;
    const featuredShops = shops.filter(s => s.is_featured).length;

    return { totalShops, buyShops, sellShops, totalValue, uniqueItems, activeOwners, featuredShops };
  }, [shops]);

  // Marketplace navigation stats
  const marketplaceStats = useMemo(() => ({
    totalShops: stats.totalShops,
    featuredShops: stats.featuredShops,
    totalCompanies: 0 // This will be updated when we fetch companies
  }), [stats]);

  const handleTypeFilter = (type: 'all' | 'buy' | 'sell') => {
    setFilterType(type);
    if (type !== 'all') {
      fetchShopsByType(type);
    } else {
      refreshShops();
    }
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    if (category !== 'all') {
      fetchShopsByItem(category);
    } else {
      refreshShops();
    }
  };

  const toggleFavorite = (shopId: string) => {
    setFavoriteShops(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(shopId)) {
        newFavorites.delete(shopId);
      } else {
        newFavorites.add(shopId);
      }
      // Save to localStorage
      localStorage.setItem('favoriteShops', JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  };

  const isFavorite = (shopId: string) => favoriteShops.has(shopId);



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold mb-2">Error Loading Marketplace</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={refreshShops} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          🏪 Nordics Marketplace
        </h1>
        <p className="text-muted-foreground">
          Discover, trade, and connect with players across the server
        </p>
      </div>

      {/* Sub-navigation */}
      <MarketplaceNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        stats={marketplaceStats}
      />

      {/* Show different content based on active tab */}
      {activeTab === 'businesses' ? (
        <BusinessListings />
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.totalShops}</p>
                <p className="text-xs text-blue-600/70">Total Shops</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.buyShops}</p>
                <p className="text-xs text-green-600/70">Buy Shops</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.sellShops}</p>
                <p className="text-xs text-purple-600/70">Sell Shops</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{formatPrice(stats.totalValue)}</p>
                <p className="text-xs text-yellow-600/70">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.uniqueItems}</p>
                <p className="text-xs text-red-600/70">Unique Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold text-indigo-600">{stats.activeOwners}</p>
                <p className="text-xs text-indigo-600/70">Shop Owners</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search items, owners, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4">
              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={filterType} onValueChange={(value: 'all' | 'buy' | 'sell') => handleTypeFilter(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="buy">Buy Shops</SelectItem>
                    <SelectItem value="sell">Sell Shops</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Favorites Filter */}
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-muted-foreground" />
                <Button
                  variant={showFavorites ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowFavorites(!showFavorites)}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {showFavorites ? 'Favorites' : 'All Shops'}
                </Button>
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(value: 'recent' | 'price-low' | 'price-high' | 'name') => setSortBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="price-low">Price Low</SelectItem>
                    <SelectItem value="price-high">Price High</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 ml-auto">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing {filteredAndSortedShops.length} of {shops.length} shops
        </p>
        {lastSync && (
          <p className="text-xs text-muted-foreground">
            Last updated: {formatLastUpdated(lastSync.getTime())}
          </p>
        )}
      </div>

      {/* Shops Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedShops.map((shop) => (
            <ShopCard 
              key={shop.id} 
              shop={shop} 
              formatPrice={formatPrice} 
              formatLastUpdated={formatLastUpdated}
              onToggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedShops.map((shop) => (
            <ShopListItem 
              key={shop.id} 
              shop={shop} 
              formatPrice={formatPrice} 
              formatLastUpdated={formatLastUpdated}
              onToggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedShops.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-xl font-bold mb-2">No Shops Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? `No shops match "${searchTerm}"` : 'No shops available at the moment'}
          </p>
          <Button onClick={refreshShops} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default ModernMarketplace; 