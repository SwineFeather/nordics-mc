
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
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      features: [
        '/hat command (block in hand becomes hat)',
        'Invisible item frames (/itf toggle)',
        '/nick command with ~ prefix',
        '/me command for narrative messages',
        '15% discount on Treasure Chests',
        'Pets: Piggy, Cow',
        'Particle Effects: Snow footprints',
        'Mounts: Horse'
      ]
    },
    {
      name: 'Fancy Kala',
      price: '$10/month',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      features: [
        'All Kala benefits',
        'Rename items with /itemname',
        'Change item lore with /itemlore',
        '20% discount on Treasure Chests',
        'Pets: Frog',
        'Particle Effects: Spring footprints, Rain Cloud, Notes',
        'Mounts: Donkey, Pig'
      ]
    },
    {
      name: 'Golden Kala',
      price: '$15/month',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      features: [
        'All Fancy Kala benefits',
        '25% discount on Treasure Chests',
        'Pets: Allay',
        'Particle Effects: Divine Halo, Ender Aura',
        'Mounts: Ecologist Horse'
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold gradient-text mb-4 flex items-center justify-center">
          <ShoppingCart className="w-10 h-10 mr-3" />
          Server Store
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Support our server and gain access to exclusive cosmetics, commands, and features. 
          Every contribution helps keep Nordics alive and thriving!
        </p>
      </div>

      {/* Patreon Support Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Monthly Patron Support</h2>
          <p className="text-muted-foreground">
            Become a monthly supporter and gain access to exclusive cosmetics that refresh every month
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {patronTiers.map((tier, index) => (
            <Card key={tier.name} className={`relative hover:shadow-lg transition-shadow ${index === 1 ? 'ring-2 ring-primary' : ''}`}>
              {index === 1 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {index === 0 && <Star className="w-6 h-6 text-blue-500" />}
                  {index === 1 && <Crown className="w-6 h-6 text-purple-500" />}
                  {index === 2 && <Sparkles className="w-6 h-6 text-yellow-500" />}
                </div>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <div className="text-3xl font-bold">{tier.price}</div>
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
                <Button className="w-full" onClick={() => window.open('https://www.patreon.com/nordics', '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Support on Patreon
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Support Message */}
      <div className="mt-12 text-center bg-muted/30 rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-4">Why Support Nordics?</h3>
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
