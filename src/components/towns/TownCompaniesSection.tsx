import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Building2, 
  Users, 
  Star, 
  TrendingUp, 
  Calendar,
  MapPin,
  Briefcase
} from 'lucide-react';
import { TownCompaniesService, TownCompany } from '@/services/townCompaniesService';
import { useNavigate } from 'react-router-dom';

interface TownCompaniesSectionProps {
  townId: number;
}

const TownCompaniesSection: React.FC<TownCompaniesSectionProps> = ({ townId }) => {
  const [companies, setCompanies] = useState<TownCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const companiesData = await TownCompaniesService.getTownCompanies(townId);
        setCompanies(companiesData);
      } catch (err) {
        setError('Failed to fetch companies');
        console.error('Error fetching companies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [townId]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  const formatRevenue = (revenue: number) => {
    if (revenue >= 1000000) {
      return `$${(revenue / 1000000).toFixed(1)}M`;
    } else if (revenue >= 1000) {
      return `$${(revenue / 1000).toFixed(1)}K`;
    } else {
      return `$${revenue.toFixed(0)}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <Building2 className="w-12 h-12 mx-auto opacity-50" />
        </div>
        <p className="text-muted-foreground">Failed to load companies</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-lg font-medium mb-2">No companies registered</p>
        <p className="text-sm">
          This town doesn't have any registered companies yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {companies.length} {companies.length === 1 ? 'company' : 'companies'} registered in this town
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={company.logo_url || undefined} alt={company.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {company.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-semibold text-lg truncate cursor-pointer hover:text-primary transition-colors"
                      onClick={() => navigate(`/company/${company.slug}`)}
                    >
                      {company.name}
                    </h3>
                    {company.tagline && (
                      <p className="text-sm text-muted-foreground truncate">{company.tagline}</p>
                    )}
                  </div>
                </div>
                {company.is_featured && (
                  <Badge variant="default" className="bg-yellow-600 text-xs">
                    Featured
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Industry & Business Type */}
                <div className="flex items-center gap-2 text-sm">
                  {company.industry && (
                    <Badge variant="outline" className="text-xs">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {company.industry}
                    </Badge>
                  )}
                  {company.business_type && (
                    <Badge variant="outline" className="text-xs">
                      {company.business_type}
                    </Badge>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{company.member_count} staff</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{company.average_rating.toFixed(1)} ({company.review_count})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>{formatRevenue(company.total_revenue)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDate(company.created_at)}</span>
                  </div>
                </div>


              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TownCompaniesSection;
