
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, Crown, Sparkles, ExternalLink, HelpCircle } from 'lucide-react';

// Custom component for Treasure Chests with hover info
const TreasureChestInfo = ({ discount }: { discount: string }) => (
  <span className="group relative inline-flex items-center gap-1 cursor-help">
    <span className="underline decoration-dotted">{discount} discount on Treasure Chests</span>
    <HelpCircle className="w-4 h-4 text-muted-foreground" />
    
    {/* Hover tooltip */}
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
      <div className="text-center">
        <p>Treasure Chests cost €500</p>
        <p>Right-click 4 chests to earn cosmetics & money</p>
        <p>Use command: <code className="bg-gray-800 px-1 rounded">/uc menu</code></p>
        <a href="/guide/cosmetics" className="text-blue-300 hover:text-blue-100 underline">Read more →</a>
      </div>
      {/* Arrow */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  </span>
);

const Store = () => {
  const patronTiers = [
    {
      name: 'Kala',
      price: '$1/month',
      moneyEarned: '€4 passive income',
      color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-200 dark:border-orange-800',
      icon: <Star className="w-6 h-6 text-orange-500" />,
      features: [
        'Invisible item frames (/itf toggle)',
        <TreasureChestInfo key="kala-chest" discount="15%" />,
        'Pets: Piggy, Cow',
        'Particle Effects: Snow footprints',
        'Mounts: Horse',
        'Kala Discord role',
        'Access to Supporter channel on Discord',
        'Priority support'
      ]
    },
    {
      name: 'Fancy Kala',
      price: '$5/month',
      moneyEarned: '€4.5 passive income',
      color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-orange-800',
      icon: <Crown className="w-6 h-6 text-red-500" />,
      features: [
        'All Kala benefits',
        <TreasureChestInfo key="fancy-chest" discount="20%" />,
        'Pets: Frog',
        'Particle Effects: Spring footprints, Rain Cloud, Notes',
        'Mounts: Donkey, Pig',
        'Fancy Kala Discord role'
      ]
    },
    {
      name: 'Golden Kala',
      price: '$10/month',
      moneyEarned: '€5 passive income',
      color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-orange-800',
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      features: [
        'All Fancy Kala benefits',
        <TreasureChestInfo key="golden-chest" discount="25%" />,
        'Pets: Allay',
        'Particle Effects: Divine Halo, Ender Aura',
        'Mounts: Ecologist Horse',
        'Golden Kala Discord role'
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 mr-3" />
            Server Store
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          
        </p>
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-800 dark:text-green-200 text-sm">
            <span className="font-semibold">💰 Active Player Rewards:</span> All players earn €2 passive income for being active on the server. 
            Patrons earn even more: Kala (€4), Fancy Kala (€4.5), Golden Kala (€5) - <span className="italic">Coming Soon!</span>
          </p>
        </div>
        
        {/* Cosmetics Guide Link */}
        <div className="mt-4 text-center">
          <a 
            href="/guide/cosmetics" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            🎨 Learn more about cosmetics and drops →
          </a>
        </div>
      </div>

      {/* Patreon Support Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Monthly Patron Support</h2>
          <p className="text-muted-foreground">
            
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {patronTiers.map((tier, index) => (
            <Card key={tier.name} className={`relative hover:shadow-lg transition-shadow border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 ${index === 1 ? 'ring-2 ring-orange-500' : ''}`}>
              {index === 1 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {tier.icon}
                </div>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">{tier.price}</div>
                <div className="text-sm text-muted-foreground mt-2">
                  <span className="font-semibold text-green-600 dark:text-green-400">{tier.moneyEarned}</span>
                  <br />
                  <span className="text-xs">(Coming Soon)</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white" onClick={() => window.open('https://www.patreon.com/nordics', '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Support on Patreon
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Support Message */}
      <div className="mt-12 text-center bg-gradient-to-br from-orange-50/50 via-red-50/50 to-amber-50/50 dark:from-orange-950/20 dark:via-red-950/20 dark:to-amber-950/20 rounded-lg p-8 border border-orange-200 dark:border-orange-800">
        <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Why Support Nordics?</h3>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          As a small community-driven server, we rely on your support to keep our world alive and thriving. 
          Being a non-profit means every contribution goes directly toward server maintenance, infrastructure improvements, and new features. 
          Your support ensures we can stay online for years to come, providing the best possible experience for all our players. 
          No matter the size, every donation makes a meaningful difference in our community's future.
        </p>
      </div>
    </div>
  );
};

export default Store;
