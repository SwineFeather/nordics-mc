import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Factory, Pickaxe, Banknote, Disc3, Trees, Wand2, Sofa, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const NSI: React.FC = () => {
  const isSubdomain = typeof window !== 'undefined' && window.location.hostname.startsWith('nsi.');

  const subsidiaries: Array<{ name: string; slug: string; icon: React.ReactNode }> = [
    { name: 'Northstar Industries - Sales Division', slug: 'nsi-sales', icon: <Factory className="w-5 h-5 text-primary" /> },
    { name: 'Northstar Industries - Mining Division', slug: 'nsi-mining', icon: <Pickaxe className="w-5 h-5 text-primary" /> },
    { name: 'Northstar Industries - Banking Division', slug: 'nsi-banking', icon: <Banknote className="w-5 h-5 text-primary" /> },
    { name: 'Kabbe2121’s Disk shop', slug: 'kabbe-disk-shop', icon: <Disc3 className="w-5 h-5 text-primary" /> },
    { name: 'Mora Trä', slug: 'mora-tra', icon: <Trees className="w-5 h-5 text-primary" /> },
    { name: 'Magical Tower of friendship', slug: 'magical-tower-of-friendship', icon: <Wand2 className="w-5 h-5 text-primary" /> },
    { name: 'Medieval IKEA', slug: 'medieval-ikea', icon: <Sofa className="w-5 h-5 text-primary" /> },
  ];

  return (
    <div className="space-y-8">
      {/* Hero / Banner */}
      <div
        className="rounded-xl overflow-hidden border"
        style={{
          background:
            'linear-gradient(135deg, rgba(30,64,175,0.12) 0%, rgba(245,158,11,0.12) 100%)',
        }}
      >
        <div className="px-6 md:px-10 py-10 md:py-16">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-primary/20 flex items-center justify-center border">
              <Building2 className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge>Enterprise</Badge>
                {isSubdomain ? (
                  <Badge variant="outline">nsi.localhost</Badge>
                ) : (
                  <Badge variant="outline">/nsi</Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Northstar Industries</h1>
              <p className="text-muted-foreground max-w-3xl">
                Northstar Industries was founded by the residents of Northstar shortly after the town's conception. The
                purpose for the company was to grow Northstars industrial influence and salespower across the world. Its
                placement was perfect for becoming an important trade point, the first marketplace was placed right in
                the center of town and had rentable plots to outsiders and Northmen. This let new companies form such as
                Mora Trä, Kabbe2121’s Disk shop and Aquashore wagon.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Today Northstar Industries is more of a parent company and now has multiple divisions that work in specific
            areas. The organization now mostly works with marketing and trade connections with towns within the nation
            and outside.
          </p>
        </CardContent>
      </Card>

      {/* Subsidiaries */}
      <Card>
        <CardHeader>
          <CardTitle>Subsidiaries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subsidiaries.map((sub) => (
              <Link key={sub.slug} to={`/nsi/${sub.slug}`} className="block">
                <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                    {sub.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{sub.name}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact / Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Partnerships & Opportunities</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          To inquire about partnerships, trade, or joining a division, reach out via the community Discord or contact
          Northstar representatives in-game.
        </CardContent>
      </Card>
    </div>
  );
};

export default NSI;


