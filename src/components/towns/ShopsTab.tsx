
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Info,
  Loader2
} from 'lucide-react';
import { useShopsData, ShopWithOwner } from '@/hooks/useShopsData';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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

const ShopsTab: React.FC = () => {
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
  const [displayCount, setDisplayCount] = useState(50); // Show 50 shops initially
  const [hideEmpty, setHideEmpty] = useState(false);

  // Get unique item types for category filter
  const categories = useMemo(() => {
    const uniqueTypes = [...new Set(shops.map(shop => shop.item_type))];
    return ['all', ...uniqueTypes.sort()];
  }, [shops]);

  const isFavorite = (shopId: string) => favoriteShops.has(shopId);

  // Filter and sort shops
  const filteredAndSortedShops = useMemo(() => {
    let filtered = shops.filter(shop => {
      const matchesSearch = 
        shop.item_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shop.item_display_name && shop.item_display_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        shop.owner_uuid.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || shop.type === filterType;
      const matchesCategory = selectedCategory === 'all' || shop.item_type === selectedCategory;
      const matchesStock = !hideEmpty || shop.stock > 0;
      
      return matchesSearch && matchesType && matchesCategory && matchesStock;
    });

    // Sort shops - Featured shops always come first
    filtered.sort((a, b) => {
      // First, sort by featured status (featured shops come first)
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      
      // Then apply the selected sort criteria
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
  }, [shops, searchTerm, filterType, sortBy, selectedCategory, hideEmpty]);

  // Get shops to display (limited by displayCount)
  const displayedShops = filteredAndSortedShops.slice(0, displayCount);

  // Statistics
  const stats = useMemo(() => {
    const totalShops = shops.length;
    const buyShops = shops.filter(s => s.type === 'buy').length;
    const sellShops = shops.filter(s => s.type === 'sell').length;
    const featuredShops = shops.filter(s => s.is_featured).length;
    const totalValue = shops.reduce((sum, shop) => sum + (shop.price * shop.stock), 0);
    const uniqueItems = new Set(shops.map(s => s.item_type)).size;
    const activeOwners = new Set(shops.map(s => s.owner_uuid)).size;

    return { totalShops, buyShops, sellShops, featuredShops, totalValue, uniqueItems, activeOwners };
  }, [shops]);

  const handleTypeFilter = (type: 'all' | 'buy' | 'sell') => {
    setFilterType(type);
    setDisplayCount(50); // Reset display count when filtering
    if (type !== 'all') {
      fetchShopsByType(type);
    } else {
      refreshShops();
    }
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    setDisplayCount(50); // Reset display count when filtering
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

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 50);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shops...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold mb-2">Error Loading Shops</h3>
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
          🏪 Nordics Shops
        </h1>
        <p className="text-muted-foreground">
          Discover and trade with players across the server
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-lg font-semibold">{stats.totalShops}</p>
                <p className="text-xs text-muted-foreground">Total Shops</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-lg font-semibold">{stats.buyShops}</p>
                <p className="text-xs text-muted-foreground">Buying</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-lg font-semibold">{stats.sellShops}</p>
                <p className="text-xs text-muted-foreground">Selling</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-lg font-semibold">{formatPrice(stats.totalValue)}</p>
                <p className="text-xs text-muted-foreground">Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-lg font-semibold">{stats.uniqueItems}</p>
                <p className="text-xs text-muted-foreground">Items</p>
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
                    <SelectItem value="buy">Buying Shops</SelectItem>
                    <SelectItem value="sell">Selling Shops</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hide Empty Shops Filter */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hide-empty-shops"
                  checked={hideEmpty}
                  onChange={e => setHideEmpty(e.target.checked)}
                  className="accent-primary w-4 h-4"
                />
                <label htmlFor="hide-empty-shops" className="text-sm text-muted-foreground select-none">
                  Hide Empty Shops
                </label>
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

              {/* Favorites Filter - Removed */}

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

      {/* Featured Shops Section */}
      {stats.featuredShops > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-foreground">Featured Shops</h2>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
              {stats.featuredShops} featured
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedShops
              .filter(shop => shop.is_featured)
              .slice(0, 8) // Show max 8 featured shops
              .map((shop) => (
                <div key={shop.id} className="relative">
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-amber-500 text-white border-0 shadow-lg">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  {viewMode === 'grid' ? (
                    <ShopCard 
                      shop={shop} 
                      formatPrice={formatPrice} 
                      formatLastUpdated={formatLastUpdated}
                    />
                  ) : (
                    <ShopListItem 
                      shop={shop} 
                      formatPrice={formatPrice} 
                      formatLastUpdated={formatLastUpdated}
                    />
                  )}
                </div>
              ))}
          </div>
          {displayedShops.filter(shop => shop.is_featured).length > 8 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Showing 8 of {displayedShops.filter(shop => shop.is_featured).length} featured shops
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing {displayedShops.length} of {filteredAndSortedShops.length} shops
          {filteredAndSortedShops.length > displayedShops.length && ` (${filteredAndSortedShops.length - displayedShops.length} more available)`}
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
          {displayedShops.map((shop) => (
            <ShopCard 
              key={shop.id} 
              shop={shop} 
              formatPrice={formatPrice} 
              formatLastUpdated={formatLastUpdated}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedShops.map((shop) => (
            <ShopListItem 
              key={shop.id} 
              shop={shop} 
              formatPrice={formatPrice} 
              formatLastUpdated={formatLastUpdated}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {filteredAndSortedShops.length > displayedShops.length && (
        <div className="flex justify-center pt-6">
          <Button 
            onClick={handleLoadMore} 
            variant="outline" 
            size="lg"
            className="px-8"
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Load More Shops ({Math.min(50, filteredAndSortedShops.length - displayedShops.length)} more)
          </Button>
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
    </div>
  );
};

export default ShopsTab;
