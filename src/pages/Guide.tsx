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
  Info,
  Flower,
  Leaf,
  Droplets,
  Apple,
  BookOpen,
  Smile
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
          <TabsList className="flex flex-wrap justify-center items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-3 w-full max-w-6xl mx-auto border border-green-200 dark:border-green-800 shadow-lg min-h-[60px]">
            <TabsTrigger 
              value="cultivation" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold h-10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-green-100 dark:hover:bg-green-900/20 hover:scale-105"
            >
              <Sprout className="w-4 h-4" />
              Cultivation
            </TabsTrigger>
            <TabsTrigger 
              value="fishing" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold h-10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:scale-105"
            >
              <Fish className="w-4 h-4" />
              Fishing
            </TabsTrigger>
            <TabsTrigger 
              value="cosmetics" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold h-10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-pink-100 dark:hover:bg-pink-900/20 hover:scale-105"
            >
              <Palette className="w-4 h-4" />
              Cosmetics
            </TabsTrigger>
            <TabsTrigger 
              value="towny" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold h-10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:scale-105"
            >
              <Building2 className="w-4 h-4" />
              Towny
            </TabsTrigger>
            <TabsTrigger 
              value="company" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold h-10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-purple-100 dark:hover:bg-purple-900/20 hover:scale-105"
            >
              <Building className="w-4 h-4" />
              Company
            </TabsTrigger>
            <TabsTrigger 
              value="war" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold h-10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-red-100 dark:hover:bg-red-900/20 hover:scale-105"
            >
              <Sword className="w-4 h-4" />
              War
            </TabsTrigger>
            <TabsTrigger 
              value="economy" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold h-10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 hover:scale-105"
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
      {/* Header Image */}
      <div className="flex justify-center">
        <img 
          src="/Cultivation.png" 
          alt="Cultivation Guide" 
          className="w-full max-w-2xl h-auto rounded-lg shadow-lg"
        />
      </div>

      {/* Basic Farming Techniques */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-center text-foreground mb-6">
          Basic Farming Techniques
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Zap className="w-5 h-5 text-green-600" />
                Quick Selling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Use <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded">/sell all</code> to sell all Hay Bales in your inventory
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

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Sword className="w-5 h-5 text-green-600" />
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
      </div>
    </div>
  );
};

// Fishing Tab Component
const FishingTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="flex justify-center items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl p-3 w-full max-w-2xl mx-auto border border-blue-200 dark:border-blue-800 shadow-lg min-h-[56px]">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 px-6 py-2 rounded-lg text-base font-semibold text-foreground h-12 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:scale-105"
          >
            <Info className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="fishdex" 
            className="flex items-center gap-2 px-6 py-2 rounded-lg text-base font-semibold text-foreground h-12 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:scale-105"
          >
            <Fish className="w-4 h-4" />
            FishDex
          </TabsTrigger>
        </TabsList>

        {/* Overview Sub-tab - Simplified and Organized */}
        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            {/* How Fishing Works - Simplified */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Target className="w-5 h-5 text-blue-600" />
                  How Fishing Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Fishing Bar:</span> 10 boxes appear on screen. Hit the moving green target!
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Health System:</span> Each hit reduces fish health by 1. Fish have 1-10 health based on rarity.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Lives:</span> Start with 2 lives. Miss a target = lose a life. Lose both = fish escapes!
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Difficulty:</span> Speed increases with fish rarity. Legendary fish move much faster!
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fish Tiers - Simplified */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Trophy className="w-5 h-5 text-blue-600" />
                  Fish Tiers & Rarity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skull className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-600">Immortal:</span>
                      <span className="text-sm text-muted-foreground">Ancient, Artifact, Unique, Mythic</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-600">Legendary:</span>
                      <span className="text-sm text-muted-foreground">Divine, Exotic, Legendary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gem className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-purple-600">Epic:</span>
                      <span className="text-sm text-muted-foreground">Highly valued with benefits</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-600">Rare:</span>
                      <span className="text-sm text-muted-foreground">Uncommon but prized</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-600">Common:</span>
                      <span className="text-sm text-muted-foreground">Basic resources</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-pink-600" />
                      <span className="font-medium text-pink-600">Cosmetic:</span>
                      <span className="text-sm text-muted-foreground">Wearable items</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Badges - Simplified */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Star className="w-5 h-5 text-blue-600" />
                  Special Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <div>
                      <span className="font-medium">Prismatic Badge:</span> +30% XP and +30% Value for prismatic fish
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="font-medium">Magic Badge:</span> Exceptionally rare fish with unpredictable traits
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Gem className="w-5 h-5 text-yellow-600" />
                    <div>
                      <span className="font-medium">Premium Badge:</span> More valuable versions of rare fish
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* FishDex Sub-tab */}
        <TabsContent value="fishdex" className="mt-6">
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-4">
                FishDex - Complete Catalog
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Work in progress
              </p>
            </div>
            
            <div className="flex justify-center">
              <Card className="shadow-sm max-w-md">
                <CardHeader>
                  <CardTitle className="text-center text-foreground">
                    🚧 Coming Soon
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    The FishDex is currently under development. Check back soon for a complete catalog of all fish across different biomes!
                  </p>
                </CardContent>
              </Card>
            </div>









        </div>
      </TabsContent>



        </Tabs>
      </div>
    );
};

