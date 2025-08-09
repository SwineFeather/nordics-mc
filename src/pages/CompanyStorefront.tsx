import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, ArrowLeft, ShoppingBag } from 'lucide-react';
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

interface Company {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  average_rating: number;
  industry: string | null;
  business_type: string | null;
  shops?: Shop[];
}

const CompanyStorefront: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await (supabase as any)
          .from('companies')
          .select(`
            *,
            shops:shops(
              id, owner_uuid, world, x, y, z,
              item_type, item_amount, item_durability, item_display_name,
              item_lore, item_enchants, item_custom_model_data, item_unbreakable,
              price, type, stock, unlimited, last_updated, description, company_id, is_featured
            )
          `)
          .eq('slug', slug)
          .eq('status', 'active')
          .single();

        if (error) throw error;
        setCompany(data || null);
      } catch (e: any) {
        setError(e?.message || 'Failed to load company');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-center">
        <div className="text-4xl mb-4">🏬</div>
        <h1 className="text-2xl font-bold mb-2">Company Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || 'This company is unavailable.'}</p>
        <Button asChild variant="outline"><Link to="/nsi"><ArrowLeft className="w-4 h-4 mr-2" />Back to NSI</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header / Banner */}
      <div className="relative">
        <div
          className="h-48 w-full rounded-lg flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${company.primary_color || '#1E40AF'}20, ${company.secondary_color || '#F59E0B'}20)`,
          }}
        >
          {company.banner_url ? (
            <img src={company.banner_url} alt={`${company.name} banner`} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Welcome to {company.name}</p>
            </div>
          )}
        </div>

        {/* Logo and title */}
        <div className="ml-0 md:ml-48 pt-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">{company.name}</h1>
              {company.tagline && <p className="text-muted-foreground mb-2">{company.tagline}</p>}
              <div className="flex items-center gap-2">
                {company.industry && <Badge variant="outline">{company.industry}</Badge>}
                {company.business_type && <Badge variant="outline">{company.business_type}</Badge>}
              </div>
            </div>
            <div>
              <Button asChild variant="outline"><Link to="/nsi"><ArrowLeft className="w-4 h-4 mr-2" />NSI Home</Link></Button>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      {company.description && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{company.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Shops grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> Shops</CardTitle>
        </CardHeader>
        <CardContent>
          {company.shops && company.shops.length > 0 ? (
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
            <div className="text-center py-10 text-muted-foreground">No shops listed yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyStorefront;


