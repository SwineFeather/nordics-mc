import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  MapPin, 
  User, 
  Coins, 
  Package, 
  Clock,
  Shield,
  ShoppingCart,
  Heart,
  Share2,
  ExternalLink,
  Globe,
  Info,
  Star,
  Zap,
  Edit3,
  Save,
  X,
  Eye,
  FileText
} from 'lucide-react';
import { useShopsData, ShopWithOwner } from '@/hooks/useShopsData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  formatPrice, 
  formatLastUpdated, 
  getTypeColor, 
  getStockDisplay,
  getStockColor,
  formatCoordinates,
  getWorldDisplayName,
  getItemDisplayName
} from '@/utils/marketplaceUtils';
import MinecraftItemImage from '@/components/ui/MinecraftItemImage';
import ShopMapEmbed from '@/components/towns/ShopMapEmbed';
import SimpleMarkdownRenderer from '@/components/SimpleMarkdownRenderer';
import { toast } from 'sonner';

const ShopPage = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { shops, loading, error } = useShopsData();
  const [shop, setShop] = useState<ShopWithOwner | null>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState('');
  const [savingDescription, setSavingDescription] = useState(false);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);

  useEffect(() => {
    if (shopId && shops.length > 0) {
      const foundShop = shops.find(s => s.id === shopId);
      if (foundShop) {
        setShop(foundShop);
        setDescription(foundShop.description || '');
      }
    }
  }, [shopId, shops]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Shop link copied to clipboard!');
  };

  const handleFavorite = () => {
    toast.success('Shop added to favorites!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Shop: ${getItemDisplayName(shop?.item_type || '', shop?.item_display_name)}`,
        text: `Check out this shop on Nordics World!`,
        url: window.location.href
      });
    } else {
      copyLink();
    }
  };

  const canEditDescription = () => {
    if (!shop || !user) return false;
    return shop.owner_uuid === user.id || profile?.role === 'admin' || profile?.role === 'moderator';
  };

  const canFeatureShop = () => {
    if (!user) return false;
    return profile?.role === 'admin' || profile?.role === 'moderator';
  };

  const handleEditDescription = () => {
    setIsEditingDescription(true);
  };

  const handleSaveDescription = async () => {
    if (!shop) return;
    
    try {
      setSavingDescription(true);
      
      // Update database (using type assertion since shops table may not be in types yet)
      const { error } = await (supabase as any)
        .from('shops')
        .update({ description: description.trim() || null })
        .eq('id', shop.id);

      if (error) {
        console.error('Database error:', error);
        throw new Error('Failed to save to database');
      }

      // Update local state
      setShop(prev => prev ? { ...prev, description: description.trim() || null } : null);
      setIsEditingDescription(false);
      setShowMarkdownPreview(false);
      toast.success('Shop description updated successfully!');
    } catch (err) {
      console.error('Error updating shop description:', err);
      toast.error('Failed to update shop description');
    } finally {
      setSavingDescription(false);
    }
  };

  const handleCancelEdit = () => {
    setDescription(shop?.description || '');
    setIsEditingDescription(false);
    setShowMarkdownPreview(false);
  };

  const handleFeatureShop = async () => {
    if (!shop) return;
    
    try {
      const newFeaturedStatus = !shop.is_featured;
      
      // Update database
      const { error } = await (supabase as any)
        .from('shops')
        .update({ is_featured: newFeaturedStatus })
        .eq('id', shop.id);

      if (error) {
        console.error('Database error:', error);
        throw new Error('Failed to update featured status');
      }

      // Update local state
      setShop(prev => prev ? { ...prev, is_featured: newFeaturedStatus } : null);
      toast.success(newFeaturedStatus ? 'Shop featured successfully!' : 'Shop unfeatured successfully!');
    } catch (err) {
      console.error('Error updating featured status:', err);
      toast.error('Failed to update featured status');
    }
  };

  // Test function to verify database connection
  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('shops')
        .select('id, description')
        .limit(1);
      
      if (error) {
        console.error('Database test failed:', error);
        toast.error('Database connection test failed');
      } else {
        console.log('Database test successful:', data);
        toast.success('Database connection working!');
      }
    } catch (err) {
      console.error('Database test error:', err);
      toast.error('Database test error');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading shop data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Shop Not Found</h3>
          <p className="text-muted-foreground mb-4">
            {error || 'The shop you are looking for does not exist or has been removed.'}
          </p>
          <Button onClick={() => navigate('/towns')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          onClick={() => navigate('/towns')} 
          variant="ghost" 
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <MinecraftItemImage itemType={shop.item_type} size="2xl" />
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {getItemDisplayName(shop.item_type, shop.item_display_name)}
              </h1>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${getTypeColor(shop.type)} text-white`}>
                  {shop.type === 'buy' ? '📥' : '📤'} {shop.type.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {getWorldDisplayName(shop.world)}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Owned by {shop.owner_uuid} • Last updated {formatLastUpdated(shop.last_updated)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={handleFavorite} variant="outline" size="sm">
              <Heart className="w-4 h-4 mr-2" />
              Favorite
            </Button>
            <Button variant="outline" size="sm">
              <User className="w-4 h-4 mr-2" />
              Contact Owner
            </Button>
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            {canFeatureShop() && (
              <Button 
                onClick={handleFeatureShop} 
                variant={shop.is_featured ? "default" : "outline"} 
                size="sm"
                className={shop.is_featured ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white" : ""}
              >
                <Star className="w-4 h-4 mr-2" />
                {shop.is_featured ? 'Featured' : 'Feature'}
              </Button>
            )}
            <Button className="bg-primary text-primary-foreground" size="sm">
              <ShoppingCart className="w-4 h-4 mr-2" />
              {shop.type === 'buy' ? 'Buy' : 'Sell'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Compact Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Item Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Coins className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-xl font-bold">{formatPrice(shop.price)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Stock</p>
                    <p className={`text-xl font-bold ${getStockColor(shop.stock, shop.unlimited)}`}>
                      {getStockDisplay(shop.stock, shop.unlimited)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-xl font-bold">{shop.item_amount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Updated</p>
                    <p className="text-sm font-bold">{formatLastUpdated(shop.last_updated)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shop Description */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Shop Description
                </CardTitle>
                {canEditDescription() && !isEditingDescription && (
                  <Button variant="outline" size="sm" onClick={handleEditDescription}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingDescription ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      variant={showMarkdownPreview ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                    >
                      {showMarkdownPreview ? (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Edit
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </>
                      )}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Supports Markdown formatting
                    </span>
                  </div>
                  
                  {showMarkdownPreview ? (
                    <div className="min-h-[100px] p-3 border rounded-md bg-muted/20">
                      {description ? (
                        <SimpleMarkdownRenderer content={description} />
                      ) : (
                        <p className="text-muted-foreground italic">No content to preview</p>
                      )}
                    </div>
                  ) : (
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your shop, what you sell, special offers, or any other information...

You can use Markdown formatting:
**Bold text** *Italic text*
# Headers
- Lists
- More items
> Blockquotes
`code` and ```code blocks```"
                      className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                    />
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSaveDescription} 
                      disabled={savingDescription}
                      size="sm"
                    >
                      {savingDescription ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="min-h-[100px]">
                  {shop?.description ? (
                    <SimpleMarkdownRenderer content={shop.description} />
                  ) : (
                    <p className="text-muted-foreground italic">
                      {canEditDescription() 
                        ? "No description yet. Click 'Edit' to add a description for your shop."
                        : "No description available for this shop."
                      }
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Item Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Item Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Basic Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Item Type:</span>
                      <span className="font-medium">{shop.item_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Display Name:</span>
                      <span className="font-medium">{shop.item_display_name || 'Default'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">{shop.item_amount}</span>
                    </div>
                    {shop.item_durability > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Durability:</span>
                        <span className="font-medium">{shop.item_durability}</span>
                      </div>
                    )}
                    {shop.item_custom_model_data && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Custom Model:</span>
                        <span className="font-medium text-purple-600">#{shop.item_custom_model_data}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Properties</h4>
                  <div className="space-y-2">
                    {shop.item_unbreakable && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Shield className="w-4 h-4" />
                        <span>Unbreakable</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shop Type:</span>
                      <Badge className={getTypeColor(shop.type)}>
                        {shop.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unlimited Stock:</span>
                      <span className="font-medium">{shop.unlimited ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Owner:</span>
                      <span className="font-medium truncate">{shop.owner_uuid}</span>
                    </div>
                  </div>
                </div>
              </div>

              {shop.item_enchants && Object.keys(shop.item_enchants).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Enchantments</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(shop.item_enchants as Record<string, any>).map(([enchant, level]) => (
                      <Badge key={enchant} variant="outline">
                        {enchant} {level}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {shop.item_lore && shop.item_lore.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Lore</h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    {shop.item_lore.map((line, index) => (
                      <p key={index} className="text-sm italic text-muted-foreground">
                        "{line}"
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>


        </div>

        {/* Right Column - Live Map View */}
        <div className="space-y-6">
          <ShopMapEmbed 
            shopName={getItemDisplayName(shop.item_type, shop.item_display_name)}
            coordinates={{ x: shop.x, y: shop.y, z: shop.z }}
            world={shop.world}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ShopPage; 