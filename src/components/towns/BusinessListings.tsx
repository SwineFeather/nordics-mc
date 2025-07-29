import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  Star, 
  MapPin, 
  Globe, 
  Mail, 
  MessageCircle,
  TrendingUp,
  Award,
  Calendar,
  Search,
  Filter,
  ExternalLink,
  Eye,
  Clock,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SimpleMarkdownRenderer from '@/components/SimpleMarkdownRenderer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import CreateCompanyModal from './CreateCompanyModal';
import PendingCompanies from './PendingCompanies';

interface Company {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  website_url: string | null;
  email: string | null;
  discord_invite: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  business_type: string | null;
  industry: string | null;
  founded_date: string | null;
  headquarters_world: string | null;
  headquarters_coords: string | null;
  member_count: number;
  max_members: number | null;
  is_public: boolean;
  is_featured: boolean;
  total_revenue: number;
  total_transactions: number;
  average_rating: number;
  review_count: number;
  owner_uuid: string;
  ceo_uuid: string | null;
  status: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
  shops?: Shop[];
}

interface Shop {
  id: string;
  item_type: string;
  item_display_name: string | null;
  price: number;
  type: 'buy' | 'sell';
  stock: number;
  unlimited: boolean;
  world: string;
  x: number;
  y: number;
  z: number;
  last_updated: number;
}

const BusinessListings: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'revenue' | 'members' | 'created'>('name');
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');

  useEffect(() => {
    fetchCompanies();
  }, [activeTab]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch companies with their associated shops
      const { data: companiesData, error: companiesError } = await (supabase as any)
        .from('companies')
        .select(`
          *,
          shops:shops(
            id,
            item_type,
            item_display_name,
            price,
            type,
            stock,
            unlimited,
            world,
            x,
            y,
            z,
            last_updated
          )
        `)
        .eq('is_public', true)
        .eq('status', activeTab)
        .order('is_featured', { ascending: false });

      if (companiesError) throw companiesError;

      setCompanies(companiesData || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedCompanies = companies
    .filter(company => {
      const matchesSearch = 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.tagline && company.tagline.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesIndustry = industryFilter === 'all' || company.industry === industryFilter;
      
      return matchesSearch && matchesIndustry;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.average_rating - a.average_rating;
        case 'revenue':
          return b.total_revenue - a.total_revenue;
        case 'members':
          return b.member_count - a.member_count;
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

  const industries = [...new Set(companies.map(c => c.industry).filter(Boolean))].sort();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading business listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold mb-2">Error Loading Businesses</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchCompanies} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            🏢 Business Listings
          </h1>
          <p className="text-muted-foreground">
            Discover established companies and their services
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {user && (
            <CreateCompanyModal 
              onCompanyCreated={fetchCompanies}
              isAdmin={profile?.role === 'admin' || profile?.role === 'moderator'}
            />
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: 'active' | 'pending') => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Active Companies
            <Badge variant="secondary" className="ml-1">
              {companies.filter(c => c.status === 'active').length}
            </Badge>
          </TabsTrigger>
          {(profile?.role === 'admin' || profile?.role === 'moderator') && (
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Review
              <Badge variant="secondary" className="ml-1">
                {companies.filter(c => c.status === 'pending').length}
              </Badge>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="active" className="space-y-6">

      {/* Filters */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search companies, industries, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(value: 'name' | 'rating' | 'revenue' | 'members' | 'created') => setSortBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="members">Members</SelectItem>
                    <SelectItem value="created">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing {filteredAndSortedCompanies.length} of {companies.length} companies
        </p>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedCompanies.map((company) => (
          <Card key={company.id} className="group hover:shadow-xl transition-all duration-300 border-border bg-card/50 backdrop-blur-sm hover:bg-card/80">
            <CardHeader className="pb-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {company.logo_url ? (
                      <img 
                        src={company.logo_url} 
                        alt={company.name}
                        className="w-12 h-12 rounded-lg object-cover border"
                      />
                    ) : (
                      <div 
                        className="w-12 h-12 rounded-lg border flex items-center justify-center"
                        style={{ backgroundColor: company.primary_color || '#6B7280' }}
                      >
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                        {company.name}
                      </CardTitle>
                      {company.tagline && (
                        <p className="text-sm text-muted-foreground truncate">
                          {company.tagline}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {company.is_featured && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {company.verification_status === 'verified' && (
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {company.industry && (
                    <Badge variant="outline" className="text-xs">
                      {company.industry}
                    </Badge>
                  )}
                  {company.business_type && (
                    <Badge variant="outline" className="text-xs">
                      {company.business_type}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Description */}
              {company.description && (
                <div className="text-sm text-muted-foreground line-clamp-3">
                  <SimpleMarkdownRenderer content={company.description} />
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-primary">{company.member_count}</p>
                  <p className="text-xs text-muted-foreground">Members</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-primary">{company.shops?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Shops</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-primary">{formatCurrency(company.total_revenue)}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-primary">{company.average_rating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>

              {/* Location */}
              {company.headquarters_world && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{company.headquarters_world}</span>
                  {company.headquarters_coords && (
                    <span className="text-xs">({company.headquarters_coords})</span>
                  )}
                </div>
              )}

              {/* Founded Date */}
              {company.founded_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Founded {formatDate(company.founded_date)}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  className="flex-1" 
                  size="sm"
                  onClick={() => navigate(`/company/${company.slug}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Company
                </Button>
                {company.website_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedCompanies.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-bold mb-2">No Companies Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? `No companies match "${searchTerm}"` : 'No companies available at the moment'}
          </p>
          <Button onClick={fetchCompanies} variant="outline">
            Refresh
          </Button>
        </div>
      )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <PendingCompanies />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessListings; 