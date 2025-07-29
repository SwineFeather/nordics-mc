import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Building } from 'lucide-react';
import { CompanyCard } from './CompanyCard';
import { CreateCompanyModal } from './CreateCompanyModal';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  tagline?: string;
  logo_url?: string;
  banner_url?: string;
  industry?: string;
  business_type?: string;
  status: string;
  created_at: string;
  owner_uuid: string;
  headquarters_coords?: string;
  headquarters_world?: string;
  member_count: number;
  total_revenue?: number;
  verification_status?: string;
  tags?: string[];
}

export const BusinessListings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  const searchCompanies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(20);

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error searching companies:', error);
      toast.error('Failed to search companies');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .limit(20);

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Business Listings</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover player-run businesses and services in our community
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Companies</CardTitle>
          <CardDescription>Find businesses by name or description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search by company name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchCompanies()}
            />
            <Button onClick={searchCompanies} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {companies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          )}

          {companies.length === 0 && !loading && (
            <div className="text-center py-8">
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No companies found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Create Your Company</CardTitle>
            <CardDescription>Establish your business and connect with the community</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateCompanyModal
              onCompanyCreated={loadCompanies}
            />
          </CardContent>
        </Card>
      )}

      <CreateCompanyModal
        onCompanyCreated={loadCompanies}
      />
    </div>
  );
};
