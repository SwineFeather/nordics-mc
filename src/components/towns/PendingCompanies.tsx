import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  User,
  Calendar,
  MapPin,
  Globe,
  Mail,
  MessageCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SimpleMarkdownRenderer from '@/components/SimpleMarkdownRenderer';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

interface PendingCompany {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  website_url: string | null;
  email: string | null;
  discord_invite: string | null;
  business_type: string | null;
  industry: string | null;
  founded_date: string | null;
  headquarters_world: string | null;
  headquarters_coords: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  max_members: number | null;
  keywords: string[];
  tags: string[];
  owner_uuid: string;
  status: string;
  created_at: string;
  updated_at: string;
  owner_name?: string;
}

const PendingCompanies: React.FC = () => {
  const { user, profile } = useAuth();
  const [pendingCompanies, setPendingCompanies] = useState<PendingCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<PendingCompany | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (profile?.role === 'admin' || profile?.role === 'moderator') {
      fetchPendingCompanies();
    }
  }, [profile]);

  const fetchPendingCompanies = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await (supabase as any)
        .from('companies')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPendingCompanies(data || []);
    } catch (err) {
      console.error('Error fetching pending companies:', err);
      toast.error('Failed to fetch pending companies');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (companyId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('companies')
        .update({ 
          status: 'active',
          verification_status: 'verified',
          verification_date: new Date().toISOString(),
          verified_by: user?.id
        })
        .eq('id', companyId);

      if (error) throw error;

      toast.success('Company approved successfully!');
      fetchPendingCompanies();
    } catch (err) {
      console.error('Error approving company:', err);
      toast.error('Failed to approve company');
    }
  };

  const handleReject = async (companyId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('companies')
        .update({ 
          status: 'rejected',
          verification_status: 'rejected'
        })
        .eq('id', companyId);

      if (error) throw error;

      toast.success('Company rejected');
      fetchPendingCompanies();
    } catch (err) {
      console.error('Error rejecting company:', err);
      toast.error('Failed to reject company');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || (profile?.role !== 'admin' && profile?.role !== 'moderator')) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-xl font-bold mb-2">Access Denied</h3>
        <p className="text-muted-foreground">
          You need admin or moderator privileges to view pending companies.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pending companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Clock className="w-8 h-8 text-orange-500" />
            Pending Companies
          </h1>
          <p className="text-muted-foreground">
            Review and approve new company submissions
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {pendingCompanies.length} Pending
        </Badge>
      </div>

      {/* Companies List */}
      <div className="space-y-4">
        {pendingCompanies.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold mb-2">No Pending Companies</h3>
              <p className="text-muted-foreground">
                All company submissions have been reviewed!
              </p>
            </CardContent>
          </Card>
        ) : (
          pendingCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div 
                      className="w-16 h-16 rounded-lg border flex items-center justify-center"
                      style={{ backgroundColor: company.primary_color || '#6B7280' }}
                    >
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{company.name}</h3>
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                      
                      {company.tagline && (
                        <p className="text-muted-foreground mb-3">{company.tagline}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          <span>{company.industry}</span>
                        </div>
                        {company.business_type && (
                          <div className="flex items-center gap-1">
                            <span>•</span>
                            <span>{company.business_type}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Submitted {formatDate(company.created_at)}</span>
                        </div>
                        {company.headquarters_world && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{company.headquarters_world}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCompany(company);
                        setShowDetails(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(company.id)}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(company.id)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Company Details Modal */}
      {selectedCompany && showDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Building2 className="w-6 h-6" />
                  {selectedCompany.name}
                </h2>
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                      <p className="font-semibold">{selectedCompany.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Slug</Label>
                      <p className="font-mono text-sm">{selectedCompany.slug}</p>
                    </div>
                    {selectedCompany.tagline && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Tagline</Label>
                        <p>{selectedCompany.tagline}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Industry</Label>
                      <p>{selectedCompany.industry}</p>
                    </div>
                    {selectedCompany.business_type && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Business Type</Label>
                        <p>{selectedCompany.business_type}</p>
                      </div>
                    )}
                    {selectedCompany.founded_date && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Founded Date</Label>
                        <p>{formatDate(selectedCompany.founded_date)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Contact & Location */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact & Location</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedCompany.website_url && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Website</Label>
                        <a 
                          href={selectedCompany.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline block"
                        >
                          {selectedCompany.website_url}
                        </a>
                      </div>
                    )}
                    {selectedCompany.email && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                        <p>{selectedCompany.email}</p>
                      </div>
                    )}
                    {selectedCompany.discord_invite && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Discord</Label>
                        <a 
                          href={selectedCompany.discord_invite} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline block"
                        >
                          Join Discord
                        </a>
                      </div>
                    )}
                    {selectedCompany.headquarters_world && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">World</Label>
                        <p>{selectedCompany.headquarters_world}</p>
                      </div>
                    )}
                    {selectedCompany.headquarters_coords && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Coordinates</Label>
                        <p className="font-mono text-sm">{selectedCompany.headquarters_coords}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Description */}
                {selectedCompany.description && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SimpleMarkdownRenderer content={selectedCompany.description} />
                    </CardContent>
                  </Card>
                )}

                {/* Additional Details */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Max Members</Label>
                        <p>{selectedCompany.max_members || 'Unlimited'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Primary Color</Label>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: selectedCompany.primary_color || '#6B7280' }}
                          />
                          <span className="font-mono text-sm">{selectedCompany.primary_color}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Secondary Color</Label>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: selectedCompany.secondary_color || '#6B7280' }}
                          />
                          <span className="font-mono text-sm">{selectedCompany.secondary_color}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Submitted</Label>
                        <p className="text-sm">{formatDate(selectedCompany.created_at)}</p>
                      </div>
                    </div>
                    
                    {selectedCompany.keywords.length > 0 && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium text-muted-foreground">Keywords</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedCompany.keywords.map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedCompany.tags.length > 0 && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium text-muted-foreground">Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedCompany.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReject(selectedCompany.id)}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(selectedCompany.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Company
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingCompanies; 