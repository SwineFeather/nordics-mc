
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, Crown, Sparkles, ExternalLink } from 'lucide-react';

const Store = () => {
  const patronTiers = [
    {
      name: 'Kala',
      price: '$5/month',
      color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-200 dark:border-orange-800',
      icon: <Star className="w-6 h-6 text-orange-500" />,
      features: [
        '/hat command (block in hand becomes hat)',
        'Invisible item frames (/itf toggle)',
        '/nick command with ~ prefix',
        '/me command for narrative messages',
        '15% discount on Treasure Chests',
        'Pets: Piggy, Cow',
        'Particle Effects: Snow footprints',
        'Mounts: Horse',
        'Own Discord role',
        'Access to Supporter channel on Discord',
        'Priority support'
      ]
    },
    {
      name: 'Fancy Kala',
      price: '$10/month',
      color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800',
      icon: <Crown className="w-6 h-6 text-red-500" />,
      features: [
        'All Kala benefits',
        'Rename items with /itemname',
        'Change item lore with /itemlore',
        '20% discount on Treasure Chests',
        'Pets: Frog',
        'Particle Effects: Spring footprints, Rain Cloud, Notes',
        'Mounts: Donkey, Pig',
        'Own Discord role',
        'Access to Supporter channel on Discord',
        'Priority support'
      ]
    },
    {
      name: 'Golden Kala',
      price: '$15/month',
      color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800',
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      features: [
        'All Fancy Kala benefits',
        '25% discount on Treasure Chests',
        'Pets: Allay',
        'Particle Effects: Divine Halo, Ender Aura',
        'Mounts: Ecologist Horse',
        'Own Discord role',
        'Access to Supporter channel on Discord',
        'Priority support'
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
          Support our server and gain access to exclusive cosmetics, commands, and features. 
          Every contribution helps keep Nordics alive and thriving!
        </p>
      </div>

      {/* Patreon Support Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Monthly Patron Support</h2>
          <p className="text-muted-foreground">
            Become a monthly supporter and gain access to exclusive cosmetics that refresh every month
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
