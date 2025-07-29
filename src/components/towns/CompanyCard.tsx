
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import type { Company } from '@/hooks/useCompaniesData';

interface CompanyCardProps {
  company: Company;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, isExpanded, onToggleExpand }) => {
  const Icon = company.icon;

  return (
    <Card className="glass-card rounded-3xl hover-lift">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xl flex items-center">
            <Icon className="w-5 h-5 mr-2 text-primary" />
            {company.name}
          </CardTitle>
          <Badge variant="outline">
            {company.type}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">{company.description}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-muted-foreground">Owner:</span>
            <p className="font-medium">{company.owner}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Location:</span>
            <p className="font-medium">{company.location}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Industry:</span>
            <p className="font-medium">{company.industry}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Founded:</span>
            <p className="font-medium">{company.founded}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Employees:</span>
            <p className="font-medium">{company.employees}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Revenue:</span>
            <p className="font-medium">{company.revenue}</p>
          </div>
        </div>

        {company.services && (
          <div className="mb-4">
            <span className="text-sm text-muted-foreground">Services:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {company.services.map((service, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {company.subsidiaries && (
          <div className="mb-4">
            <span className="text-sm text-muted-foreground">Subsidiaries:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {company.subsidiaries.map((sub, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {sub}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {company.divisions && (
          <div className="mb-4">
            <Button
              variant="outline"
              className="w-full rounded-2xl"
              onClick={onToggleExpand}
            >
              {isExpanded ? (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Hide Divisions
                </>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4 mr-2" />
                  View {company.divisions.length} Divisions
                </>
              )}
            </Button>

            {isExpanded && (
              <div className="mt-4 space-y-2 animate-fade-in">
                {company.divisions.map((division, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{division.name}</h4>
                      <span className="text-xs text-muted-foreground">{division.founded}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{division.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {company.projects && (
          <div className="mb-4">
            <span className="text-sm text-muted-foreground">Current Projects:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {company.projects.map((project, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {project}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 rounded-xl">
            Contact
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyCard;