// Cosmetics Tab Component
const CosmeticsTab: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Treasure Chests Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Star className="w-5 h-5 text-yellow-600" />
            Treasure Chests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Treasure Chests are a premium feature available for 500 euros. When purchased, four chests will appear around you in-game. Right-click to open them and discover a variety of rewards, including any of the cosmetics listed on our site. These rewards range from common to rare items, giving you a chance to obtain exclusive cosmetics. Additionally, you can win in-game money, with amounts ranging from 40 euros to 200 euros.
          </p>
        </CardContent>
      </Card>

      {/* GIF Section */}
      <div className="flex justify-center">
        <div className="max-w-md">
          <img 
            src="/Minecraft2025.08.14-19.18.06.01-ezgif.com-speed.gif" 
            alt="Minecraft Animation" 
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>

      {/* Comprehensive Cosmetics List */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-center text-foreground">
          Complete Cosmetics Catalog
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pets */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Heart className="w-5 h-5 text-pink-600" />
                Pets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Common</Badge>
                  <span className="text-sm">Piggy, Cow, Chick</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Uncommon</Badge>
                  <span className="text-sm">Bee, Frog</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Rare</Badge>
                  <span className="text-sm">Allay</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Particle Effects */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Zap className="w-5 h-5 text-pink-600" />
                Particle Effects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Common</Badge>
                  <span className="text-sm">Snow Footprints</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Uncommon</Badge>
                  <span className="text-sm">Spring Footprints, Notes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Rare</Badge>
                  <span className="text-sm">Ender Aura, Divine Halo</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mounts */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Target className="w-5 h-5 text-pink-600" />
                Mounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Common</Badge>
                  <span className="text-sm">Horse, Pig</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Uncommon</Badge>
                  <span className="text-sm">Donkey</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Rare</Badge>
                  <span className="text-sm">Ecologist Horse</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hats - Combined Categories */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Crown className="w-5 h-5 text-pink-600" />
                Hats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Emojis */}
              <div>
                <h4 className="font-medium text-sm mb-2 text-foreground">Emojis</h4>
                <div className="text-sm text-muted-foreground">
                  Scared, Angel, Embarrassed, Kissy, Sad, Cool, Surprised, Dead, Crying, Big Smile, Wink, Derp, Smile
                </div>
              </div>
              
              {/* Blocks */}
              <div>
                <h4 className="font-medium text-sm mb-2 text-foreground">Blocks</h4>
                <div className="text-sm text-muted-foreground">
                  Iron, Gold, Diamond, Piston, Command Block, Music, Bedrock
                </div>
              </div>
              
              {/* Mobs */}
              <div>
                <h4 className="font-medium text-sm mb-2 text-foreground">Mobs</h4>
                <div className="text-sm text-muted-foreground">
                  Squid, Chicken, Pig, Blaze, Golem, Enderman
                </div>
              </div>
              
              {/* Characters */}
              <div>
                <h4 className="font-medium text-sm mb-2 text-foreground">Characters</h4>
                <div className="text-sm text-muted-foreground">
                  Mario, Luigi, Batman, Skull, Ghost, Jack O' Lantern, Scary Clown, Santa, Present, Elf, All Colored Crewmates
                </div>
              </div>
              
              {/* Edibles */}
              <div>
                <h4 className="font-medium text-sm mb-2 text-foreground">Edibles</h4>
                <div className="text-sm text-muted-foreground">
                  Bread, Cheese, Pancakes, Cake, Cookie, Candy Cane, Chocolate, White Chocolate, Apple, Melon, Carved Pumpkin, Strawberry, Coconut, Taco, Bacon, Fries, Hamburger, Popcorn, White Donut, Pink Donut, Chocolate Donut, Pie
                </div>
              </div>
              
              {/* Alphabet */}
              <div>
                <h4 className="font-medium text-sm mb-2 text-foreground">Alphabet</h4>
                <div className="text-sm text-muted-foreground">
                  All letters in the English Alphabet
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Towny Tab Component
const TownyTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<string>('town');

  return (
    <div className="space-y-8">
      {/* Sub-navigation for Towny */}
      <div className="flex justify-center">
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveSubTab('town')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeSubTab === 'town'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-2" />
            Town
          </button>
          <button
            onClick={() => setActiveSubTab('nation')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeSubTab === 'nation'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Crown className="w-4 h-4 inline mr-2" />
            Nation
          </button>
          <button
            onClick={() => setActiveSubTab('plot')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeSubTab === 'plot'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-2" />
            Plot
          </button>
        </div>
      </div>

      {/* Quick Menu Commands */}
      <Card className="shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Zap className="w-5 h-5 text-orange-600" />
            Quick Menu Commands
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <code className="text-lg font-mono text-orange-700 dark:text-orange-300">/plot menu</code>
              <p className="text-sm text-muted-foreground mt-1">Plot management interface</p>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <code className="text-lg font-mono text-orange-700 dark:text-orange-300">/nation menu</code>
              <p className="text-sm text-muted-foreground mt-1">Nation management interface</p>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <code className="text-lg font-mono text-orange-700 dark:text-orange-300">/town menu</code>
              <p className="text-sm text-muted-foreground mt-1">Town management interface</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content based on active sub-tab */}
      {activeSubTab === 'town' && <TownSection />}
      {activeSubTab === 'nation' && <NationSection />}
      {activeSubTab === 'plot' && <PlotSection />}
    </div>
  );
};

