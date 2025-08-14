import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  Building2, 
  Users, 
  MapPin, 
  Globe, 
  ExternalLink, 
  Star, 
  Plus,
  Crown,
  Sparkles,
  Shield,
  Zap,
  Gift
} from 'lucide-react';
import { useCompaniesData } from '@/hooks/useCompaniesData';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import SimpleMarkdownRenderer from '@/components/SimpleMarkdownRenderer';
import CreateCompanyModal from './CreateCompanyModal';

const GroupsTab: React.FC = () => {
  const { companies, loading, error } = useCompaniesData();
  const { user } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Filter parent companies (Groups/Enterprises)
  const parentCompanies = companies.filter(company => 
    company.business_type === 'Enterprise' || 
    company.business_type === 'Group' || 
    company.business_type === 'Holding Company'
  );

  // Get subsidiaries for each parent company
  const getSubsidiaries = (parentId: string) => {
    return companies.filter(company => company.parent_company_id === parentId);
  };

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getIndustryColor = (industry: string) => {
    const colors: { [key: string]: string } = {
      'Mining': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Trading': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Manufacturing': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Farming': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      'Technology': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Conglomerate': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      'Holding Company': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };
    return colors[industry] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load company groups</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
             {/* Create Enterprise Button */}
       <div className="flex justify-center mb-8">
         <CreateCompanyModal 
           onCompanyCreated={() => {
             // Refresh the companies data
             window.location.reload();
           }}
         />
       </div>

      {/* Benefits Section */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <Crown className="w-12 h-12 mx-auto mb-4 text-amber-600" />
            <h3 className="text-2xl font-bold mb-2">Enterprise Benefits</h3>
            <p className="text-muted-foreground">
              Special treatment and exclusive perks for enterprise members
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-black/20">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-purple-600" />
              <h4 className="font-semibold mb-2">Custom Items & Textures</h4>
              <p className="text-sm text-muted-foreground">
                Access to exclusive custom items, textures, and in-game content
              </p>
            </div>
             
             <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-black/20">
               <Globe className="w-8 h-8 mx-auto mb-3 text-teal-600" />
               <h4 className="font-semibold mb-2">Dedicated Subdomain & Website</h4>
               <p className="text-sm text-muted-foreground">
                 Your own subdomain under nordics.world with a full enterprise page (e.g. yourbrand.nordics.world)
               </p>
             </div>
              <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-black/20">
                <Shield className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <h4 className="font-semibold mb-2">Enhanced Platform & Priority Support</h4>
                <p className="text-sm text-muted-foreground">
                  Premium features, higher member limits, and faster processing for requests
                </p>
              </div>
            
            <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-black/20">
              <Gift className="w-8 h-8 mx-auto mb-3 text-green-600" />
              <h4 className="font-semibold mb-2">Exclusive Events</h4>
              <p className="text-sm text-muted-foreground">
                Access to special events, competitions, and community activities
              </p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-black/20">
              <Building2 className="w-8 h-8 mx-auto mb-3 text-red-600" />
              <h4 className="font-semibold mb-2">Subsidiary Management</h4>
              <p className="text-sm text-muted-foreground">
                Tools to manage multiple subsidiaries under one enterprise
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enterprise Groups */}
      {parentCompanies.length === 0 ? (
        <Card className="text-center py-12">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Enterprise Groups Found</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to create an enterprise group and lead the business community!
          </p>
          <CreateCompanyModal 
            onCompanyCreated={() => {
              // Refresh the companies data
              window.location.reload();
            }}
          />
        </Card>
      ) : (
        <div className="grid gap-8">
          {parentCompanies.map((group) => {
            const subsidiaries = getSubsidiaries(group.id);
            const isExpanded = expandedGroups.has(group.id);

            return (
              <Card key={group.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <CardTitle className="text-2xl">{group.name}</CardTitle>
                        {group.is_featured && (
                          <Badge className="bg-yellow-500 text-white border-0">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span className="font-medium">{group.business_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">{subsidiaries.length} Subsidiaries</span>
                        </div>
                        {group.headquarters_world && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            <span className="font-medium">{group.headquarters_world}</span>
                          </div>
                        )}
                      </div>

                      {group.tagline && (
                        <p className="text-lg text-muted-foreground italic font-medium">
                          "{group.tagline}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={`${getIndustryColor(group.industry)} text-sm font-medium`}>
                        {group.industry}
                      </Badge>
                      {/* Remove View Profile for parent companies */}
                      {/* <Link to={`/company/${group.slug}`}> */}
                      {/*   <Button variant="outline" size="sm" className="hover:bg-primary hover:text-white transition-colors"> */}
                      {/*     <ExternalLink className="w-4 h-4 mr-2" /> */}
                      {/*     View Profile */}
                      {/*   </Button> */}
                      {/* </Link> */}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {/* Group Description */}
                  {group.description && (
                    <div className="p-8 border-b bg-gradient-to-r from-muted/30 to-muted/10">
                      <div className="prose prose-lg dark:prose-invert max-w-none">
                        <SimpleMarkdownRenderer content={group.description} />
                      </div>
                    </div>
                  )}

                  {/* Subsidiaries Section */}
                  <div className="p-8">
                    <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(group.id)}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between p-4 h-auto hover:bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <h4 className="text-xl font-semibold">Subsidiary Companies</h4>
                            <Badge variant="secondary" className="text-sm">{subsidiaries.length}</Badge>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-6 h-6" />
                          ) : (
                            <ChevronRight className="w-6 h-6" />
                          )}
                        </Button>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="mt-6">
                        {subsidiaries.length === 0 ? (
                          <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                            <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                            <p className="text-muted-foreground font-medium">
                              No subsidiaries registered yet.
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              This enterprise can add subsidiary companies to expand their business portfolio.
                            </p>
                          </div>
                        ) : (
                          <div className="grid gap-4">
                            {subsidiaries.map((subsidiary) => (
                              <div
                                key={subsidiary.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h5 className="font-semibold text-lg">{subsidiary.name}</h5>
                                    {subsidiary.is_featured && (
                                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <Badge variant="outline" className="text-xs">
                                      {subsidiary.business_type}
                                    </Badge>
                                    <Badge className={`text-xs ${getIndustryColor(subsidiary.industry)}`}>
                                      {subsidiary.industry}
                                    </Badge>
                                    {subsidiary.headquarters_world && (
                                      <div className="flex items-center gap-1">
                                        <Globe className="w-3 h-3" />
                                        {subsidiary.headquarters_world}
                                      </div>
                                    )}
                                  </div>

                                  {subsidiary.tagline && (
                                    <p className="text-sm text-muted-foreground mt-2 italic">
                                      {subsidiary.tagline}
                                    </p>
                                  )}
                                </div>

                                <Link to={`/company/${subsidiary.slug}`}>
                                  <Button variant="outline" size="sm" className="hover:bg-primary hover:text-white transition-colors">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View
                                  </Button>
                                </Link>
                              </div>
                            ))}
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Information Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-cyan-800">
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            About Enterprise Groups
          </h3>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong>Enterprise/Group Companies:</strong> These are parent companies that own and manage multiple subsidiary businesses. 
              They provide centralized management, shared resources, and strategic direction for their portfolio of companies.
            </p>
            <p>
              <strong>Subsidiaries:</strong> Individual companies that are owned or controlled by a parent company. 
              They operate under the parent's guidance while maintaining their own brand and operations.
            </p>
            <p>
              <strong>Benefits:</strong> Group structures allow for better resource allocation, risk management, 
              and strategic planning across multiple business units, plus access to exclusive perks and features.
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default GroupsTab; 