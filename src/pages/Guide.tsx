import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
  Smile,
  Landmark,
  Globe,
  Map
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
    if (location.pathname.startsWith('/guide/politics')) return 'politics';
    if (location.pathname.startsWith('/guide/brewing')) return 'brewing';
    return defaultTab;
  };
  
  const [activeTab, setActiveTab] = useState<string>(getActiveTab());
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/guide/${value}`);
  };
  
  return (
    <div className="min-h-[100vh] bg-background py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-6 sm:mb-8">
        <div className="text-center">
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="sticky top-4 space-y-2">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/40 dark:to-slate-900/40 rounded-xl p-3 border border-gray-200 dark:border-gray-700 shadow-lg">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-center">Guide Sections</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleTabChange('cultivation')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'cultivation'
                      ? 'bg-gradient-to-r from-green-500 to-cyan-500 text-white shadow-lg'
                      : 'hover:bg-green-100 dark:hover:bg-green-900/20 text-foreground hover:text-green-700 dark:hover:text-green-300'
                  }`}
                >
                  <Sprout className="w-4 h-4" />
                  <span>Cultivation</span>
                </button>
                
                <button
                  onClick={() => handleTabChange('fishing')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'fishing'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'hover:bg-blue-100 dark:hover:bg-blue-900/20 text-foreground hover:text-blue-700 dark:hover:text-blue-300'
                  }`}
                >
                  <Fish className="w-4 h-4" />
                  <span>Fishing</span>
                </button>
                
                <button
                  onClick={() => handleTabChange('cosmetics')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'cosmetics'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                      : 'hover:bg-pink-100 dark:hover:bg-pink-900/20 text-foreground hover:text-pink-700 dark:hover:text-pink-300'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span>Cosmetics</span>
                </button>
                
                <button
                  onClick={() => handleTabChange('towny')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'towny'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'hover:bg-orange-100 dark:hover:bg-orange-900/20 text-foreground hover:text-orange-700 dark:hover:text-orange-300'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Towny</span>
                </button>
                
                <button
                  onClick={() => handleTabChange('company')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'company'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                      : 'hover:bg-purple-100 dark:hover:bg-purple-900/20 text-foreground hover:text-purple-700 dark:hover:text-purple-300'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>Company</span>
                </button>
                
                <button
                  onClick={() => handleTabChange('war')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'war'
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                      : 'hover:bg-red-100 dark:hover:bg-red-900/20 text-foreground hover:text-red-700 dark:hover:text-red-300'
                  }`}
                >
                  <Sword className="w-4 h-4" />
                  <span>War</span>
                </button>
                
                <button
                  onClick={() => handleTabChange('economy')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'economy'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                      : 'hover:bg-yellow-100 dark:hover:bg-yellow-900/20 text-foreground hover:text-yellow-700 dark:hover:text-yellow-300'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span>Economy</span>
                </button>
                
                <button
                  onClick={() => handleTabChange('politics')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'politics'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'hover:bg-indigo-100 dark:hover:bg-indigo-900/20 text-foreground hover:text-indigo-700 dark:hover:text-indigo-300'
                  }`}
                >
                  <Landmark className="w-4 h-4" />
                  <span>Politics</span>
                </button>
                
                <button
                  onClick={() => handleTabChange('brewing')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === 'brewing'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                      : 'hover:bg-amber-100 dark:hover:bg-amber-900/20 text-foreground hover:text-amber-700 dark:hover:text-amber-300'
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  <span>Brewing</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'cultivation' && <CultivationTab />}
          {activeTab === 'fishing' && <FishingTab />}
          {activeTab === 'cosmetics' && <CosmeticsTab />}
          {activeTab === 'towny' && <TownyTab />}
          {activeTab === 'company' && <CompanyTab />}
          {activeTab === 'war' && <WarTab />}
          {activeTab === 'economy' && <EconomyTab />}
          {activeTab === 'politics' && <PoliticsTab />}
          {activeTab === 'brewing' && <BrewingTab />}
        </div>
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

      {/* Cultivation Guide Content */}
      <div className="space-y-6">
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
      <div className="flex justify-center">
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeSubTab === 'overview'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Info className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveSubTab('fishdex')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeSubTab === 'fishdex'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Fish className="w-4 h-4 inline mr-2" />
            FishDex
          </button>
        </div>
      </div>

      {/* Content based on active sub-tab */}
      {activeSubTab === 'overview' && (
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
        )}

        {/* FishDex Sub-tab */}
        {activeSubTab === 'fishdex' && (
          <div className="mt-6 space-y-8">
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
        )}
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

// Politics Tab Component
const PoliticsTab: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
          <Landmark className="w-10 h-10 text-indigo-600" />
          Politics & Political Map Guide
        </h1>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Learn how to customize your nation's government structure, manage vassals, and understand how politics shape the political map you can see in <a href="/map" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 underline font-medium">/map</a>.
          </p>
      </div>

      {/* Political Map Explanation */}
      <Card className="shadow-lg border-indigo-200 dark:border-indigo-800">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Map className="w-6 h-6 text-indigo-600" />
            Political Map & Nation Customization
          </CardTitle>
          <CardDescription>
            Understanding how your nation's political structure affects the map display
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Important Note
            </h4>
                         <p className="text-blue-800 dark:text-blue-200 text-sm">
               To see your nation's political structure on the map, you need to customize your nation through the Edit Nation interface. 
               The political map at <a href="/map" className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 underline font-medium">/map</a> will display your government system, 
               vassal relationships, and economic system once properly configured.
             </p>
          </div>
          <p className="text-sm text-muted-foreground">
            If you want your nation to have kingdoms or vassals within it, you need to create new nations and set them as vassals in the nation settings. 
            This creates a hierarchical political structure that will be visible on the political map.
          </p>
        </CardContent>
      </Card>

      {/* Government Systems */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Crown className="w-6 h-6 text-yellow-600" />
            Government Systems
          </CardTitle>
          <CardDescription>
            Government systems are set through the Edit Nation interface, not through in-game commands
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Ruling Entity
              </h4>
              <p className="text-sm text-muted-foreground">
                Who/what actually rules (Monarch, President, Council, etc.)
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Landmark className="w-4 h-4 text-green-600" />
                Government System
              </h4>
              <p className="text-sm text-muted-foreground">
                How the government is organized (Monarchy, Democracy, Republic, etc.)
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Economic System
              </h4>
              <p className="text-sm text-muted-foreground">
                How resources and wealth are distributed
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Available Categories:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800">
                Traditional Nobility
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 border-blue-200 dark:border-blue-800">
                Elected Leaders
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200 border-green-200 dark:border-green-800">
                Council & Assembly
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200 border-red-200 dark:border-red-800">
                Military Leaders
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200 border-purple-200 dark:border-purple-800">
                Fantasy & Mythical
              </Badge>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800">
                Specialized Categories
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Examples: Monarch, Emperor, King, Queen, Duke, President, Prime Minister, Chancellor, Parliament, Senate, Congress, General, Admiral, Warlord, Dragon, Phoenix, Wizard, and many more.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Vassals & Subnations */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="w-6 h-6 text-blue-600" />
            Vassals & Subnations
          </CardTitle>
          <CardDescription>
            Vassal status is set through the Edit Nation interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            A vassal nation is under the protection and influence of a larger nation while maintaining some independence.
          </p>
          
          <h4 className="font-semibold text-foreground">Benefits:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h5 className="font-medium text-foreground">Military Protection</h5>
                <p className="text-sm text-muted-foreground">Protection from larger nation</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h5 className="font-medium text-foreground">Economic Benefits</h5>
                <p className="text-sm text-muted-foreground">Trade agreements and shared resources</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h5 className="font-medium text-foreground">Diplomatic Support</h5>
                <p className="text-sm text-muted-foreground">Support in international relations</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h5 className="font-medium text-foreground">Shared Infrastructure</h5>
                <p className="text-sm text-muted-foreground">Access to shared resources and infrastructure</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Economic Systems */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Economic Systems
          </CardTitle>
          <CardDescription>
            Economic systems are set through the Edit Nation interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Nations can choose from a comprehensive range of real-world economic systems that determine how resources, 
            wealth, and production are organized and distributed within their society.
          </p>
          
          <h4 className="font-semibold text-foreground">Available Economic Systems:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200 border-green-200 dark:border-green-800">
              Capitalism
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 border-blue-200 dark:border-blue-800">
              Socialism
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200 border-purple-200 dark:border-purple-800">
              Communism
            </Badge>
            <Badge variant="outline" className="bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200 border-orange-200 dark:border-orange-800">
              Feudalism
            </Badge>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800">
              Mercantilism
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200 border-red-200 dark:border-red-800">
              Anarchy
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800">
              Social Democracy
            </Badge>
            <Badge variant="outline" className="bg-teal-50 text-teal-800 dark:bg-teal-900/20 dark:text-teal-200 border-teal-200 dark:border-teal-800">
              Corporatism
            </Badge>
            <Badge variant="outline" className="bg-pink-50 text-pink-800 dark:bg-pink-900/20 dark:text-pink-200 border-pink-200 dark:border-pink-800">
              Workers' Self-Management
            </Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200 border-amber-200 dark:border-amber-800">
              Market Economy
            </Badge>
            <Badge variant="outline" className="bg-lime-50 text-lime-800 dark:bg-lime-900/20 dark:text-lime-200 border-lime-200 dark:border-lime-800">
              Resource-Based Economy
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            And many more including: Colonialism, Dirigisme, Distributism, Hydraulic Despotism, Inclusive Democracy, 
            Keynesian Economics, Mutualism, National Syndicalism, Network Economy, Non-Property System, Palace Economy, 
            Participatory Economy, Potlatch, Progressive Utilization Theory, Proprietism, Social Credit, and Statism.
          </p>
        </CardContent>
      </Card>

      {/* How to Set Up */}
      <Card className="shadow-lg border-amber-200 dark:border-amber-800">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BookOpen className="w-6 h-6 text-amber-600" />
            How to Set Up Your Nation's Politics
          </CardTitle>
          <CardDescription>
            Step-by-step guide to configuring your nation's political structure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Access Edit Nation Interface</h4>
                <p className="text-sm text-muted-foreground">
                  Use the Edit Nation interface to customize your nation's political structure.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Choose Government Type</h4>
                <p className="text-sm text-muted-foreground">
                  Select your ruling entity, government system, and economic system from the available options.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Create Vassals (Optional)</h4>
                <p className="text-sm text-muted-foreground">
                  If you want subnations, create new nations and set them as vassals in the nation settings.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-sm">
                4
              </div>
              <div>
                                 <h4 className="font-semibold text-foreground mb-2">View on Political Map</h4>
                 <p className="text-sm text-muted-foreground">
                   Check <a href="/map" className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 underline font-medium">/map</a> to see your nation's political structure displayed.
                 </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Brewing Tab Component
const BrewingTab: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">Brewing Guide</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Master the art of brewing with BreweryX - create unique potions, beers, and spirits
        </p>
      </div>

      {/* Video Guide */}
      <Card className="shadow-lg border-blue-200 dark:border-blue-800">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Zap className="w-6 h-6 text-blue-600" />
            Video Guide: How to Brew
          </CardTitle>
          <CardDescription>
            Watch this quick tutorial to see the brewing process in action
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="aspect-video w-full max-w-2xl mx-auto">
            <iframe
              src="https://www.youtube.com/embed/bTv0e1JVmUE"
              title="Brewing Guide Tutorial"
              className="w-full h-full rounded-lg shadow-md"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="mt-4 text-center">
            <a 
              href="https://www.youtube.com/shorts/bTv0e1JVmUE" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline font-medium"
            >
              Watch on YouTube
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card className="shadow-lg border-amber-200 dark:border-amber-800">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Flame className="w-6 h-6 text-amber-600" />
            Getting Started
          </CardTitle>
          <CardDescription>
            Learn the basics of brewing with BreweryX
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Welcome to brewing! Unlike in vanilla Minecraft, it's not as easy as adding an ingredient 
            to a brewing stand and waiting for it to finish. Brewing requires patience and precision - 
            some recipes need exact timing and careful attention to detail. If you rush or make mistakes, 
            your potion quality will suffer or you might end up with something completely different!
          </p>
          <p className="text-muted-foreground">
            Not all recipes need every step - the instructions below show the most common brewing process. 
            Take your time and follow them carefully for the best results!
          </p>
        </CardContent>
      </Card>

      {/* Brewing Process */}
      <Card className="shadow-lg border-green-200 dark:border-green-800">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Droplets className="w-6 h-6 text-green-600" />
            Brewing Process
          </CardTitle>
          <CardDescription>
            Step-by-step brewing instructions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Obtain a cauldron and fill it with water</h4>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Add a heat source under your cauldron</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  This can be one of many: Fire or soul fire, Lava or magma blocks, Campfire or soul campfire
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Add the ingredients for your recipe</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Right click the cauldron with each ingredient
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-sm">
                4
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Use a clock on the cauldron</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Monitor how long the drink has been brewing for
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-sm">
                5
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Extract the contents</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  When brewing time is complete, use 3 glass bottles to fully extract the contents
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> At this point, for some recipes, you may be done! Other recipes may require 
              aging and/or distilling. Please proceed to the next sections for documentation of these processes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Aging */}
      <Card className="shadow-lg border-orange-200 dark:border-orange-800">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TreePine className="w-6 h-6 text-orange-600" />
            Aging
          </CardTitle>
          <CardDescription>
            Age your brews in barrels for enhanced effects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Aging is a feature in BreweryX that allows you to age your brews in barrels. When a brew is aged, 
            it will gain additional effects and values based on the brew's recipe. The aging process is optional 
            on a per-brew basis and depends on the specific recipe you're following.
          </p>
          
          <h4 className="font-semibold text-foreground mt-6 mb-3">Creating a Barrel</h4>
          <p className="text-muted-foreground">
            To create a barrel, you'll need to construct it from wooden planks and place a sign with the text "barrel" on it. 
            The barrel design can vary in size:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
              <h5 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Small Barrel</h5>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                A compact, blocky structure with a 3x3 base and tiered top layers
              </p>
            </div>
            <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
              <h5 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Big Barrel</h5>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                A larger, elongated structure with a 4-block length and elevated on wooden legs
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> A sign with the text "barrel" is required for the barrel to function properly!
            </p>
          </div>
          
          <h4 className="font-semibold text-foreground mt-6 mb-3">Using Barrels</h4>
          <p className="text-muted-foreground">
            After you put your drinks in barrels, you just need to wait! 1 "year" is equal to 1 in-game day. 
            If you overdo the drink or use the wrong type of wood, the drink is likely to spoil.
          </p>
        </CardContent>
      </Card>





      {/* Complete Recipe List */}
      <Card className="shadow-lg border-indigo-200 dark:border-indigo-800">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Complete Recipe List
          </CardTitle>
          <CardDescription>
            All available brewing recipes with difficulty levels and key details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Beers */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-lg border-b border-indigo-200 dark:border-indigo-800 pb-2">
              🍺 Beers (Beginner Friendly)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <h5 className="font-medium text-green-800 dark:text-green-200">Wheat Beer</h5>
                <p className="text-xs text-green-700 dark:text-green-300">Difficulty: 1/10 • Alcohol: 5%</p>
                <p className="text-xs text-green-600 dark:text-green-400">Ingredients: Wheat (3)</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <h5 className="font-medium text-green-800 dark:text-green-200">Beer</h5>
                <p className="text-xs text-green-700 dark:text-green-300">Difficulty: 1/10 • Alcohol: 6%</p>
                <p className="text-xs text-green-600 dark:text-green-400">Ingredients: Wheat (6)</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <h5 className="font-medium text-green-800 dark:text-green-200">Dark Beer</h5>
                <p className="text-xs text-green-700 dark:text-green-300">Difficulty: 2/10 • Alcohol: 7%</p>
                <p className="text-xs text-green-600 dark:text-green-400">Ingredients: Wheat (6)</p>
              </div>
            </div>
          </div>

          {/* Wines & Mead */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-lg border-b border-indigo-200 dark:border-indigo-800 pb-2">
              🍷 Wines & Mead (Medium Difficulty)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <h5 className="font-medium text-purple-800 dark:text-purple-200">Red Wine</h5>
                <p className="text-xs text-purple-700 dark:text-purple-300">Difficulty: 4/10 • Alcohol: 8%</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Ingredients: Sweet Berries (5)</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <h5 className="font-medium text-purple-800 dark:text-purple-200">Mead</h5>
                <p className="text-xs text-purple-700 dark:text-purple-300">Difficulty: 2/10 • Alcohol: 9%</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Ingredients: Sugar Cane (6)</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <h5 className="font-medium text-purple-800 dark:text-purple-200">Apple Mead</h5>
                <p className="text-xs text-purple-700 dark:text-purple-300">Difficulty: 4/10 • Alcohol: 11%</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Ingredients: Sugar Cane (6) + Apple (2)</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <h5 className="font-medium text-purple-800 dark:text-purple-200">Apple Cider</h5>
                <p className="text-xs text-purple-700 dark:text-purple-300">Difficulty: 4/10 • Alcohol: 7%</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Ingredients: Apple (14)</p>
              </div>
            </div>
          </div>

          {/* Spirits */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-lg border-b border-indigo-200 dark:border-indigo-800 pb-2">
              🥃 Spirits (Advanced)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                <h5 className="font-medium text-orange-800 dark:text-orange-200">Whiskey</h5>
                <p className="text-xs text-orange-700 dark:text-orange-300">Difficulty: 7/10 • Alcohol: 26%</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Ingredients: Wheat (10)</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                <h5 className="font-medium text-orange-800 dark:text-orange-200">Rum</h5>
                <p className="text-xs text-orange-700 dark:text-orange-300">Difficulty: 6/10 • Alcohol: 30%</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Ingredients: Sugar Cane (18)</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                <h5 className="font-medium text-orange-800 dark:text-orange-200">Vodka</h5>
                <p className="text-xs text-orange-700 dark:text-orange-300">Difficulty: 4/10 • Alcohol: 20%</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Ingredients: Potato (10)</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                <h5 className="font-medium text-orange-800 dark:text-orange-200">Gin</h5>
                <p className="text-xs text-orange-700 dark:text-orange-300">Difficulty: 6/10 • Alcohol: 20%</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Ingredients: Wheat (9) + Blue Flowers (6) + Apple (1)</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                <h5 className="font-medium text-orange-800 dark:text-orange-200">Tequila</h5>
                <p className="text-xs text-orange-700 dark:text-orange-300">Difficulty: 5/10 • Alcohol: 20%</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Ingredients: Cactus (8)</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                <h5 className="font-medium text-orange-800 dark:text-orange-200">Absinthe</h5>
                <p className="text-xs text-orange-700 dark:text-orange-300">Difficulty: 8/10 • Alcohol: 42%</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Ingredients: Grass (15)</p>
              </div>
            </div>
          </div>

          {/* Special Varieties */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-lg border-b border-indigo-200 dark:border-indigo-800 pb-2">
              ✨ Special Varieties
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h5 className="font-medium text-yellow-800 dark:text-yellow-200">Mushroom Vodka</h5>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">Difficulty: 7/10 • Alcohol: 18%</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">Ingredients: Potato (10) + Mushrooms (6)</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h5 className="font-medium text-yellow-800 dark:text-yellow-200">Fire Whiskey</h5>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">Difficulty: 7/10 • Alcohol: 28%</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">Ingredients: Wheat (10) + Blaze Powder (2)</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h5 className="font-medium text-yellow-800 dark:text-yellow-200">Golden Vodka</h5>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">Difficulty: 6/10 • Alcohol: 20%</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">Ingredients: Potato (10) + Gold Nugget (2)</p>
              </div>
            </div>
          </div>

          {/* Non-Alcoholic */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-lg border-b border-indigo-200 dark:border-indigo-800 pb-2">
              ☕ Non-Alcoholic Drinks
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <h5 className="font-medium text-blue-800 dark:text-blue-200">Coffee</h5>
                <p className="text-xs text-blue-700 dark:text-blue-300">Difficulty: 3/10 • Reduces Alcohol</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Ingredients: Cocoa Beans (12) + Milk (2)</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <h5 className="font-medium text-blue-800 dark:text-blue-200">Hot Chocolate</h5>
                <p className="text-xs text-blue-700 dark:text-blue-300">Difficulty: 2/10</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Ingredients: Cookie (3)</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <h5 className="font-medium text-blue-800 dark:text-blue-200">Iced Coffee</h5>
                <p className="text-xs text-blue-700 dark:text-blue-300">Difficulty: 4/10 • Reduces Alcohol</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Ingredients: Cookie (8) + Snowball (4) + Milk (1)</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <h5 className="font-medium text-blue-800 dark:text-blue-200">Potato Soup</h5>
                <p className="text-xs text-blue-700 dark:text-blue-300">Difficulty: 1/10</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Ingredients: Potato (5) + Grass (3)</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <p className="text-sm text-indigo-800 dark:text-indigo-200">
              <strong>Note:</strong> This list shows all available recipes. Each recipe has different requirements for ingredients, 
              cooking time, aging, and distillation. Start with easier recipes and work your way up as you gain experience!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="shadow-lg border-red-200 dark:border-red-800">
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Info className="w-6 h-6 text-red-600" />
            Troubleshooting
          </CardTitle>
          <CardDescription>
            Common issues and solutions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground mb-4">
            If your brew doesn't turn out as expected:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center text-red-700 dark:text-red-300 text-sm font-bold">
                !
              </div>
              <p className="text-sm text-muted-foreground">Check that all ingredients were added in the correct order</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center text-red-700 dark:text-red-300 text-sm font-bold">
                !
              </div>
              <p className="text-sm text-muted-foreground">Verify the brewing time was accurate</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center text-red-700 dark:text-red-300 text-sm font-bold">
                !
              </div>
              <p className="text-sm text-muted-foreground">Ensure your barrel is properly constructed with the required sign</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center text-red-700 dark:text-red-300 text-sm font-bold">
                !
              </div>
              <p className="text-sm text-muted-foreground">Confirm you're using the right type of wood for aging</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center text-red-700 dark:text-red-300 text-sm font-bold">
                !
              </div>
              <p className="text-sm text-muted-foreground">Check that your heat source is sufficient and consistent</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Guide;
