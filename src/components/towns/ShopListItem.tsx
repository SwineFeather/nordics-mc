import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Clock, 
  Calculator, 
  Eye, 
  Heart,
  Minus,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ShopWithOwner } from '@/hooks/useShopsData';
import MinecraftItemImage from '@/components/ui/MinecraftItemImage';
import { 
  getItemDisplayName, 
  getTypeColor, 
  getWorldDisplayName, 
  formatCoordinates,
  getStockDisplay,
  getStockColor
} from '@/utils/marketplaceUtils';

interface ShopListItemProps {
  shop: ShopWithOwner;
  formatPrice: (price: number) => string;
  formatLastUpdated: (timestamp: number) => string;
  onToggleFavorite: (shopId: string) => void;
  isFavorite: (shopId: string) => boolean;
}

const ShopListItem: React.FC<ShopListItemProps> = ({ 
  shop, 
  formatPrice, 
  formatLastUpdated, 
  onToggleFavorite, 
  isFavorite 
}) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  
  const handleViewShop = () => {
    navigate(`/shop/${shop.id}`);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(shop.id);
  };

  const maxQuantity = shop.unlimited ? 999 : shop.stock;
  const totalCost = quantity * shop.price;

  const handleQuantityChange = (value: number) => {
    const newQuantity = Math.max(1, Math.min(value, maxQuantity));
    setQuantity(newQuantity);
  };

  const incrementQuantity = () => {
    handleQuantityChange(quantity + 1);
  };

  const decrementQuantity = () => {
    handleQuantityChange(quantity - 1);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="group relative">
            <MinecraftItemImage itemType={shop.item_type} size="2xl" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {getItemDisplayName(shop.item_type, shop.item_display_name)}
              {shop.item_custom_model_data && ` (Model #${shop.item_custom_model_data})`}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                {getItemDisplayName(shop.item_type, shop.item_display_name)}
              </h3>
              <Badge className={`${getTypeColor(shop.type)} text-white`}>
                {shop.type === 'buy' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                <span className="ml-1">{shop.type === 'buy' ? 'BUYING' : 'SELLING'}</span>
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Price:</span>
                <span className="ml-2 font-semibold text-primary">{formatPrice(shop.price)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Stock:</span>
                <span className={`ml-2 font-medium ${getStockColor(shop.stock, shop.unlimited)}`}>
                  {getStockDisplay(shop.stock, shop.unlimited)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <span className="ml-2 font-medium">{shop.item_amount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Owner:</span>
                <span className="ml-2 font-medium truncate">{shop.owner_uuid}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{getWorldDisplayName(shop.world)} ({formatCoordinates(shop.x, shop.y, shop.z)})</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatLastUpdated(shop.last_updated)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            {/* Calculator Section */}
            <div className="flex items-center gap-2 bg-muted/30 p-2 rounded border">
              <Calculator className="w-4 h-4 text-primary" />
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="w-6 h-6 p-0"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  min={1}
                  max={maxQuantity}
                  className="w-16 text-center h-8"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={incrementQuantity}
                  disabled={quantity >= maxQuantity}
                  className="w-6 h-6 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">
                  {formatPrice(totalCost)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {quantity} × {formatPrice(shop.price)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleViewShop}>
                <Eye className="w-4 h-4 mr-2" />
                Details
              </Button>
              <Button 
                variant={isFavorite(shop.id) ? "default" : "outline"} 
                size="sm"
                onClick={handleToggleFavorite}
              >
                <Heart className={`w-4 h-4 ${isFavorite(shop.id) ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopListItem; 