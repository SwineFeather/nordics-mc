
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Calendar, Users, DollarSign, Briefcase } from 'lucide-react';

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

interface CompanyCardProps {
  company: Company;
}

export const CompanyCard = ({ company }: CompanyCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      {company.banner_url && (
        <div className="h-32 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg" />
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {company.logo_url ? (
            <img 
              src={company.logo_url} 
              alt={`${company.name} logo`}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building className="h-6 w-6 text-primary" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg truncate">{company.name}</CardTitle>
              <Badge variant="outline" className={getStatusColor(company.status)}>
                {company.status}
              </Badge>
            </div>
            
            {company.tagline && (
              <CardDescription className="line-clamp-1">{company.tagline}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {company.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {company.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          {company.industry && (
            <div className="flex items-center gap-1">
              <Briefcase className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground truncate">{company.industry}</span>
            </div>
          )}
          
          {company.headquarters_coords && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground truncate">HQ: {company.headquarters_coords}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              {new Date(company.created_at).getFullYear()}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{company.member_count} members</span>
          </div>
          
          {company.total_revenue && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">${company.total_revenue.toLocaleString()}</span>
            </div>
          )}
        </div>

        {company.tags && company.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {company.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {company.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{company.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
