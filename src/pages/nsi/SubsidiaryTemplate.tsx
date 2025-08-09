import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ShopCard from '@/components/towns/ShopCard';
import { formatPrice, formatLastUpdated } from '@/utils/marketplaceUtils';

interface Shop {
  id: string;
  owner_uuid: string;
  world: string;
  x: number;
  y: number;
  z: number;
  item_type: string;
  item_amount: number;
  item_durability: number;
  item_display_name: string | null;
  item_lore: string[] | null;
  item_enchants: any | null;
  item_custom_model_data: number | null;
  item_unbreakable: boolean | null;
  price: number;
  type: 'buy' | 'sell';
  stock: number;
  unlimited: boolean;
  last_updated: number;
  description: string | null;
  company_id?: string | null;
  is_featured?: boolean;
}

interface CompanyRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  industry: string | null;
  business_type: string | null;
  shops?: Shop[];
}

interface SubsidiaryTemplateProps {
  name: string;
  slug: string;
  tagline?: string;
  heroIcon?: React.ReactNode;
  description: string[];
  highlights?: string[];
  offeringsTitle?: string;
  offerings?: string[];
}

const SubsidiaryTemplate: React.FC<SubsidiaryTemplateProps> = ({
  name,
  slug,
  tagline,
  heroIcon,
  description,
  highlights = [],
  offeringsTitle = 'Offerings',
  offerings = [],
}) => {
  const [company, setCompany] = useState<CompanyRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const { data, error } = await (supabase as any)
          .from('companies')
          .select(`*, shops:shops(*)`)
          .eq('slug', slug)
          .eq('status', 'active')
          .single();
        if (error) {
          setCompany(null);
        } else {
          setCompany(data || null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [slug]);

  const bg = `linear-gradient(135deg, ${company?.primary_color || '#1E40AF'}20, ${company?.secondary_color || '#F59E0B'}20)`;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-xl overflow-hidden border" style={{ background: bg }}>
        <div className="px-6 md:px-10 py-10 md:py-16">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-primary/20 flex items-center justify-center border">
              {heroIcon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline">Subsidiary</Badge>
                <Badge>{name}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{name}</h1>
              {tagline && <p className="text-muted-foreground max-w-3xl">{tagline}</p>}
            </div>
            <div className="hidden md:block">
              <Button asChild variant="outline"><Link to="/nsi"><ArrowLeft className="w-4 h-4 mr-2" />NSI Home</Link></Button>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {description.map((p, i) => (
            <p key={i} className="text-muted-foreground">{p}</p>
          ))}
        </CardContent>
      </Card>

      {/* Highlights */}
      {highlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc pl-6">
              {highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Offerings */}
      {offerings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{offeringsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc pl-6">
              {offerings.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Shops */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> Shops</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : company?.shops && company.shops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {company.shops.map((shop) => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  formatPrice={formatPrice}
                  formatLastUpdated={formatLastUpdated}
                  onToggleFavorite={() => {}}
                  isFavorite={() => false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No shops listed yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubsidiaryTemplate;


