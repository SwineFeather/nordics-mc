
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { 
  TrendingUp, 
  TrendingDown, 
  User, 
  MapPin, 
  Clock, 
  Shield, 
  Calculator, 
  Eye, 
  Heart,
  Minus,
  Plus,
  ChevronDown,
  ChevronRight
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

interface ShopCardProps {
  shop: ShopWithOwner;
  formatPrice: (price: number) => string;
  formatLastUpdated: (timestamp: number) => string;
  onToggleFavorite: (shopId: string) => void;
  isFavorite: (shopId: string) => boolean;
}

const ShopCard: React.FC<ShopCardProps> = ({ 
  shop, 
  formatPrice, 
  formatLastUpdated, 
  onToggleFavorite, 
  isFavorite 
}) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  
  const handleViewShop = () => {
    navigate(`/shop/${shop.id}`);
  };

  const handleMiddleClick = (e: React.MouseEvent) => {
    if (e.button === 1) { // Middle mouse button
      e.preventDefault();
      window.open(`/shop/${shop.id}`, '_blank');
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(shop.id);
  };

  const maxQuantity = shop.unlimited ? 999 : shop.stock;
  const totalCost = quantity * shop.price;

  const handleQuantityChange = useCallback((value: number) => {
    const newQuantity = Math.max(1, Math.min(value, maxQuantity));
    setQuantity(newQuantity);
  }, [maxQuantity]);

  const incrementQuantity = useCallback(() => {
    setQuantity(prev => Math.min(prev + 1, maxQuantity));
  }, [maxQuantity]);

  const decrementQuantity = useCallback(() => {
    setQuantity(prev => Math.max(prev - 1, 1));
  }, []);

  const toggleCalculator = useCallback(() => {
    setCalculatorOpen(prev => !prev);
  }, []);

  const calculatorContent = useMemo(() => (
    <div className="space-y-3 p-3 bg-muted/20 rounded-lg border border-border">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={decrementQuantity}
          disabled={quantity <= 1}
          className="w-8 h-8 p-0"
        >
          <Minus className="w-3 h-3" />
        </Button>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 1;
            setQuantity(Math.max(1, Math.min(value, maxQuantity)));
          }}
          min={1}
          max={maxQuantity}
          className="w-20 text-center"
        />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={incrementQuantity}
          disabled={quantity >= maxQuantity}
          className="w-8 h-8 p-0"
        >
          <Plus className="w-3 h-3" />
        </Button>
        <span className="text-sm text-muted-foreground ml-2">
          of {maxQuantity}
        </span>
      </div>
      
      <div className="text-center">
        <p className="text-lg font-bold text-primary">
          Total: {formatPrice(totalCost)}
        </p>
        <p className="text-xs text-muted-foreground">
          {quantity} × {formatPrice(shop.price)}
        </p>
      </div>
    </div>
  ), [quantity, maxQuantity, totalCost, shop.price, formatPrice, decrementQuantity, incrementQuantity]);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-border bg-card/50 backdrop-blur-sm hover:bg-card/80">
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="group relative">
              <MinecraftItemImage itemType={shop.item_type} size="2xl" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {getItemDisplayName(shop.item_type, shop.item_display_name)}
                {shop.item_custom_model_data && ` (Model #${shop.item_custom_model_data})`}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                {getItemDisplayName(shop.item_type, shop.item_display_name)}
              </CardTitle>
              <p className="text-xs text-muted-foreground truncate">
                {shop.item_type}
              </p>
            </div>
          </div>
          <Badge className={`${getTypeColor(shop.type)} text-white w-fit`}>
            {shop.type === 'buy' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            <span className="ml-1">{shop.type === 'buy' ? 'BUYING' : 'SELLING'}</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Price and Stock */}
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{formatPrice(shop.price)}</p>
            <p className="text-xs text-muted-foreground">per item</p>
          </div>
          <div className="text-center">
            <p className={`text-lg font-semibold ${getStockColor(shop.stock, shop.unlimited)}`}>
              {getStockDisplay(shop.stock, shop.unlimited)}
            </p>
            <p className="text-xs text-muted-foreground">in stock</p>
          </div>
        </div>

        {/* Calculator Section */}
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            onClick={toggleCalculator}
            className="w-full justify-between p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Price Calculator</span>
            </div>
            {calculatorOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
          
          {calculatorOpen && calculatorContent}
        </div>

        {/* Item Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">{shop.item_amount}</span>
          </div>
          {shop.item_durability > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Durability:</span>
              <span className="font-medium">{shop.item_durability}</span>
            </div>
          )}
          {shop.item_custom_model_data && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Custom Model:</span>
              <span className="font-medium text-purple-600">#{shop.item_custom_model_data}</span>
            </div>
          )}
          {shop.item_unbreakable && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <Shield className="w-3 h-3" />
              <span>Unbreakable</span>
            </div>
          )}
          {shop.item_enchants && Object.keys(shop.item_enchants).length > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Enchantments:</span>
              <div className="flex flex-wrap gap-1">
                {Object.entries(shop.item_enchants as Record<string, any>).map(([enchant, level]) => (
                  <Badge key={enchant} variant="outline" className="text-xs">
                    {enchant} {level}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {shop.item_lore && shop.item_lore.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Lore:</span>
              <div className="text-xs text-muted-foreground italic">
                {shop.item_lore.slice(0, 2).map((line, index) => (
                  <div key={index} className="truncate">"{line}"</div>
                ))}
                {shop.item_lore.length > 2 && (
                  <div className="text-xs text-muted-foreground">...and {shop.item_lore.length - 2} more lines</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Owner and Location */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="truncate">{shop.owner_uuid}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="truncate">{getWorldDisplayName(shop.world)} ({formatCoordinates(shop.x, shop.y, shop.z)})</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{formatLastUpdated(shop.last_updated)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
                  <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewShop}
          onMouseDown={handleMiddleClick}
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopCard;