// Town Section Component
const TownSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-center text-foreground mb-6">
        Town Management
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Building2 className="w-5 h-5 text-orange-600" />
              Creating a Town
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                To create a town, type <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/town new &lt;townname&gt;</code> while standing in the desired location.
              </p>
              <p className="text-sm text-muted-foreground">
                Set town spawn: <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/town set spawn</code>
              </p>
              <p className="text-sm text-muted-foreground">
                Set town board: <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/town set board &lt;message&gt;</code>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="w-5 h-5 text-orange-600" />
              Town Residents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Add resident: <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/town add &lt;playername&gt;</code>
              </p>
              <p className="text-sm text-muted-foreground">
                Remove resident: <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/town remove &lt;playername&gt;</code>
              </p>
              <p className="text-sm text-muted-foreground">
                Set mayor: <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/town set mayor &lt;playername&gt;</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Nation Section Component
const NationSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-center text-foreground mb-6">
        Nation Management
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Crown className="w-5 h-5 text-orange-600" />
              Creating a Nation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                To create a nation, type <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/nation new &lt;nationname&gt;</code> while you are a mayor of a town.
              </p>
              <p className="text-sm text-muted-foreground">
                Add town to nation: <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/nation add &lt;townname&gt;</code>
              </p>
              <p className="text-sm text-muted-foreground">
                Set capital: <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">/nation set capital &lt;townname&gt;</code>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="w-5 h-5 text-orange-600" />
              Government Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Government types are set through the Edit Nation interface, not through in-game commands. Leaders can customize their nation's government structure using a hierarchical selection system.
              </p>
              <div className="text-sm">
                <strong>Government Structure:</strong>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>• <strong>Ruling Entity:</strong> Who/what actually rules (Monarch, President, Council, etc.)</li>
                  <li>• <strong>Government System:</strong> How the government is organized (Monarchy, Democracy, Republic, etc.)</li>
                  <li>• <strong>Economic System:</strong> How resources and wealth are distributed</li>
                </ul>
              </div>
              <div className="text-sm mt-3">
                <strong>Available Categories:</strong>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>• <strong>Traditional Nobility:</strong> Monarch, Emperor, King, Queen, Duke, etc.</li>
                  <li>• <strong>Elected Leaders:</strong> President, Prime Minister, Chancellor, etc.</li>
                  <li>• <strong>Council & Assembly:</strong> Parliament, Senate, Congress, etc.</li>
                  <li>• <strong>Military Leaders:</strong> General, Admiral, Warlord, etc.</li>
                  <li>• <strong>Fantasy & Mythical:</strong> Dragon, Phoenix, Wizard, etc.</li>
                  <li>• <strong>And many more specialized categories</strong></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Coins className="w-5 h-5 text-orange-600" />
              Economic Systems
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Economic systems are set through the Edit Nation interface. Nations can have different economic systems that determine how resources and wealth are distributed.
              </p>
              <div className="text-sm">
                <strong>Common Systems:</strong>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>• Capitalist - Free market economy</li>
                  <li>• Socialist - Government helps share resources</li>
                  <li>• Mixed Economy - Combination of both</li>
                  <li>• Resource-Based - Focus on natural resources</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="w-5 h-5 text-orange-600" />
              Vassals & Subnations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Vassal status is set through the Edit Nation interface. A vassal nation is under the protection and influence of a larger nation while maintaining some independence.
              </p>
              <div className="text-sm">
                <strong>Benefits:</strong>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>• Military protection from larger nation</li>
                  <li>• Economic benefits and trade agreements</li>
                  <li>• Diplomatic support in international relations</li>
                  <li>• Shared resources and infrastructure</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Plot Section Component
const PlotSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-center text-foreground mb-6">
        Plot Management
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Store className="w-5 h-5 text-orange-600" />
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

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="w-5 h-5 text-orange-600" />
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
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Building2 className="w-5 h-5 text-orange-600" />
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
  );
};

// Company Tab Component
const CompanyTab: React.FC = () => {
  return (
    <div className="space-y-6">
      

      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <Building className="w-24 h-24 mx-auto mb-4 text-purple-400 dark:text-purple-600" />
          <h3 className="text-2xl font-bold text-foreground mb-2">
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
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <Sword className="w-24 h-24 mx-auto mb-4 text-red-400 dark:text-red-600" />
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Work in Progress
          </h3>
          <p className="text-muted-foreground">
            War guide features are under development
          </p>
        </div>
      </div>
    </div>
  );
};

// Economy Tab Component
const EconomyTab: React.FC = () => {
  return (
    <div className="space-y-6">
      

      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Store className="w-5 h-5 text-yellow-600" />
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
                  <h4 className="font-semibold text-foreground mb-2">Place the Chest</h4>
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
                  <h4 className="font-semibold text-foreground mb-2">Left-Click the Chest</h4>
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
                  <h4 className="font-semibold text-foreground mb-2">Restock the Shop</h4>
                  <p className="text-sm text-muted-foreground">
                    Shop created! Restock by placing items in the chest.
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
