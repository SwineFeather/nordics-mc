import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sprout, 
  Fish, 
  Palette, 
  Building2, 
  Building, 
  Sword, 
  Coins,

  MapPin,
  Users,
  Crown,
  Shield,
  Target,
  Zap,
  Star,
  Heart,
  Gem,
  Trophy,
  Flame,
  Snowflake,
  TreePine,
  Mountain,
  Waves,
  Sun,
  Moon,
  Skull,
  Store,
  TrendingUp,
  Info
} from 'lucide-react';

interface GuideProps {
  defaultTab?: string;
}

const Guide: React.FC<GuideProps> = ({ defaultTab = 'cultivation' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname.startsWith('/guide/cultivation')) return 'cultivation';
    if (location.pathname.startsWith('/guide/fishing')) return 'fishing';
    if (location.pathname.startsWith('/guide/cosmetics')) return 'cosmetics';
    if (location.pathname.startsWith('/guide/towny')) return 'towny';
    if (location.pathname.startsWith('/guide/company')) return 'company';
    if (location.pathname.startsWith('/guide/war')) return 'war';
    if (location.pathname.startsWith('/guide/economy')) return 'economy';
    return defaultTab;
  };
  
  const [activeTab, setActiveTab] = useState<string>(getActiveTab());
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/guide/${value}`);
  };
  
  return (
    <div className="min-h-[100vh] bg-background py-8">


      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-1 w-full max-w-6xl mx-auto border border-blue-200 dark:border-blue-800 shadow-lg">
            <TabsTrigger 
              value="cultivation" 
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-green-100 dark:hover:bg-green-900/20 hover:scale-105"
            >
              <Sprout className="w-4 h-4" />
              Cultivation
            </TabsTrigger>
            <TabsTrigger 
              value="fishing" 
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:scale-105"
            >
              <Fish className="w-4 h-4" />
              Fishing
            </TabsTrigger>
            <TabsTrigger 
              value="cosmetics" 
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-pink-100 dark:hover:bg-pink-900/20 hover:scale-105"
            >
              <Palette className="w-4 h-4" />
              Cosmetics
            </TabsTrigger>
            <TabsTrigger 
              value="towny" 
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:scale-105"
            >
              <Building2 className="w-4 h-4" />
              Towny
            </TabsTrigger>
            <TabsTrigger 
              value="company" 
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-purple-100 dark:hover:bg-purple-900/20 hover:scale-105"
            >
              <Building className="w-4 h-4" />
              Company
            </TabsTrigger>
            <TabsTrigger 
              value="war" 
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-red-100 dark:hover:bg-red-900/20 hover:scale-105"
            >
              <Sword className="w-4 h-4" />
              War
            </TabsTrigger>
            <TabsTrigger 
              value="economy" 
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 hover:scale-105"
            >
              <Coins className="w-4 h-4" />
              Economy
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="cultivation" className="mt-8">
            <CultivationTab />
          </TabsContent>
          
          <TabsContent value="fishing" className="mt-8">
            <FishingTab />
          </TabsContent>
          
          <TabsContent value="cosmetics" className="mt-8">
            <CosmeticsTab />
          </TabsContent>
          
          <TabsContent value="towny" className="mt-8">
            <TownyTab />
          </TabsContent>
          
          <TabsContent value="company" className="mt-8">
            <CompanyTab />
          </TabsContent>
          
          <TabsContent value="war" className="mt-8">
            <WarTab />
          </TabsContent>
          
          <TabsContent value="economy" className="mt-8">
            <EconomyTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Cultivation Tab Component
const CultivationTab: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Zap className="w-5 h-5" />
              Quick Selling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Use <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded">sell all</code> to sell all Hay Bales in your inventory
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Hay Bale Stack Value:</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  €5.76
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Price may fluctuate based on market conditions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Target className="w-5 h-5" />
              Smart Harvesting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Right-click on fully-grown plants to harvest and replant instantly
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Heart className="w-4 h-4 text-green-600" />
                <span>Maintains field efficiency</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-green-600" />
                <span>Faster than manual replanting</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Sword className="w-5 h-5" />
              The Sickle Tool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Craft a sickle to easily harvest larger parts of a field
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-green-600" />
                <span>Area harvesting capability</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-green-600" />
                <span>Increased efficiency</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Target className="w-5 h-5" />
              Field Layout Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Design your fields for maximum efficiency and easy navigation
            </p>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Grid Pattern:</strong> Plant in straight rows for easy harvesting
              </div>
              <div className="text-sm">
                <strong>Water Access:</strong> Ensure all crops have access to water sources
              </div>
              <div className="text-sm">
                <strong>Path Planning:</strong> Leave walking paths between crop sections
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Zap className="w-5 h-5" />
              Crop Rotation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Rotate different crops to maintain soil fertility and prevent disease
            </p>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Seasonal Planning:</strong> Plant crops appropriate for the current season
              </div>
              <div className="text-sm">
                <strong>Diversity:</strong> Mix different crop types for better yields
              </div>
              <div className="text-sm">
                <strong>Rest Periods:</strong> Allow fields to rest between harvests
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <Coins className="w-5 h-5" />
            Market Timing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Selling Strategies</h4>
              <div className="space-y-2 text-sm">
                <div>• Monitor market prices regularly</div>
                <div>• Sell during peak demand periods</div>
                <div>• Hold crops when prices are low</div>
                <div>• Use bulk selling for better rates</div>
              </div>
            </div>
            <div>
              <h4 className="text-green-700 dark:text-green-300 mb-2">Storage Tips</h4>
              <div className="space-y-2 text-sm">
                <div>• Use chests for long-term storage</div>
                <div>• Organize by crop type</div>
                <div>• Keep emergency supplies</div>
                <div>• Label storage containers</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Fishing Tab Component
const FishingTab: React.FC = () => {
  return (
    <div className="space-y-8">

      {/* Newbie Guide Section */}
      <Card className="border-blue-200 dark:border-blue-800 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Info className="w-5 h-5" />
            Newbie Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">The Fishing Bar</h4>
              <p className="text-sm text-muted-foreground">
                A bar with 10 boxes appears on screen. One highlighted box moves back and forth - 
                time your actions to hit the green target box that appears randomly.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">Health & Lives</h4>
              <p className="text-sm text-muted-foreground">
                Each successful hit reduces fish health by 1. Fish have 1-5 health (Legendary/Mythical up to 10). 
                Start with 2 lives - miss and lose a life!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Target className="w-5 h-5" />
                Difficulty Scaling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The speed of the highlighted box increases based on fish rarity. Common and Rare fish have manageable speeds, 
                while Legendary and Mythical fish require precise timing and skill.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Zap className="w-5 h-5" />
                Special Badges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Prismatic</Badge>
                <span className="text-sm">+30% XP and Value</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Magic</Badge>
                <span className="text-sm">Unpredictable, powerful traits</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Premium</Badge>
                <span className="text-sm">Rarer, more desirable version</span>
              </div>
            </CardContent>
          </Card>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <Crown className="w-5 h-5" />
                Immortal Tier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Ancient</Badge>
                <span className="text-sm">Legendary fish tied to ocean myths</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Artifact</Badge>
                <span className="text-sm">Mysterious origins, unique properties</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Unique</Badge>
                <span className="text-sm">One-of-a-kind special abilities</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Mythic</Badge>
                <span className="text-sm">Rarest, known only in legends</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                <Star className="w-5 h-5" />
                Legendary Tier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Divine</Badge>
                <span className="text-sm">God-like qualities, ancient deities</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Exotic</Badge>
                <span className="text-sm">Vibrant, unique traits, special biomes</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Legendary</Badge>
                <span className="text-sm">Powerful, highly sought after</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Gem className="w-5 h-5" />
                Epic Tier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Epic</Badge>
                <span className="text-sm">Highly valued, significant benefits</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Treasure</Badge>
                <span className="text-sm">Useful loot barrels</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <Star className="w-5 h-5" />
                Rare Tier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Rare</Badge>
                <span className="text-sm">Uncommon, prized for distinct abilities</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Treasure</Badge>
                <span className="text-sm">Valuable loot barrels</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Star className="w-5 h-5" />
                Common Tier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Common</Badge>
                <span className="text-sm">Majority of ocean catches, basic resources</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Utility</Badge>
                <span className="text-sm">Backbone of fishing and crafting</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Biome Information */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: Snowflake, name: 'Snow', color: 'text-blue-400' },
            { icon: Sun, name: 'Temperate', color: 'text-green-400' },
            { icon: Waves, name: 'Cold Ocean', color: 'text-cyan-400' },
            { icon: Waves, name: 'Warm Ocean', color: 'text-blue-400' },
            { icon: Sun, name: 'Desert', color: 'text-yellow-400' },
            { icon: TreePine, name: 'Jungle', color: 'text-green-400' },
            { icon: Moon, name: 'Mushroom', color: 'text-purple-400' },
            { icon: TreePine, name: 'Swamp', color: 'text-green-400' },
            { icon: Mountain, name: 'Caves', color: 'text-gray-400' },
            { icon: Skull, name: 'Deep Dark', color: 'text-gray-600' }
          ].map((biome, index) => (
            <Card key={index} className="text-center p-4 hover:scale-105 transition-transform cursor-pointer">
              <biome.icon className={`w-8 h-8 mx-auto mb-2 ${biome.color}`} />
              <p className="text-sm font-medium">{biome.name}</p>
            </Card>
          ))}
        </div>

        {/* Oceanic Lineage Information */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              In the world of fishing, every fish belongs to a greater species lineage. Though their evolution is hidden in the depths of the ocean's lore, 
              anglers can uncover and learn about these ancient transformations through their catches. The Oceanic Lineage reflects the natural progression 
              of species, with each fish representing a step in its evolutionary history.
            </p>
            <p className="text-sm text-muted-foreground text-center mt-4 leading-relaxed">
              While there's no direct evolution between catches, each species hints at its past and future forms. For example, a common Snapper might be 
              part of a greater lineage that includes the rare Blossomtail Snapper and the even more exotic Flower Snapper. Your catches will automatically 
              populate the Fishdex, giving you insight into the diverse aquatic life and the legendary lore that binds them.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Cosmetics Tab Component
const CosmeticsTab: React.FC = () => {
  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-pink-200 dark:border-pink-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-300">
              <Palette className="w-5 h-5" />
              Customization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Personalize your character with unique cosmetic items
            </p>
          </CardContent>
        </Card>

        <Card className="border-pink-200 dark:border-pink-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-300">
              <Star className="w-5 h-5" />
              Rare Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Discover and collect exclusive cosmetic items
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Towny Tab Component
const TownyTab: React.FC = () => {
  return (
    <div className="space-y-8">


      {/* Quick Menu Commands */}
      <Card className="border-orange-200 dark:border-orange-800 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
            <Zap className="w-5 h-5" />
            Quick Menu Commands
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <code className="text-lg font-mono text-orange-700 dark:text-orange-300">plot menu</code>
              <p className="text-sm text-muted-foreground mt-1">Plot management interface</p>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <code className="text-lg font-mono text-orange-700 dark:text-orange-300">nation menu</code>
              <p className="text-sm text-muted-foreground mt-1">Nation management interface</p>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <code className="text-lg font-mono text-orange-700 dark:text-orange-300">town menu</code>
              <p className="text-sm text-muted-foreground mt-1">Town management interface</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plot Management Section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-center text-orange-700 dark:text-orange-300 mb-6">
          Plot Management
        </h3>
        
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <MapPin className="w-5 h-5" />
              Understanding Plots
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A town consists of several land blocks, where the size of each land block is always 16×16 blocks. 
              When a land block is claimed, it is owned by the town, but it does not become a plot immediately. 
              The land that belongs to the town, but is not a plot, can only be built on and demolished by the town's assistants and mayor.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <Store className="w-5 h-5" />
                Selling Plots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  To put a plot for sale, type <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/plot forsale &lt;price&gt;</code> while standing inside it.
                </p>
                <p className="text-sm text-muted-foreground">
                  Residents can buy the plot by typing <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/plot claim</code>.
                </p>
                <p className="text-sm text-muted-foreground">
                  Set default plot price: <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/town set plotprice &lt;price&gt;</code>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <Shield className="w-5 h-5" />
                Plot Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-2">
                Use <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/plot set perm &lt;group&gt; &lt;permission&gt; [on/off]</code>
              </p>
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Groups:</strong> friend, resident, ally, outsider
                </div>
                <div className="text-sm">
                  <strong>Permissions:</strong> build, destroy, switch, itemuse
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plot Types */}
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Building2 className="w-5 h-5" />
              Plot Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { type: 'default', desc: 'Default plot type, all plots start as default' },
                { type: 'shop', desc: 'Player shop area, appears red on map' },
                { type: 'arena', desc: 'PvP enabled, friendly fire always on' },
                { type: 'embassy', desc: 'Can be bought by any player, even non-residents' },
                { type: 'bank', desc: 'Allows deposit/withdraw from town/nation banks' },
                { type: 'jail', desc: 'Where imprisoned players are sent' },
                { type: 'farm', desc: 'Only crops can be placed/destroyed' },
                { type: 'wilds', desc: 'Semi-protected, trees/flowers can be broken' }
              ].map((plotType, index) => (
                <div key={index} className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="font-semibold text-orange-700 dark:text-orange-300 text-sm">
                    {plotType.type}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {plotType.desc}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Town Management Section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-center text-orange-700 dark:text-orange-300 mb-6">
          Town Management
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <Building2 className="w-5 h-5" />
                General Commands
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/town set name &lt;name&gt;</code> - Change town name
              </div>
              <div className="text-sm">
                <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/town set mayor &lt;player&gt;</code> - Transfer mayorship
              </div>
              <div className="text-sm">
                <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/town set board &lt;message&gt;</code> - Set town board
              </div>
              <div className="text-sm">
                <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/town set homeblock</code> - Set town homeblock
              </div>
              <div className="text-sm">
                <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/town set tag &lt;tag&gt;</code> - Set town tag
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <Crown className="w-5 h-5" />
                Ranks & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Mayor:</strong> Full control, can assign ranks, delete town, create nation
                </div>
                <div className="text-sm">
                  <strong>Co-Mayor:</strong> Same as mayor except cannot delete town, create nation, or set new mayor
                </div>
                <div className="text-sm">
                  <strong>Councillor:</strong> Can create outposts, claim/unclaim land, clear plots, withdraw from bank
                </div>
                <div className="text-sm">
                  <strong>Assistant:</strong> Can reclaim plots, kick residents, build/destroy anywhere
                </div>
                <div className="text-sm">
                  <strong>Helper:</strong> Can add players, put plots for sale, build/destroy (except resident plots)
                </div>
                <div className="text-sm">
                  <strong>Builder:</strong> Can build/destroy anywhere (except resident plots)
                </div>
                <div className="text-sm">
                  <strong>Recruiter:</strong> Can add players to town
                </div>
                <div className="text-sm">
                  <strong>VIP:</strong> Exempt from town taxes
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Creating and Running a Town */}
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Zap className="w-5 h-5" />
              Creating and Running a Town
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">Creating a Town</h4>
                <p className="text-sm text-muted-foreground">
                  Type <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/t new &lt;town name&gt;</code> while standing on the chunk you want as your homeblock. 
                  This chunk becomes your spawn point and town center.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">Inviting Players</h4>
                <p className="text-sm text-muted-foreground">
                  Use <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/t add &lt;player name&gt;</code> to invite players. 
                  They must type <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/accept &lt;town name&gt;</code> to join.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">Claiming Land</h4>
                <p className="text-sm text-muted-foreground">
                  Use <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/t claim</code> to claim adjacent chunks. 
                  Each claim costs €5 from town bank. View borders with <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/resident toggle constantplotborder</code>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Features Section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-center text-orange-700 dark:text-orange-300 mb-6">
          Chat Features
        </h3>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Users className="w-5 h-5" />
              Towny Titles and Surnames
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">Setting Titles & Surnames</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Title:</strong> <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/town set title [player] [title]</code>
                  </div>
                  <div>
                    <strong>Surname:</strong> <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/town set surname [player] [surname]</code>
                  </div>
                  <div>
                    <strong>Remove:</strong> Use "none" instead of title/surname
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">Color Codes</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { code: '&6', color: 'Gold' },
                    { code: '&c', color: 'Red' },
                    { code: '&a', color: 'Green' },
                    { code: '&9', color: 'Blue' },
                    { code: '&d', color: 'Pink' },
                    { code: '&e', color: 'Yellow' },
                    { code: '&f', color: 'White' },
                    { code: '&7', color: 'Gray' }
                  ].map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <code className="bg-orange-100 dark:bg-orange-900 px-1 py-0.5 rounded">{color.code}</code>
                      <span className="text-muted-foreground">{color.color}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <h5 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">Example:</h5>
              <p className="text-sm text-muted-foreground">
                <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/town set title Aytte &6Mayor</code> + 
                <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/town set surname Aytte &ctheBrave</code> = 
                <span className="text-yellow-600">Mayor</span> Aytte <span className="text-red-600">theBrave</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Company Tab Component
const CompanyTab: React.FC = () => {
  return (
    <div className="space-y-6">


      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <Building className="w-24 h-24 mx-auto mb-4 text-purple-400 dark:text-purple-600" />
          <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            Coming Soon
          </h3>
          <p className="text-muted-foreground">
            Company management features are under development
          </p>
        </div>
      </div>
    </div>
  );
};

// War Tab Component
const WarTab: React.FC = () => {
  return (
    <div className="space-y-6">


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <Sword className="w-5 h-5" />
              Combat Basics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Essential combat mechanics and strategies
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <Shield className="w-5 h-5" />
              Defense Strategies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Protect your territory and assets
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <Target className="w-5 h-5" />
              Attack Tactics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Offensive strategies and raid planning
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Economy Tab Component
const EconomyTab: React.FC = () => {
  return (
    <div className="space-y-6">


      <div className="space-y-6">
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
              <Store className="w-5 h-5" />
              How to Create a Shop
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center text-yellow-700 dark:text-yellow-300 font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Place the Chest</h4>
                  <p className="text-sm text-muted-foreground">
                    Start by placing the chest somewhere on a plot you own.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center text-yellow-700 dark:text-yellow-300 font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Left-Click the Chest</h4>
                  <p className="text-sm text-muted-foreground">
                    Left-Click the chest with the item you want to sell in your hand. Then type in the chat what you would like the price per item to be.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center text-yellow-700 dark:text-yellow-300 font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Restock the Shop</h4>
                  <p className="text-sm text-muted-foreground">
                    If everything went well, you should now have a shop that sells a diamond for 250 euros. You can then restock the shop's inventory by placing the remaining 63 diamonds in the chest.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Guide;
